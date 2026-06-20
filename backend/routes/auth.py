from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from config import MONGO_URI
import bcrypt
from datetime import datetime

auth = Blueprint("auth", __name__)
print("MONGO_URI =", MONGO_URI)
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

db = client["fitness_app"]
users = db["users"]

@auth.route("/register", methods=["POST"])
def register():

    data = request.json

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if users.find_one({"email": email}):
        return jsonify({"message": "User already exists"}), 400

    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    )

    users.insert_one({
        "name": name,
        "email": email,
        "password": hashed_password
    })

    return jsonify({"message": "Registration Successful"}), 201
@auth.route("/login", methods=["POST"])
def login():

    data = request.json

    email = data.get("email")
    password = data.get("password")

    user = users.find_one({"email": email})

    if not user:
        return jsonify({"message": "User not found"}), 404

    if bcrypt.checkpw(
        password.encode("utf-8"),
        user["password"]
    ):
        return jsonify({
            "message": "Login Successful"
        }), 200

    return jsonify({
        "message": "Invalid Password"
    }), 401
@auth.route("/profile/<email>", methods=["GET"])
def profile(email):

    user = users.find_one(
        {"email": email},
        {"password": 0}
    )

    if not user:
        return jsonify({
            "message": "User not found"
        }), 404

    user["_id"] = str(user["_id"])

    return jsonify(user), 200
workouts = db["workouts"]

@auth.route("/workout", methods=["POST"])
def add_workout():

    data = request.json

    workout = {
    "email": data.get("email"),
    "exercise": data.get("exercise"),
    "sets": data.get("sets"),
    "reps": data.get("reps"),
    "created_at": datetime.utcnow()
    }

    workouts.insert_one(workout)

    return jsonify({
        "message": "Workout Added"
    }), 201
@auth.route("/workouts/<email>", methods=["GET"])
def get_workouts(email):

    workout_list = list(
        workouts.find(
            {"email": email},
            {"_id": 0}
        )
    )

    return jsonify(workout_list), 200