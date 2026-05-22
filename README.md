# Plataforma de Gestión Académica

**Materia:** Programación de Vanguardia  
**Docente:** Esteban Calcagno  
**Tipo:** Trabajo práctico final grupal
**Integrantes**: Leonardo Mansilla · Nahuel Pastene · Edgardo Centurión · Gustavo Citati · Miguel Luna · Walter Gómez

Aplicación web full-stack que digitaliza la administración de materias, inscripciones, entregas y comunicación en un entorno universitario. El sistema soporta tres roles con permisos diferenciados:

| Rol            | Capacidades                                                                 |
| -------------- | --------------------------------------------------------------------------- |
| **estudiante** | Ver materias, inscribirse, entregar TPs, consultar notas                    |
| **docente**    | Gestionar materias asignadas, calificar entregas, publicar avisos y eventos |
| **admin**      | Administración completa: usuarios, materias, docentes, alumnos              |

---

## Arquitectura

```
┌─────────────────────┐       HTTPS / REST       ┌──────────────────────┐
│   Frontend (React)  │ ◄──────────────────────► │  Backend (FastAPI)   │
│   Render Static     │       JSON + JWT          │  Render Web Service  │
└─────────────────────┘                           └──────────┬───────────┘
                                                             │ SQLAlchemy ORM
                                                  ┌──────────▼───────────┐
                                                  │   PostgreSQL (prod)  │
                                                  │   SQLite (tests/dev) │
                                                  └──────────────────────┘
```

| Capa            | Tecnología                                                       |
| --------------- | ---------------------------------------------------------------- |
| Backend         | FastAPI · SQLAlchemy 2.0 · PostgreSQL · PyJWT · bcrypt · slowapi |
| Frontend        | React 19 · TypeScript · Vite · React Router DOM · Axios          |
| Infraestructura | Docker · Docker Compose · GitHub Actions · Render                |

### Estructura del repositorio

```
├── api/
│   ├── app/
│   │   ├── models/       # Modelos SQLAlchemy (Usuario, Materia, Entrega, Aviso, Evento...)
│   │   ├── schemas/      # Schemas Pydantic
│   │   ├── views/        # Routers (auth, materias, inscripciones, entregas, avisos, eventos)
│   │   ├── auth.py       # JWT: generación y verificación de tokens
│   │   ├── dependencies.py # Dependencias de autorización por rol
│   │   ├── limiter.py    # Rate limiting con slowapi
│   │   └── main.py       # Entry point FastAPI
│   ├── tests/            # Tests de integración con pytest
│   ├── seed.py           # Datos de prueba
│   └── requirements.txt
├── app/
│   └── src/
│       ├── pages/        # Vistas: Dashboard, Materias, Calendario, MisNotas...
│       ├── components/   # Layout, Sidebar, ProtectedRoute
│       ├── services/     # Llamadas a la API (axios)
│       ├── context/      # AuthContext (sesión y rol)
│       └── tests/        # Tests con vitest + Testing Library
├── docker-compose.yml
└── .github/workflows/ci-cd.yml
```

---

## Levantar en local con Docker

