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
workout_sessions = db["workout_sessions"]
personal_records = db["personal_records"]
goals = db["goals"]
notifications = db["notifications"]
exercises = db["exercises"]
feedbacks = db["feedbacks"]


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

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password")

    if email == "owner@fitai.com" or name.lower() == "owner":
        return jsonify({
            "message": "Registration restricted: This is a reserved owner account."
        }), 403

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

    # Only update fields that are actually present in the request body.
    # This allows partial updates (e.g. avatar-only) without overwriting
    # existing values with None.
    allowed_fields = ["name", "age", "weight", "height", "goal", "avatar", "settings"]
    update_data = {k: data[k] for k in allowed_fields if k in data}

    if not update_data:
        return jsonify({"message": "No fields to update"}), 400

    users.update_one(
        {"email": request.user_email},
        {"$set": update_data}
    )

    return jsonify({
        "message": "Profile updated successfully"
    }), 200


# ==========================
# Public Profile (no auth)
# ==========================

@auth.route("/public-profile/<user_id>", methods=["GET"])
def public_profile(user_id):
    """Return public info for a user — only if they've enabled publicProfile."""
    try:
        obj_id = ObjectId(user_id)
    except Exception:
        return jsonify({"message": "Invalid user ID"}), 400

    user = users.find_one({"_id": obj_id}, {"password": 0})
    if not user:
        return jsonify({"message": "User not found"}), 404

    settings = user.get("settings", {})
    privacy   = settings.get("privacy", {})

    if not privacy.get("publicProfile", False):
        return jsonify({"message": "This profile is private"}), 403

    # Build safe public payload
    public_data = {
        "name":   user.get("name", "Athlete"),
        "goal":   user.get("goal"),
        "avatar": user.get("avatar"),
        "level":  user.get("level", 1),
        "xp":     user.get("xp", 0),
        "streak": user.get("streak", 0),
    }

    # Include workout count only if shareWorkouts is also enabled
    if privacy.get("shareWorkouts", False):
        completed_count = workout_sessions.count_documents({
            "email": user.get("email"),
            "status": "completed"
        })
        public_data["completedWorkouts"] = completed_count

    return jsonify(public_data), 200


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

    goal    = data.get("goal", "general fitness")
    age     = data.get("age", "unknown")
    weight  = data.get("weight", "unknown")
    history = data.get("history", [])   # list of {role, content} dicts

    # Fetch real stats for the system prompt
    user = users.find_one({"email": request.user_email})
    completed_sessions = list(workout_sessions.find({"email": request.user_email, "status": "completed"}))
    skipped_sessions_count = workout_sessions.count_documents({"email": request.user_email, "status": "skipped"})
    streak = user.get("streak", 0) if user else 0
    longest_streak = user.get("longest_streak", 0) if user else 0
    xp = user.get("xp", 0) if user else 0
    level = user.get("level", 1) if user else 1
    
    workouts_count = len(completed_sessions)
    prs = list(personal_records.find({"email": request.user_email}))
    pr_list = ", ".join([f"{pr.get('exercise')}: {pr.get('weight')}kg" for pr in prs]) if prs else "None yet"

    # System prompt using real stats
    system_prompt = f"""You are FitAI Coach, a friendly, knowledgeable personal trainer and nutrition expert.

User Profile & Real Database Statistics:
- Age: {age}
- Weight: {weight} kg
- Goal: {goal}
- Current Streak: {streak} days
- Longest Streak: {longest_streak} days
- Level: {level} (Total XP: {xp})
- Completed Workouts: {workouts_count}
- Skipped Workouts: {skipped_sessions_count}
- Personal Records: {pr_list}

Guidelines:
- Respond naturally to any message, including greetings.
- Reference these real statistics naturally to encourage and praise the user.
- If they skipped a workout recently, give them custom advice to get back on track.
- Use markdown (bold, bullet lists, headers) to format advice clearly.
- Remember everything said earlier in this conversation."""

    messages = [{"role": "system", "content": system_prompt}] + history

    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        temperature=0.7,
        max_tokens=1024,
    )

    advice = response.choices[0].message.content

    return jsonify({
        "advice": advice
    }), 200


# ==========================
# Change Password
# ==========================

@auth.route("/change-password", methods=["POST"])
@token_required
def change_password():
    data = request.json
    current_password = data.get("currentPassword")
    new_password = data.get("newPassword")

    if not current_password or not new_password:
        return jsonify({
            "message": "Missing password fields"
        }), 400

    user = users.find_one({"email": request.user_email})
    if not user:
        return jsonify({
            "message": "User not found"
        }), 404

    # Verify current password
    if not bcrypt.checkpw(
        current_password.encode("utf-8"),
        user["password"]
    ):
        return jsonify({
            "message": "Incorrect current password"
        }), 400

    # Hash new password
    hashed_password = bcrypt.hashpw(
        new_password.encode("utf-8"),
        bcrypt.gensalt()
    )

    # Update database record
    users.update_one(
        {"email": request.user_email},
        {"$set": {"password": hashed_password}}
    )

    return jsonify({
        "message": "Password changed successfully"
    }), 200


# ==========================
# Start Workout Session (Feature 1)
# ==========================
@auth.route("/workout/start", methods=["POST"])
@token_required
def start_workout_session():
    data = request.json
    exercise = data.get("exercise")
    sets = int(data.get("sets", 3))
    reps = int(data.get("reps", 10))
    weight = int(data.get("weight", 0))

    if not exercise:
        return jsonify({"message": "Exercise name is required"}), 400

    session = {
        "email": request.user_email,
        "exercise": exercise,
        "sets": sets,
        "reps": reps,
        "weight": weight,
        "status": "in_progress",
        "completed_sets": [False] * sets,
        "duration": 0,
        "calories": 0,
        "completion_rate": 0,
        "created_at": datetime.utcnow(),
        "completed_at": None
    }

    result = workout_sessions.insert_one(session)
    session["_id"] = str(result.inserted_id)
    session["created_at"] = session["created_at"].isoformat()

    return jsonify(session), 201


# ==========================
# Complete Set (Feature 2 & 3)
# ==========================
@auth.route("/workout/complete-set", methods=["POST"])
@token_required
def complete_set():
    data = request.json
    session_id = data.get("session_id")
    set_index = int(data.get("set_index"))
    checked = bool(data.get("checked"))

    if not session_id:
        return jsonify({"message": "Session ID is required"}), 400

    session = workout_sessions.find_one({"_id": ObjectId(session_id), "email": request.user_email})
    if not session:
        return jsonify({"message": "Session not found"}), 404

    completed_sets = session.get("completed_sets", [])
    if set_index < 0 or set_index >= len(completed_sets):
        return jsonify({"message": "Invalid set index"}), 400

    completed_sets[set_index] = checked
    checked_count = sum(1 for c in completed_sets if c)
    completion_rate = int((checked_count / len(completed_sets)) * 100)

    workout_sessions.update_one(
        {"_id": ObjectId(session_id)},
        {"$set": {"completed_sets": completed_sets, "completion_rate": completion_rate}}
    )

    session["_id"] = str(session["_id"])
    session["completed_sets"] = completed_sets
    session["completion_rate"] = completion_rate
    if session.get("created_at"):
        session["created_at"] = session["created_at"].isoformat()

    return jsonify(session), 200


