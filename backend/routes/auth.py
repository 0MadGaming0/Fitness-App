from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from config import MONGO_URI, SECRET_KEY
import bcrypt
import jwt

from bson import ObjectId
from datetime import datetime, timedelta
from functools import wraps
from groq import Groq
from config import GROQ_API_KEY

auth = Blueprint("auth", __name__)
groq_client = Groq(api_key=GROQ_API_KEY)

# MongoDB Connection
client = MongoClient(
    MONGO_URI,
    tls=True,
    tlsAllowInvalidCertificates=True
)

try:
    client.admin.command("ping")
    print("✅ Auth.py MongoDB Connected")
except Exception as e:
    print("❌ Auth.py MongoDB Failed:", e)

# Database
db = client["fitness_app"]
users = db["users"]
workouts = db["workouts"]


# ==========================
# JWT Middleware
# ==========================

def token_required(f):

    @wraps(f)
    def decorated(*args, **kwargs):

        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return jsonify({
                "message": "Token missing"
            }), 401

        try:

            token = auth_header.split(" ")[1]

            payload = jwt.decode(
                token,
                SECRET_KEY,
                algorithms=["HS256"]
            )

            request.user_email = payload["email"]

        except Exception:
            return jsonify({
                "message": "Invalid Token"
            }), 401

        return f(*args, **kwargs)

    return decorated


# ==========================
# Register
# ==========================

@auth.route("/register", methods=["POST"])
def register():

    data = request.json

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if users.find_one({"email": email}):
        return jsonify({
            "message": "User already exists"
        }), 400

    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    )

    users.insert_one({
        "name": name,
        "email": email,
        "password": hashed_password
    })

    return jsonify({
        "message": "Registration Successful"
    }), 201


# ==========================
# Login
# ==========================

@auth.route("/login", methods=["POST"])
def login():

    data = request.json

    email = data.get("email")
    password = data.get("password")

    user = users.find_one({"email": email})

    if not user:
        return jsonify({
            "message": "User not found"
        }), 404

    if bcrypt.checkpw(
        password.encode("utf-8"),
        user["password"]
    ):

        token = jwt.encode(
            {
                "email": user["email"],
                "exp": datetime.utcnow() + timedelta(days=1)
            },
            SECRET_KEY,
            algorithm="HS256"
        )

        return jsonify({
            "message": "Login Successful",
            "token": token
        }), 200

    return jsonify({
        "message": "Invalid Password"
    }), 401


# ==========================
# Profile
# ==========================

@auth.route("/profile", methods=["GET"])
@token_required
def profile():

    user = users.find_one(
        {"email": request.user_email},
        {"password": 0}
    )

    if not user:
        return jsonify({
            "message": "User not found"
        }), 404

    user["_id"] = str(user["_id"])

    return jsonify(user), 200

# ==========================
# Update Profile
# ==========================

@auth.route("/profile", methods=["PUT"])
@token_required
def update_profile():

    data = request.json

    update_data = {
        "name": data.get("name"),
        "age": data.get("age"),
        "weight": data.get("weight"),
        "height": data.get("height"),
        "goal": data.get("goal")
    }

    users.update_one(
        {"email": request.user_email},
        {"$set": update_data}
    )

    return jsonify({
        "message": "Profile updated successfully"
    }), 200

# ==========================
# Add Workout
# ==========================

@auth.route("/workout", methods=["POST"])
@token_required
def add_workout():

    data = request.json

    workout = {
        "email": request.user_email,
        "exercise": data.get("exercise"),
        "sets": data.get("sets"),
        "reps": data.get("reps"),
        "created_at": datetime.utcnow()
    }

    workouts.insert_one(workout)

    return jsonify({
        "message": "Workout Added"
    }), 201


# ==========================
# Get My Workouts
# ==========================

@auth.route("/workouts", methods=["GET"])
@token_required
def get_workouts():

    workout_list = list(
        workouts.find(
            {"email": request.user_email},
            {"_id": 0}
        )
    )

    return jsonify(workout_list), 200


# ==========================
# Delete Workout
# ==========================

@auth.route("/workout/<workout_id>", methods=["DELETE"])
@token_required
def delete_workout(workout_id):

    try:
        object_id = ObjectId(workout_id)

    except Exception:
        return jsonify({
            "message": "Invalid Workout ID"
        }), 400

    result = workouts.delete_one({
        "_id": object_id,
        "email": request.user_email
    })

    if result.deleted_count == 0:
        return jsonify({
            "message": "Workout not found"
        }), 404

    return jsonify({
        "message": "Workout deleted successfully"
    }), 200
@auth.route("/workout/<workout_id>", methods=["PUT"])
@token_required
def update_workout(workout_id):

    data = request.json

    update_data = {
        "exercise": data.get("exercise"),
        "sets": data.get("sets"),
        "reps": data.get("reps")
    }

    result = workouts.update_one(
        {
            "_id": ObjectId(workout_id),
            "email": request.user_email
        },
        {
            "$set": update_data
        }
    )

    if result.matched_count == 0:
        return jsonify({
            "message": "Workout not found"
        }), 404

    return jsonify({
        "message": "Workout updated successfully"
    }), 200
# ==========================
# AI Coach
# ==========================

@auth.route("/ai-coach", methods=["POST"])
@token_required
def ai_coach():

    data = request.json

    goal = data.get("goal")
    age = data.get("age")
    weight = data.get("weight")

    prompt = f"""
    You are an expert fitness coach.

    User Details:
    Age: {age}
    Weight: {weight} kg
    Goal: {goal}

    Give:
    1. Fitness advice
    2. Workout recommendation
    3. Diet recommendation

    Keep the response concise and practical.
    """

    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    advice = response.choices[0].message.content

    return jsonify({
        "advice": advice
    }), 200
