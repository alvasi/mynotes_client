from flask import Flask, render_template, jsonify, request, session, redirect, url_for
import psycopg as db
import requests
import os

app = Flask(__name__)

API_BASE_URL = "http://deadline-api-server.c7f8dwe8dbfhhfcx.uksouth.azurecontainer.io:5000"

app.secret_key = os.environ.get('FLASK_SECRET_KEY')

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
    email = request.form.get("email")
    password = request.form.get("password")
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM notes_user WHERE email = %s AND password = %s"
    cursor.execute(query, (email, password))
    user = cursor.fetchone()
    conn.close()
    if user:
        session['name'] = user[1]
        session['email'] = user[2]
        return redirect(url_for('dashboard'))
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
    
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    full_name = first_name + " " + last_name
    DoB = data.get('DoB')
    email = data.get('email')
    password = data.get('password')

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

    values = (
        user_id,
        full_name,
        email,
        DoB,
        password
    )

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

    return jsonify({'success': True, 'message': 'Registration successful'})    

@app.route("/dashboard")
def dashboard():
    if 'email' not in session:
        # Redirect to login page if not logged in
        return redirect(url_for('login'))
    return render_template("dashboard.html", username=session['name'], user_id=session['email'])

@app.route("/view_deadlines", methods=["GET"])
def view_deadlines():
    # Here you would retrieve deadlines from your API and pass them to your template
    if 'email' not in session:
        return redirect(url_for('login'))
    user_id=session['email']
    params = {
        'username': '{{ user_id }}'
    }
    response=requests.get(f"{API_BASE_URL}/all_deadlines", params=params)
    if response.ok:
        entries = response.json()
        return render_template("deadlines.html", entries=entries, username=session['name'], user_id=session['email'])
    else:
        return jsonify({'error': 'Could not retrieve deadlines from the API'}), 500

# @app.route('/add_deadline', methods=['POST'])
# def add_deadline():
#     # Forward the request to the actual API
#     data = request.get_json()
#     response = requests.post(f"{API_BASE_URL}/add_deadline", json=data)
#     return jsonify(response.json()), response.status_code

# @app.route('/deadlines', methods=['GET'])
# def get_deadlines():
#     # Forward the request to the actual API
#     username = session.get('email')
#     deadline_type = request.args.get('type')  # 'all', 'current', or 'past'
#     endpoint = {
#         'all': 'all_deadlines',
#         'current': 'current_deadlines',
#         'past': 'past_deadlines'
#     }.get(deadline_type, 'all_deadlines')

#     response = requests.get(f"{API_BASE_URL}/{endpoint}", params={'username': username})
#     return jsonify(response.json()), response.status_code
