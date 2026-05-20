from tests.conftest import auth


def test_crear_aviso_global(client, docente_token):
    res = client.post("/avisos/", json={
        "titulo": "Aviso general",
        "contenido": "Contenido del aviso"
    }, headers=auth(docente_token))
    assert res.status_code == 201
    data = res.json()
    assert data["titulo"] == "Aviso general"
    assert data["materia_id"] is None
    assert "autor" in data


def test_crear_aviso_de_materia(client, docente_token, materia_id):
    res = client.post("/avisos/", json={
        "titulo": "Aviso de materia",
        "contenido": "Contenido",
        "materia_id": materia_id
    }, headers=auth(docente_token))
    assert res.status_code == 201
    assert res.json()["materia_id"] == materia_id


def test_crear_aviso_sin_token(client):
    res = client.post("/avisos/", json={
        "titulo": "Aviso",
        "contenido": "Contenido"
    })
    assert res.status_code == 401


def test_crear_aviso_como_estudiante(client, estudiante_token):
    res = client.post("/avisos/", json={
        "titulo": "Aviso",
        "contenido": "Contenido"
    }, headers=auth(estudiante_token))
    assert res.status_code == 201


def test_listar_avisos_globales(client, admin_token):
    client.post("/avisos/", json={"titulo": "Global 1", "contenido": "x"},
                headers=auth(admin_token))
    client.post("/avisos/", json={"titulo": "Global 2", "contenido": "x"},
                headers=auth(admin_token))
    res = client.get("/avisos/", headers=auth(admin_token))
    assert res.status_code == 200
    assert len(res.json()) == 2


def test_listar_avisos_globales_no_incluye_de_materia(client, admin_token, materia_id):
    client.post("/avisos/", json={"titulo": "Global", "contenido": "x"},
                headers=auth(admin_token))
    client.post("/avisos/", json={"titulo": "De materia", "contenido": "x", "materia_id": materia_id},
                headers=auth(admin_token))
    res = client.get("/avisos/", headers=auth(admin_token))
    assert res.status_code == 200
    assert len(res.json()) == 1
    assert res.json()[0]["titulo"] == "Global"


def test_listar_avisos_por_materia(client, docente_token, materia_id):
    client.post("/avisos/", json={"titulo": "Aviso 1", "contenido": "x", "materia_id": materia_id},
                headers=auth(docente_token))
    client.post("/avisos/", json={"titulo": "Aviso 2", "contenido": "x", "materia_id": materia_id},
                headers=auth(docente_token))
    res = client.get(f"/avisos/materia/{materia_id}", headers=auth(docente_token))
    assert res.status_code == 200
    assert len(res.json()) == 2


def test_listar_avisos_materia_sin_avisos(client, estudiante_token, materia_id):
    res = client.get(f"/avisos/materia/{materia_id}", headers=auth(estudiante_token))
    assert res.status_code == 200
    assert res.json() == []


def test_listar_avisos_sin_token(client):
    res = client.get("/avisos/")
    assert res.status_code == 401


def test_crear_aviso_sin_titulo_falla(client, docente_token):
    res = client.post("/avisos/", json={"contenido": "Sin titulo"},
                      headers=auth(docente_token))
    assert res.status_code == 422


def test_avisos_de_materia_inexistente_retorna_lista_vacia(client, estudiante_token):
    res = client.get("/avisos/materia/9999", headers=auth(estudiante_token))
    assert res.status_code == 200
    assert res.json() == []


def test_avisos_de_materia_no_incluye_globales(client, admin_token, materia_id):
    client.post("/avisos/", json={"titulo": "Global", "contenido": "x"},
                headers=auth(admin_token))
    client.post("/avisos/", json={"titulo": "De materia", "contenido": "x",
                                  "materia_id": materia_id},
                headers=auth(admin_token))
    res = client.get(f"/avisos/materia/{materia_id}", headers=auth(admin_token))
    assert res.status_code == 200
    assert len(res.json()) == 1
    assert res.json()[0]["titulo"] == "De materia"


def test_aviso_respuesta_incluye_autor(client, docente_token):
    res = client.post("/avisos/", json={"titulo": "Test", "contenido": "x"},
                      headers=auth(docente_token))
    assert res.status_code == 201
    data = res.json()
    assert "autor" in data
    assert "nombre" in data["autor"]
