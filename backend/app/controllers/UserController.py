from app.config.MongoConnection import users_collection
from passlib.context import CryptContext
from app.config.config import SECRET_KEY
from fastapi import Response
from fastapi import Header, HTTPException
from bson import ObjectId
import jwt
import datetime
import base64
import re

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

AVATAR_PATTERN = re.compile(r"^data:image/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$")
MAX_AVATAR_BYTES = 300 * 1024

def register_user(data):
    name = data.name
    email = data.email
    password = data.password

    # check if user exists
    if users_collection.find_one({"email": email}):
        return {
            "success": False,
            "message": "User already exists"
        }

    # hash password
    hashed_password = pwd_context.hash(password)

    # save user
    users_collection.insert_one({
        "name": name,
        "email": email,
        "password": hashed_password
    })

    # create token
    token = jwt.encode(
        {
            "email": email,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
        },
        SECRET_KEY,
        algorithm="HS256"
    )
    #     # 🍪 SET COOKIE HERE
    # response.set_cookie(
    #     key="access_token",
    #     value=token,
    #     httponly=True,   # IMPORTANT 🔥
    #     secure=False,    # True in production (HTTPS)
    #     samesite="lax"
    # )

    return {"success": True, "token": token}

def login_user(data):
    email = data.email
    password = data.password

    # 1. check if user exists
    user = users_collection.find_one({"email": email})

    if not user:
        return {
            "success": False,
            "message": "User does not exist"
        }

    # 2. verify password
    if not pwd_context.verify(password, user["password"]):
        return {
            "success": False,
            "message": "Invalid password"
        }

    # 3. create token
    token = jwt.encode(
        {
            "email": email,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
        },
        SECRET_KEY,
        algorithm="HS256"
    )
        # 🍪 SET COOKIE HERE
    # response.set_cookie(
    #     key="access_token",
    #     value=token,
    #     httponly=True,   # IMPORTANT 🔥
    #     samesite="lax"
    # )

    return {"success": True, "token": token}


async def get_current_user(authorization: str = Header(None)):

    # Check Token Exists
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Token missing"
        )

    try:

        # Extract Token
        token = authorization.split(" ")[1]

        # Decode JWT
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"]
        )

        # Get Email From Token
        email = payload.get("email")

        if not email:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        # Find User In MongoDB
        user = users_collection.find_one(
            {"email": email}
        )

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        # Remove MongoDB ObjectId
        user["_id"] = str(user["_id"])

        # Remove Password Before Sending
        user.pop("password", None)

        return user

    except jwt.ExpiredSignatureError:

        raise HTTPException(
            status_code=401,
            detail="Token expired"
        )

    except jwt.InvalidTokenError:

        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

def _is_real_image(raw: bytes, kind: str):
    # Check the file signature so a renamed non-image can't be stored
    if kind == "png":
        return raw.startswith(b"\x89PNG\r\n\x1a\n")
    if kind == "jpeg":
        return raw.startswith(b"\xff\xd8\xff")
    return raw[:4] == b"RIFF" and raw[8:12] == b"WEBP"


def update_avatar(data, current_user):

    # 1. check format
    match = AVATAR_PATTERN.match(data.avatar)
    if not match:
        raise HTTPException(
            status_code=400,
            detail="Please upload a PNG, JPEG or WebP image"
        )

    # 2. check content and size
    try:
        raw = base64.b64decode(match.group(2), validate=True)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image data")

    if not _is_real_image(raw, match.group(1)):
        raise HTTPException(status_code=400, detail="Invalid image data")

    if len(raw) > MAX_AVATAR_BYTES:
        raise HTTPException(
            status_code=400,
            detail="Image is too large (max 300 KB)"
        )

    # 3. save on the user
    users_collection.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": {"avatar": data.avatar}}
    )

    return {"success": True, "avatar": data.avatar}


def remove_avatar(current_user):
    users_collection.update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$unset": {"avatar": ""}}
    )

    return {"success": True}

# def get_me(request):
#     token = request.cookies.get("access_token")

#     if not token:
#         return {"loggedIn": False}

#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
#         return {"loggedIn": True, "user": payload}

#     except:
#         return {"loggedIn": False}
