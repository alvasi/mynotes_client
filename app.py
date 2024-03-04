from flask import Flask, render_template, jsonify, request, session, redirect, url_for, send_from_directory
from flask_cors import CORS

import psycopg as db
import requests
import os

app = Flask(__name__)

CORS(app)

DDL_BASE_URL = "http://deadline-api.cae0f0dcf0fjagfc.uksouth.azurecontainer.io:5000"
USER_BASE_URL = "http://userapi.fpdsatbedpgcezhj.uksouth.azurecontainer.io:5000"

app.secret_key = os.environ.get("FLASK_SECRET_KEY")


@app.route("/")
def index():
    return send_from_directory('static', 'index.html')


@app.route("/login")
def login_page():
    # Render the login.html template on GET request
    return render_template('login.html')


# Serve React App
@app.route('/app', defaults={'path': ''})
@app.route('/app/<path:path>')
def serve_react_app(path):
    if path and os.path.exists('client/build/' + path):
        print ("inside serve react app: ", path)
        return send_from_directory('client/build', path)
    else:
        return send_from_directory('client/build', 'index.html')


# login submit
@app.route("/loginsubmit", methods=["POST"])
def login_submit():
    username = request.form.get("username")
    password = request.form.get("password")

    # Prepare the data payload for the API
    data_payload = {"username": username, "password": password}

    api_url = f"{USER_BASE_URL}/login"
    response = requests.post(api_url, json=data_payload)
    if response.ok:
        user = response.json()
    if user:
        session["name"] = user[1]
        session["username"] = user[3]
        # Redirect to the React-rendered dashboard page
        return redirect('/app/dashboard')
    else:
        # Render the login page again with an error message
        return render_template('login.html', error="Login failed. User not found.")


# register page
@app.route("/register")
def register():
    return render_template('register.html')


# register submit
@app.route("/registersubmit", methods=["POST"])
def register_submit():
    data = request.json

    first_name = data.get("first_name")
    last_name = data.get("last_name")
    DoB = data.get("DoB")
    username = data.get("username")
    password = data.get("password")

    data_payload = {
        "first_name": first_name,
        "last_name": last_name,
        "DoB": DoB,
        "username": username,
        "password": password,
    }
    api_url = f"{USER_BASE_URL}/register_submit"
    response = requests.post(api_url, json=data_payload)
    print (response)
    if response.ok:
        return jsonify({"message": "Registration successful"})
    else:
        return jsonify({"message": "Registration not successful"})



@app.route("/api/dashboard")
def dashboard():
    if "username" not in session:
        return jsonify({"success": False, "message": "Not logged in"}), 401
    else:
        return jsonify({"success": True, "name": session["name"], "username": session["username"]})


@app.route("/api/view_deadlines", methods=["GET"])
def view_deadlines():
    if "username" not in session:
        return redirect(url_for("login"))

    deadline_type = request.args.get("type", "all")  # Default to 'all'
    username = session["username"]
    params = {"username": username}

    if deadline_type == "past":
        response = requests.get(f"{DDL_BASE_URL}/past_deadlines", params=params)
    elif deadline_type == "current":
        response = requests.get(f"{DDL_BASE_URL}/current_deadlines", params=params)
    else:
        response = requests.get(f"{DDL_BASE_URL}/all_deadlines", params=params)

    if response.ok:
        print ("successfully fetched response for view deadlines")
        entries = response.json()
        return jsonify(entries)
    else:
        return jsonify({"error": "Could not retrieve deadlines from the API"}), 500



@app.route("/api/add_deadline", methods=["POST"])
def add_deadline():
    if "username" not in session:
        return redirect(url_for("login"))

    # Get JSON data from the request
    data = request.get_json()

    task = data.get("task")
    deadline = data.get("deadline")
    username = session["username"]

    # Prepare the data payload for the API
    data_payload = {"username": username, "task": task, "deadline": deadline}

    # URL of the API endpoint for adding a deadline
    api_url = f"{DDL_BASE_URL}/add_deadline"

    # Make a POST request to the API
    response = requests.post(api_url, json=data_payload)

    if response.ok:
        return jsonify({"success": True, "message": "Deadline added successfully"})
    else:
        # Forward the API's response status code and message
        response_data = response.json() if response.content else {}
        return jsonify({
            "error": response_data.get("error", "Failed to add deadline through API")
        }), response.status_code



@app.route("/api/mark_deadline_complete", methods=["POST"])
def mark_deadline_complete():
    data = request.get_json()  # Get data as JSON
    deadline_id = data.get("deadline_id")

    if not deadline_id:
        return jsonify("Missing deadline ID"), 400

    # Prepare the data payload for the API
    data_payload = {"id": deadline_id}

    # URL of the API endpoint for marking a deadline as completed
    api_url = f"{DDL_BASE_URL}/complete_deadline"

    # Make a POST request to the API
    response = requests.post(api_url, json=data_payload)

    if response.ok:
        return jsonify({"success": True, "message": "Deadline marked as completed"})
    else:
        return jsonify({"error": "Failed to mark deadline as completed through API"}), response.status_code

