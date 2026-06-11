# Documento Técnico — Plataforma de Gestión Académica

**Trabajo Práctico Final — Programación de Vanguardia**
**Docente:** Esteban Calcagno · **Fecha:** Junio 2026

---

## 1. Descripción del sistema

La **Plataforma de Gestión Académica** es una aplicación web full-stack que centraliza la administración de materias universitarias. Reemplaza la gestión dispersa (correos, planillas) con un sistema unificado donde estudiantes, docentes y administradores operan sobre los mismos datos en tiempo real.

**Usuarios y objetivos:**

| Rol | Puede hacer |
|---|---|
| **Estudiante** | Inscribirse a materias, entregar TPs, consultar notas y el calendario |
| **Docente** | Crear TPs, calificar entregas, cargar notas finales, publicar avisos y eventos |
| **Administrador** | Gestionar materias, docentes y alumnos; acceso total al sistema |

**Funcionalidades principales:** autenticación con roles, inscripción a materias, entrega y calificación de trabajos prácticos, avisos globales y por materia, y calendario de eventos.

---

## 2. Arquitectura propuesta

El sistema está compuesto por tres servicios independientes que se comunican entre sí:

```
┌─────────────────────────────────────────┐
│         CLIENTE  (Browser)              │
│     React 19 + TypeScript + Vite        │
│           Puerto 80 (nginx)             │
└──────────────────┬──────────────────────┘
                   │  HTTP/JSON  (Axios)
                   │  Authorization: Bearer JWT
┌──────────────────▼──────────────────────┐
│          BACKEND  (FastAPI)             │
│        Python 3.10 + SQLAlchemy         │
│              Puerto 8000                │
└──────────────────┬──────────────────────┘
                   │  ORM (SQLAlchemy)
┌──────────────────▼──────────────────────┐
│         BASE DE DATOS (PostgreSQL 15)   │
│              Puerto 5432                │
└─────────────────────────────────────────┘
```

El frontend es una **SPA (Single Page Application)**: el navegador descarga la app una sola vez y todas las navegaciones posteriores ocurren sin recargar la página, actualizando el contenido mediante llamadas a la API.

**Stack tecnológico y justificación de decisiones:**

| Tecnología | Rol | Por qué |
|---|---|---|
| **FastAPI** | Framework backend | Genera documentación automática (Swagger), tipado nativo con Pydantic, soporte async |
| **SQLAlchemy 2.0** | ORM | Declarativo, tipado, integración directa con Pydantic |
| **PostgreSQL 15** | Base de datos | Relaciones complejas, integridad referencial, constraints únicos |
| **React 19 + TypeScript** | Framework frontend | Componentes reutilizables, tipado que previene bugs en compilación |
| **Vite** | Bundler | Build muy rápido, HMR integrado, config mínima |
| **Docker Compose** | Orquestación local | Los 3 servicios arrancan con un solo comando sin instalar dependencias locales |
| **Render** | Hosting | Deploy simple desde GitHub, plan gratuito, soporte de Docker |

---

## 3. Frontend

**Framework:** React 19 + TypeScript, bundleado con Vite. En producción se sirve como archivos estáticos desde Nginx.

**Comunicación con el backend:** una instancia centralizada de Axios (`services/api.ts`) agrega automáticamente el token JWT en cada request mediante interceptores. Si el servidor responde con `401 Unauthorized`, el interceptor borra el token y redirige al login sin que ningún componente lo maneje manualmente.

**Flujo de navegación y páginas:**

```
/login, /register          → Público
/dashboard                 → Todos los roles
/materias, /materias/:id   → Todos los roles
/calendario                → Todos los roles
/mis-notas, /mis-entregas  → Solo estudiante
/admin, /docentes, /alumnos → Solo admin
```

| Página | Rol | Descripción |
|---|---|---|
| Login / Register | Público | Acceso y alta de estudiantes |
| Dashboard | Todos | Resumen contextual, avisos globales, acceso rápido |
| Materias / Detalle | Todos | Listado (varía por rol), inscripción, TPs y avisos de la materia |
| Calendario | Todos | Eventos próximos y pasados. Docente/admin pueden crear eventos |
| Mis Notas | Estudiante | Tabla de inscripciones con notas y promedio general |
| Mis Entregas | Estudiante | Historial con estado (entregado, calificado), notas y comentarios |
| Panel Admin | Admin | Estadísticas globales (materias, docentes, alumnos) |
| Docentes / Alumnos | Admin | ABM de usuarios por rol |

**Componentes clave:**

- `ProtectedRoute` — verifica token y rol antes de renderizar; redirige a `/login` si no hay sesión
- `AuthContext` — estado global de sesión (`user`, `login()`, `logout()`, `loading`) disponible en toda la app vía `useAuth()`
- `Sidebar` — menú de navegación que adapta sus ítems según el rol del usuario logueado
- Capa `services/` — funciones con nombres de dominio (`loginRequest`, `crearTP`, `calificarEntrega`) que abstraen los llamados HTTP

