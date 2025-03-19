from pymongo import MongoClient
import yaml
from datetime import datetime

with open("config.yaml", "r") as file:
    config = yaml.safe_load(file)

def connect_db():
    """Connect to MongoDB using connection string and return the database object"""
    connection_string = config["database"]["connection_string"]
    client = MongoClient(connection_string)
    db = client[config["database"]["name"]]
    return db

def initialize_db():
    """Initialize the MongoDB database and collections"""
    db = connect_db()
    
    if "users" not in db.list_collection_names():
        # Create the collection
        db.create_collection("users")
        print("Users collection created successfully")
    
    if "conversations" not in db.list_collection_names():
        db.create_collection("conversations")
        print("Conversations collection created successfully")
    
    return db

def update_interaction_summary(user_id, summary):
    """Update the interaction summary for a user"""
    db = connect_db()
    users_collection = db["users"]
    
    result = users_collection.update_one(
        {"user_id": user_id},
        {
            "$push": {"interaction_summaries": summary},
            "$set": {"last_interaction": datetime.now()}
        },
        upsert=True
    )
    
    if result.upserted_id:
        print(f"Created new user record with ID: {user_id}")
    else:
        print(f"Updated interaction summary for user ID: {user_id}")

def save_message(user_id, role, content):
    """
    Save a conversation message to the database
    
    Args:
        user_id: The ID of the user
        role: The role (user or assistant)
        content: The message content
    """
    db = connect_db()
    conversations_collection = db["conversations"]
    
    message = {
        "user_id": user_id,
        "role": role,
        "content": content,
        "timestamp": datetime.now()
    }
    
    result = conversations_collection.insert_one(message)
    print(f"Message saved with ID: {result.inserted_id}")