# ==========================
# Finish Workout Session (Feature 1, 5, 7, 13, 14)
# ==========================
@auth.route("/workout/finish", methods=["POST"])
@token_required
def finish_workout():
    data = request.json
    session_id = data.get("session_id")
    duration = int(data.get("duration", 0)) # in seconds
    weight_lifted = data.get("weight") # optional actual weight
    reps_logged = data.get("reps") # optional actual reps

    if not session_id:
        return jsonify({"message": "Session ID is required"}), 400

    session = workout_sessions.find_one({"_id": ObjectId(session_id), "email": request.user_email})
    if not session:
        return jsonify({"message": "Session not found"}), 404

    sets = session.get("sets", 0)
    reps = reps_logged if reps_logged is not None else session.get("reps", 0)
    weight = weight_lifted if weight_lifted is not None else session.get("weight", 0)

    # Estimate calories
    calories = int(sets * reps * 0.2 + duration * 0.05)

    # Update session status
    workout_sessions.update_one(
        {"_id": ObjectId(session_id)},
        {
            "$set": {
                "status": "completed",
                "duration": duration,
                "calories": calories,
                "weight": weight,
                "reps": reps,
                "completed_at": datetime.utcnow()
            }
        }
    )

    # XP calculations (Feature 7)
    xp_earned = 100 # Base completion
    completed_sets = session.get("completed_sets", [])
    perfect = all(completed_sets) if completed_sets else False
    if perfect:
        xp_earned += 50

    # PR calculations (Feature 13)
    is_pr = False
    pr_doc = personal_records.find_one({"email": request.user_email, "exercise": session.get("exercise")})
    if not pr_doc or weight > pr_doc.get("weight", 0):
        is_pr = True
        personal_records.update_one(
            {"email": request.user_email, "exercise": session.get("exercise")},
            {"$set": {"weight": weight, "reps": reps, "achieved_at": datetime.utcnow()}},
            upsert=True
        )
        xp_earned += 80
        # Insert notification
        notifications.insert_one({
            "email": request.user_email,
            "message": f"🎉 New Personal Record in {session.get('exercise')}: {weight}kg!",
            "type": "pr",
            "created_at": datetime.utcnow(),
            "read": False
        })

    # Streaks calculations (Feature 5)
    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    yesterday_str = (datetime.utcnow() - timedelta(days=1)).strftime("%Y-%m-%d")

    user = users.find_one({"email": request.user_email})
    current_streak = user.get("streak", 0)
    longest_streak = user.get("longest_streak", 0)
    last_completed = user.get("last_workout_completed")
    workout_days = user.get("workout_days_this_month", [])

    if last_completed != today_str:
        if last_completed == yesterday_str:
            current_streak += 1
        else:
            current_streak = 1
        longest_streak = max(current_streak, longest_streak)

    if today_str not in workout_days:
        workout_days.append(today_str)

    # Update Level and XP (Feature 7)
    current_xp = user.get("xp", 0) + xp_earned
    current_level = int(current_xp / 500) + 1

    users.update_one(
        {"email": request.user_email},
        {
            "$set": {
                "xp": current_xp,
                "level": current_level,
                "streak": current_streak,
                "longest_streak": longest_streak,
                "last_workout_completed": today_str,
                "workout_days_this_month": workout_days
            }
        }
    )

    # Goal updates (Feature 10)
    goals.update_one(
        {"email": request.user_email, "type": "workout_days"},
        {"$inc": {"current": 1}},
        upsert=False
    )

    # Streak achievements notifications (Feature 6 & 12)
    if current_streak in [3, 7, 30]:
        notifications.insert_one({
            "email": request.user_email,
            "message": f"🔥 You've hit a {current_streak}-day workout streak!",
            "type": "streak",
            "created_at": datetime.utcnow(),
            "read": False
        })

    return jsonify({
        "message": "Workout finished successfully",
        "xp_earned": xp_earned,
        "total_xp": current_xp,
        "level": current_level,
        "is_pr": is_pr,
        "calories": calories,
        "streak": current_streak
    }), 200


# ==========================
# Skip Workout Session
# ==========================
@auth.route("/workout/skip", methods=["POST"])
@token_required
def skip_workout():
    data = request.json
    exercise = data.get("exercise", "General Workout")
    
    session = {
        "email": request.user_email,
        "exercise": exercise,
        "sets": 0,
        "reps": 0,
        "weight": 0,
        "status": "skipped",
        "completed_sets": [],
        "duration": 0,
        "calories": 0,
        "completion_rate": 0,
        "created_at": datetime.utcnow(),
        "completed_at": datetime.utcnow()
    }
    
    workout_sessions.insert_one(session)
    
    # Notify returning back
    notifications.insert_one({
        "email": request.user_email,
        "message": "⚠️ Workout skipped. Let's make sure we hit the next one! 💪",
        "type": "reminder",
        "created_at": datetime.utcnow(),
        "read": False
    })
    
    return jsonify({"message": "Workout skip logged"}), 201


# ==========================
# Get Dashboard / Summary Statistics (Feature 8, 10)
# ==========================
@auth.route("/dashboard/summary", methods=["GET"])
@token_required
def dashboard_summary():
    user = users.find_one({"email": request.user_email}, {"password": 0})
    if not user:
        return jsonify({"message": "User not found"}), 404

    streak = user.get("streak", 0)
    longest_streak = user.get("longest_streak", 0)
    xp = user.get("xp", 0)
    level = user.get("level", 1)

    # Weekly goal
    goal = goals.find_one({"email": request.user_email, "type": "workout_days"})
    goal_data = None
    if goal:
        goal_data = {
            "target": goal.get("target", 5),
            "current": goal.get("current", 0),
            "progress_pct": int((goal.get("current", 0) / max(goal.get("target", 1), 1)) * 100)
        }
    else:
        # Create standard weekly goal
        goals.insert_one({
            "email": request.user_email,
            "type": "workout_days",
            "target": 5.0,
            "current": 0.0,
            "week_start": datetime.utcnow().strftime("%Y-%m-%d")
        })
        goal_data = {
            "target": 5.0,
            "current": 0.0,
            "progress_pct": 0
        }

    # Fetch next planned workout template
    next_planned = workouts.find_one({"email": request.user_email})
    next_planned_data = None
    if next_planned:
        next_planned_data = {
            "id": str(next_planned["_id"]),
            "exercise": next_planned.get("exercise"),
            "sets": next_planned.get("sets"),
            "reps": next_planned.get("reps")
        }

    # Calories sum today
    today_sessions = list(workout_sessions.find({
        "email": request.user_email,
        "status": "completed",
        "completed_at": {
            "$gte": datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        }
    }))
    calories_today = sum(s.get("calories", 0) for s in today_sessions)

    # Fetch last 5 completed sessions
    recent_sessions = list(workout_sessions.find({
        "email": request.user_email,
        "status": "completed"
    }).sort("completed_at", -1).limit(5))

    recent_completed_data = []
    for rs in recent_sessions:
        recent_completed_data.append({
            "exercise": rs.get("exercise"),
            "sets": rs.get("sets"),
            "reps": rs.get("reps"),
            "weight": rs.get("weight", 0),
            "completed_at": rs.get("completed_at").strftime("%Y-%m-%d") if rs.get("completed_at") else ""
        })

    return jsonify({
        "streak": streak,
        "longest_streak": longest_streak,
        "xp": xp,
        "level": level,
        "goal": goal_data,
        "next_planned": next_planned_data,
        "calories_today": calories_today,
        "recent_completed": recent_completed_data
    }), 200


