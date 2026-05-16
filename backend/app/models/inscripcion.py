import enum
from sqlalchemy import Column, Integer, Float, ForeignKey, Enum, UniqueConstraint
from sqlalchemy.orm import relationship
from app.database import Base


class EstadoInscripcion(str, enum.Enum):
    activa = "activa"
    aprobada = "aprobada"
    desaprobada = "desaprobada"


class Inscripcion(Base):
    __tablename__ = "inscripciones"
    __table_args__ = (UniqueConstraint("estudiante_id", "materia_id"),)

    id = Column(Integer, primary_key=True, index=True)
    estudiante_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    materia_id = Column(Integer, ForeignKey("materias.id"), nullable=False)
    estado = Column(Enum(EstadoInscripcion), default=EstadoInscripcion.activa)
    nota_final = Column(Float, nullable=True)

    estudiante = relationship("Usuario", back_populates="inscripciones")
    materia = relationship("Materia", back_populates="inscripciones")
