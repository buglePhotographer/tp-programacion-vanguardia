from datetime import datetime, timedelta
from tests.conftest import auth


def crear_tp(client, token, materia_id):
    fecha = (datetime.now() + timedelta(days=7)).isoformat()
    return client.post("/trabajos-practicos", json={
        "materia_id": materia_id,
        "titulo": "TP de prueba",
        "descripcion": "Descripcion",
        "fecha_entrega": fecha,
    }, headers=auth(token))


def test_crear_tp_como_docente(client, docente_token, materia_id):
    res = crear_tp(client, docente_token, materia_id)
    assert res.status_code == 201
    assert res.json()["titulo"] == "TP de prueba"


def test_crear_tp_como_estudiante(client, estudiante_token, materia_id):
    res = crear_tp(client, estudiante_token, materia_id)
    assert res.status_code == 403


def test_listar_tps_de_materia(client, docente_token, estudiante_token, materia_id):
    crear_tp(client, docente_token, materia_id)
    res = client.get(f"/trabajos-practicos/materia/{materia_id}",
                     headers=auth(estudiante_token))
    assert res.status_code == 200
    assert len(res.json()) == 1


def test_entregar_tp(client, docente_token, estudiante_token, materia_id):
    tp_id = crear_tp(client, docente_token, materia_id).json()["id"]
    res = client.post("/entregas", json={
        "tp_id": tp_id, "archivo_url": "https://github.com/test/tp"
    }, headers=auth(estudiante_token))
    assert res.status_code == 201
    assert res.json()["tp_id"] == tp_id
    assert res.json()["nota"] is None


def test_entregar_tp_duplicado(client, docente_token, estudiante_token, materia_id):
    tp_id = crear_tp(client, docente_token, materia_id).json()["id"]
    client.post("/entregas", json={"tp_id": tp_id, "archivo_url": "https://x.com"},
                headers=auth(estudiante_token))
    res = client.post("/entregas", json={"tp_id": tp_id, "archivo_url": "https://x.com"},
                      headers=auth(estudiante_token))
    assert res.status_code == 400
    assert "Ya entregaste" in res.json()["detail"]


def test_calificar_entrega(client, docente_token, estudiante_token, materia_id):
    tp_id = crear_tp(client, docente_token, materia_id).json()["id"]
    entrega_id = client.post("/entregas", json={
        "tp_id": tp_id, "archivo_url": "https://x.com"
    }, headers=auth(estudiante_token)).json()["id"]

    res = client.put(f"/entregas/{entrega_id}/calificar",
                     json={"nota": 9.0, "comentario": "Muy bien"},
                     headers=auth(docente_token))
    assert res.status_code == 200

    entregas = client.get("/entregas/mis-entregas", headers=auth(estudiante_token))
    entrega = next(e for e in entregas.json() if e["id"] == entrega_id)
    assert entrega["nota"] == 9.0
    assert entrega["comentario"] == "Muy bien"


def test_calificar_entrega_como_estudiante(client, docente_token, estudiante_token, materia_id):
    tp_id = crear_tp(client, docente_token, materia_id).json()["id"]
    entrega_id = client.post("/entregas", json={
        "tp_id": tp_id, "archivo_url": "https://x.com"
    }, headers=auth(estudiante_token)).json()["id"]

    res = client.put(f"/entregas/{entrega_id}/calificar",
                     json={"nota": 8.0},
                     headers=auth(estudiante_token))
    assert res.status_code == 403


def test_entregar_tp_como_docente(client, docente_token, materia_id):
    tp_id = crear_tp(client, docente_token, materia_id).json()["id"]
    res = client.post("/entregas", json={"tp_id": tp_id, "archivo_url": "https://x.com"},
                      headers=auth(docente_token))
    assert res.status_code == 403


def test_calificar_entrega_inexistente(client, docente_token):
    res = client.put("/entregas/9999/calificar",
                     json={"nota": 8.0, "comentario": "Test"},
                     headers=auth(docente_token))
    assert res.status_code == 404


def test_listar_entregas_de_tp(client, docente_token, estudiante_token, materia_id):
    tp_id = crear_tp(client, docente_token, materia_id).json()["id"]
    client.post("/entregas", json={"tp_id": tp_id, "archivo_url": "https://x.com"},
                headers=auth(estudiante_token))
    res = client.get(f"/entregas/tp/{tp_id}", headers=auth(docente_token))
    assert res.status_code == 200
    assert len(res.json()) == 1


def test_listar_entregas_tp_sin_entregas(client, docente_token, materia_id):
    tp_id = crear_tp(client, docente_token, materia_id).json()["id"]
    res = client.get(f"/entregas/tp/{tp_id}", headers=auth(docente_token))
    assert res.status_code == 200
    assert res.json() == []


def test_mis_entregas_vacio(client, estudiante_token):
    res = client.get("/entregas/mis-entregas", headers=auth(estudiante_token))
    assert res.status_code == 200
    assert res.json() == []


def test_mis_entregas_sin_token(client):
    res = client.get("/entregas/mis-entregas")
    assert res.status_code == 401


def test_crear_tp_sin_token(client, materia_id):
    fecha = (datetime.now() + timedelta(days=7)).isoformat()
    res = client.post("/trabajos-practicos", json={
        "materia_id": materia_id, "titulo": "TP", "descripcion": "Desc",
        "fecha_entrega": fecha,
    })
    assert res.status_code == 401
