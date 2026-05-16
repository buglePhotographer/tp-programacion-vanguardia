from tests.conftest import auth


def test_inscribirse(client, estudiante_token, materia_id):
    res = client.post("/inscripciones/", json={"materia_id": materia_id},
                      headers=auth(estudiante_token))
    assert res.status_code == 201
    assert res.json()["materia"]["id"] == materia_id
    assert res.json()["estado"] == "activa"


def test_inscribirse_duplicado(client, estudiante_token, materia_id):
    client.post("/inscripciones/", json={"materia_id": materia_id},
                headers=auth(estudiante_token))
    res = client.post("/inscripciones/", json={"materia_id": materia_id},
                      headers=auth(estudiante_token))
    assert res.status_code == 400
    assert "Ya estás inscripto" in res.json()["detail"]


def test_inscribirse_como_docente(client, docente_token, materia_id):
    res = client.post("/inscripciones/", json={"materia_id": materia_id},
                      headers=auth(docente_token))
    assert res.status_code == 403


def test_inscribirse_materia_inexistente(client, estudiante_token):
    res = client.post("/inscripciones/", json={"materia_id": 9999},
                      headers=auth(estudiante_token))
    assert res.status_code == 404


def test_mis_materias(client, estudiante_token, materia_id):
    client.post("/inscripciones/", json={"materia_id": materia_id},
                headers=auth(estudiante_token))
    res = client.get("/inscripciones/mis-materias", headers=auth(estudiante_token))
    assert res.status_code == 200
    assert len(res.json()) == 1
    assert res.json()[0]["materia"]["id"] == materia_id


def test_mis_materias_vacio(client, estudiante_token):
    res = client.get("/inscripciones/mis-materias", headers=auth(estudiante_token))
    assert res.status_code == 200
    assert res.json() == []


def test_alumnos_de_materia_como_docente(client, docente_token, estudiante_token, materia_id):
    client.post("/inscripciones/", json={"materia_id": materia_id},
                headers=auth(estudiante_token))
    res = client.get(f"/inscripciones/materia/{materia_id}", headers=auth(docente_token))
    assert res.status_code == 200
    assert len(res.json()) == 1


def test_alumnos_de_materia_como_estudiante(client, estudiante_token, materia_id):
    res = client.get(f"/inscripciones/materia/{materia_id}", headers=auth(estudiante_token))
    assert res.status_code == 403


def test_cargar_nota_final(client, docente_token, estudiante_token, materia_id):
    inscripcion_id = client.post("/inscripciones/", json={"materia_id": materia_id},
                                 headers=auth(estudiante_token)).json()["id"]
    res = client.put(f"/inscripciones/{inscripcion_id}/nota-final",
                     params={"nota": 8.5},
                     headers=auth(docente_token))
    assert res.status_code == 200

    mis_materias = client.get("/inscripciones/mis-materias", headers=auth(estudiante_token)).json()
    assert mis_materias[0]["nota_final"] == 8.5


def test_cargar_nota_final_como_estudiante(client, docente_token, estudiante_token, materia_id):
    inscripcion_id = client.post("/inscripciones/", json={"materia_id": materia_id},
                                 headers=auth(estudiante_token)).json()["id"]
    res = client.put(f"/inscripciones/{inscripcion_id}/nota-final",
                     params={"nota": 7.0},
                     headers=auth(estudiante_token))
    assert res.status_code == 403


def test_cargar_nota_final_inscripcion_inexistente(client, docente_token):
    res = client.put("/inscripciones/9999/nota-final",
                     params={"nota": 5.0},
                     headers=auth(docente_token))
    assert res.status_code == 404
