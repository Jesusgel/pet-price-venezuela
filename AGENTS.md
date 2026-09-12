# 🐾 Pet-Price Venezuela — Agent Guide

> Este archivo es la **fuente de verdad** para cualquier agente de IA que trabaje en este repositorio.
> Lee este archivo completo antes de responder cualquier solicitud.

---

## 🗂 Estructura del Repositorio (Monorepo)

Este proyecto es un **monorepo con dos soluciones independientes**:

```
pet-price-venezuela/
├── backend/          ← Solución Python / FastAPI
│   ├── app/
│   │   ├── api/          # Rutas HTTP (endpoints)
│   │   ├── core/         # Configuración, settings, DB session
│   │   ├── models/       # Modelos SQLModel (tablas DB)
│   │   ├── repositories/ # Acceso a datos (queries)
│   │   ├── schemas/      # Schemas Pydantic (request/response)
│   │   └── services/     # Lógica de negocio (conversión USD→VES)
│   ├── alembic/          # Migraciones de base de datos
│   ├── tests/            # Tests con Pytest
│   └── pyproject.toml    # Dependencias (gestionadas con uv)
│
├── frontend/         ← Solución Next.js / TypeScript
│   ├── src/
│   │   ├── app/          # Rutas y layouts (App Router)
│   │   ├── components/   # Componentes UI atómicos
│   │   ├── hooks/        # Custom hooks (useProducts, useExchangeRate)
│   │   ├── services/     # Cliente HTTP hacia FastAPI
│   │   └── types/        # Interfaces TypeScript
│   └── package.json      # Dependencias (Node.js)
│
├── docker-compose.yml    # Orquestación local (PostgreSQL + Backend)
├── .agents/
│   └── rules/            # Reglas detalladas por dominio
└── AGENTS.md             ← Estás aquí
```

---

## 🧭 Routing Contextual — ¿Qué reglas aplicar?

Según la naturaleza de la solicitud, aplica las reglas del dominio correspondiente
ubicadas en `.agents/rules/`. **Siempre** aplica primero `project-overview.md`.

| Tipo de solicitud | Archivos afectados | Reglas a aplicar |
|---|---|---|
| Lógica de negocio, endpoints, modelos, BD | `backend/**` | `project-overview.md` + `backend-expert.md` |
| Interfaz de usuario, componentes, hooks | `frontend/**` | `project-overview.md` + `frontend-expert.md` |
| Tests de Python / FastAPI | `backend/tests/**` | `project-overview.md` + `backend-expert.md` + `qa-expert.md` |
| Tests de React / Next.js | `frontend/**/__tests__/**` | `project-overview.md` + `frontend-expert.md` + `qa-frontend-expert.md` |
| Docker, CI/CD, Railway, Vercel | `docker-compose.yml`, `Dockerfile`, `.env*` | `project-overview.md` + `infraestructure-expert.md` |
| Solicitud que toca backend **y** frontend | `backend/**` + `frontend/**` | Todas las reglas relevantes en orden |
| Migraciones de base de datos | `backend/alembic/**` | `project-overview.md` + `backend-expert.md` + `infraestructure-expert.md` |
| Commits, ramas, historial Git, PRs | `.git/**`, cualquier archivo | `git-expert.md` |

---

## ⚙️ Comandos Rápidos de Desarrollo

### Backend
```bash
# Activar entorno e instalar dependencias
cd backend
uv sync

# Levantar solo la base de datos (Docker)
docker-compose up -d db

# Correr el servidor de desarrollo
uv run uvicorn app.main:app --reload --port 8000

# Aplicar migraciones
uv run alembic upgrade head

# Correr tests con cobertura
uv run pytest --cov=app tests/
```

### Frontend
```bash
# Instalar dependencias
cd frontend
npm install

# Servidor de desarrollo
npm run dev          # → http://localhost:3000

# Correr tests
npm run test

# Correr tests con cobertura
npm run test:coverage
```

### Entorno completo (Docker Compose)
```bash
# Desde la raíz del proyecto
docker-compose up --build
```

---

## 🔗 Contrato de API (Backend ↔ Frontend)

