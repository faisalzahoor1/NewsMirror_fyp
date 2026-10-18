from app.config.MongoConnection import (
    messages_collection,
    users_collection,
    notifications_collection,
)
from fastapi import HTTPException
from bson import ObjectId
import datetime

def get_conversation_id(user1_id: str, user2_id: str) -> str:
    return "_".join(sorted([str(user1_id), str(user2_id)]))

def find_user_by_id(user_id: str):
    user = None
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
    except Exception:
        pass
    if not user:
        user = users_collection.find_one({"_id": str(user_id)})
    return user

def send_message(data, current_user: dict):
    text = data.text.strip() if data.text else ""
    if not text:
        raise HTTPException(status_code=400, detail="Message text cannot be empty")

    recipient_id = str(data.recipient_id).strip()
    sender_id = str(current_user["_id"])

    if recipient_id == sender_id:
        raise HTTPException(status_code=400, detail="You cannot send messages to yourself")

    recipient = find_user_by_id(recipient_id)
    if not recipient:
        raise HTTPException(status_code=404, detail="Recipient user not found")

    recipient_id = str(recipient["_id"])
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    conv_id = get_conversation_id(sender_id, recipient_id)

    msg_doc = {
        "conversation_id": conv_id,
        "sender_id": sender_id,
        "sender_name": current_user.get("name") or "Anonymous",
        "sender_email": current_user.get("email") or "",
        "recipient_id": recipient_id,
        "recipient_name": recipient.get("name") or "User",
        "recipient_email": recipient.get("email") or "",
        "text": text,
        "is_read": False,
        "created_at": now_iso
    }

    result = messages_collection.insert_one(msg_doc)
    msg_doc["_id"] = str(result.inserted_id)

    # Create notification for recipient
    preview = text[:45] + ("..." if len(text) > 45 else "")
    sender_name = current_user.get("name") or "Someone"
    notification_doc = {
        "recipient_id": recipient_id,
        "sender_id": sender_id,
        "sender_name": sender_name,
        "type": "dm",
        "message": f"{sender_name} sent you a message: \"{preview}\"",
        "is_read": False,
        "created_at": now_iso
    }
    notifications_collection.insert_one(notification_doc)

    return {
        "success": True,
        "message": msg_doc
    }

def get_conversations(current_user: dict):
    user_id = str(current_user["_id"])

    # Query all messages where user is sender or recipient
    cursor = messages_collection.find({
        "$or": [
            {"sender_id": user_id},
            {"recipient_id": user_id}
        ]
    }).sort("_id", -1)

    conv_map = {}
    for msg in cursor:
        conv_id = msg.get("conversation_id")
        if not conv_id:
            continue

        if conv_id not in conv_map:
            # Determine partner
            is_sender = (str(msg["sender_id"]) == user_id)
            partner_id = str(msg["recipient_id"]) if is_sender else str(msg["sender_id"])
            partner_name = msg.get("recipient_name") if is_sender else msg.get("sender_name")
            partner_email = msg.get("recipient_email") if is_sender else msg.get("sender_email")

            conv_map[conv_id] = {
                "conversation_id": conv_id,
                "partner_id": partner_id,
                "partner_name": partner_name or "User",
                "partner_email": partner_email or "",
                "last_message": {
                    "text": msg.get("text", ""),
                    "sender_id": str(msg.get("sender_id")),
                    "created_at": msg.get("created_at")
                },
                "unread_count": 0
            }

        # Accumulate unread count if message was sent to current user
        if str(msg.get("recipient_id")) == user_id and not msg.get("is_read"):
            conv_map[conv_id]["unread_count"] += 1

    # Enrich partner names with latest from users_collection
    conversations = list(conv_map.values())
    for c in conversations:
        u = find_user_by_id(c["partner_id"])
        if u:
            c["partner_name"] = u.get("name") or c["partner_name"]
            c["partner_email"] = u.get("email") or c["partner_email"]

    return {
        "success": True,
        "conversations": conversations
    }

def get_conversation_messages(partner_id: str, current_user: dict):
    user_id = str(current_user["_id"])
    partner_id = str(partner_id).strip()

    partner = find_user_by_id(partner_id)
    if not partner:
        raise HTTPException(status_code=404, detail="User not found")

    partner_clean_id = str(partner["_id"])
    conv_id = get_conversation_id(user_id, partner_clean_id)

    # Mark incoming unread messages as read
    messages_collection.update_many(
        {"conversation_id": conv_id, "recipient_id": user_id, "is_read": False},
        {"$set": {"is_read": True}}
    )

    # Also mark DM notifications from this partner as read
    notifications_collection.update_many(
        {"recipient_id": user_id, "sender_id": partner_clean_id, "type": "dm", "is_read": False},
        {"$set": {"is_read": True}}
    )

    cursor = messages_collection.find({"conversation_id": conv_id}).sort("_id", 1)
    messages = []
    for m in cursor:
        m["_id"] = str(m["_id"])
        messages.append(m)

    return {
        "success": True,
        "messages": messages,
        "partner": {
            "_id": partner_clean_id,
            "name": partner.get("name") or "User",
            "email": partner.get("email") or ""
        }
    }

def get_user_chat_profile(user_id: str):
    partner = find_user_by_id(str(user_id).strip())
    if not partner:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "success": True,
        "user": {
            "_id": str(partner["_id"]),
            "name": partner.get("name") or "User",
            "email": partner.get("email") or ""
        }
    }

def get_unread_dm_total(current_user: dict):
    user_id = str(current_user["_id"])
    count = messages_collection.count_documents({
        "recipient_id": user_id,
        "is_read": False
    })
    return {
        "success": True,
        "unread_count": count
    }
