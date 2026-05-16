from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.usuario import UsuarioResponse


class TPCreate(BaseModel):
    materia_id: int
    titulo: str
    descripcion: Optional[str] = None
    fecha_entrega: datetime


class TPResponse(BaseModel):
    id: int
    materia_id: int
    titulo: str
    descripcion: Optional[str]
    fecha_entrega: datetime

    model_config = {"from_attributes": True}


class EntregaCreate(BaseModel):
    tp_id: int
    archivo_url: str


class EntregaCalificar(BaseModel):
    nota: float
    comentario: Optional[str] = None


class TPResumen(BaseModel):
    id: int
    titulo: str
    fecha_entrega: datetime
    model_config = {"from_attributes": True}


class EntregaResponse(BaseModel):
    id: int
    tp_id: int
    trabajo_practico: Optional[TPResumen] = None
    estudiante: UsuarioResponse
    archivo_url: Optional[str]
    fecha_entrega: Optional[datetime]
    nota: Optional[float]
    comentario: Optional[str]

    model_config = {"from_attributes": True}
