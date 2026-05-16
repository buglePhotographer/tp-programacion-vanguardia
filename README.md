# Plataforma de Gestión Académica

TP final — Programación de Vanguardia.

Aplicación web para gestión académica con roles diferenciados: **administrador**, **docente** y **estudiante**. Permite gestionar materias, inscripciones, trabajos prácticos, entregas y avisos.

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend | FastAPI · SQLAlchemy · PostgreSQL · JWT |
| Frontend | React 19 · TypeScript · Vite · React Router |
| Infraestructura | Docker · Docker Compose · GitHub Actions |

## Estructura del repositorio

```
├── api/          # Backend FastAPI
│   ├── app/
│   │   ├── models/       # Modelos SQLAlchemy
│   │   ├── schemas/      # Schemas Pydantic
│   │   ├── views/        # Rutas (auth, materias, inscripciones, entregas, avisos)
│   │   ├── auth.py       # JWT helpers
│   │   └── main.py       # Entry point
│   ├── tests/            # Tests de integración (pytest)
│   ├── seed.py           # Datos de prueba
│   └── requirements.txt
├── app/          # Frontend React + Vite
│   └── src/
│       ├── pages/        # Vistas principales
│       ├── components/   # Componentes reutilizables
│       ├── services/     # Llamadas a la API (axios)
│       └── context/      # AuthContext (sesión/rol)
├── docker-compose.yml
└── .github/workflows/    # CI + deploy
```

## Levantar en local con Docker (recomendado)

Requisitos: [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo.

```bash
docker compose up --build
```

| Servicio | URL |
|---------|-----|
| Frontend | http://localhost |
| Backend / API docs | http://localhost:8000/docs |

Para poblar la base con datos de prueba:

```bash
docker compose exec backend python seed.py
```

### Usuarios de prueba (tras ejecutar seed.py)

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@plataforma.com | admin123 | Administrador |
| carlos.gomez@plataforma.com | docente123 | Docente |
| maria.lopez@plataforma.com | alumno123 | Estudiante |

---

## Levantar en local sin Docker

### Backend

Requisitos: Python 3.11+, PostgreSQL corriendo en `localhost:5432`.

```bash
cd api

# Crear y activar entorno virtual
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
```

Crear el archivo `api/.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/plataforma_academica
SECRET_KEY=super-secret-key-cambiar-en-produccion
```

Crear la base de datos en PostgreSQL:

```sql
CREATE DATABASE plataforma_academica;
```

Iniciar el servidor:

```bash
uvicorn app.main:app --reload --port 8000
```

La API queda disponible en `http://localhost:8000`. Documentación interactiva en `http://localhost:8000/docs`.

Cargar datos de prueba (opcional):

```bash
python seed.py
```

### Frontend

Requisitos: Node.js 20+.

```bash
cd app
npm install
```

Crear el archivo `app/.env`:

```env
VITE_API_URL=http://localhost:8000
```

Iniciar el servidor de desarrollo:

```bash
npm run dev
```

La app queda disponible en `http://localhost:5173`.

---

## Tests

### Backend

```bash
cd api
pytest tests/ -v
```

Los tests usan SQLite en memoria, no requieren PostgreSQL.

### Frontend

```bash
cd app
npm test
```

---

## Variables de entorno

### `api/.env`

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | Cadena de conexión PostgreSQL | `postgresql://user:pass@localhost:5432/db` |
| `SECRET_KEY` | Clave para firmar los JWT | Cualquier string largo y aleatorio |

### `app/.env`

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | URL base del backend | `http://localhost:8000` |

---

## CI/CD

El repositorio incluye tres workflows de GitHub Actions en `.github/workflows/`:

- **`ci.yml`** — corre pytest y vitest en cada push/PR a `master`.
- **`deploy-api.yml`** — construye y publica la imagen Docker del backend en GHCR cuando cambia `api/`.
- **`deploy-app.yml`** — construye y publica la imagen Docker del frontend en GHCR cuando cambia `app/`.

Para activar el deploy se deben configurar los secrets correspondientes en _GitHub → Settings → Secrets and variables → Actions_ (ver comentarios dentro de cada workflow).
