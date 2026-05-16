from fastapi import Depends, HTTPException, status
from app.auth import get_current_user
from app.models.usuario import Usuario, Rol


def solo_docente(current_user: Usuario = Depends(get_current_user)) -> Usuario:
    if current_user.rol != Rol.docente:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo docentes")
    return current_user


def solo_admin(current_user: Usuario = Depends(get_current_user)) -> Usuario:
    if current_user.rol != Rol.admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo administradores")
    return current_user


def docente_o_admin(current_user: Usuario = Depends(get_current_user)) -> Usuario:
    if current_user.rol not in (Rol.docente, Rol.admin):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo docentes o administradores")
    return current_user
