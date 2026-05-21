from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.database import Base, engine
from app.views import auth, materias, inscripciones, entregas, avisos, eventos
from app.config import FRONTEND_URL
from app.limiter import limiter
import app.models  # importa todos los modelos para que SQLAlchemy los registre


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Plataforma Académica", version="1.0.0", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost", FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(materias.router)
app.include_router(inscripciones.router)
app.include_router(entregas.router)
app.include_router(avisos.router)
app.include_router(eventos.router)


@app.get("/")
def health():
    return {"status": "ok"}