# ==========================
# Get Detailed Analytics (Feature 19)
# ==========================
@auth.route("/analytics/detailed", methods=["GET"])
@token_required
def get_detailed_analytics():
    completed_sessions = list(workout_sessions.find({"email": request.user_email, "status": "completed"}))
    skipped_count = workout_sessions.count_documents({"email": request.user_email, "status": "skipped"})
    total_workouts = len(completed_sessions)

    total_sets = sum(s.get("sets", 0) for s in completed_sessions)
    total_reps = sum(s.get("sets", 0) * s.get("reps", 0) for s in completed_sessions)
    total_calories = sum(s.get("calories", 0) for s in completed_sessions)
    total_duration_secs = sum(s.get("duration", 0) for s in completed_sessions)
    total_hours = round(total_duration_secs / 3600, 1)

    avg_duration = round((total_duration_secs / 60) / max(total_workouts, 1), 1)

    # Muscle distribution
    muscle_counts = {}
    for s in completed_sessions:
        ex = s.get("exercise", "")
        cat = "General"
        e = ex.lower()
        if "bench" in e or "chest" in e or "push" in e: cat = "Chest"
        elif "squat" in e or "leg" in e or "lunge" in e: cat = "Legs"
        elif "pull" in e or "row" in e or "back" in e or "lat" in e: cat = "Back"
        elif "run" in e or "cardio" in e or "cycle" in e: cat = "Cardio"
        elif "shoulder" in e or "press" in e or "ohp" in e: cat = "Shoulders"
        elif "curl" in e or "arm" in e or "tricep" in e or "bicep" in e: cat = "Arms"
        muscle_counts[cat] = muscle_counts.get(cat, 0) + 1

    muscle_dist = [{"name": k, "value": v} for k, v in muscle_counts.items()]

    # Personal records
    prs = list(personal_records.find({"email": request.user_email}))
    prs_data = []
    for pr in prs:
        prs_data.append({
            "exercise": pr.get("exercise"),
            "weight": pr.get("weight"),
            "reps": pr.get("reps")
        })

    # Weight history mapping
    user = users.find_one({"email": request.user_email})
    current_weight = int(user.get("weight", 75) if user.get("weight") else 75)
    weight_data = [
        {"date": "Week 1", "weight": current_weight + 1.5},
        {"date": "Week 2", "weight": current_weight + 1.0},
        {"date": "Week 3", "weight": current_weight + 0.5},
        {"date": "Week 4", "weight": current_weight}
    ]

    return jsonify({
        "total_workouts": total_workouts,
        "skipped_workouts": skipped_count,
        "total_sets": total_sets,
        "total_reps": total_reps,
        "total_calories": total_calories,
        "total_hours": total_hours,
        "average_duration_mins": avg_duration,
        "muscle_distribution": muscle_dist,
        "personal_records": prs_data,
        "weight_history": weight_data
    }), 200


# ==========================
# Get Calendar Map (Feature 9)
# ==========================
@auth.route("/calendar", methods=["GET"])
@token_required
def get_calendar():
    sessions = list(workout_sessions.find({"email": request.user_email}))
    calendar_map = {}

    for s in sessions:
        created = s.get("created_at") or s.get("completed_at")
        if not created:
            continue
        date_str = created.strftime("%Y-%m-%d")
        status = s.get("status", "planned")
        if date_str in calendar_map and calendar_map[date_str] == "completed":
            continue
        calendar_map[date_str] = status

    return jsonify(calendar_map), 200


# ==========================
# Manage Goals (Feature 10)
# ==========================
@auth.route("/goals", methods=["GET", "PUT"])
@token_required
def manage_goals():
    if request.method == "GET":
        goal = goals.find_one({"email": request.user_email, "type": "workout_days"})
        if not goal:
            goal = {
                "email": request.user_email,
                "type": "workout_days",
                "target": 5.0,
                "current": 0.0,
                "week_start": datetime.utcnow().strftime("%Y-%m-%d")
            }
            goals.insert_one(goal)

        goal["_id"] = str(goal["_id"])
        return jsonify(goal), 200

    else:
        data = request.json
        target = float(data.get("target", 5))
        current = float(data.get("current", 0))

        goals.update_one(
            {"email": request.user_email, "type": "workout_days"},
            {"$set": {"target": target, "current": current}},
            upsert=True
        )

        return jsonify({"message": "Goal updated successfully"}), 200


# Get Notifications (Feature 12)
# ==========================
@auth.route("/notifications", methods=["GET"])
@token_required
def get_notifications():
    notifs = list(notifications.find({"email": request.user_email}).sort("created_at", -1).limit(10))
    for n in notifs:
        n["_id"] = str(n["_id"])
        n["created_at"] = n["created_at"].isoformat()

    return jsonify(notifs), 200


