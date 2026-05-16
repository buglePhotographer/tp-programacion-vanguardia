from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.usuario import Usuario, Rol
from app.schemas.usuario import UsuarioCreate, UsuarioResponse, LoginRequest, TokenResponse
from app.auth import hash_password, verify_password, create_token, get_current_user
from app.dependencies import solo_admin

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UsuarioResponse, status_code=201)
def register(data: UsuarioCreate, db: Session = Depends(get_db)):
    if db.query(Usuario).filter(Usuario.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email ya registrado")
    user = Usuario(
        nombre=data.nombre,
        email=data.email,
        rol=data.rol,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    return {"access_token": create_token(user.id, user.rol)}


@router.get("/me", response_model=UsuarioResponse)
def me(current_user: Usuario = Depends(get_current_user)):
    return current_user


@router.get("/usuarios", response_model=List[UsuarioResponse])
def listar_usuarios(
    rol: Optional[Rol] = Query(None),
    db: Session = Depends(get_db),
    _: Usuario = Depends(solo_admin),
):
    q = db.query(Usuario)
    if rol:
        q = q.filter(Usuario.rol == rol)
    return q.order_by(Usuario.nombre).all()
