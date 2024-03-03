from flask import Flask, render_template, jsonify, request, session, redirect, url_for, send_from_directory
from flask_cors import CORS

import psycopg as db
import requests
import os

# app = Flask(__name__, static_folder='client/build', static_url_path='')
app = Flask(__name__)

CORS(app)

API_BASE_URL = "http://deadline-api.cae0f0dcf0fjagfc.uksouth.azurecontainer.io:5000"

app.secret_key = os.environ.get("FLASK_SECRET_KEY")


def get_db_connection():
    server_params = {
        "dbname": "sf23",
        "host": "db.doc.ic.ac.uk",
        "port": "5432",
        "user": "sf23",
        "password": "3048=N35q4nEsm",
        "client_encoding": "utf-8",
    }
    return db.connect(**server_params)


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


@app.route("/loginsubmit", methods=["POST"])
def login_submit():
    email = request.form.get("email")
    password = request.form.get("password")
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM notes_user WHERE email = %s AND password = %s"
    cursor.execute(query, (email, password))
    user = cursor.fetchone()
    conn.close()
    if user:
        session["name"] = user[1]
        session["email"] = user[2]
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
    full_name = first_name + " " + last_name
    DoB = data.get("DoB")
    email = data.get("email")
    password = data.get("password")

    # generate unique user_id
    sqlcommand = (
        "SELECT COUNT(*) AS row_count FROM my_user WHERE name = '"
        + first_name
        + " "
        + last_name
        + "';"
    )
    try:
        conn = get_db_connection()
        curs = conn.cursor()
        curs.execute(sqlcommand)
        ret = curs.fetchone()
    except Exception as e:
        print(f"An error occurred: {e}")  # Log the error
    finally:
        if "curs" in locals():
            curs.close()
        if "conn" in locals():
            conn.close()

    user_id = (first_name + last_name).lower() + (str)(ret[0] + 1)

    sqlcommand = """
        INSERT INTO notes_user (user_id, name, email, dob, password) 
        VALUES (%s, %s, %s, %s, %s)
    """

    values = (user_id, full_name, email, DoB, password)

    try:
        conn = get_db_connection()
        curs = conn.cursor()
        curs.execute(sqlcommand, values)
        conn.commit()
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        if "curs" in locals():
            curs.close()
        if "conn" in locals():
            conn.close()

    return jsonify({"success": True, "message": "Registration successful"})


@app.route("/api/dashboard")
def dashboard():
    if "email" not in session:
        return jsonify({"success": False, "message": "Not logged in"}), 401
    else:
        return jsonify({"success": True, "name": session["name"], "email": session["email"]})


@app.route("/api/view_deadlines", methods=["GET"])
def view_deadlines():
    if "email" not in session:
        return redirect(url_for("login"))

    deadline_type = request.args.get("type", "all")  # Default to 'all'
    user_id = session["email"]
    params = {"username": user_id}

    if deadline_type == "past":
        response = requests.get(f"{API_BASE_URL}/past_deadlines", params=params)
    elif deadline_type == "current":
        response = requests.get(f"{API_BASE_URL}/current_deadlines", params=params)
    else:
        response = requests.get(f"{API_BASE_URL}/all_deadlines", params=params)

    if response.ok:
        print ("successfully fetched response for view deadlines")
        entries = response.json()
        return jsonify(entries)
    else:
        return jsonify({"error": "Could not retrieve deadlines from the API"}), 500



@app.route("/api/add_deadline", methods=["POST"])
def add_deadline():
    if "email" not in session:
        return redirect(url_for("login"))

    # Get JSON data from the request
    data = request.get_json()

    task = data.get("task")
    deadline = data.get("deadline")
    username = session["email"]

    # Prepare the data payload for the API
    data_payload = {"username": username, "task": task, "deadline": deadline}

    # URL of the API endpoint for adding a deadline
    api_url = f"{API_BASE_URL}/add_deadline"

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
    api_url = f"{API_BASE_URL}/complete_deadline"

    # Make a POST request to the API
    response = requests.post(api_url, json=data_payload)

    if response.ok:
        return jsonify({"success": True, "message": "Deadline marked as completed"})
    else:
        return jsonify({"error": "Failed to mark deadline as completed through API"}), response.status_code