# ==========================
# Seeding Exercises
# ==========================
@auth.route("/exercises/seed", methods=["POST"])
@token_required
def seed_exercises():
    seed_list = [
        {
            "name": "Bench Press",
            "category": "Strength",
            "difficulty": "Intermediate",
            "equipment": "Barbell, Bench",
            "primaryMuscles": ["Chest", "Triceps"],
            "secondaryMuscles": ["Front Shoulders"],
            "instructions": [
                "Lie flat on a bench with your feet flat on the floor.",
                "Grip the barbell with hands slightly wider than shoulder-width.",
                "Unrack the bar and lower it slowly to your mid-chest.",
                "Push the bar back up until your arms are fully extended."
            ],
            "commonMistakes": [
                "Arching the lower back excessively",
                "Bouncing the bar off your chest",
                "Locking elbows at the top"
            ],
            "tips": [
                "Keep your feet planted firmly on the ground",
                "Squeeze your shoulder blades together",
                "Keep your core engaged"
            ],
            "alternatives": ["Push-up", "Dumbbell Chest Press", "Cable Chest Fly"],
            "videoUrl": "https://www.youtube.com/embed/rT7DgCr-3pg",
            "thumbnailUrl": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop",
            "caloriesEstimate": 220,
            "recommendedSets": 4,
            "recommendedReps": 10,
            "dataVersion": 3
        },
        {
            "name": "Squat",
            "category": "Strength",
            "difficulty": "Beginner",
            "equipment": "Barbell (optional), Bodyweight",
            "primaryMuscles": ["Quads", "Glutes"],
            "secondaryMuscles": ["Hamstrings", "Core"],
            "instructions": [
                "Stand with feet shoulder-width apart.",
                "Keep your back straight, chest up, and hands in front of you.",
                "Lower your hips back and down as if sitting in a chair.",
                "Lower until your thighs are parallel to the floor, keeping knees behind toes.",
                "Push through your heels to return to standing."
            ],
            "commonMistakes": [
                "Allowing knees to cave inward",
                "Lifting heels off the floor",
                "Rounding your lower back"
            ],
            "tips": [
                "Focus on keeping your chest high",
                "Inhale as you go down, exhale as you push up",
                "Squeeze your glutes at the top of the movement"
            ],
            "alternatives": ["Leg Press", "Bulgarian Split Squats", "Goblet Squat"],
            "videoUrl": "https://www.youtube.com/embed/ultWZbUMPL8",
            "thumbnailUrl": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop",
            "caloriesEstimate": 280,
            "recommendedSets": 3,
            "recommendedReps": 12
        },
        {
            "name": "Deadlift",
            "category": "Strength",
            "difficulty": "Advanced",
            "equipment": "Barbell",
            "primaryMuscles": ["Hamstrings", "Glutes", "Lower Back"],
            "secondaryMuscles": ["Core", "Forearms", "Lats"],
            "instructions": [
                "Stand with feet mid-foot under the barbell.",
                "Bend over and grab the bar with a shoulder-width grip.",
                "Bend your knees until your shins touch the bar, keeping a flat back.",
                "Lift the bar by standing up, keeping it close to your body.",
                "Lock out your hips at the top and lower the bar under control."
            ],
            "commonMistakes": [
                "Rounding your spine or lower back",
                "Lifting primarily with your arms",
                "Pulling the bar away from your legs"
            ],
            "tips": [
                "Keep your spine neutral at all times",
                "Push the floor away with your feet",
                "Engage your lats to keep the bar close"
            ],
            "alternatives": ["Romanian Deadlift", "Trap Bar Deadlift", "Kettlebell Swing"],
            "videoUrl": "https://www.youtube.com/embed/XxWcirHIwVo",
            "thumbnailUrl": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop",
            "caloriesEstimate": 300,
            "recommendedSets": 3,
            "recommendedReps": 8
        },
        {
            "name": "Push-up",
            "category": "Strength",
            "difficulty": "Beginner",
            "equipment": "Bodyweight",
            "primaryMuscles": ["Chest", "Triceps"],
            "secondaryMuscles": ["Front Shoulders", "Core"],
            "instructions": [
                "Place hands shoulder-width apart on the floor, feet straight behind you.",
                "Lower your chest to the floor keeping elbows at a 45-degree angle.",
                "Push through hands to return to starting position."
            ],
            "commonMistakes": [
                "Sagging your hips or raising them too high",
                "Flaring elbows out to 90 degrees"
            ],
            "tips": [
                "Keep your entire body in a straight line",
                "Squeeze your glutes and core throughout"
            ],
            "alternatives": ["Knee Push-ups", "Incline Push-ups", "Dumbbell Press"],
            "videoUrl": "https://www.youtube.com/embed/IODxDxX7oi4",
            "thumbnailUrl": "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&auto=format&fit=crop",
            "caloriesEstimate": 180,
            "recommendedSets": 3,
            "recommendedReps": 15
        },
        {
            "name": "Plank",
            "category": "Core",
            "difficulty": "Beginner",
            "equipment": "Bodyweight",
            "primaryMuscles": ["Abdominals"],
            "secondaryMuscles": ["Shoulders", "Glutes"],
            "instructions": [
                "Rest forearms on the floor with elbows directly below your shoulders.",
                "Keep your body straight and toes tucked.",
                "Squeeze your abs and glutes, holding the position."
            ],
            "commonMistakes": [
                "Raising hips too high",
                "Arching your back and letting hips sag"
            ],
            "tips": [
                "Breathe deeply and consistently",
                "Draw your belly button in towards your spine"
            ],
            "alternatives": ["Side Plank", "Hollow Body Hold", "Dead Bug"],
            "videoUrl": "https://www.youtube.com/embed/pSHjTRCQxIw",
            "thumbnailUrl": "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&auto=format&fit=crop",
            "caloriesEstimate": 120,
            "recommendedSets": 3,
            "recommendedReps": 60
        },
        {
            "name": "Pull-up",
            "category": "Strength",
            "difficulty": "Intermediate",
            "equipment": "Pull-up Bar",
            "primaryMuscles": ["Lats", "Biceps"],
            "secondaryMuscles": ["Rear Shoulders", "Core"],
            "instructions": [
                "Grab the bar with an overhand grip slightly wider than shoulder-width.",
                "Hang with arms fully extended, shoulder blades relaxed.",
                "Pull your chest toward the bar, driving elbows down and back.",
                "Lower yourself in a controlled manner until arms are fully extended."
            ],
            "commonMistakes": [
                "Using momentum to swing up",
                "Not achieving full range of motion",
                "Shrugging shoulders instead of depressing them"
            ],
            "tips": [
                "Initiate the pull by depressing your shoulder blades",
                "Keep your core tight throughout",
                "Cross your feet to reduce swinging"
            ],
            "alternatives": ["Lat Pulldown", "Assisted Pull-up", "Inverted Row"],
            "videoUrl": "https://www.youtube.com/embed/eGo4IYlbE5g",
            "thumbnailUrl": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&auto=format&fit=crop",
            "caloriesEstimate": 200,
            "recommendedSets": 3,
            "recommendedReps": 8
        },
        {
            "name": "Overhead Press",
            "category": "Strength",
            "difficulty": "Intermediate",
            "equipment": "Barbell",
            "primaryMuscles": ["Shoulders", "Triceps"],
            "secondaryMuscles": ["Upper Chest", "Core"],
            "instructions": [
                "Stand with feet shoulder-width apart, bar resting on upper chest.",
                "Grip the bar just outside shoulder width.",
                "Press the bar overhead in a straight line, tilting head back slightly.",
                "Lock out overhead with arms fully extended.",
                "Lower the bar back to the starting position under control."
            ],
            "commonMistakes": [
                "Leaning back excessively and turning it into an incline press",
                "Flaring elbows too wide at the bottom",
                "Not engaging the core and lower back"
            ],
            "tips": [
                "Squeeze your glutes and abs to protect your lower back",
                "Think about pushing your head through your arms at the top",
                "Use a hip pop to initiate the lift if doing push press"
            ],
            "alternatives": ["Dumbbell Shoulder Press", "Arnold Press", "Pike Push-up"],
            "videoUrl": "https://www.youtube.com/embed/2yjwXTZQDDI",
            "thumbnailUrl": "https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=600&auto=format&fit=crop",
            "caloriesEstimate": 210,
            "recommendedSets": 4,
            "recommendedReps": 8
        },
        {
            "name": "Dumbbell Chest Press",
            "category": "Strength",
            "difficulty": "Beginner",
            "equipment": "Dumbbells, Bench",
            "primaryMuscles": ["Chest", "Triceps"],
            "secondaryMuscles": ["Front Shoulders"],
            "instructions": [
                "Lie on a bench holding a dumbbell in each hand at chest level.",
                "Press the dumbbells up and slightly together.",
                "Lower the dumbbells slowly back to chest level.",
                "Repeat for the desired number of reps."
            ],
            "commonMistakes": [
                "Letting the elbows flare too wide",
                "Allowing the lower back to arch off the bench",
                "Dropping the weight instead of lowering under control"
            ],
            "tips": [
                "Maintain a slight arch in your upper back only",
                "Squeeze your chest at the top of the movement",
                "Control the negative (lowering) portion"
            ],
            "alternatives": ["Bench Press", "Cable Chest Fly", "Chest Press Machine"],
            "videoUrl": "https://www.youtube.com/embed/VmB1G1K7v94",
            "thumbnailUrl": "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&auto=format&fit=crop",
            "caloriesEstimate": 200,
            "recommendedSets": 3,
            "recommendedReps": 12
        },
        {
            "name": "Barbell Row",
            "category": "Strength",
            "difficulty": "Intermediate",
            "equipment": "Barbell",
            "primaryMuscles": ["Lats", "Rhomboids", "Biceps"],
            "secondaryMuscles": ["Rear Shoulders", "Lower Back"],
            "instructions": [
                "Stand with feet hip-width apart. Bend over until torso is roughly 45 degrees.",
                "Grab the barbell with a shoulder-width overhand grip.",
                "Pull the bar toward your lower chest, driving elbows back.",
                "Lower the bar in a controlled manner back to the starting position."
            ],
            "commonMistakes": [
                "Using momentum to row the bar instead of muscle",
                "Rounding your lower back",
                "Pulling to the wrong position (too high or too low)"
            ],
            "tips": [
                "Keep your back flat and core braced throughout",
                "Think about pulling with your elbows, not your hands",
                "Squeeze your shoulder blades together at the top"
            ],
            "alternatives": ["Dumbbell Row", "Cable Row", "Chest-Supported Row"],
            "videoUrl": "https://www.youtube.com/embed/FWJR5Ve8bnQ",
            "thumbnailUrl": "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&auto=format&fit=crop",
            "caloriesEstimate": 240,
            "recommendedSets": 4,
            "recommendedReps": 10
        },
        {
            "name": "Romanian Deadlift",
            "category": "Strength",
            "difficulty": "Intermediate",
            "equipment": "Barbell",
            "primaryMuscles": ["Hamstrings", "Glutes"],
            "secondaryMuscles": ["Lower Back", "Core"],
            "instructions": [
                "Stand holding a barbell at hip level with an overhand grip.",
                "Keep knees slightly bent and push your hips back as you lower the bar.",
                "Lower the bar along your legs until you feel a stretch in your hamstrings.",
                "Drive your hips forward to return to standing."
            ],
            "commonMistakes": [
                "Bending knees too much, turning it into a deadlift",
                "Rounding the lower back",
                "Not feeling tension in the hamstrings"
            ],
            "tips": [
                "Keep the bar close to your legs at all times",
                "Focus on the hip hinge, not bending your knees",
                "Go as low as your hamstring flexibility allows"
            ],
            "alternatives": ["Deadlift", "Good Morning", "Nordic Curl"],
            "videoUrl": "https://www.youtube.com/embed/JCXUYuzwNrM",
            "thumbnailUrl": "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&auto=format&fit=crop",
            "caloriesEstimate": 260,
            "recommendedSets": 3,
            "recommendedReps": 10
        },
        {
            "name": "Lat Pulldown",
            "category": "Strength",
            "difficulty": "Beginner",
            "equipment": "Cable Machine",
            "primaryMuscles": ["Lats", "Biceps"],
            "secondaryMuscles": ["Rear Shoulders", "Core"],
            "instructions": [
                "Sit at a cable machine and grip the bar slightly wider than shoulder-width.",
                "Lean back slightly and pull the bar down to your upper chest.",
                "Squeeze your lats at the bottom, then return bar to top slowly."
            ],
            "commonMistakes": [
                "Pulling the bar behind the neck",
                "Using too much momentum",
                "Shrugging instead of depressing the shoulder blades"
            ],
            "tips": [
                "Initiate the movement by pulling your shoulder blades down first",
                "Keep your chest up and core braced",
                "Control the weight on the way back up"
            ],
            "alternatives": ["Pull-up", "Cable Row", "Dumbbell Row"],
            "videoUrl": "https://www.youtube.com/embed/CAwf7n6Luuc",
            "thumbnailUrl": "https://images.unsplash.com/photo-1517344368193-41552b6ad3f5?w=600&auto=format&fit=crop",
            "caloriesEstimate": 190,
            "recommendedSets": 3,
            "recommendedReps": 12
        },
        {
            "name": "Bulgarian Split Squat",
            "category": "Strength",
            "difficulty": "Advanced",
            "equipment": "Dumbbells, Bench",
            "primaryMuscles": ["Quads", "Glutes"],
            "secondaryMuscles": ["Hamstrings", "Core"],
            "instructions": [
                "Stand a couple of feet in front of a bench, holding dumbbells.",
                "Place the top of your rear foot on the bench.",
                "Lower your back knee toward the floor, keeping front shin vertical.",
                "Push through your front heel to return to the starting position."
            ],
            "commonMistakes": [
                "Front knee caving inward",
                "Leaning too far forward",
                "Standing too close to the bench"
            ],
            "tips": [
                "Keep most of your weight through your front foot",
                "Look straight ahead for balance",
                "Keep your torso upright"
            ],
            "alternatives": ["Squat", "Lunges", "Step-up"],
            "videoUrl": "https://www.youtube.com/embed/2C-uNgKwPLE",
            "thumbnailUrl": "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=600&auto=format&fit=crop",
            "caloriesEstimate": 270,
            "recommendedSets": 3,
            "recommendedReps": 10
        },
        {
            "name": "Dumbbell Lateral Raise",
            "category": "Strength",
            "difficulty": "Beginner",
            "equipment": "Dumbbells",
            "primaryMuscles": ["Lateral Deltoids"],
            "secondaryMuscles": ["Front Shoulders", "Traps"],
            "instructions": [
                "Stand holding light dumbbells at your sides.",
                "Raise your arms to the side until they are parallel to the floor.",
                "Pause briefly at the top, then lower slowly."
            ],
            "commonMistakes": [
                "Using momentum to swing the weights",
                "Going too heavy and compensating with traps",
                "Not controlling the negative portion"
            ],
            "tips": [
                "Keep a slight bend in your elbows throughout",
                "Lead with your elbows, not your wrists",
                "Lighter weight with strict form beats heavy and sloppy"
            ],
            "alternatives": ["Cable Lateral Raise", "Machine Lateral Raise", "Overhead Press"],
            "videoUrl": "https://www.youtube.com/embed/3VcKaXpzqRo",
            "thumbnailUrl": "https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?w=600&auto=format&fit=crop",
            "caloriesEstimate": 150,
            "recommendedSets": 3,
            "recommendedReps": 15
        },
        {
            "name": "Bicep Curl",
            "category": "Strength",
            "difficulty": "Beginner",
            "equipment": "Dumbbells",
            "primaryMuscles": ["Biceps"],
            "secondaryMuscles": ["Forearms"],
            "instructions": [
                "Stand holding dumbbells at arm's length with palms facing forward.",
                "Curl the weights up toward your shoulders, keeping elbows tucked.",
                "Squeeze at the top, then lower slowly back to the starting position."
            ],
            "commonMistakes": [
                "Swinging the torso to help lift the weight",
                "Not fully extending the arms at the bottom",
                "Letting elbows flare out to the sides"
            ],
            "tips": [
                "Keep your elbows pinned at your sides throughout",
                "Supinate (rotate) your palms as you curl for full contraction",
                "Control the lowering phase for more time under tension"
            ],
            "alternatives": ["Barbell Curl", "Hammer Curl", "Cable Curl"],
            "videoUrl": "https://www.youtube.com/embed/ykJmrZ5v0Oo",
            "thumbnailUrl": "https://images.unsplash.com/photo-1581009137042-c552e485697a?w=600&auto=format&fit=crop",
            "caloriesEstimate": 140,
            "recommendedSets": 3,
            "recommendedReps": 12
        },
        {
            "name": "Tricep Dip",
            "category": "Strength",
            "difficulty": "Intermediate",
            "equipment": "Parallel Bars",
            "primaryMuscles": ["Triceps"],
            "secondaryMuscles": ["Chest", "Front Shoulders"],
            "instructions": [
                "Grip parallel bars and support your body weight with arms locked out.",
                "Lean slightly forward and lower your body by bending your elbows.",
                "Lower until your upper arms are roughly parallel to the floor.",
                "Push back up until arms are locked out."
            ],
            "commonMistakes": [
                "Flaring elbows too far outward",
                "Not going through the full range of motion",
                "Shrugging shoulders at the top"
            ],
            "tips": [
                "Control the descent for 2-3 seconds",
                "Keep your chest up and don't round your back",
                "Add weight with a belt once bodyweight becomes easy"
            ],
            "alternatives": ["Bench Dip", "Cable Pushdown", "Close-Grip Bench Press"],
            "videoUrl": "https://www.youtube.com/embed/wjUmnZH528Y",
            "thumbnailUrl": "https://images.unsplash.com/photo-1598632640487-6ea4a4e8b963?w=600&auto=format&fit=crop",
            "caloriesEstimate": 175,
            "recommendedSets": 3,
            "recommendedReps": 12
        },
        {
            "name": "Lunges",
            "category": "Strength",
            "difficulty": "Beginner",
            "equipment": "Bodyweight",
            "primaryMuscles": ["Quads", "Glutes"],
            "secondaryMuscles": ["Hamstrings", "Core"],
            "instructions": [
                "Stand with feet together and hands on your hips.",
                "Step one foot forward and lower your back knee toward the ground.",
                "Keep your front shin vertical and chest upright.",
                "Push off the front foot to return to the starting position."
            ],
            "commonMistakes": [
                "Front knee going past the toe",
                "Leaning the torso forward",
                "Taking too short of a step"
            ],
            "tips": [
                "Take a big enough step so your front shin stays vertical",
                "Keep your core braced and shoulders back",
                "Look straight ahead to maintain balance"
            ],
            "alternatives": ["Bulgarian Split Squat", "Step-up", "Squat"],
            "videoUrl": "https://www.youtube.com/embed/QOVaHwm-Q6U",
            "thumbnailUrl": "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=600&auto=format&fit=crop",
            "caloriesEstimate": 230,
            "recommendedSets": 3,
            "recommendedReps": 12
        },
        {
            "name": "Cable Chest Fly",
            "category": "Strength",
            "difficulty": "Intermediate",
            "equipment": "Cable Machine",
            "primaryMuscles": ["Chest"],
            "secondaryMuscles": ["Front Shoulders"],
            "instructions": [
                "Set cables at chest height on both sides.",
                "Stand in the middle and grab both handles, stepping forward slightly.",
                "With a slight bend in the elbows, bring your hands together in front of you.",
                "Slowly return to the starting position, feeling the stretch."
            ],
            "commonMistakes": [
                "Bending elbows too much, turning it into a press",
                "Using too much weight and relying on momentum",
                "Not fully squeezing the chest at the peak contraction"
            ],
            "tips": [
                "Imagine hugging a large tree",
                "Keep a consistent elbow angle throughout",
                "Control the return to feel the full stretch"
            ],
            "alternatives": ["Dumbbell Fly", "Pec Deck", "Bench Press"],
            "videoUrl": "https://www.youtube.com/embed/Iwe6AmxVf7o",
            "thumbnailUrl": "https://images.unsplash.com/photo-1547919307-1ecb10702e6f?w=600&auto=format&fit=crop",
            "caloriesEstimate": 180,
            "recommendedSets": 3,
            "recommendedReps": 15
        },
        {
            "name": "Burpee",
            "category": "Cardio",
            "difficulty": "Intermediate",
            "equipment": "Bodyweight",
            "primaryMuscles": ["Full Body"],
            "secondaryMuscles": ["Cardiorespiratory System"],
            "instructions": [
                "Stand with feet shoulder-width apart.",
                "Drop your hands to the floor and jump your feet back into a push-up position.",
                "Do one push-up, then jump your feet back toward your hands.",
                "Explode upward, jumping with arms overhead."
            ],
            "commonMistakes": [
                "Sagging hips during the push-up portion",
                "Landing with stiff knees on the jump",
                "Rushing without proper form"
            ],
            "tips": [
                "Scale by stepping instead of jumping if needed",
                "Breathe out on the exertion (jump phase)",
                "Keep a steady rhythm rather than going too fast"
            ],
            "alternatives": ["Mountain Climber", "Jumping Jacks", "Box Jump"],
            "videoUrl": "https://www.youtube.com/embed/dZgVxmf6jkA",
            "thumbnailUrl": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop",
            "caloriesEstimate": 350,
            "recommendedSets": 3,
            "recommendedReps": 10
        },
        {
            "name": "Mountain Climber",
            "category": "Cardio",
            "difficulty": "Beginner",
            "equipment": "Bodyweight",
            "primaryMuscles": ["Core", "Hip Flexors"],
            "secondaryMuscles": ["Shoulders", "Quads"],
            "instructions": [
                "Start in a high plank position with arms fully extended.",
                "Drive one knee toward your chest, then quickly switch legs.",
                "Keep your hips level and core tight throughout."
            ],
            "commonMistakes": [
                "Letting hips rise up or sag down",
                "Bouncing off the arms rather than driving the knees",
                "Holding your breath"
            ],
            "tips": [
                "The faster you go, the more cardio benefit you get",
                "Keep shoulders directly over wrists",
                "Breathe rhythmically"
            ],
            "alternatives": ["Plank", "Burpee", "High Knees"],
            "videoUrl": "https://www.youtube.com/embed/nmwgirgXLYM",
            "thumbnailUrl": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop",
            "caloriesEstimate": 300,
            "recommendedSets": 3,
            "recommendedReps": 30
        },
        {
            "name": "Hip Thrust",
            "category": "Strength",
            "difficulty": "Intermediate",
            "equipment": "Barbell, Bench",
            "primaryMuscles": ["Glutes"],
            "secondaryMuscles": ["Hamstrings", "Core"],
            "instructions": [
                "Sit on the floor with your upper back against a bench.",
                "Roll a barbell over your hips and place feet flat on the floor.",
                "Drive your hips up by squeezing your glutes until your body is level.",
                "Lower your hips back to the floor with control."
            ],
            "commonMistakes": [
                "Hyperextending the lower back at the top",
                "Not fully extending the hips",
                "Letting feet slide during the movement"
            ],
            "tips": [
                "Use a pad on the barbell to protect your hips",
                "Tuck your chin to keep your spine neutral",
                "Pause and squeeze hard at the top"
            ],
            "alternatives": ["Glute Bridge", "Cable Kickback", "Romanian Deadlift"],
            "videoUrl": "https://www.youtube.com/embed/SEdqd1n0cvg",
            "thumbnailUrl": "https://images.unsplash.com/photo-1596357395217-80de13130e92?w=600&auto=format&fit=crop",
            "caloriesEstimate": 210,
            "recommendedSets": 4,
            "recommendedReps": 12
        },
        {
            "name": "Side Plank",
            "category": "Core",
            "difficulty": "Beginner",
            "equipment": "Bodyweight",
            "primaryMuscles": ["Obliques"],
            "secondaryMuscles": ["Abdominals", "Shoulders"],
            "instructions": [
                "Lie on your side with legs stacked, forearm on the floor.",
                "Lift your hips off the floor to form a straight line.",
                "Hold the position, keeping your body rigid."
            ],
            "commonMistakes": [
                "Letting hips drop toward the floor",
                "Rotating the torso forward or backward",
                "Bracing only one side and neglecting the other"
            ],
            "tips": [
                "Stack your feet or stagger them for better balance",
                "Reach your free arm toward the ceiling for extra challenge",
                "Work both sides equally"
            ],
            "alternatives": ["Plank", "Dead Bug", "Russian Twist"],
            "videoUrl": "https://www.youtube.com/embed/_rdfjFSFKMY",
            "thumbnailUrl": "https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=600&auto=format&fit=crop",
            "caloriesEstimate": 100,
            "recommendedSets": 3,
            "recommendedReps": 30
        },
        {
            "name": "Russian Twist",
            "category": "Core",
            "difficulty": "Intermediate",
            "equipment": "Bodyweight / Weight Plate",
            "primaryMuscles": ["Obliques", "Abdominals"],
            "secondaryMuscles": ["Hip Flexors"],
            "instructions": [
                "Sit on the floor with knees bent, feet slightly off the floor.",
                "Lean back slightly to engage your core.",
                "Hold a weight plate or clasp your hands, and rotate your torso side to side."
            ],
            "commonMistakes": [
                "Moving only your arms instead of your torso",
                "Holding your breath",
                "Rounding your lower back"
            ],
            "tips": [
                "Keep your chest tall and spine neutral",
                "Go slow and controlled to maximize muscle activation",
                "For more difficulty, extend legs out further"
            ],
            "alternatives": ["Side Plank", "Bicycle Crunch", "Cable Wood Chop"],
            "videoUrl": "https://www.youtube.com/embed/wkD8rjkodUI",
            "thumbnailUrl": "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&auto=format&fit=crop",
            "caloriesEstimate": 130,
            "recommendedSets": 3,
            "recommendedReps": 20
        },
        {
            "name": "Box Jump",
            "category": "Cardio",
            "difficulty": "Intermediate",
            "equipment": "Plyo Box",
            "primaryMuscles": ["Quads", "Glutes", "Calves"],
            "secondaryMuscles": ["Hamstrings", "Core"],
            "instructions": [
                "Stand in front of a sturdy box with feet shoulder-width apart.",
                "Bend your knees and swing your arms back.",
                "Explode upward and land softly on top of the box with bent knees.",
                "Step down carefully and repeat."
            ],
            "commonMistakes": [
                "Landing with straight legs instead of soft knees",
                "Jumping from a box that is too high",
                "Not fully extending hips at the top"
            ],
            "tips": [
                "Land as softly as possible to protect your joints",
                "Always step down rather than jumping off",
                "Start with a lower box and build up progressively"
            ],
            "alternatives": ["Squat Jump", "Step-up", "Burpee"],
            "videoUrl": "https://www.youtube.com/embed/NBY9-kTuHEk",
            "thumbnailUrl": "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=600&auto=format&fit=crop",
            "caloriesEstimate": 320,
            "recommendedSets": 4,
            "recommendedReps": 8
        },
        {
            "name": "Yoga Sun Salutation",
            "category": "Mobility",
            "difficulty": "Beginner",
            "equipment": "Yoga Mat",
            "primaryMuscles": ["Full Body"],
            "secondaryMuscles": ["Spine", "Hips"],
            "instructions": [
                "Start in Mountain Pose (standing upright, hands at sides).",
                "Inhale and sweep arms overhead into Upward Salute.",
                "Exhale and fold forward into Standing Forward Bend.",
                "Step back into Plank Pose and lower to Chaturanga.",
                "Inhale into Upward Dog, then exhale into Downward Dog.",
                "Walk feet forward, rise back up and repeat."
            ],
            "commonMistakes": [
                "Rushing through the sequence without breath",
                "Collapsing the lower back in Upward Dog",
                "Not engaging the core in Plank"
            ],
            "tips": [
                "Move with your breath — one movement per breath",
                "Modify poses as needed for your flexibility",
                "Focus on lengthening the spine in every pose"
            ],
            "alternatives": ["Hip Flexor Stretch", "Cat-Cow Stretch", "Downward Dog"],
            "videoUrl": "https://www.youtube.com/embed/73sjOu0g58M",
            "thumbnailUrl": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop",
            "caloriesEstimate": 100,
            "recommendedSets": 1,
            "recommendedReps": 5
        },
        {
            "name": "Hip Flexor Stretch",
            "category": "Mobility",
            "difficulty": "Beginner",
            "equipment": "Bodyweight",
            "primaryMuscles": ["Hip Flexors"],
            "secondaryMuscles": ["Quads", "Lower Back"],
            "instructions": [
                "Kneel on one knee with the other foot in front, forming a 90-degree angle.",
                "Shift your weight forward, feeling a stretch in the front of the rear hip.",
                "Hold for 20-30 seconds, then switch sides."
            ],
            "commonMistakes": [
                "Arching the lower back instead of tilting the pelvis",
                "Not sinking deep enough to feel the stretch",
                "Holding your breath"
            ],
            "tips": [
                "Squeeze the glute of the kneeling leg to deepen the stretch",
                "Keep your torso upright and chest tall",
                "Breathe deeply throughout the hold"
            ],
            "alternatives": ["Pigeon Pose", "Couch Stretch", "Yoga Sun Salutation"],
            "videoUrl": "https://www.youtube.com/embed/0Qr57fLXGgU",
            "thumbnailUrl": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop",
            "caloriesEstimate": 60,
            "recommendedSets": 2,
            "recommendedReps": 30
        }
    ]

    # Drop all existing exercises to remove duplicates, then re-seed cleanly
    exercises.drop()
    if seed_list:
        exercises.insert_many(seed_list)

    return jsonify({"message": f"Exercises seeded with {len(seed_list)} exercises"}), 200


