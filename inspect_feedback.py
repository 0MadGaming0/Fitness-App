import os
import sys
from pymongo import MongoClient

# Add backend directory to sys.path to load config
backend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
sys.path.append(backend_path)

try:
    from config import MONGO_URI
except ImportError:
    # Fallback to standard local connection if not loaded
    MONGO_URI = "mongodb://localhost:27017/fitness_app"

def main():
    print("=" * 70)
    print("                 FITAI USER FEEDBACK INSPECTOR")
    print("=" * 70)
    
    try:
        client = MongoClient(MONGO_URI, tls=True, tlsAllowInvalidCertificates=True)
        db = client["fitness_app"]
        feedbacks_col = db["feedbacks"]
        
        feedbacks = list(feedbacks_col.find().sort("created_at", -1))
        
        if not feedbacks:
            print("\n   No user feedback has been submitted yet.")
            print("=" * 70)
            return

        print(f"\n   Found {len(feedbacks)} user feedback entry/entries:\n")
        
        for idx, fb in enumerate(feedbacks):
            email = fb.get("email", "Unknown Email")
            fb_type = fb.get("type", "General Praise")
            rating = fb.get("rating", 5)
            comment = fb.get("comment", "")
            created_at = fb.get("created_at", "N/A")
            
            stars = "⭐" * rating
            
            print(f"[{idx + 1}] User: {email}")
            print(f"    Date:   {created_at}")
            print(f"    Type:   {fb_type}")
            print(f"    Rating: {stars} ({rating}/5)")
            print(f"    Message:")
            print(f"      \"{comment}\"")
            print("-" * 70)
            
    except Exception as e:
        print(f"❌ Failed to query database: {e}")
        print("Please check your MONGO_URI config and connection.")
        print("=" * 70)

if __name__ == "__main__":
    main()
