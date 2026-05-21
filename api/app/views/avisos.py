from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.aviso import Aviso
from app.schemas.aviso import AvisoCreate, AvisoResponse
from app.auth import get_current_user
from app.dependencies import docente_o_admin
from app.models.usuario import Usuario

router = APIRouter(prefix="/avisos", tags=["Avisos"])


@router.post("/", response_model=AvisoResponse, status_code=201)
def crear(data: AvisoCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(docente_o_admin)):
    aviso = Aviso(**data.model_dump(), autor_id=current_user.id)
    db.add(aviso)
    db.commit()
    db.refresh(aviso)
    return aviso


@router.get("/", response_model=list[AvisoResponse])
def listar_globales(db: Session = Depends(get_db), _: Usuario = Depends(get_current_user)):
    return db.query(Aviso).filter(Aviso.materia_id == None).all()


@router.get("/materia/{materia_id}", response_model=list[AvisoResponse])
def por_materia(materia_id: int, db: Session = Depends(get_db), _: Usuario = Depends(get_current_user)):
    return db.query(Aviso).filter(Aviso.materia_id == materia_id).all()


@router.delete("/{aviso_id}", status_code=204)
def eliminar(aviso_id: int, db: Session = Depends(get_db), _: Usuario = Depends(docente_o_admin)):
    aviso = db.query(Aviso).filter(Aviso.id == aviso_id).first()
    if not aviso:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Aviso no encontrado")
    db.delete(aviso)
    db.commit()
