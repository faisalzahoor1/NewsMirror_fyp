from fastapi import FastAPI
from app.routes import UserRoutes
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(UserRoutes.registerRouter, prefix="/api/user", tags=["User"])
app.include_router(UserRoutes.loginRouter, prefix="/api/user", tags=["User"])
app.include_router(UserRoutes.InfoRouter, prefix="/api/user", tags=["User"])
# app.include_router(UserRoutes.router, prefix="/api/user", tags=["User"])