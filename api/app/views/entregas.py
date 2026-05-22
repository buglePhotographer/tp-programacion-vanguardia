import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.entrega import Entrega, TrabajoPractico
from app.schemas.entrega import EntregaCreate, EntregaCalificar, EntregaResponse, TPCreate, TPResponse
from app.auth import get_current_user
from app.dependencies import solo_docente
from app.models.usuario import Usuario, Rol

router = APIRouter(tags=["Entregas"])
logger = logging.getLogger(__name__)


@router.post("/trabajos-practicos", response_model=TPResponse, status_code=201)
def crear_tp(data: TPCreate, db: Session = Depends(get_db), _: Usuario = Depends(solo_docente)):
    tp = TrabajoPractico(**data.model_dump())
    db.add(tp)
    db.commit()
    db.refresh(tp)
    return tp


@router.get("/trabajos-practicos/materia/{materia_id}", response_model=list[TPResponse])
def listar_tps(materia_id: int, db: Session = Depends(get_db), _: Usuario = Depends(get_current_user)):
    return db.query(TrabajoPractico).filter(TrabajoPractico.materia_id == materia_id).all()


@router.post("/entregas", response_model=EntregaResponse, status_code=201)
def entregar_tp(data: EntregaCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    if current_user.rol != Rol.estudiante:
        raise HTTPException(status_code=403, detail="Solo estudiantes pueden entregar TPs")
    ya_entregado = db.query(Entrega).filter_by(tp_id=data.tp_id, estudiante_id=current_user.id).first()
    if ya_entregado:
        raise HTTPException(status_code=400, detail="Ya entregaste este TP")
    entrega = Entrega(**data.model_dump(), estudiante_id=current_user.id)
    db.add(entrega)
    db.commit()
    db.refresh(entrega)
    logger.info("Entrega registrada tp_id=%d estudiante_id=%d", data.tp_id, current_user.id)
    return entrega


@router.get("/entregas/mis-entregas", response_model=list[EntregaResponse])
def mis_entregas(db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    return db.query(Entrega).filter(Entrega.estudiante_id == current_user.id).all()


@router.get("/entregas/tp/{tp_id}", response_model=list[EntregaResponse])
def entregas_por_tp(tp_id: int, db: Session = Depends(get_db), _: Usuario = Depends(solo_docente)):
    return db.query(Entrega).filter(Entrega.tp_id == tp_id).all()


@router.put("/entregas/{entrega_id}/calificar")
def calificar(entrega_id: int, data: EntregaCalificar, db: Session = Depends(get_db), _: Usuario = Depends(solo_docente)):
    entrega = db.query(Entrega).filter(Entrega.id == entrega_id).first()
    if not entrega:
        raise HTTPException(status_code=404, detail="Entrega no encontrada")
    entrega.nota = data.nota
    entrega.comentario = data.comentario
    db.commit()
    logger.info("Calificación registrada entrega_id=%d nota=%.1f", entrega_id, data.nota)
    return {"ok": True}
