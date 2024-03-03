from flask import Flask, render_template, jsonify, request, session, redirect, url_for
import psycopg as db
import requests
import os

app = Flask(__name__)

DDL_BASE_URL = "http://deadline-api.cae0f0dcf0fjagfc.uksouth.azurecontainer.io:5000"
USER_BASE_URL = "http://userapi.fpdsatbedpgcezhj.uksouth.azurecontainer.io:5000"

app.secret_key = os.environ.get("FLASK_SECRET_KEY")


# index page for the app
@app.route("/")
def index():
    return render_template("index.html")


# login page
@app.route("/login")
def login():
    return render_template("login.html")


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
        return redirect(url_for("dashboard"))
    else:
        return jsonify({"message": "User not found"}), 401


# register page
@app.route("/register")
def register():
    return render_template("register.html")


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
    if response.ok:
        return redirect(url_for("login"))
    else:
        return jsonify({"message": "Registration not successful"}), 401


@app.route("/dashboard")
def dashboard():
    if "username" not in session:
        # Redirect to login page if not logged in
        return redirect(url_for("login"))
    return render_template(
        "dashboard.html", name=session["name"], username=session["username"]
    )


@app.route("/view_deadlines", methods=["GET"])
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
        entries = response.json()
        return render_template(
            "deadlines.html",
            entries=entries,
            name=session["name"],
            username=session["username"],
            deadline_type=deadline_type,
        )
    else:
        return jsonify({"error": "Could not retrieve deadlines from the API"}), 500


@app.route("/add_deadline", methods=["POST"])
def add_deadline():
    if "username" not in session:
        return redirect(url_for("login"))
    # Assuming you use form data; adjust as needed if using JavaScript/AJAX
    task = request.form.get("task")
    deadline = request.form.get("deadline")

    username = session["username"]

    # Prepare the data payload for the API
    data_payload = {"username": username, "task": task, "deadline": deadline}

    # URL of the API endpoint for adding a deadline
    api_url = f"{DDL_BASE_URL}/add_deadline"

    # Make a POST request to the API
    response = requests.post(api_url, json=data_payload)

    if response.ok:
        # Redirect or notify the user of success
        return redirect(url_for("view_deadlines"))
    else:
        # Handle errors or notify the user of failure
        return (
            jsonify({"error": "Failed to add deadline through API"}),
            response.status_code,
        )


@app.route("/mark_deadline_complete", methods=["POST"])
def mark_deadline_complete():
    deadline_id = request.form.get("deadline_id")

    if not deadline_id:
        return jsonify("Missing deadline ID"), 400

    # Prepare the data payload for the API
    data_payload = {"id": deadline_id}

    # URL of the API endpoint for marking a deadline as completed
    api_url = f"{DDL_BASE_URL}/complete_deadline"

    # Make a POST request to the API
    response = requests.post(api_url, json=data_payload)

    if response.ok:
        # Redirect or notify the user of success
        return redirect(url_for("view_deadlines"))
    else:
        # Handle errors or notify the user of failure
        return (
            jsonify({"error": "Failed to mark deadline as completed through API"}),
            response.status_code,
        )