El frontend consume el backend a través de su cliente HTTP en `frontend/src/services/api.ts`.

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/v1/products` | Lista todos los productos con precios en USD y VES |
| `GET` | `/api/v1/products/{id}` | Detalle de un producto específico |
| `POST` | `/api/v1/products` | Crea un nuevo producto |
| `PUT` | `/api/v1/products/{id}` | Actualiza un producto existente |
| `DELETE` | `/api/v1/products/{id}` | Elimina un producto |
| `GET` | `/api/v1/exchange-rate` | Tasa BCV actual (USD/VES) desde DolarAPI.com |

**URL base local del backend:** `http://localhost:8000`
**URL base local del frontend:** `http://localhost:3000`

---

## 📐 Reglas Transversales (Aplican a TODO el proyecto)

Estas convenciones son **no negociables** independientemente del dominio:

### 💰 Precisión Financiera
- **NUNCA** usar `float` para valores monetarios.
- Backend → usar `Decimal` de Python.
- Frontend → formatear con `Intl.NumberFormat` o utilidades equivalentes.
- Formato de display: `Bs. 1.234,56` (punto = miles, coma = decimales).

### 🔐 Seguridad y Configuración
- **NUNCA** hardcodear credenciales, URLs o API keys en el código.
- Toda configuración sensible va en variables de entorno (`.env`).
- El archivo `.env` **nunca** se commitea al repositorio (está en `.gitignore`).

### 📝 Control de Cambios
- Antes de modificar cualquier archivo, **mostrar el plan de acción** al usuario.
- Mostrar las diferencias (diff) de los cambios propuestos.
- **No modificar nada sin consentimiento explícito del usuario.**

### 🧪 Calidad de Código
- Backend: todo el código debe pasar `ruff check` sin errores.
- Frontend: todo el código debe pasar `eslint` sin errores.
- No dejar `console.log` ni `print()` de debug en el código final.

### 🌐 Idioma
- Código (variables, funciones, clases): **inglés**.
- Comentarios, docstrings y mensajes de log: **español o inglés** (consistente por archivo).
- Mensajes de UI (labels, placeholders, errores): **español** (audiencia venezolana).

---

## 🚀 Estado Actual del Proyecto

| Fase | Estado | Descripción |
|------|--------|-------------|
| Fase 1 — Backend Core | ✅ Completada | APIs funcionales, DB, integración DolarAPI |
| Fase 2 — Frontend | ✅ Completada | UI con Glassmorphism, filtros, Skeleton Loaders |
| Fase 4 — CRUD Completo | 🔄 En progreso | Endpoints + Modal UI para Crear/Editar/Eliminar |
| Fase 3 — Agente IA | 📋 Pendiente | Endpoint `/chat` con LangChain + Gemini |

> [!NOTE]
> La numeración de fases sigue el `implementation_plan.md` en la raíz del proyecto.
> Consulta ese archivo para detalles completos de cada fase.

---

## 📚 Referencias de Reglas Detalladas

Cada archivo en `.agents/rules/` contiene las reglas específicas del dominio:

- [`.agents/rules/project-overview.md`](.agents/rules/project-overview.md) — Objetivo, reglas de negocio y deployment target
- [`.agents/rules/backend-expert.md`](.agents/rules/backend-expert.md) — SOLID, Clean Architecture, FastAPI, SQLModel
- [`.agents/rules/frontend-expert.md`](.agents/rules/frontend-expert.md) — Next.js 14+, Tailwind, TanStack Query, Framer Motion
- [`.agents/rules/qa-expert.md`](.agents/rules/qa-expert.md) — Pytest, testing de FastAPI, mocking de APIs externas
- [`.agents/rules/qa-frontend-expert.md`](.agents/rules/qa-frontend-expert.md) — Vitest, MSW, React Testing Library
- [`.agents/rules/infraestructure-expert.md`](.agents/rules/infraestructure-expert.md) — Docker, Railway, Vercel, Alembic
- [`.agents/rules/git-expert.md`](.agents/rules/git-expert.md) — Conventional Commits, ramas, seguridad, flujo de PRs
