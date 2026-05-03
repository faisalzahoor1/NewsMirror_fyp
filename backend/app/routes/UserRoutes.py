
from fastapi import Response
from fastapi import APIRouter, Request
from app.models.UserModel import UserCreate
from app.controllers.UserController import register_user
from app.controllers.UserController import login_user
# from app.controllers.UserController import get_me
from app.schemas.UserSchema import UserLogin

registerRouter = APIRouter()
loginRouter = APIRouter()
# router = APIRouter()

@registerRouter.post("/register")
def register(data: UserCreate):
    return register_user(data)


@loginRouter.post("/login")
def login(data: UserLogin):
    return login_user(data)

# @router.get("/me")
# def auth_me(request: Request):
#     return get_me(request)