# ==========================
# Get All Exercises
# ==========================
@auth.route("/exercises", methods=["GET"])
@token_required
def get_all_exercises():
    # Query parameters
    search_query = request.args.get("q", "").strip()
    category = request.args.get("category", "").strip()
    difficulty = request.args.get("difficulty", "").strip()
    muscle = request.args.get("muscle", "").strip()
    equipment = request.args.get("equipment", "").strip()

    query = {}
    if search_query:
        query["name"] = {"$regex": search_query, "$options": "i"}
    if category:
        query["category"] = category
    if difficulty:
        query["difficulty"] = difficulty
    if muscle:
        query["$or"] = [
            {"primaryMuscles": {"$regex": muscle, "$options": "i"}},
            {"secondaryMuscles": {"$regex": muscle, "$options": "i"}}
        ]
    if equipment:
        query["equipment"] = {"$regex": equipment, "$options": "i"}

    exs = list(exercises.find(query))
    for e in exs:
        e["_id"] = str(e["_id"])

    return jsonify(exs), 200


# ==========================
# Get Exercise By ID
# ==========================
@auth.route("/exercises/<id>", methods=["GET"])
@token_required
def get_exercise_by_id(id):
    try:
        e = exercises.find_one({"_id": ObjectId(id)})
        if not e:
            return jsonify({"message": "Exercise not found"}), 404
        e["_id"] = str(e["_id"])
        return jsonify(e), 200
    except Exception:
        return jsonify({"message": "Invalid Exercise ID"}), 400


