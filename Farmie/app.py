from flask import Flask, request, make_response, jsonify
import mysql.connector
import hashlib
from flask_cors import CORS

app = Flask(__name__)

# Enabling CORS with specific origins for added security (you can use 'localhost:8081' for dev)
CORS(app, origins="*", supports_credentials=True)  # Allow requests from localhost:8081

# Database connection function
def get_db_connection():
    return mysql.connector.connect(
        host='localhost',
        user='farmie_user',
        password='farmie123',
        database='farmie_db'
    )

# Helper function to hash passwords
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()


# Register route
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return make_response(jsonify({'message': 'Username and password required'}), 400)

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if user already exists
    cursor.execute('SELECT * FROM registered_users WHERE username = %s', (username,))
    existing_user = cursor.fetchone()

    if existing_user:
        return make_response(jsonify({'message': 'User already exists'}), 409)

    # Insert new user
    hashed_password = hash_password(password)
    cursor.execute('INSERT INTO registered_users (username, password) VALUES (%s, %s)', (username, hashed_password))
    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({'message': 'User registered successfully'}), 201

# Login route
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return make_response(jsonify({'message': 'Username and password required'}), 400)

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute('SELECT password FROM registered_users WHERE username = %s', (username,))
    result = cursor.fetchone()

    if not result:
        return make_response(jsonify({'message': 'Invalid username or password'}), 401)

    stored_password = result[0]
    hashed_input_password = hash_password(password)

    if stored_password != hashed_input_password:
        return make_response(jsonify({'message': 'Invalid username or password'}), 401)

    cursor.close()
    conn.close()

    return jsonify({'message': 'Login successful'}), 200

if __name__ == '__main__':
    app.run(debug=True)
