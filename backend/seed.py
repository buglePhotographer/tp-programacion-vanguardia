"""
Script de datos de demo para la Plataforma Académica.
Uso: docker compose exec backend python seed.py
"""
from datetime import datetime, timedelta
from app.database import Base, engine, SessionLocal
import app.models  # registra todos los modelos
from app.models.usuario import Usuario, Rol
from app.models.materia import Materia
from app.models.inscripcion import Inscripcion, EstadoInscripcion
from app.models.entrega import TrabajoPractico, Entrega
from app.models.aviso import Aviso
from app.models.evento import Evento
from app.auth import hash_password

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# ── Usuarios ──────────────────────────────────────────────────────────────────

admin = Usuario(nombre="Administrador", email="admin@plataforma.com",
                password_hash=hash_password("admin1234"), rol=Rol.admin)

doc1 = Usuario(nombre="María González", email="mgonzalez@plataforma.com",
               password_hash=hash_password("docente1234"), rol=Rol.docente)
doc2 = Usuario(nombre="Carlos Pérez", email="cperez@plataforma.com",
               password_hash=hash_password("docente1234"), rol=Rol.docente)
doc3 = Usuario(nombre="Florencia Ibáñez", email="fibanez@plataforma.com",
               password_hash=hash_password("docente1234"), rol=Rol.docente)

est1 = Usuario(nombre="Lucía Ramírez", email="lramirez@plataforma.com",
               password_hash=hash_password("alumno1234"), rol=Rol.estudiante)
est2 = Usuario(nombre="Tomás Herrera", email="therrera@plataforma.com",
               password_hash=hash_password("alumno1234"), rol=Rol.estudiante)
est3 = Usuario(nombre="Valentina López", email="vlopez@plataforma.com",
               password_hash=hash_password("alumno1234"), rol=Rol.estudiante)
est4 = Usuario(nombre="Matías Sosa", email="msosa@plataforma.com",
               password_hash=hash_password("alumno1234"), rol=Rol.estudiante)
est5 = Usuario(nombre="Camila Fernández", email="cfernandez@plataforma.com",
               password_hash=hash_password("alumno1234"), rol=Rol.estudiante)
est6 = Usuario(nombre="Nicolás Romero", email="nromero@plataforma.com",
               password_hash=hash_password("alumno1234"), rol=Rol.estudiante)
est7 = Usuario(nombre="Sofía Castro", email="scastro@plataforma.com",
               password_hash=hash_password("alumno1234"), rol=Rol.estudiante)

db.add_all([admin, doc1, doc2, doc3, est1, est2, est3, est4, est5, est6, est7])
db.flush()

# ── Materias ──────────────────────────────────────────────────────────────────

mat1 = Materia(nombre="Programación de Vanguardia", codigo="PV101",
               descripcion="Arquitecturas modernas, microservicios, CI/CD y buenas prácticas.",
               docente_id=doc1.id)
mat2 = Materia(nombre="Bases de Datos Avanzadas", codigo="BDA202",
               descripcion="Modelado relacional, NoSQL, optimización de consultas y transacciones.",
               docente_id=doc1.id)
mat3 = Materia(nombre="Sistemas Distribuidos", codigo="SD303",
               descripcion="Consistencia, disponibilidad, tolerancia a fallos y patrones distribuidos.",
               docente_id=doc2.id)
mat4 = Materia(nombre="Seguridad Informática", codigo="SI404",
               descripcion="OWASP, criptografía, gestión de identidades y hardening de sistemas.",
               docente_id=doc2.id)
mat5 = Materia(nombre="Inteligencia Artificial", codigo="IA505",
               descripcion="Fundamentos de ML, redes neuronales y modelos de lenguaje.",
               docente_id=doc3.id)

db.add_all([mat1, mat2, mat3, mat4, mat5])
db.flush()

# ── Inscripciones ─────────────────────────────────────────────────────────────