---

## 4. Backend

**Framework:** FastAPI organizado en módulos separados por responsabilidad.

```
api/app/
├── models/        # Tablas de la base de datos (SQLAlchemy ORM)
├── schemas/       # Validación de entrada/salida (Pydantic)
├── views/         # Endpoints agrupados por dominio
├── auth.py        # JWT y hashing de contraseñas
├── dependencies.py # Dependencias inyectables de autorización
└── main.py        # CORS, middleware de logging, registro de routers
```

**Modelo de datos (7 entidades):**

```
Usuario (id, nombre, email, password_hash, rol)
  └── rol: estudiante | docente | admin

Materia (id, nombre, codigo, descripcion, docente_id → Usuario)

Inscripcion (id, estudiante_id → Usuario, materia_id → Materia, estado, nota_final)
  ├── estado: activa | aprobada | desaprobada
  └── UNIQUE(estudiante_id, materia_id)

TrabajoPractico (id, materia_id → Materia, titulo, descripcion, fecha_entrega)

Entrega (id, tp_id → TP, estudiante_id → Usuario, archivo_url, nota, comentario)
  └── UNIQUE(tp_id, estudiante_id)  → un alumno entrega una sola vez por TP

Aviso / Evento (materia_id nullable → NULL = alcance global)
```

**Endpoints principales:**

| Módulo | Rutas | Restricción |
|---|---|---|
| `/auth` | register, login, me, CRUD usuarios | Público / solo admin |
| `/materias` | listar, detalle, crear, editar, eliminar | Autenticado / solo admin |
| `/inscripciones` | inscribirse, mis-materias, nota-final | Estudiante / docente |
| `/trabajos-practicos` / `/entregas` | crear TP, entregar, calificar | Docente / estudiante |
| `/avisos` / `/eventos` | crear, listar, eliminar | Docente o admin |

**Autorización:** 3 dependencias inyectables (`solo_docente`, `solo_admin`, `docente_o_admin`) centralizan la lógica de permisos. Los endpoints la declaran con `Depends()` sin duplicar código de verificación.

### Principios de POO aplicados

| Pilar | Dónde | Cómo |
|---|---|---|
| **Herencia** | `models/` | Todos los modelos heredan de `Base` (SQLAlchemy); `Rol` hereda de `str` y `enum.Enum` simultáneamente (herencia múltiple) |
| **Encapsulamiento** | `auth.py` | La contraseña se almacena solo como `password_hash`; los schemas de respuesta (`UsuarioResponse`) no exponen ese campo |
| **Abstracción** | `database.py`, `dependencies.py` | `get_db()` abstrae el ciclo de vida de la sesión DB; las dependencias de autorización ocultan la lógica de verificación de rol |
| **Polimorfismo** | `models/usuario.py` | `Rol` como subtipo de `str` permite usarlo donde se espera un string; el diseño priorizó composición sobre polimorfismo explícito |

### Patrones de diseño aplicados

| Patrón | Dónde | Cómo |
|---|---|---|
| **Singleton** | `database.py`, `limiter.py`, `api.ts` | `engine`, `SessionLocal` y la instancia de Axios se crean una sola vez y se comparten en toda la app |
| **Observer** | `main.py`, `api.ts`, `AuthContext.tsx` | El middleware HTTP observa cada request y loguea; los interceptores de Axios observan responses y reaccionan al 401; `useEffect` observa el montaje para recuperar sesión |
| **Strategy** | `dependencies.py`, `ProtectedRoute.tsx` | Las dependencias de autorización son estrategias intercambiables que los endpoints eligen con `Depends()`; `ProtectedRoute` cambia su comportamiento según el prop `soloRol` |
| **Adapter** | `services/api.ts`, `services/*.service.ts` | La instancia de Axios adaptada expone autenticación integrada; la capa de servicios adapta llamados HTTP genéricos a funciones con nombres de dominio |

---

## 5. Testing

**Estrategia:** dos suites independientes, una por capa, con herramientas adecuadas a cada entorno.

### Backend — pytest

Los tests corren contra **SQLite en memoria**, sin necesidad de PostgreSQL. El rate limiter se desactiva automáticamente con `TESTING=true`.

| Suite | Qué cubre |
|---|---|
| `test_auth.py` | Registro, login, verificación de token, CRUD de usuarios |
| `test_materias.py` | Crear/listar/editar/eliminar, filtrado por rol |
| `test_inscripciones.py` | Inscribirse, ver materias, nota final |
| `test_entregas.py` | Crear TP, entregar (una sola vez), calificar |
| `test_avisos.py` | Avisos globales y por materia |
| `test_integracion.py` | Flujos end-to-end: usuario → inscripción → entrega → calificación → nota |

