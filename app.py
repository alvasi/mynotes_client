from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    session,
    redirect,
    url_for,
    send_from_directory,
)
from flask_cors import CORS

import psycopg as db
import requests
import os
import random
from datetime import datetime


app = Flask(__name__)

CORS(app)


DDL_BASE_URL = "http://deadline-api.cae0f0dcf0fjagfc.uksouth.azurecontainer.io:5000"
USER_BASE_URL = "http://user-api.b2f5h7gdc7hmhqhy.uksouth.azurecontainer.io:5000"
NOTES_BASE_URL = "http://notesapi.g3cxeje0gvbagsav.uksouth.azurecontainer.io:5000"


app.secret_key = os.environ.get("FLASK_SECRET_KEY")


@app.route("/")
def index():
    return send_from_directory("static", "index.html")


@app.route("/login")
def login_page():
    # Render the login.html template on GET request
    return render_template("login.html")


# Serve React App
@app.route("/app", defaults={"path": ""})
@app.route("/app/<path:path>")
def serve_react_app(path):
    if path and os.path.exists("client/build/" + path):
        print("inside serve react app: ", path)
        return send_from_directory("client/build", path)
    else:
        return send_from_directory("client/build", "index.html")


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
        return redirect("/app/dashboard")
    else:
        # Render the login page again with an error message
        return render_template("login.html", error="Login failed. User not found.")


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
    print(response)
    if response.ok:
        return jsonify({"message": "Registration successful"})
    else:
        return jsonify({"message": "Registration not successful"})


@app.route("/api/dashboard")
def dashboard():
    if "username" not in session:
        return jsonify({"success": False, "message": "Not logged in"}), 401
    else:
        return jsonify(
            {"success": True, "name": session["name"], "username": session["username"]}
        )


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
        print("successfully fetched response for view deadlines")
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

    data_payload = {"username": username, "task": task, "date": deadline}
    api_url = f"{DDL_BASE_URL}/add_deadline"
    response = requests.post(api_url, json=data_payload)

    if response.ok:
        return jsonify({"success": True, "message": "Deadline added successfully"})
    else:
        # Forward the API's response status code and message
        response_data = response.json() if response.content else {}
        return (
            jsonify(
                {
                    "error": response_data.get(
                        "error", "Failed to add deadline through API"
                    )
                }
            ),
            response.status_code,
        )


@app.route("/api/delete_deadline", methods=["POST"])
def delete_deadline():
    data = request.get_json()
    deadline_id = data.get("deadline_id")

    if not deadline_id:
        return jsonify("Missing deadline ID"), 400

    data_payload = {"id": deadline_id}
    api_url = f"{DDL_BASE_URL}/delete_deadline"
    response = requests.post(api_url, json=data_payload)
    if response.ok:
        return jsonify({"success": True, "message": "Deadline deleted"})
    else:
        return (
            jsonify({"error": "Failed to delete deadline through API"}),
            response.status_code,
        )


@app.route("/api/update_deadline", methods=["POST"])
def update_deadline():
    data = request.get_json()
    deadline_id = data.get("deadline_id")
    new_task = data.get("task")
    new_deadline = data.get("deadline")

    ## Debugging
    # print ("deadlind_id: ", deadline_id)
    # print ("new_task: ", new_task)
    # print ("new_deadline: ", new_deadline)
    if not deadline_id:
        return jsonify("Missing deadline ID"), 400

    data_payload = {"id": deadline_id, "task": new_task, "deadline": new_deadline}
    api_url = f"{DDL_BASE_URL}/update_deadline"
    response = requests.post(api_url, json=data_payload)

    if response.ok:
        print("respones is ok!")
        return jsonify({"success": True, "message": "Deadline updated successfully"})
    else:
        error_message = "Failed to edit deadline through API"
        if response.headers.get("Content-Type") == "application/json":
            try:
                response_data = response.json()
                error_message = response_data.get("error", error_message)
            except ValueError:
                # response.text is not JSON, use it as the error message
                error_message = response.text
        else:
            error_message = response.text

        return jsonify({"error": error_message}), response.status_code