inscripciones = [
    # est1: activa en PV, aprobada en BDA, activa en SI
    Inscripcion(estudiante_id=est1.id, materia_id=mat1.id, estado=EstadoInscripcion.activa),
    Inscripcion(estudiante_id=est1.id, materia_id=mat2.id, estado=EstadoInscripcion.aprobada, nota_final=8.5),
    Inscripcion(estudiante_id=est1.id, materia_id=mat4.id, estado=EstadoInscripcion.activa),
    # est2: activa en PV, desaprobada en SD
    Inscripcion(estudiante_id=est2.id, materia_id=mat1.id, estado=EstadoInscripcion.activa),
    Inscripcion(estudiante_id=est2.id, materia_id=mat3.id, estado=EstadoInscripcion.desaprobada, nota_final=3.0),
    # est3: activa en PV, aprobada en SD
    Inscripcion(estudiante_id=est3.id, materia_id=mat1.id, estado=EstadoInscripcion.activa),
    Inscripcion(estudiante_id=est3.id, materia_id=mat3.id, estado=EstadoInscripcion.aprobada, nota_final=9.0),
    # est4: activa en BDA y SI
    Inscripcion(estudiante_id=est4.id, materia_id=mat2.id, estado=EstadoInscripcion.activa),
    Inscripcion(estudiante_id=est4.id, materia_id=mat4.id, estado=EstadoInscripcion.activa),
    # est5: muchas materias — para ver listas largas
    Inscripcion(estudiante_id=est5.id, materia_id=mat1.id, estado=EstadoInscripcion.activa),
    Inscripcion(estudiante_id=est5.id, materia_id=mat2.id, estado=EstadoInscripcion.aprobada, nota_final=10.0),
    Inscripcion(estudiante_id=est5.id, materia_id=mat3.id, estado=EstadoInscripcion.activa),
    Inscripcion(estudiante_id=est5.id, materia_id=mat4.id, estado=EstadoInscripcion.aprobada, nota_final=7.0),
    # est6: nota límite aprobado/desaprobado
    Inscripcion(estudiante_id=est6.id, materia_id=mat1.id, estado=EstadoInscripcion.desaprobada, nota_final=5.5),
    Inscripcion(estudiante_id=est6.id, materia_id=mat3.id, estado=EstadoInscripcion.aprobada, nota_final=6.0),
    # est7: solo inscripta, sin actividad aún
    Inscripcion(estudiante_id=est7.id, materia_id=mat1.id, estado=EstadoInscripcion.activa),
]
db.add_all(inscripciones)
db.flush()

# ── Trabajos Prácticos ────────────────────────────────────────────────────────

now = datetime.now()

tp1 = TrabajoPractico(materia_id=mat1.id, titulo="TP1 – Dockerización de una API REST",
                      descripcion="Contenerizar una API FastAPI con Docker y docker-compose. Incluir healthcheck y variables de entorno.",
                      fecha_entrega=now + timedelta(days=7))
tp2 = TrabajoPractico(materia_id=mat1.id, titulo="TP2 – Pipeline CI/CD",
                      descripcion="Configurar un pipeline en GitHub Actions que ejecute tests, build y deploy automático.",
                      fecha_entrega=now + timedelta(days=21))
tp3 = TrabajoPractico(materia_id=mat2.id, titulo="TP1 – Modelo relacional y consultas",
                      descripcion="Diseñar el DER de un sistema de e-commerce e implementar las consultas en PostgreSQL.",
                      fecha_entrega=now - timedelta(days=3))
tp4 = TrabajoPractico(materia_id=mat3.id, titulo="TP1 – Implementar un sistema de consenso",
                      descripcion="Simular el algoritmo Raft en Python con al menos 3 nodos.",
                      fecha_entrega=now + timedelta(days=14))
tp5 = TrabajoPractico(materia_id=mat3.id, titulo="TP2 – Diseño de un sistema tolerante a fallos",
                      descripcion="Implementar circuit breakers y retries en un microservicio usando Python.",
                      fecha_entrega=now + timedelta(days=35))
