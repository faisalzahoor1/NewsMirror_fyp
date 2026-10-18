from fastapi import APIRouter, Depends, Query, Header
from typing import Optional
from app.schemas.CommentSchema import CommentCreate, ReactionCreate
from app.controllers.CommentController import (
    add_comment,
    get_comments,
    delete_comment,
    toggle_reaction,
    get_all_reactions,
    parse_optional_user,
    get_user_notifications,
    mark_notification_read,
    mark_all_notifications_read,
)
from app.controllers.UserController import get_current_user

commentRouter = APIRouter()

# --- Comments Endpoints ---
@commentRouter.post("/comments")
def post_comment(data: CommentCreate, current_user = Depends(get_current_user)):
    return add_comment(data, current_user)

@commentRouter.get("/comments")
def list_comments(article_id: Optional[str] = Query(None)):
    return get_comments(article_id)

@commentRouter.get("/comments/{article_id}")
def list_article_comments(article_id: str):
    return get_comments(article_id)

@commentRouter.delete("/comments/{comment_id}")
def remove_comment(comment_id: str, current_user = Depends(get_current_user)):
    return delete_comment(comment_id, current_user)

# --- Like / Dislike Reactions Endpoints ---
@commentRouter.post("/react")
def react_to_article(data: ReactionCreate, current_user = Depends(get_current_user)):
    return toggle_reaction(data, current_user)

@commentRouter.get("/reactions")
def list_reactions(authorization: Optional[str] = Header(None)):
    current_user = parse_optional_user(authorization)
    return get_all_reactions(current_user)

# --- Notifications Endpoints ---
@commentRouter.get("/notifications")
def list_notifications(current_user = Depends(get_current_user)):
    return get_user_notifications(current_user)

@commentRouter.put("/notifications/read-all")
def mark_all_read(current_user = Depends(get_current_user)):
    return mark_all_notifications_read(current_user)

@commentRouter.put("/notifications/{notification_id}/read")
def mark_single_read(notification_id: str, current_user = Depends(get_current_user)):
    return mark_notification_read(notification_id, current_user)
