import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app

SQLALCHEMY_TEST_URL = "sqlite:///:memory:"


@pytest.fixture()
def client():
    engine = create_engine(
        SQLALCHEMY_TEST_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


# ── Helpers ────────────────────────────────────────────────────────────────

def register(client, nombre, email, password, rol):
    return client.post("/auth/register", json={
        "nombre": nombre, "email": email, "password": password, "rol": rol
    })


def get_token(client, email, password):
    res = client.post("/auth/login", json={"email": email, "password": password})
    return res.json()["access_token"]


def auth(token):
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture()
def admin_token(client):
    register(client, "Admin", "admin@test.com", "admin1234", "admin")
    return get_token(client, "admin@test.com", "admin1234")


@pytest.fixture()
def docente_token(client):
    register(client, "Docente", "docente@test.com", "docente1234", "docente")
    return get_token(client, "docente@test.com", "docente1234")


@pytest.fixture()
def estudiante_token(client):
    register(client, "Estudiante", "alumno@test.com", "alumno1234", "estudiante")
    return get_token(client, "alumno@test.com", "alumno1234")


@pytest.fixture()
def materia_id(client, admin_token):
    res = client.post("/materias/", json={
        "nombre": "Matemática", "codigo": "MAT101", "descripcion": "Desc"
    }, headers=auth(admin_token))
    return res.json()["id"]
