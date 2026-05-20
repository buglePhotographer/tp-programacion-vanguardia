from tests.conftest import auth


def test_crear_materia_como_admin(client, admin_token):
    res = client.post("/materias/", json={
        "nombre": "Álgebra", "codigo": "ALG101", "descripcion": "Álgebra lineal"
    }, headers=auth(admin_token))
    assert res.status_code == 201
    data = res.json()
    assert data["nombre"] == "Álgebra"
    assert data["codigo"] == "ALG101"


def test_crear_materia_como_estudiante(client, estudiante_token):
    res = client.post("/materias/", json={
        "nombre": "Álgebra", "codigo": "ALG101"
    }, headers=auth(estudiante_token))
    assert res.status_code == 403


def test_crear_materia_codigo_duplicado(client, admin_token):
    client.post("/materias/", json={"nombre": "Álgebra", "codigo": "ALG101"},
                headers=auth(admin_token))
    res = client.post("/materias/", json={"nombre": "Otra", "codigo": "ALG101"},
                      headers=auth(admin_token))
    assert res.status_code == 400


def test_listar_materias(client, admin_token, materia_id):
    res = client.get("/materias/", headers=auth(admin_token))
    assert res.status_code == 200
    assert len(res.json()) == 1


def test_obtener_materia(client, admin_token, materia_id):
    res = client.get(f"/materias/{materia_id}", headers=auth(admin_token))
    assert res.status_code == 200
    assert res.json()["id"] == materia_id


def test_obtener_materia_inexistente(client, admin_token):
    res = client.get("/materias/9999", headers=auth(admin_token))
    assert res.status_code == 404


def test_listar_materias_sin_token(client):
    res = client.get("/materias/")
    assert res.status_code == 401


def test_actualizar_materia_como_admin(client, admin_token, materia_id):
    res = client.put(f"/materias/{materia_id}", json={"nombre": "Matemática Avanzada"},
                     headers=auth(admin_token))
    assert res.status_code == 200
    assert res.json()["nombre"] == "Matemática Avanzada"
    assert res.json()["codigo"] == "MAT101"


def test_actualizar_materia_como_docente(client, docente_token, materia_id):
    res = client.put(f"/materias/{materia_id}", json={"nombre": "Nuevo nombre"},
                     headers=auth(docente_token))
    assert res.status_code == 403


def test_actualizar_materia_inexistente(client, admin_token):
    res = client.put("/materias/9999", json={"nombre": "Nada"},
                     headers=auth(admin_token))
    assert res.status_code == 404


def test_eliminar_materia_como_admin(client, admin_token, materia_id):
    res = client.delete(f"/materias/{materia_id}", headers=auth(admin_token))
    assert res.status_code == 204
    res = client.get(f"/materias/{materia_id}", headers=auth(admin_token))
    assert res.status_code == 404


def test_eliminar_materia_como_estudiante(client, estudiante_token, materia_id):
    res = client.delete(f"/materias/{materia_id}", headers=auth(estudiante_token))
    assert res.status_code == 403


def test_eliminar_materia_inexistente(client, admin_token):
    res = client.delete("/materias/9999", headers=auth(admin_token))
    assert res.status_code == 404


def test_crear_materia_sin_token(client):
    res = client.post("/materias/", json={"nombre": "X", "codigo": "X101"})
    assert res.status_code == 401


def test_crear_materia_como_docente(client, docente_token):
    res = client.post("/materias/", json={"nombre": "X", "codigo": "X101"},
                      headers=auth(docente_token))
    assert res.status_code == 403


def test_actualizar_materia_como_estudiante(client, estudiante_token, materia_id):
    res = client.put(f"/materias/{materia_id}", json={"nombre": "Nuevo"},
                     headers=auth(estudiante_token))
    assert res.status_code == 403


def test_eliminar_materia_como_docente(client, docente_token, materia_id):
    res = client.delete(f"/materias/{materia_id}", headers=auth(docente_token))
    assert res.status_code == 403


def test_listar_materias_como_estudiante(client, estudiante_token):
    res = client.get("/materias/", headers=auth(estudiante_token))
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_materia_actualizada_preserva_codigo(client, admin_token, materia_id):
    res = client.put(f"/materias/{materia_id}", json={"nombre": "Nombre Nuevo"},
                     headers=auth(admin_token))
    assert res.status_code == 200
    assert res.json()["codigo"] == "MAT101"
    assert res.json()["nombre"] == "Nombre Nuevo"
