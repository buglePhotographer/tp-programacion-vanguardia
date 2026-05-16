from pydantic import BaseModel, EmailStr
from app.models.usuario import Rol


class UsuarioCreate(BaseModel):
    nombre: str
    email: EmailStr
    password: str
    rol: Rol


class UsuarioResponse(BaseModel):
    id: int
    nombre: str
    email: EmailStr
    rol: Rol

    model_config = {"from_attributes": True}


class UsuarioUpdate(BaseModel):
    nombre: str | None = None
    email: EmailStr | None = None
    password: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
