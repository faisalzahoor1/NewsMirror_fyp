from pydantic import BaseModel, EmailStr, Field

class UserLogin(BaseModel):
    email: str
    password: str

class AvatarUpdate(BaseModel):
    # Image as a data URL, e.g. "data:image/jpeg;base64,..."
    avatar: str = Field(..., max_length=500_000)