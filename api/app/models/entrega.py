from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class TrabajoPractico(Base):
    __tablename__ = "trabajos_practicos"

    id = Column(Integer, primary_key=True, index=True)
    materia_id = Column(Integer, ForeignKey("materias.id"), nullable=False)
    titulo = Column(String, nullable=False)
    descripcion = Column(String)
    fecha_entrega = Column(DateTime, nullable=False)

    materia = relationship("Materia", back_populates="trabajos_practicos")
    entregas = relationship("Entrega", back_populates="trabajo_practico")


class Entrega(Base):
    __tablename__ = "entregas"
    __table_args__ = (UniqueConstraint("tp_id", "estudiante_id"),)

    id = Column(Integer, primary_key=True, index=True)
    tp_id = Column(Integer, ForeignKey("trabajos_practicos.id"), nullable=False)
    estudiante_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    archivo_url = Column(String)
    fecha_entrega = Column(DateTime, server_default=func.now())
    nota = Column(Float, nullable=True)
    comentario = Column(String, nullable=True)

    trabajo_practico = relationship("TrabajoPractico", back_populates="entregas")
    estudiante = relationship("Usuario", back_populates="entregas")
