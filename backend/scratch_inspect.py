import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI, tls=True, tlsAllowInvalidCertificates=True)
db = client["fitness_app"]
workouts = db["workouts"]

print("Listing first 5 workouts in DB:")
for w in workouts.find().limit(5):
    print(w)
