from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.materia import Materia
from app.schemas.materia import MateriaCreate, MateriaUpdate, MateriaResponse
from app.auth import get_current_user
from app.dependencies import solo_admin
from app.models.usuario import Usuario, Rol

router = APIRouter(prefix="/materias", tags=["Materias"])


@router.get("/", response_model=list[MateriaResponse])
def listar(db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    if current_user.rol == Rol.docente:
        return db.query(Materia).filter(Materia.docente_id == current_user.id).all()
    return db.query(Materia).all()


@router.get("/{materia_id}", response_model=MateriaResponse)
def obtener(materia_id: int, db: Session = Depends(get_db), _: Usuario = Depends(get_current_user)):
    materia = db.query(Materia).filter(Materia.id == materia_id).first()
    if not materia:
        raise HTTPException(status_code=404, detail="Materia no encontrada")
    return materia


@router.post("/", response_model=MateriaResponse, status_code=201)
def crear(data: MateriaCreate, db: Session = Depends(get_db), _: Usuario = Depends(solo_admin)):
    if db.query(Materia).filter(Materia.codigo == data.codigo).first():
        raise HTTPException(status_code=400, detail="Código ya existe")
    materia = Materia(**data.model_dump())
    db.add(materia)
    db.commit()
    db.refresh(materia)
    return materia


@router.put("/{materia_id}", response_model=MateriaResponse)
def actualizar(materia_id: int, data: MateriaUpdate, db: Session = Depends(get_db), _: Usuario = Depends(solo_admin)):
    materia = db.query(Materia).filter(Materia.id == materia_id).first()
    if not materia:
        raise HTTPException(status_code=404, detail="Materia no encontrada")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(materia, field, value)
    db.commit()
    db.refresh(materia)
    return materia


@router.delete("/{materia_id}", status_code=204)
def eliminar(materia_id: int, db: Session = Depends(get_db), _: Usuario = Depends(solo_admin)):
    materia = db.query(Materia).filter(Materia.id == materia_id).first()
    if not materia:
        raise HTTPException(status_code=404, detail="Materia no encontrada")
    db.delete(materia)
    db.commit()
