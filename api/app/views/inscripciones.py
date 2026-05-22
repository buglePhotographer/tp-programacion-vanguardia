import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.inscripcion import Inscripcion
from app.models.materia import Materia
from app.schemas.inscripcion import InscripcionCreate, InscripcionResponse
from app.auth import get_current_user
from app.dependencies import solo_docente
from app.models.usuario import Usuario, Rol

router = APIRouter(prefix="/inscripciones", tags=["Inscripciones"])
logger = logging.getLogger(__name__)


@router.post("/", response_model=InscripcionResponse, status_code=201)
def inscribirse(data: InscripcionCreate, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    if current_user.rol != Rol.estudiante:
        raise HTTPException(status_code=403, detail="Solo estudiantes pueden inscribirse")
    if not db.query(Materia).filter(Materia.id == data.materia_id).first():
        raise HTTPException(status_code=404, detail="Materia no encontrada")
    ya_inscripto = db.query(Inscripcion).filter_by(estudiante_id=current_user.id, materia_id=data.materia_id).first()
    if ya_inscripto:
        raise HTTPException(status_code=400, detail="Ya estás inscripto en esta materia")
    inscripcion = Inscripcion(estudiante_id=current_user.id, materia_id=data.materia_id)
    db.add(inscripcion)
    db.commit()
    db.refresh(inscripcion)
    logger.info("Inscripción usuario_id=%d materia_id=%d", current_user.id, data.materia_id)
    return inscripcion


@router.get("/mis-materias", response_model=list[InscripcionResponse])
def mis_materias(db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    return db.query(Inscripcion).filter(Inscripcion.estudiante_id == current_user.id).all()


@router.get("/materia/{materia_id}", response_model=list[InscripcionResponse])
def alumnos_de_materia(materia_id: int, db: Session = Depends(get_db), _: Usuario = Depends(solo_docente)):
    return db.query(Inscripcion).filter(Inscripcion.materia_id == materia_id).all()


@router.put("/{inscripcion_id}/nota-final")
def cargar_nota_final(inscripcion_id: int, nota: float, db: Session = Depends(get_db), _: Usuario = Depends(solo_docente)):
    inscripcion = db.query(Inscripcion).filter(Inscripcion.id == inscripcion_id).first()
    if not inscripcion:
        raise HTTPException(status_code=404, detail="Inscripción no encontrada")
    inscripcion.nota_final = nota
    db.commit()
    return {"ok": True}
