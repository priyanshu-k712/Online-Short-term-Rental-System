from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.database import Database

from .config import DATABASE_NAME, MONGODB_URI

client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
db: Database = client[DATABASE_NAME]


def initialize_database() -> None:
    """Check MongoDB connectivity and create indexes needed by the app."""
    client.admin.command("ping")
    db.users.create_index([("email", ASCENDING)], unique=True)
    db.properties.create_index([("host_id", ASCENDING)])
    db.properties.create_index([("location", ASCENDING)])
    db.bookings.create_index(
        [
            ("property_id", ASCENDING),
            ("status", ASCENDING),
            ("check_in", ASCENDING),
            ("check_out", ASCENDING),
        ]
    )
    db.bookings.create_index([("guest_id", ASCENDING), ("created_at", DESCENDING)])
