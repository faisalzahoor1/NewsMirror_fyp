

from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")

db = client["newsmirror"]
users_collection = db["users"]
comments_collection = db["comments"]
reactions_collection = db["reactions"]
notifications_collection = db["notifications"]
articles_collection = db["articles"]
messages_collection = db["messages"]
