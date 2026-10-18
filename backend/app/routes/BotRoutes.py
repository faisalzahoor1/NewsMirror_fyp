from fastapi import APIRouter, Depends
from app.schemas.BotSchema import BotChatRequest
from app.controllers.BotController import chat_with_bot
from app.controllers.UserController import get_current_user

botRouter = APIRouter()

# --- AI News Assistant Endpoint ---
# Plain "def" so FastAPI runs the blocking Gemini call in a worker thread
@botRouter.post("/bot/chat")
def bot_chat(data: BotChatRequest, current_user = Depends(get_current_user)):
    return chat_with_bot(data, current_user)
