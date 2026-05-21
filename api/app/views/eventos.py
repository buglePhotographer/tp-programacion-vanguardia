from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.evento import Evento
from app.schemas.evento import EventoCreate, EventoResponse
from app.dependencies import docente_o_admin
from app.auth import get_current_user
from app.models.usuario import Usuario

router = APIRouter(prefix="/eventos", tags=["Eventos"])


@router.get("/", response_model=list[EventoResponse])
def listar(db: Session = Depends(get_db), _: Usuario = Depends(get_current_user)):
    return db.query(Evento).order_by(Evento.fecha_inicio).all()


@router.get("/materia/{materia_id}", response_model=list[EventoResponse])
def por_materia(materia_id: int, db: Session = Depends(get_db), _: Usuario = Depends(get_current_user)):
    return db.query(Evento).filter(Evento.materia_id == materia_id).order_by(Evento.fecha_inicio).all()


@router.post("/", response_model=EventoResponse, status_code=201)
def crear(data: EventoCreate, db: Session = Depends(get_db), _: Usuario = Depends(docente_o_admin)):
    if data.fecha_fin <= data.fecha_inicio:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="fecha_fin debe ser posterior a fecha_inicio")
    evento = Evento(**data.model_dump())
    db.add(evento)
    db.commit()
    db.refresh(evento)
    return evento


@router.delete("/{evento_id}", status_code=204)
def eliminar(evento_id: int, db: Session = Depends(get_db), _: Usuario = Depends(docente_o_admin)):
    evento = db.query(Evento).filter(Evento.id == evento_id).first()
    if not evento:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evento no encontrado")
    db.delete(evento)
    db.commit()
