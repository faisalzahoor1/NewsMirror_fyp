from pydantic import BaseModel, Field
from typing import List, Literal

class BotMessage(BaseModel):
    role: Literal["user", "bot"]
    text: str = Field(..., max_length=4000)

class BotChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    history: List[BotMessage] = Field(default_factory=list, max_length=10)