# ==========================
# AI Exercise Coach (Contextual Chat)
# ==========================
@auth.route("/ai-coach/exercise", methods=["POST"])
@token_required
def ask_exercise_coach():
    data = request.json
    exercise_id = data.get("exerciseId")
    user_query = data.get("message")
    chat_history = data.get("history", [])

    if not user_query:
        return jsonify({"message": "Message is required"}), 400

    exercise_context = ""
    if exercise_id:
        try:
            ex = exercises.find_one({"_id": ObjectId(exercise_id)})
            if ex:
                exercise_context = f"""
Here is the official reference data for the exercise we are discussing:
Exercise Name: {ex.get('name')}
Category: {ex.get('category')}
Difficulty: {ex.get('difficulty')}
Equipment: {ex.get('equipment')}
Primary Muscles Target: {', '.join(ex.get('primaryMuscles', []))}
Secondary Muscles: {', '.join(ex.get('secondaryMuscles', []))}
Instructions:
{chr(10).join([f'- {inst}' for inst in ex.get('instructions', [])])}
Common Mistakes to Avoid:
{chr(10).join([f'- {mistake}' for mistake in ex.get('commonMistakes', [])])}
Pro Tips:
{chr(10).join([f'- {tip}' for tip in ex.get('tips', [])])}
Recommended sets/reps: {ex.get('recommendedSets')} sets x {ex.get('recommendedReps')} reps.
"""
        except Exception:
            pass

    # Construct the Groq system instructions
    system_instruction = f"""You are FitAI Coach, a certified strength and conditioning specialist.
{exercise_context}
Use the above exercise context when answering the user's question. If the user asks about form, mistakes, tips, or alternatives, guide them strictly using this expert reference. Keep your tone motivational, clear, concise, and structured (using bold headings or bullet points where appropriate). Always prioritize safety and technique.
"""

    messages = [{"role": "system", "content": system_instruction}]
    for msg in chat_history:
        messages.append({
            "role": msg.get("role"),
            "content": msg.get("content")
        })
    messages.append({"role": "user", "content": user_query})

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7,
            max_tokens=1024
        )
        ai_response = completion.choices[0].message.content
        return jsonify({"response": ai_response}), 200
    except Exception as e:
        print("Groq API Error:", e)
        return jsonify({"message": "AI Coach failed to generate response."}), 500


