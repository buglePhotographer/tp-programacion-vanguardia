"""
Tests de integración — flujos completos end-to-end
"""
from datetime import datetime, timedelta
from tests.conftest import register, get_token, auth


def _crear_materia(client, admin_token, nombre="Arquitectura", codigo="ARQ101"):
    return client.post("/materias/", json={
        "nombre": nombre, "codigo": codigo, "descripcion": "Desc"
    }, headers=auth(admin_token)).json()["id"]


def _crear_tp(client, docente_token, materia_id, titulo="TP Integración"):
    fecha = (datetime.now() + timedelta(days=7)).isoformat()
    return client.post("/trabajos-practicos", json={
        "materia_id": materia_id, "titulo": titulo,
        "descripcion": "Desc", "fecha_entrega": fecha,
    }, headers=auth(docente_token)).json()["id"]


def test_flujo_completo_estudiante(client):
    """
    Admin crea materia → docente crea TP → estudiante se inscribe,
    entrega el TP y el docente lo califica → estudiante ve la nota.
    """
    register(client, "Admin", "admin@test.com", "admin1234", "admin")
    admin_token = get_token(client, "admin@test.com", "admin1234")

    register(client, "Docente", "doc@test.com", "doc1234", "docente")
    doc_token = get_token(client, "doc@test.com", "doc1234")

    register(client, "Estudiante", "est@test.com", "est1234", "estudiante")
    est_token = get_token(client, "est@test.com", "est1234")

    materia_id = _crear_materia(client, admin_token)
    tp_id = _crear_tp(client, doc_token, materia_id)

    insc = client.post("/inscripciones/", json={"materia_id": materia_id},
                       headers=auth(est_token)).json()
    assert insc["estado"] == "activa"

    entrega = client.post("/entregas", json={
        "tp_id": tp_id, "archivo_url": "https://github.com/est/tp"
    }, headers=auth(est_token)).json()
    assert entrega["nota"] is None
    entrega_id = entrega["id"]

    client.put(f"/entregas/{entrega_id}/calificar",
               json={"nota": 9.0, "comentario": "Excelente trabajo"},
               headers=auth(doc_token))

    mis_entregas = client.get("/entregas/mis-entregas", headers=auth(est_token)).json()
    entrega_calificada = next(e for e in mis_entregas if e["id"] == entrega_id)
    assert entrega_calificada["nota"] == 9.0
    assert entrega_calificada["comentario"] == "Excelente trabajo"


def test_flujo_docente_multiples_entregas(client):
    """
    Docente crea TP → múltiples estudiantes entregan →
    docente ve todas las entregas y califica individualmente.
    """
    register(client, "Admin", "admin@test.com", "admin1234", "admin")
    admin_token = get_token(client, "admin@test.com", "admin1234")

    register(client, "Docente", "doc@test.com", "doc1234", "docente")
    doc_token = get_token(client, "doc@test.com", "doc1234")

    for i in range(3):
        register(client, f"Est{i}", f"est{i}@test.com", "est1234", "estudiante")
    tokens_est = [get_token(client, f"est{i}@test.com", "est1234") for i in range(3)]

    materia_id = _crear_materia(client, admin_token)
    tp_id = _crear_tp(client, doc_token, materia_id)

    entrega_ids = []
    for i, tok in enumerate(tokens_est):
        client.post("/inscripciones/", json={"materia_id": materia_id}, headers=auth(tok))
        e = client.post("/entregas", json={
            "tp_id": tp_id, "archivo_url": f"https://github.com/est{i}/tp"
        }, headers=auth(tok)).json()
        entrega_ids.append(e["id"])

    entregas = client.get(f"/entregas/tp/{tp_id}", headers=auth(doc_token)).json()
    assert len(entregas) == 3

    notas = [7.0, 8.5, 10.0]
    for eid, nota in zip(entrega_ids, notas):
        res = client.put(f"/entregas/{eid}/calificar",
                         json={"nota": nota}, headers=auth(doc_token))
        assert res.status_code == 200

    entregas_calificadas = client.get(f"/entregas/tp/{tp_id}", headers=auth(doc_token)).json()
    notas_guardadas = {e["id"]: e["nota"] for e in entregas_calificadas}
    for eid, nota in zip(entrega_ids, notas):
        assert notas_guardadas[eid] == nota


def test_flujo_admin_gestiona_plataforma(client):
    """
    Admin crea múltiples materias y verifica el listado.
    Admin puede filtrar usuarios por rol.
    """
    register(client, "Admin", "admin@test.com", "admin1234", "admin")
    admin_token = get_token(client, "admin@test.com", "admin1234")

    codigos = ["MAT101", "FIS201", "QUI301"]
    for i, cod in enumerate(codigos):
        client.post("/materias/", json={
            "nombre": f"Materia {i}", "codigo": cod, "descripcion": "Desc"
        }, headers=auth(admin_token))

    materias = client.get("/materias/", headers=auth(admin_token)).json()
    assert len(materias) == 3

    register(client, "Doc1", "doc1@test.com", "pass", "docente")
    register(client, "Doc2", "doc2@test.com", "pass", "docente")
    register(client, "Est1", "est1@test.com", "pass", "estudiante")

    docentes = client.get("/auth/usuarios?rol=docente", headers=auth(admin_token)).json()
    estudiantes = client.get("/auth/usuarios?rol=estudiante", headers=auth(admin_token)).json()

    assert len(docentes) == 2
    assert len(estudiantes) == 1
    assert all(u["rol"] == "docente" for u in docentes)


def test_aviso_de_materia_visible_para_inscriptos(client):
    """
    Docente publica aviso en materia → estudiante inscripto puede verlo,
    el aviso no aparece en la lista global.
    """
    register(client, "Admin", "admin@test.com", "admin1234", "admin")
    admin_token = get_token(client, "admin@test.com", "admin1234")

    register(client, "Docente", "doc@test.com", "doc1234", "docente")
    doc_token = get_token(client, "doc@test.com", "doc1234")

    register(client, "Estudiante", "est@test.com", "est1234", "estudiante")
    est_token = get_token(client, "est@test.com", "est1234")

    materia_id = _crear_materia(client, admin_token)

    client.post("/inscripciones/", json={"materia_id": materia_id}, headers=auth(est_token))

    client.post("/avisos/", json={
        "titulo": "Aviso de materia", "contenido": "Contenido",
        "materia_id": materia_id
    }, headers=auth(doc_token))

    avisos_materia = client.get(f"/avisos/materia/{materia_id}", headers=auth(est_token)).json()
    assert len(avisos_materia) == 1
    assert avisos_materia[0]["titulo"] == "Aviso de materia"

    avisos_globales = client.get("/avisos/", headers=auth(est_token)).json()
    assert all(a["titulo"] != "Aviso de materia" for a in avisos_globales)
