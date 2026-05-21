from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MateriaInfo(BaseModel):
    id: int
    nombre: str
    model_config = {"from_attributes": True}


class EventoCreate(BaseModel):
    materia_id: Optional[int] = None
    titulo: str
    descripcion: Optional[str] = None
    fecha_inicio: datetime
    fecha_fin: datetime


class EventoResponse(BaseModel):
    id: int
    materia_id: Optional[int]
    materia: Optional[MateriaInfo]
    titulo: str
    descripcion: Optional[str]
    fecha_inicio: datetime
    fecha_fin: datetime
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}
