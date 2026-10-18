from pydantic import BaseModel

class SendMessageSchema(BaseModel):
    recipient_id: str
    text: str
