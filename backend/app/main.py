from fastapi import FastAPI
from app.routes import UserRoutes, CommentRoutes, BotRoutes, ChatRoutes, ArticleRoutes
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(UserRoutes.registerRouter, prefix="/api/user", tags=["User"])
app.include_router(UserRoutes.loginRouter, prefix="/api/user", tags=["User"])
app.include_router(UserRoutes.InfoRouter, prefix="/api/user", tags=["User"])
app.include_router(CommentRoutes.commentRouter, prefix="/api/community", tags=["Community"])
app.include_router(BotRoutes.botRouter, prefix="/api/community", tags=["AI Bot"])
app.include_router(ChatRoutes.chatRouter, prefix="/api/chat", tags=["Chat"])
app.include_router(ArticleRoutes.articleRouter, prefix="/api/articles", tags=["Articles"])
# NewsMirror API Endpoints
# app.include_router(UserRoutes.router, prefix="/api/user", tags=["User"])