# ==========================
# Post Feedback
# ==========================
@auth.route("/feedback", methods=["POST"])
@token_required
def post_feedback():
    data = request.json
    feedback_type = data.get("type", "General Praise")
    comment = data.get("comment", "")
    rating = int(data.get("rating", 5))

    if not comment:
        return jsonify({"message": "Comment is required"}), 400

    feedback_doc = {
        "email": request.user_email,
        "type": feedback_type,
        "comment": comment,
        "rating": rating,
        "featured": False,
        "created_at": datetime.utcnow()
    }
    feedbacks.insert_one(feedback_doc)

    return jsonify({"message": "Feedback submitted successfully! Thank you! ❤️"}), 200


# ==========================
# Get All Feedback (Developer/Admin View)
# ==========================
@auth.route("/feedback/all", methods=["GET"])
@token_required
def get_all_feedback():
    if request.user_email != "owner@fitai.com":
        return jsonify({"message": "Access denied: Owner only."}), 403

    all_fb = list(feedbacks.find().sort("created_at", -1))
    for fb in all_fb:
        fb["_id"] = str(fb["_id"])
        fb["created_at"] = fb["created_at"].isoformat() if fb.get("created_at") else None
    return jsonify(all_fb), 200


# ==========================
# Reply to Feedback (Owner Only)
# ==========================
@auth.route("/feedback/<feedback_id>/reply", methods=["POST"])
@token_required
def reply_to_feedback(feedback_id):
    if request.user_email != "owner@fitai.com":
        return jsonify({"message": "Access denied: Owner only."}), 403

    data = request.json
    reply_text = data.get("reply", "").strip()

    if not reply_text:
        return jsonify({"message": "Reply content is required"}), 400

    feedback = feedbacks.find_one({"_id": ObjectId(feedback_id)})
    if not feedback:
        return jsonify({"message": "Feedback not found"}), 404

    feedbacks.update_one(
        {"_id": ObjectId(feedback_id)},
        {
            "$set": {
                "reply": reply_text,
                "replied_at": datetime.utcnow()
            }
        }
    )

    return jsonify({"message": "Reply saved successfully!"}), 200