tp6 = TrabajoPractico(materia_id=mat4.id, titulo="TP1 – Auditoría OWASP Top 10",
                      descripcion="Analizar una aplicación web de ejemplo e identificar vulnerabilidades del OWASP Top 10.",
                      fecha_entrega=now + timedelta(days=10))
tp7 = TrabajoPractico(materia_id=mat4.id, titulo="TP2 – Implementar autenticación segura",
                      descripcion="Agregar MFA, rotación de tokens JWT y rate limiting a una API REST.",
                      fecha_entrega=now + timedelta(days=28))
# TP vencido sin entregas — para testear estado vacío
tp8 = TrabajoPractico(materia_id=mat2.id, titulo="TP2 – Optimización de consultas",
                      descripcion="Analizar planes de ejecución y aplicar índices compuestos en una base de datos de producción.",
                      fecha_entrega=now - timedelta(days=10))

db.add_all([tp1, tp2, tp3, tp4, tp5, tp6, tp7, tp8])
db.flush()

# ── Entregas ──────────────────────────────────────────────────────────────────

entregas = [
    # TP1 PV101 – todos los inscriptos entregaron, con notas variadas
    Entrega(tp_id=tp1.id, estudiante_id=est1.id,
            archivo_url="https://github.com/lramirez/tp1-docker",
            nota=9.0, comentario="Excelente implementación, healthcheck correcto."),
    Entrega(tp_id=tp1.id, estudiante_id=est2.id,
            archivo_url="https://github.com/therrera/tp1-docker",
            nota=6.5, comentario="Falta manejo de variables de entorno en producción."),
    Entrega(tp_id=tp1.id, estudiante_id=est3.id,
            archivo_url="https://drive.google.com/file/vlopez-tp1",
            nota=8.0, comentario="Muy bien, pequeño issue con el orden de dependencias."),
    Entrega(tp_id=tp1.id, estudiante_id=est5.id,
            archivo_url="https://github.com/cfernandez/tp1-docker",
            nota=10.0, comentario="Perfecto. Incluye multi-stage build y healthcheck con curl."),
    Entrega(tp_id=tp1.id, estudiante_id=est6.id,
            archivo_url="https://github.com/nromero/tp1-docker",
            nota=4.0, comentario="El contenedor no levanta correctamente. Revisar CMD vs ENTRYPOINT."),
    # est7 no entregó TP1 — para testear estado "pendiente"

    # TP2 PV101 – sin calificar (entregado pero el docente no calificó aún)
    Entrega(tp_id=tp2.id, estudiante_id=est1.id,
            archivo_url="https://github.com/lramirez/tp2-cicd"),
    Entrega(tp_id=tp2.id, estudiante_id=est5.id,
            archivo_url="https://github.com/cfernandez/tp2-cicd"),

    # TP1 BDA202 – vencido, con notas
    Entrega(tp_id=tp3.id, estudiante_id=est1.id,
            archivo_url="https://drive.google.com/file/lramirez-bda-tp1",
            nota=7.5, comentario="Buen DER, mejorar índices en las consultas de agregación."),
    Entrega(tp_id=tp3.id, estudiante_id=est4.id,
            archivo_url="https://github.com/msosa/bda-tp1",
            nota=5.0, comentario="Consultas correctas pero el modelo normalizado tiene anomalías."),
    Entrega(tp_id=tp3.id, estudiante_id=est5.id,
            archivo_url="https://github.com/cfernandez/bda-tp1",
            nota=10.0, comentario="DER impecable y consultas optimizadas con índices compuestos."),
    # tp8 BDA202 (vencido) – nadie entregó, para testear lista vacía

    # TP1 SD303 – algunos entregaron, sin calificar
    Entrega(tp_id=tp4.id, estudiante_id=est3.id,
            archivo_url="https://github.com/vlopez/raft-sim"),
    Entrega(tp_id=tp4.id, estudiante_id=est5.id,
            archivo_url="https://github.com/cfernandez/raft-sim",
            nota=8.5, comentario="Implementación correcta. Falta manejo del split-brain."),

    # TP1 SI404 – entregado y calificado
    Entrega(tp_id=tp6.id, estudiante_id=est1.id,
            archivo_url="https://drive.google.com/file/lramirez-owasp",
            nota=9.5, comentario="Identificó todas las vulnerabilidades críticas con evidencia."),
    Entrega(tp_id=tp6.id, estudiante_id=est4.id,
            archivo_url="https://github.com/msosa/owasp-audit",
            nota=7.0, comentario="Buen análisis, faltó cubrir A07 Identification and Authentication Failures."),

    # TP2 SI404 – entregado sin calificar
    Entrega(tp_id=tp7.id, estudiante_id=est4.id,
            archivo_url="https://github.com/msosa/secure-auth"),
]
db.add_all(entregas)
db.flush()

