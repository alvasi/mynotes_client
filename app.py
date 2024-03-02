from flask import Flask, render_template, jsonify, request, session, redirect, url_for
import requests

app = Flask(__name__)

API_BASE_URL = "http://deadline-api-server.c7f8dwe8dbfhhfcx.uksouth.azurecontainer.io:5000"


@app.route("/view_deadlines", methods=["GET"])
def view_deadlines():
    # Here you would retrieve deadlines from your API and pass them to your template
    # Not implemented here for brevity
    return render_template("deadlines.html")

@app.route('/add_deadline', methods=['POST'])
def add_deadline():
    # Forward the request to the actual API
    data = request.get_json()
    response = requests.post(f"{API_BASE_URL}/add_deadline", json=data)
    return jsonify(response.json()), response.status_code

@app.route('/deadlines', methods=['GET'])
def get_deadlines():
    # Forward the request to the actual API
    username = session.get('username')
    deadline_type = request.args.get('type')  # 'all', 'current', or 'past'
    endpoint = {
        'all': 'all_deadlines',
        'current': 'current_deadlines',
        'past': 'past_deadlines'
    }.get(deadline_type, 'all_deadlines')

    response = requests.get(f"{API_BASE_URL}/{endpoint}", params={'username': username})
    return jsonify(response.json()), response.status_code