Requisitos: [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo.

```bash
docker compose up --build
```

| Servicio             | URL                        |
| -------------------- | -------------------------- |
| Frontend             | http://localhost           |
| Backend / Swagger UI | http://localhost:8000/docs |

Para poblar la base con datos de prueba:

```bash
docker compose exec backend python seed.py
```

### Usuarios de prueba (tras ejecutar seed.py)

| Email                       | Contraseña | Rol           |
| --------------------------- | ---------- | ------------- |
| admin@plataforma.com        | admin123   | Administrador |
| carlos.gomez@plataforma.com | docente123 | Docente       |
| maria.lopez@plataforma.com  | alumno123  | Estudiante    |

### Variables de entorno

**`api/.env`**

| Variable       | Descripción                   | Ejemplo                                    |
| -------------- | ----------------------------- | ------------------------------------------ |
| `DATABASE_URL` | Cadena de conexión PostgreSQL | `postgresql://user:pass@localhost:5432/db` |
| `SECRET_KEY`   | Clave para firmar los JWT     | String largo y aleatorio                   |

**`app/.env`**

| Variable       | Descripción          | Ejemplo                 |
| -------------- | -------------------- | ----------------------- |
| `VITE_API_URL` | URL base del backend | `http://localhost:8000` |

---

## Frontend

- **React 19** con **TypeScript** y **Vite** como bundler
- **React Router DOM** para navegación SPA con rutas protegidas
- **Axios** con interceptores para autenticación y manejo de errores globales

### Rutas

```
/login          → público
/register       → público (registro de estudiantes)
/dashboard      → autenticado (todos los roles)
/materias       → autenticado (todos los roles)
/materias/:id   → autenticado (detalle con inscripción y avisos)
/calendario     → autenticado (todos los roles)
/mis-notas      → solo estudiante
/mis-entregas   → solo estudiante
/admin          → solo admin
/docentes       → solo admin
/alumnos        → solo admin
```

Las rutas protegidas usan `ProtectedRoute`, que redirige a `/login` si no hay sesión activa. La prop `soloRol` restringe el acceso a un rol específico.

`AuthContext` provee `{ user, login, logout }` a toda la app. El `user` incluye `{ id, nombre, email, rol }` decodificado del JWT en `localStorage`.

### Páginas

| Página                 | Descripción                                                         |
| ---------------------- | ------------------------------------------------------------------- |
| `Login` / `Register`   | Autenticación y registro de cuentas estudiante                      |
| `Dashboard`            | Resumen estadístico + avisos globales recientes                     |
| `Materias`             | ABM completo para admin, vista filtrada para docentes               |
| `MateriaDetalle`       | Ficha de materia: inscripción, TPs, entregas, avisos                |
| `Calendario`           | Eventos agrupados en Próximos / Pasados, con formulario de creación |
| `MisNotas`             | Notas del estudiante por materia con promedio                       |
| `MisEntregas`          | Historial de entregas con estado de calificación                    |
| `AdminPanel`           | Estadísticas globales del sistema                                   |
| `Docentes` / `Alumnos` | ABM de usuarios por rol                                             |

---

## Backend

- **FastAPI** con Python 3.10
- **SQLAlchemy 2.0** como ORM (modelos declarativos)
- **Pydantic v2** para validación de esquemas de entrada/salida
- **PyJWT** para generación y verificación de tokens
- **passlib + bcrypt** para hashing de contraseñas
- **slowapi** para rate limiting basado en IP

### Modelos de datos

```
Usuario (id, nombre, email, password_hash, rol)
    │
    ├── Materia (id, nombre, codigo, descripcion, docente_id→Usuario)
    │       ├── Inscripcion (id, estudiante_id→Usuario, materia_id→Materia)
    │       ├── TrabajoPractico (id, titulo, descripcion, fecha_entrega, materia_id)
    │       │       └── Entrega (id, tp_id, estudiante_id, fecha, archivo_url, nota)
    │       ├── Aviso (id, titulo, contenido, fecha, autor_id→Usuario, materia_id→Materia)
    │       └── Evento (id, titulo, descripcion, fecha_inicio, fecha_fin, materia_id→Materia)
    └── Aviso (avisos globales: materia_id = null)
```

### Routers

| Router          | Prefijo          | Descripción                   |
| --------------- | ---------------- | ----------------------------- |
| `auth`          | `/auth`          | Login, registro               |
| `materias`      | `/materias`      | ABM de materias               |
| `inscripciones` | `/inscripciones` | Inscribirse / desinscribirse  |
| `entregas`      | `/entregas`      | Subir y calificar TPs         |
| `avisos`        | `/avisos`        | Avisos globales y por materia |
| `eventos`       | `/eventos`       | Calendario de eventos         |

### Autorización

Tres dependencias inyectables con `Depends()` aplican control de acceso a nivel de endpoint:

```python
def docente_o_admin(current_user: Usuario = Depends(get_current_user)) -> Usuario:
    if current_user.rol not in (Rol.docente, Rol.admin):
        raise HTTPException(status_code=403, detail="Solo docentes o administradores")
    return current_user
```

---

## Tests

### Backend

```bash
cd api
pytest tests/ -v
```

Los tests usan SQLite en memoria; no requieren PostgreSQL. La variable `TESTING=true` se setea en `conftest.py` antes de importar la app para deshabilitar el rate limiter.

| Archivo                 | Cobertura                                |
| ----------------------- | ---------------------------------------- |
| `test_auth.py`          | Registro, login, tokens inválidos        |
| `test_materias.py`      | ABM de materias, permisos por rol        |
| `test_inscripciones.py` | Inscripción y desinscripción             |
| `test_entregas.py`      | Entrega de TPs, calificación, permisos   |
| `test_avisos.py`        | Creación/eliminación de avisos, permisos |
| `test_integracion.py`   | Flujos completos end-to-end              |

### Frontend

```bash
cd app
npm test
```

| Archivo                   | Cobertura                                          |
| ------------------------- | -------------------------------------------------- |
| `Login.test.tsx`          | Render, submit, error de credenciales              |
| `ProtectedRoute.test.tsx` | Redirección sin sesión, render con sesión          |
| `Sidebar.test.tsx`        | Ítems del menú según rol                           |
| `Dashboard.test.tsx`      | Stats, avisos, botones según rol                   |
| `MisNotas.test.tsx`       | Listado de notas, promedio, estado vacío           |
| `MisEntregas.test.tsx`    | Historial de entregas, contadores, estados         |
| `servicios.test.ts`       | Capa de servicios: auth, materias, avisos, eventos |

---

## CI/CD

El workflow `.github/workflows/ci-cd.yml` corre en cada push/PR a `master`:

1. **test-backend** — pytest en Ubuntu, Python 3.10, SQLite
2. **test-frontend** — vitest en Ubuntu, Node 20
3. **deploy** — solo en push a `master` y si ambos tests pasan; dispara los deploy hooks de Render via `curl POST`

Los secrets `RENDER_BACKEND_DEPLOY_HOOK` y `RENDER_FRONTEND_DEPLOY_HOOK` se configuran en _GitHub → Settings → Secrets and variables → Actions_.

---

## Seguridad

- **bcrypt** para hashing de contraseñas (nunca se almacenan en texto plano)
- **JWT HS256** con expiración de 8 horas, clave en variable de entorno `SECRET_KEY`
- **Rate limiting** con slowapi: 10 req/min en login, 5 req/min en registro; devuelve `429` al superarse
- **CORS** configurado explícitamente: solo orígenes permitidos (`localhost:5173`, `localhost`, dominio de Render)
- **Autorización doble**: el backend valida el rol en cada endpoint; el frontend adapta la UI pero no es la línea de defensa