# ── Avisos ────────────────────────────────────────────────────────────────────

avisos = [
    # Globales
    Aviso(autor_id=admin.id, titulo="Bienvenidos al cuatrimestre 2026",
          contenido="Les damos la bienvenida a la plataforma académica. Pueden inscribirse a las materias desde la sección Materias."),
    Aviso(autor_id=admin.id, titulo="Mantenimiento programado – sábado 18/05",
          contenido="El sistema estará fuera de servicio el sábado 18 de mayo de 02:00 a 06:00 hs por tareas de mantenimiento."),
    Aviso(autor_id=admin.id, titulo="Recordatorio: cierre de inscripciones",
          contenido="El período de inscripción a materias cierra el 31 de mayo. Pasada esa fecha no se aceptarán nuevas inscripciones."),
    # PV101
    Aviso(materia_id=mat1.id, autor_id=doc1.id, titulo="Fecha de entrega del TP1 extendida",
          contenido="Se extendió el plazo de entrega del TP1 hasta el viernes. Aprovechen para revisar la documentación de Docker Compose v2."),
    Aviso(materia_id=mat1.id, autor_id=doc1.id, titulo="Clase práctica el jueves",
          contenido="El jueves haremos una clase práctica de GitHub Actions. Traigan una repo de ejemplo lista para configurar el pipeline."),
    Aviso(materia_id=mat1.id, autor_id=doc1.id, titulo="Correcciones del TP1 publicadas",
          contenido="Ya pueden ver las correcciones del TP1 en la sección Mis Entregas. Consulten dudas en la próxima clase."),
    # BDA202
    Aviso(materia_id=mat2.id, autor_id=doc1.id, titulo="Material del TP1 disponible",
          contenido="Subí el enunciado completo del TP1 con el dataset de ejemplo en el aula virtual."),
    Aviso(materia_id=mat2.id, autor_id=doc1.id, titulo="TP2 – nuevo enunciado publicado",
          contenido="El enunciado del TP2 está disponible. Fecha límite: 10 días desde hoy. No se aceptan entregas fuera de término."),
    # SD303
    Aviso(materia_id=mat3.id, autor_id=doc2.id, titulo="Lectura obligatoria",
          contenido="Para la próxima clase lean el paper original de Raft: 'In Search of an Understandable Consensus Algorithm'."),
    Aviso(materia_id=mat3.id, autor_id=doc2.id, titulo="TP2 publicado",
          contenido="Ya está disponible el enunciado del TP2 sobre tolerancia a fallos. Pueden trabajar en grupos de hasta 3 personas."),
    # SI404
    Aviso(materia_id=mat4.id, autor_id=doc2.id, titulo="Herramientas para el TP1",
          contenido="Pueden usar OWASP ZAP o Burp Suite Community para el análisis. Les dejo un tutorial en el campus."),
    Aviso(materia_id=mat4.id, autor_id=doc2.id, titulo="TP1 calificado",
          contenido="Ya están publicadas las notas del TP1. Quienes desaprobaron tienen una instancia de recuperación la semana próxima."),
    # IA505 — materia nueva, solo un aviso de presentación
    Aviso(materia_id=mat5.id, autor_id=doc3.id, titulo="Presentación de la materia",
          contenido="Hola a todos. En las próximas semanas abriré el período de inscripción. La materia arranca con fundamentos de ML y luego avanzamos a LLMs."),
]
db.add_all(avisos)