### Frontend — Vitest + Testing Library

Corre en `jsdom` (simula el DOM sin abrir un browser real). Los servicios HTTP se mockean con Axios mocks.

| Suite | Qué cubre |
|---|---|
| `Login.test.tsx` | Render, submit, manejo de errores |
| `ProtectedRoute.test.tsx` | Redirección sin sesión, render con sesión, verificación de rol |
| `Sidebar.test.tsx` | Ítems del menú según rol |
| `Dashboard.test.tsx` | Estadísticas contextuales, botones según rol |
| `MisNotas.test.tsx` | Tabla de notas, promedio, estado vacío |
| `MisEntregas.test.tsx` | Historial, contadores, estados posibles |
| `servicios.test.ts` | Mocks de Axios para auth, materias, avisos y eventos |

**Justificación del enfoque:** los tests de integración del backend garantizan que los flujos reales funcionan de punta a punta con una base de datos real (aunque sea SQLite). Los tests del frontend verifican renderizado correcto y manejo de errores sin depender del servidor.

---

## 6. Despliegue y CI/CD

### Entorno local — Docker Compose

Tres servicios orquestados con un solo comando (`docker compose up`):

- **PostgreSQL 15** con volumen persistente y healthcheck
- **Backend** (Python + Uvicorn, puerto 8000) — espera a que la DB esté lista
- **Frontend** (build multi-stage: Node 20 compila con Vite → Nginx sirve los estáticos, puerto 80)

El Dockerfile del frontend usa **multi-stage build**: la imagen final contiene solo Nginx y los archivos compilados, sin Node ni código fuente.

### Pipeline CI/CD — GitHub Actions

```
Push a master / PR
        │
        ▼
Detectar cambios       ← ¿cambió api/? ¿cambió app/?
        │
   ┌────┴────┐
   ▼         ▼
Tests      Tests
backend    frontend
(pytest)   (vitest)
   │         │
   └────┬────┘
        ▼
  ¿Todos OK + push a master?
        │
        ▼
  Deploy automático a Render
  (solo el servicio que cambió)
```

**Optimización clave:** `dorny/paths-filter` detecta qué parte del código cambió. Si solo se modificó el frontend, no corre los tests del backend ni lo redeploya. Los webhooks de Render se almacenan como secrets en GitHub.

### Producción — Render

El backend corre como Web Service y el frontend como Static Site. La URL del backend se inyecta en el frontend como variable de entorno (`VITE_API_URL`) en tiempo de build, quedando embebida en los archivos estáticos.

### Observabilidad

- **Logging estructurado:** middleware en `main.py` registra método, path, status code y duración de cada request
- **Sentry:** tracking de excepciones no manejadas en producción con stack trace completo (activación condicional por variable de entorno)
- **New Relic:** monitoreo de rendimiento APM — tiempos de respuesta, throughput, uso de recursos (activación condicional)

---

## 7. Seguridad

### Autenticación — JWT

1. El usuario envía credenciales → `POST /auth/login`
2. El servidor verifica con bcrypt y devuelve un token JWT firmado (HS256, expira en 8 horas)
3. El cliente guarda el token en `localStorage` y lo envía en cada request como `Authorization: Bearer {token}`
4. El servidor valida la firma en cada endpoint protegido mediante `get_current_user()`

### Hashing de contraseñas — bcrypt

Las contraseñas nunca se almacenan en texto plano. Se usa bcrypt con salt automático, que es resistente a ataques de fuerza bruta por su costo computacional configurable.

```python
password_hash = pwd_context.hash(password)      # bcrypt con salt
pwd_context.verify(plain_password, stored_hash) # comparación timing-safe
```

### Rate Limiting

Previene ataques de fuerza bruta sobre los endpoints de autenticación:

- `POST /auth/login` → máximo **10 requests/min** por IP
- `POST /auth/register` → máximo **5 requests/min** por IP

Se desactiva automáticamente en tests (`TESTING=true`) para no interferir.

### Validación de datos — Pydantic

Todos los datos de entrada son validados por Pydantic antes de llegar a la lógica de negocio. Tipos incorrectos o campos faltantes devuelven un `422 Unprocessable Entity` sin ejecutar ningún código interno.

Los schemas de respuesta (`UsuarioResponse`, etc.) excluyen explícitamente campos sensibles: `password_hash` nunca aparece en ninguna respuesta de la API.

### CORS y autorización por rol

- **CORS restringido:** el backend solo acepta requests de los orígenes configurados (`localhost:5173`, `localhost`, dominio de Render)
- **Autorización declarativa:** las dependencias inyectables (`solo_docente`, `solo_admin`, `docente_o_admin`) centralizan la verificación de permisos; ningún endpoint duplica lógica de autorización

---

*Trabajo Práctico Final — Programación de Vanguardia — Junio 2026*
