from tests.conftest import register, get_token, auth


def test_register_exitoso(client):
    res = register(client, "Juan", "juan@test.com", "pass1234", "estudiante")
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == "juan@test.com"
    assert data["rol"] == "estudiante"
    assert "password" not in data
    assert "password_hash" not in data


def test_register_email_duplicado(client):
    register(client, "Juan", "juan@test.com", "pass1234", "estudiante")
    res = register(client, "Juan2", "juan@test.com", "otropass", "estudiante")
    assert res.status_code == 400
    assert "Email ya registrado" in res.json()["detail"]


def test_login_exitoso(client):
    register(client, "Juan", "juan@test.com", "pass1234", "estudiante")
    res = client.post("/auth/login", json={"email": "juan@test.com", "password": "pass1234"})
    assert res.status_code == 200
    assert "access_token" in res.json()
    assert res.json()["token_type"] == "bearer"


def test_login_password_incorrecto(client):
    register(client, "Juan", "juan@test.com", "pass1234", "estudiante")
    res = client.post("/auth/login", json={"email": "juan@test.com", "password": "wrongpass"})
    assert res.status_code == 401


def test_login_usuario_inexistente(client):
    res = client.post("/auth/login", json={"email": "noexiste@test.com", "password": "pass"})
    assert res.status_code == 401


def test_me_con_token(client):
    register(client, "Juan", "juan@test.com", "pass1234", "docente")
    token = get_token(client, "juan@test.com", "pass1234")
    res = client.get("/auth/me", headers=auth(token))
    assert res.status_code == 200
    assert res.json()["email"] == "juan@test.com"
    assert res.json()["rol"] == "docente"


def test_me_sin_token(client):
    res = client.get("/auth/me")
    assert res.status_code == 401


def test_listar_usuarios_como_admin(client, admin_token):
    register(client, "E1", "e1@test.com", "pass", "estudiante")
    register(client, "E2", "e2@test.com", "pass", "estudiante")
    res = client.get("/auth/usuarios?rol=estudiante", headers=auth(admin_token))
    assert res.status_code == 200
    assert len(res.json()) == 2


def test_listar_usuarios_sin_permiso(client, estudiante_token):
    res = client.get("/auth/usuarios", headers=auth(estudiante_token))
    assert res.status_code == 403
