from pydantic import BaseModel
from typing import Optional

class CommentCreate(BaseModel):
    article_id: str
    text: str
    parent_comment_id: Optional[str] = None

class ReactionCreate(BaseModel):
    article_id: str
    reaction_type: str