# ==========================
# Toggle Featured Feedback (Owner Only)
# ==========================
@auth.route("/feedback/<feedback_id>/feature", methods=["POST"])
@token_required
def toggle_feature_feedback(feedback_id):
    if request.user_email != "owner@fitai.com":
        return jsonify({"message": "Access denied: Owner only."}), 403

    feedback = feedbacks.find_one({"_id": ObjectId(feedback_id)})
    if not feedback:
        return jsonify({"message": "Feedback not found"}), 404

    current_status = feedback.get("featured", False)
    new_status = not current_status

    feedbacks.update_one(
        {"_id": ObjectId(feedback_id)},
        {"$set": {"featured": new_status}}
    )

    return jsonify({
        "message": f"Feedback status updated successfully. Featured: {new_status}",
        "featured": new_status
    }), 200


# ==========================
# Get Featured Feedbacks (Public Endpoint)
# ==========================
@auth.route("/feedback/featured", methods=["GET"])
def get_featured_feedbacks():
    featured_list = list(feedbacks.find({"featured": True}).sort("created_at", -1))
    
    formatted_list = []
    for fb in featured_list:
        raw_email = fb.get("email", "Anonymous")
        user_doc = users.find_one({"email": raw_email})
        user_name = user_doc.get("name", "FitAI Athlete") if user_doc else "FitAI Athlete"

        formatted_list.append({
            "_id": str(fb["_id"]),
            "name": user_name,
            "type": fb.get("type", "General Praise"),
            "comment": fb.get("comment", ""),
            "rating": fb.get("rating", 5),
            "created_at": fb["created_at"].isoformat() if fb.get("created_at") else None
        })

    return jsonify(formatted_list), 200

