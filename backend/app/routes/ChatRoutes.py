from fastapi import APIRouter, Depends
from app.schemas.ChatSchema import SendMessageSchema
from app.controllers.ChatController import (
    send_message,
    get_conversations,
    get_conversation_messages,
    get_user_chat_profile,
    get_unread_dm_total,
)
from app.controllers.UserController import get_current_user

chatRouter = APIRouter()

@chatRouter.post("/send")
def post_message(data: SendMessageSchema, current_user = Depends(get_current_user)):
    return send_message(data, current_user)

@chatRouter.get("/conversations")
def list_conversations(current_user = Depends(get_current_user)):
    return get_conversations(current_user)

@chatRouter.get("/messages/{partner_id}")
def list_messages(partner_id: str, current_user = Depends(get_current_user)):
    return get_conversation_messages(partner_id, current_user)

@chatRouter.get("/user/{user_id}")
def get_user_info(user_id: str, current_user = Depends(get_current_user)):
    return get_user_chat_profile(user_id)

@chatRouter.get("/unread-count")
def get_unread_count(current_user = Depends(get_current_user)):
    return get_unread_dm_total(current_user)
