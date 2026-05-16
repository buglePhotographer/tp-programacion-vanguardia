from pydantic import BaseModel
from typing import Optional
from app.models.inscripcion import EstadoInscripcion
from app.schemas.materia import MateriaResponse


class InscripcionCreate(BaseModel):
    materia_id: int


class InscripcionResponse(BaseModel):
    id: int
    materia: MateriaResponse
    estado: EstadoInscripcion
    nota_final: Optional[float]

    model_config = {"from_attributes": True}
