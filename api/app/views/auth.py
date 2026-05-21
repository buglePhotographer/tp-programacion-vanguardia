from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.usuario import Usuario, Rol
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate, UsuarioResponse, LoginRequest, TokenResponse
from app.auth import hash_password, verify_password, create_token, get_current_user
from app.dependencies import solo_admin
from app.limiter import limiter

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UsuarioResponse, status_code=201)
@limiter.limit("5/minute")
def register(request: Request, data: UsuarioCreate, db: Session = Depends(get_db)):
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
@limiter.limit("10/minute")
def login(request: Request, data: LoginRequest, db: Session = Depends(get_db)):
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


@router.put("/usuarios/{usuario_id}", response_model=UsuarioResponse)
def actualizar_usuario(
    usuario_id: int,
    data: UsuarioUpdate,
    db: Session = Depends(get_db),
    _: Usuario = Depends(solo_admin),
):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if data.nombre is not None:
        usuario.nombre = data.nombre
    if data.email is not None:
        existente = db.query(Usuario).filter(Usuario.email == data.email, Usuario.id != usuario_id).first()
        if existente:
            raise HTTPException(status_code=400, detail="Email ya registrado")
        usuario.email = data.email
    if data.password is not None:
        usuario.password_hash = hash_password(data.password)
    db.commit()
    db.refresh(usuario)
    return usuario


@router.delete("/usuarios/{usuario_id}", status_code=204)
def eliminar_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(solo_admin),
):
    if usuario_id == current_user.id:
        raise HTTPException(status_code=400, detail="No podés eliminar tu propia cuenta")
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    db.delete(usuario)
    db.commit()
