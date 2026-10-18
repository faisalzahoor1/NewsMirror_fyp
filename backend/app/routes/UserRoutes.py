
from fastapi import Response
from fastapi import APIRouter, Request, Depends
from app.models.UserModel import UserCreate
from app.controllers.UserController import register_user
from app.controllers.UserController import login_user
# from app.controllers.UserController import get_me
from app.schemas.UserSchema import UserLogin, AvatarUpdate

from app.controllers.UserController import get_current_user, update_avatar, remove_avatar

registerRouter = APIRouter()
loginRouter = APIRouter()
InfoRouter = APIRouter()

@registerRouter.post("/register")
def register(data: UserCreate):
    return register_user(data)


@loginRouter.post("/login")
def login(data: UserLogin):
    return login_user(data)



@InfoRouter.get("/myinfo")
async def profile(user = Depends(get_current_user)):
    return user


@InfoRouter.put("/avatar")
def set_avatar(data: AvatarUpdate, user = Depends(get_current_user)):
    return update_avatar(data, user)


@InfoRouter.delete("/avatar")
def delete_avatar(user = Depends(get_current_user)):
    return remove_avatar(user)



# @router.get("/me")
# def auth_me(request: Request):
#     return get_me(request)