# ── Eventos ───────────────────────────────────────────────────────────────────

eventos = [
    # Pasados — para testear el calendario con historial
    Evento(materia_id=mat1.id, titulo="Clase inaugural PV101",
           descripcion="Presentación de la materia, docente y programa del cuatrimestre.",
           fecha_inicio=now - timedelta(days=30), fecha_fin=now - timedelta(days=30) + timedelta(hours=2)),
    Evento(materia_id=mat2.id, titulo="Taller de modelado relacional",
           descripcion="Ejercicio práctico de diseño de DER en grupos.",
           fecha_inicio=now - timedelta(days=15), fecha_fin=now - timedelta(days=15) + timedelta(hours=2)),
    Evento(materia_id=mat3.id, titulo="Exposición TP1",
           descripcion="Presentación grupal de la implementación de Raft.",
           fecha_inicio=now - timedelta(days=5), fecha_fin=now - timedelta(days=5) + timedelta(hours=2)),
    # Próximos
    Evento(materia_id=mat4.id, titulo="Recuperatorio TP1 – SI404",
           descripcion="Instancia de recuperación para quienes no alcanzaron el mínimo en el TP1.",
           fecha_inicio=now + timedelta(days=7), fecha_fin=now + timedelta(days=7, hours=2)),
    Evento(materia_id=mat1.id, titulo="Parcial integrador",
           descripcion="Evaluación integradora de todos los temas del cuatrimestre.",
           fecha_inicio=now + timedelta(days=30), fecha_fin=now + timedelta(days=30, hours=2)),
    Evento(materia_id=mat2.id, titulo="Examen final BDA",
           descripcion="Examen final con parte escrita y práctica en PostgreSQL.",
           fecha_inicio=now + timedelta(days=45), fecha_fin=now + timedelta(days=45, hours=3)),
    Evento(materia_id=mat3.id, titulo="Exposición TP2",
           descripcion="Cada grupo presenta su implementación de circuit breakers.",
           fecha_inicio=now + timedelta(days=40), fecha_fin=now + timedelta(days=40, hours=3)),
    Evento(materia_id=mat5.id, titulo="Clase introductoria IA505",
           descripcion="Primer clase de la materia. Se presentará el programa y el proyecto integrador.",
           fecha_inicio=now + timedelta(days=14), fecha_fin=now + timedelta(days=14, hours=2)),
]
db.add_all(eventos)

db.commit()
db.close()

print("✓ Datos de demo cargados correctamente.")
print()
print("Usuarios creados:")
print("  admin@plataforma.com       / admin1234   (admin)")
print("  mgonzalez@plataforma.com   / docente1234 (docente — PV101, BDA202)")
print("  cperez@plataforma.com      / docente1234 (docente — SD303, SI404)")
print("  fibanez@plataforma.com     / docente1234 (docente — IA505)")
print("  lramirez@plataforma.com    / alumno1234  (estudiante — PV, BDA, SI)")
print("  therrera@plataforma.com    / alumno1234  (estudiante — PV, SD desaprobado)")
print("  vlopez@plataforma.com      / alumno1234  (estudiante — PV, SD aprobado)")
print("  msosa@plataforma.com       / alumno1234  (estudiante — BDA, SI)")
print("  cfernandez@plataforma.com  / alumno1234  (estudiante — muchas materias, notas altas)")
print("  nromero@plataforma.com     / alumno1234  (estudiante — nota límite aprobado/desaprobado)")
print("  scastro@plataforma.com     / alumno1234  (estudiante — inscripta, sin actividad)")
