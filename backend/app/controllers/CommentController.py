from app.config.MongoConnection import (
    comments_collection,
    reactions_collection,
    users_collection,
    notifications_collection,
)
from app.config.config import SECRET_KEY
from fastapi import HTTPException
from bson import ObjectId
import datetime
import jwt

def add_comment(data, current_user: dict):
    text = data.text.strip() if data.text else ""
    if not text:
        raise HTTPException(status_code=400, detail="Comment cannot be empty")

    parent_id = str(data.parent_comment_id).strip() if getattr(data, "parent_comment_id", None) else None
    parent_comment = None

    if parent_id:
        try:
            parent_comment = comments_collection.find_one({"_id": ObjectId(parent_id)})
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid parent comment ID")
        if not parent_comment:
            raise HTTPException(status_code=404, detail="Parent comment not found")

    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    comment_doc = {
        "article_id": str(data.article_id),
        "parent_comment_id": parent_id,
        "user_id": str(current_user["_id"]),
        "user_name": current_user.get("name") or "Anonymous",
        "user_email": current_user.get("email", ""),
        "text": text,
        "created_at": now_iso
    }

    result = comments_collection.insert_one(comment_doc)
    comment_doc["_id"] = str(result.inserted_id)

    # If replying to another user's comment, create a notification for that user!
    if parent_comment:
        parent_author_id = str(parent_comment.get("user_id"))
        current_user_id = str(current_user["_id"])

        # Notify only if replying to someone else
        if parent_author_id != current_user_id:
            sender_name = current_user.get("name") or "Someone"
            preview = text[:50] + ("..." if len(text) > 50 else "")
            notification_doc = {
                "recipient_id": parent_author_id,
                "sender_id": current_user_id,
                "sender_name": sender_name,
                "article_id": str(data.article_id),
                "comment_id": str(comment_doc["_id"]),
                "parent_comment_id": parent_id,
                "message": f"{sender_name} replied to your comment: \"{preview}\"",
                "is_read": False,
                "created_at": now_iso
            }
            notifications_collection.insert_one(notification_doc)

    return {
        "success": True,
        "message": "Reply posted successfully" if parent_id else "Comment posted successfully",
        "comment": comment_doc
    }

def get_comments(article_id: str = None):
    query = {}
    if article_id:
        query["article_id"] = str(article_id)

    comments = []
    # Sort chronologically
    cursor = comments_collection.find(query).sort("_id", 1)
    for c in cursor:
        c["_id"] = str(c["_id"])
        comments.append(c)

    return {
        "success": True,
        "comments": comments
    }

def delete_comment(comment_id: str, current_user: dict):
    try:
        obj_id = ObjectId(comment_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid comment ID")

    comment = comments_collection.find_one({"_id": obj_id})
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")

    if str(comment.get("user_id")) != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="You can only delete your own comment")

    # Delete comment and any nested replies to it
    comments_collection.delete_one({"_id": obj_id})
    comments_collection.delete_many({"parent_comment_id": str(comment_id)})

    return {"success": True, "message": "Comment deleted successfully"}

def toggle_reaction(data, current_user: dict):
    article_id = str(data.article_id)
    reaction_type = data.reaction_type.strip().lower()

    if reaction_type not in ["like", "dislike"]:
        raise HTTPException(status_code=400, detail="Reaction must be 'like' or 'dislike'")

    user_id = str(current_user["_id"])
    existing = reactions_collection.find_one({"article_id": article_id, "user_id": user_id})

    if existing:
        if existing.get("type") == reaction_type:
            # Clicking the same reaction again un-reacts (toggles off)
            reactions_collection.delete_one({"_id": existing["_id"]})
            current_reaction = None
        else:
            # Switching from like to dislike or vice versa
            reactions_collection.update_one(
                {"_id": existing["_id"]},
                {"$set": {"type": reaction_type, "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()}}
            )
            current_reaction = reaction_type
    else:
        # Add new reaction to DB
        reactions_collection.insert_one({
            "article_id": article_id,
            "user_id": user_id,
            "user_name": current_user.get("name", "Anonymous"),
            "type": reaction_type,
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
        })
        current_reaction = reaction_type

    db_likes = reactions_collection.count_documents({"article_id": article_id, "type": "like"})
    db_dislikes = reactions_collection.count_documents({"article_id": article_id, "type": "dislike"})

    return {
        "success": True,
        "article_id": article_id,
        "user_reaction": current_reaction,
        "likes": db_likes,
        "dislikes": db_dislikes
    }

def get_all_reactions(current_user: dict = None):
    article_ids = reactions_collection.distinct("article_id")
    user_id = str(current_user["_id"]) if current_user else None

    result = {}
    for aid in article_ids:
        db_likes = reactions_collection.count_documents({"article_id": aid, "type": "like"})
        db_dislikes = reactions_collection.count_documents({"article_id": aid, "type": "dislike"})

        user_reaction = None
        if user_id:
            user_doc = reactions_collection.find_one({"article_id": aid, "user_id": user_id})
            if user_doc:
                user_reaction = user_doc.get("type")

        result[aid] = {
            "likes": db_likes,
            "dislikes": db_dislikes,
            "user_reaction": user_reaction
        }

    return {
        "success": True,
        "reactions": result
    }

# --- Notifications Management ---
def get_user_notifications(current_user: dict):
    user_id = str(current_user["_id"])
    cursor = notifications_collection.find({"recipient_id": user_id}).sort("_id", -1).limit(30)
    notifications = []
    unread_count = 0
    for n in cursor:
        n["_id"] = str(n["_id"])
        if not n.get("is_read"):
            unread_count += 1
        notifications.append(n)

    return {
        "success": True,
        "unread_count": unread_count,
        "notifications": notifications
    }

def mark_notification_read(notification_id: str, current_user: dict):
    try:
        obj_id = ObjectId(notification_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid notification ID")

    user_id = str(current_user["_id"])
    notifications_collection.update_one(
        {"_id": obj_id, "recipient_id": user_id},
        {"$set": {"is_read": True}}
    )
    return {"success": True, "message": "Marked as read"}

def mark_all_notifications_read(current_user: dict):
    user_id = str(current_user["_id"])
    notifications_collection.update_many(
        {"recipient_id": user_id, "is_read": False},
        {"$set": {"is_read": True}}
    )
    return {"success": True, "message": "All notifications marked as read"}

def parse_optional_user(authorization: str = None):
    if not authorization:
        return None
    try:
        parts = authorization.split(" ")
        if len(parts) == 2 and parts[0].lower() == "bearer":
            token = parts[1]
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            email = payload.get("email")
            if email:
                user = users_collection.find_one({"email": email})
                if user:
                    user["_id"] = str(user["_id"])
                    user.pop("password", None)
                    return user
    except Exception:
        return None
    return None
