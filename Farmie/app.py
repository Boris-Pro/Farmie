from flask import Flask, request, make_response, jsonify
import mysql.connector
import hashlib
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

app = Flask(__name__)

# Set up the secret key to secure sessions
app.config['SECRET_KEY'] = 'farmie_secret_key'
app.config['SESSION_COOKIE_NAME'] = 'session'

# JWT Manager setup
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'  # Change this to a more secure key
jwt = JWTManager(app)

# Enabling CORS with specific origins
CORS(app, origins="http://localhost:8081", supports_credentials=True)

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

# Login route - now generates a JWT token
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

    # Create a JWT token after successful login
    access_token = create_access_token(identity=username)

    cursor.close()
    conn.close()

    return jsonify({'access_token': access_token}), 200

# Logout route (JWT doesn't need this, but added for consistency)
@app.route('/logout', methods=['POST'])
def logout():
    return jsonify({'message': 'Logout successful'}), 200

# Add Farm route - Protected with JWT
@app.route('/add_farm', methods=['POST'])
@jwt_required()
def add_farm():
    username = get_jwt_identity()  # Get the username from the JWT token
    print(f"Logged in as: {username}")

    data = request.get_json()
    name = data.get('name')
    location = data.get('location')
    crop = data.get('crop')
    image_url = data.get('image_url')

    if not name or not location or not crop or not image_url:
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        query = """
        INSERT INTO Farms (name, location, crop, image_url, username)
        VALUES (%s, %s, %s, %s, %s)
        """
        cur.execute(query, (name, location, crop, image_url, username))
        conn.commit()

        cur.close()
        conn.close()

        return jsonify({'message': 'Farm added successfully'}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get Farms by User route - Protected with JWT
@app.route('/get_farms_by_user', methods=['GET'])
@jwt_required()
def get_farms_by_user():
    username = get_jwt_identity()  # Get the username from the JWT token
    print(f"Logged in as: {username}")

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        query = """
        SELECT id, name, location, crop, image_url
        FROM Farms
        WHERE username = %s
        """
        cur.execute(query, (username,))
        farms = cur.fetchall()

        if not farms:
            return jsonify([]), 200

        farm_list = []
        for farm in farms:
            farm_list.append({
                'id': farm[0],
                'name': farm[1],
                'location': farm[2],
                'crop': farm[3],
                'image_url': farm[4]
            })

        cur.close()
        conn.close()

        return jsonify(farm_list), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