@app.route("/api/mark_deadline_complete", methods=["POST"])
def mark_deadline_complete():
    data = request.get_json()  # Get data as JSON
    deadline_id = data.get("deadline_id")

    if not deadline_id:
        return jsonify("Missing deadline ID"), 400

    data_payload = {"id": deadline_id}
    api_url = f"{DDL_BASE_URL}/complete_deadline"
    response = requests.post(api_url, json=data_payload)

    if response.ok:
        return jsonify({"success": True, "message": "Deadline marked as completed"})
    else:
        return (
            jsonify({"error": "Failed to mark deadline as completed through API"}),
            response.status_code,
        )


@app.route("/api/mark_deadline_incomplete", methods=["POST"])
def mark_deadline_incomplete():
    data = request.get_json()  # Get data as JSON
    deadline_id = data.get("deadline_id")

    if not deadline_id:
        return jsonify("Missing deadline ID"), 400

    data_payload = {"id": deadline_id}
    api_url = f"{DDL_BASE_URL}/mark_incomplete"
    response = requests.post(api_url, json=data_payload)

    if response.ok:
        return jsonify({"success": True, "message": "Deadline marked as incomplete"})
    else:
        return (
            jsonify({"error": "Failed to mark deadline as incomplete through API"}),
            response.status_code,
        )


# serverles function
@app.route("/greeting")
def greeting():
    rand = random.randint(0, 20)
    response = requests.get(
        f"https://greeting-rand.azurewebsites.net/api/http_trigger?&rand={rand}"
    )
    if response.status_code == 200:
        data = response.text
        print("Response:", data)
        return jsonify(message=data)
    else:
        print("Error:", response.status_code)
        return jsonify(error="An error occurred")


# Notes
@app.route("/api/view_notes", methods=["GET"])
def view_notes():
    if "username" not in session:
        return redirect(url_for("login"))

    username = session["username"]
    params = {"username": username}
    response = requests.get(f"{NOTES_BASE_URL}/retrieve_notes", params=params)

    if response.ok:
        notes = response.json()
        return jsonify(notes)
    else:
        return (
            jsonify({"error": "Could not retrieve notes from the API"}),
            response.status_code,
        )


@app.route("/api/add_note", methods=["POST"])
def add_note():
    if "username" not in session:
        return redirect(url_for("login"))

    data = request.get_json()
    color = data.get("color")
    content = data.get("content")
    username = session["username"]
    time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    data_payload = {
        "username": username,
        "color": color,
        "content": content,
        "time": time,
    }
    response = requests.post(f"{NOTES_BASE_URL}/create_note", json=data_payload)

    if response.ok:
        return jsonify({"success": True, "message": "Note added successfully"})
    else:
        return (
            jsonify({"error": "Failed to add note through API"}),
            response.status_code,
        )


@app.route("/api/update_note", methods=["POST"])
def update_note():
    if "username" not in session:
        return redirect(url_for("login"))

    data = request.get_json()
    note_id = data.get("note_id")
    color = data.get("color")
    content = data.get("content")
    time = data.get("time", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

    data_payload = {
        "note_id": note_id,
        "color": color,
        "content": content,
        "time": time,
    }
    response = requests.post(f"{NOTES_BASE_URL}/update_note", json=data_payload)

    if response.ok:
        return jsonify({"success": True, "message": "Note updated successfully"})
    else:
        return (
            jsonify({"error": "Failed to update note through API"}),
            response.status_code,
        )


@app.route("/api/delete_note", methods=["POST"])
def delete_note():
    data = request.get_json()
    note_id = data.get("note_id")

    if not note_id:
        return jsonify("Missing note ID"), 400

    data_payload = {"note_id": note_id}
    response = requests.post(f"{NOTES_BASE_URL}/delete_note", json=data_payload)

    if response.ok:
        return jsonify({"success": True, "message": "Note deleted successfully"})
    else:
        return (
            jsonify({"error": "Failed to delete note through API"}),
            response.status_code,
        )
