from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Materia(Base):
    __tablename__ = "materias"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    codigo = Column(String, unique=True, nullable=False)
    descripcion = Column(String)
    docente_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)

    docente = relationship("Usuario", back_populates="materias_dictadas")
    inscripciones = relationship("Inscripcion", back_populates="materia")
    trabajos_practicos = relationship("TrabajoPractico", back_populates="materia")
    avisos = relationship("Aviso", back_populates="materia")
    eventos = relationship("Evento", back_populates="materia")
