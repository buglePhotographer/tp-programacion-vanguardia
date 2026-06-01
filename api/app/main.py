import time
import logging
from contextlib import asynccontextmanager
import sentry_sdk
import newrelic.agent
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.database import Base, engine
from app.views import auth, materias, inscripciones, entregas, avisos, eventos
from app.config import FRONTEND_URL, SENTRY_DSN, ENVIRONMENT, NEW_RELIC_LICENSE_KEY
from app.limiter import limiter
from app.logging_config import setup_logging
import app.models  # importa todos los modelos para que SQLAlchemy los registre

setup_logging()

if NEW_RELIC_LICENSE_KEY:
    newrelic.agent.initialize()

if SENTRY_DSN:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        environment=ENVIRONMENT,
        traces_sample_rate=0.2,
        send_default_pii=False,
    )
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    logger.info("Aplicación iniciada")
    yield
    logger.info("Aplicación detenida")


app = FastAPI(title="Plataforma Académica", version="1.0.0", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = (time.perf_counter() - start) * 1000
    level = logging.WARNING if response.status_code >= 400 else logging.INFO
    logger.log(level, "%s %s status=%d duration=%dms", request.method, request.url.path, response.status_code, duration_ms)
    return response


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


@app.get("/sentry-test")
def sentry_test():
    raise Exception("Test de Sentry — si ves esto en el dashboard, funciona")


@app.get("/newrelic-test")
@newrelic.agent.function_trace()
def newrelic_test():
    return {"status": "ok", "message": "Si ves esta traza en New Relic, la integración funciona"}
