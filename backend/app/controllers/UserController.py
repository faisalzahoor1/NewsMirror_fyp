from app.config.MongoConnection import users_collection
from passlib.context import CryptContext
from app.config.config import SECRET_KEY
from fastapi import Response
from fastapi import Header, HTTPException
import jwt
import datetime

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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

# def get_me(request):
#     token = request.cookies.get("access_token")

#     if not token:
#         return {"loggedIn": False}

#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
#         return {"loggedIn": True, "user": payload}

#     except:
#         return {"loggedIn": False}
