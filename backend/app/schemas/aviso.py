from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.usuario import UsuarioResponse


class AvisoCreate(BaseModel):
    materia_id: Optional[int] = None
    titulo: str
    contenido: str


class AvisoResponse(BaseModel):
    id: int
    materia_id: Optional[int]
    titulo: str
    contenido: str
    autor: UsuarioResponse
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}
