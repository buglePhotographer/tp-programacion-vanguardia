from pydantic import BaseModel
from typing import Optional
from app.schemas.usuario import UsuarioResponse


class MateriaCreate(BaseModel):
    nombre: str
    codigo: str
    descripcion: Optional[str] = None
    docente_id: Optional[int] = None


class MateriaUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    docente_id: Optional[int] = None


class MateriaResponse(BaseModel):
    id: int
    nombre: str
    codigo: str
    descripcion: Optional[str]
    docente: Optional[UsuarioResponse]

    model_config = {"from_attributes": True}
