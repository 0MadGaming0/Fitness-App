import os
import sys
import getpass
import bcrypt
from pymongo import MongoClient

# Add backend directory to sys.path to load config
backend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
sys.path.append(backend_path)

try:
    from config import MONGO_URI
except ImportError:
    MONGO_URI = "mongodb://localhost:27017/fitness_app"

def main():
    print("=" * 70)
    print("                 FITAI RESERVED OWNER ACCOUNT CREATOR")
    print("=" * 70)
    print(" This script creates or updates the reserved owner account:")
    print(" Email:    owner@fitai.com")
    print(" Username: Owner")
    print("=" * 70)

    try:
        # Check command line arguments for password
        if len(sys.argv) > 1:
            password = sys.argv[1]
        else:
            # Prompt securely for password
            password = getpass.getpass("Enter a secure password for the Owner account: ")

        if not password or len(password) < 6:
            print("❌ Password must be at least 6 characters long!")
            return

        if len(sys.argv) == 1:
            confirm_password = getpass.getpass("Confirm password: ")
            if password != confirm_password:
                print("❌ Passwords do not match!")
                return

        # Hash password using bcrypt
        hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

        # Save to database
        client = MongoClient(MONGO_URI, tls=True, tlsAllowInvalidCertificates=True)
        db = client["fitness_app"]
        users_col = db["users"]

        # Check/Upsert owner profile
        owner_doc = {
            "name": "Owner",
            "email": "owner@fitai.com",
            "password": hashed,
            "role": "owner" # Extra tag for identifying ownership
        }

        # Update if exists, otherwise insert
        users_col.update_one(
            {"email": "owner@fitai.com"},
            {"$set": owner_doc},
            upsert=True
        )

        print("\n✅ Success: The owner account has been securely created/updated!")
        print("   Email:    owner@fitai.com")
        print("   Password: [Secured & Hashed]")
        print("   You can now log in using these credentials on the login screen.")
        print("=" * 70)

    except Exception as e:
        print(f"\n❌ Error creating owner account: {e}")
        print("=" * 70)

if __name__ == "__main__":
    main()
