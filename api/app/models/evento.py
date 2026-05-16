from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Evento(Base):
    __tablename__ = "eventos"

    id = Column(Integer, primary_key=True, index=True)
    materia_id = Column(Integer, ForeignKey("materias.id"), nullable=True)
    titulo = Column(String, nullable=False)
    descripcion = Column(String)
    fecha_inicio = Column(DateTime, nullable=False)
    fecha_fin = Column(DateTime, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    materia = relationship("Materia", back_populates="eventos")
