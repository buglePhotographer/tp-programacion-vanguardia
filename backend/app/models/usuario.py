import enum
from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.orm import relationship
from app.database import Base


class Rol(str, enum.Enum):
    estudiante = "estudiante"
    docente = "docente"
    admin = "admin"


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    rol = Column(Enum(Rol), nullable=False)

    inscripciones = relationship("Inscripcion", back_populates="estudiante")
    materias_dictadas = relationship("Materia", back_populates="docente")
    entregas = relationship("Entrega", back_populates="estudiante")
    avisos = relationship("Aviso", back_populates="autor")
