from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient
from config import MONGO_URI
from routes.auth import auth


app = Flask(__name__)
CORS(app)
app.register_blueprint(auth)

client = MongoClient(
    MONGO_URI,
    tls=True,
    tlsAllowInvalidCertificates=True
)

try:
    client.admin.command("ping")
    print("✅ MongoDB Connected Successfully!")
except Exception as e:
    print("❌ Connection Failed:", e)


@app.route("/")
def home():
    return {"message": "Fitness App API Running"}

import os

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=False
    )