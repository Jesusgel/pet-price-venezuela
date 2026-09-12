# Pet-Price Venezuela

Pet-Price Venezuela es una aplicación web (MVP) diseñada para automatizar el cálculo de precios en Bolívares (VES) basados en precios base en Dólares (USD), utilizando la tasa de cambio oficial del Banco Central de Venezuela (BCV).

## 🚀 Características Principales

- **Catálogo de Productos**: Gestión de productos para mascotas con precios en USD.
- **Conversión en Tiempo Real**: Cálculo automático de precios en Bolívares (VES) usando la tasa oficial del BCV (a través de DolarAPI).
- **Precisión Financiera**: Uso estricto de tipos `Decimal` en el backend para evitar errores de coma flotante en cálculos de dinero.
- **Interfaz Premium**: Diseño moderno con Tailwind CSS (Glassmorphism), fuentes personalizadas y micro-interacciones (Framer Motion).

## 🛠 Stack Tecnológico

**Backend (API)**
- [FastAPI](https://fastapi.tiangolo.com/) (Python 3.12+)
- [SQLModel](https://sqlmodel.tiangolo.com/) & [PostgreSQL](https://www.postgresql.org/)
- [Alembic](https://alembic.sqlalchemy.org/) (Migraciones de base de datos)
- [uv](https://github.com/astral-sh/uv) (Gestión de paquetes y entornos)

**Frontend (Web)**
- [Next.js 14+](https://nextjs.org/) (App Router, React)
- [Tailwind CSS v3](https://tailwindcss.com/)
- [TanStack Query v5](https://tanstack.com/query) (React Query)
- [Framer Motion](https://www.framer.com/motion/)

**Infraestructura y Despliegue**
- Docker & Docker Compose (Desarrollo local)
- [Railway](https://railway.app/) (Despliegue de Backend + PostgreSQL)
- [Vercel](https://vercel.com/) (Despliegue de Frontend)

## 📋 Requisitos Previos

Asegúrate de tener instalado:
- [Docker](https://www.docker.com/) y Docker Compose (para la base de datos local)
- [uv](https://docs.astral.sh/uv/getting-started/installation/) (para correr el backend de Python)
- [Node.js](https://nodejs.org/) (v18+) y `npm` (para el frontend)

## 💻 Instalación y Ejecución Local

### Paso 0: Configurar Variables de Entorno

Antes de iniciar por primera vez, copia los archivos de ejemplo a sus respectivas ubicaciones:

```powershell
# En Windows (PowerShell)
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env.local
```

```bash
# En Linux / macOS (Bash)
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

---

### Paso 1: Terminal 1 — Base de Datos + Backend

1. **Iniciar PostgreSQL con Docker:**
   Desde la raíz del proyecto, levanta el contenedor de la base de datos:
   ```bash
   docker compose up -d
   ```
   *(Nota: Si usas una versión anterior de Docker, usa `docker-compose up -d`)*.

2. **Navegar a la carpeta del backend:**
   ```bash
   cd backend
   ```

3. **Instalar dependencias de Python:**
   ```bash
   uv sync
   ```

4. **Aplicar migraciones de la base de datos:**
   ```bash
   uv run alembic upgrade head
   ```

5. **(Opcional) Cargar productos de prueba:**
   Si es tu primera vez levantando la base de datos, ejecuta el script de seed para poblar el catálogo de muestra:
   ```bash
   uv run python scripts/seed_data.py
   ```

6. **Iniciar el servidor de desarrollo FastAPI:**
   ```bash
   uv run uvicorn app.main:app --reload --port 8000
   ```

- 🟢 **API:** [http://localhost:8000](http://localhost:8000)
- 📖 **Documentación Swagger:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Paso 2: Terminal 2 — Frontend (Next.js)

1. **Abre una nueva terminal y navega al frontend:**
   ```bash
   cd frontend
   ```

2. **Instalar dependencias de Node.js:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

- 🌐 **Aplicación Web:** [http://localhost:3000](http://localhost:3000)

## 🏗 Arquitectura del Proyecto

El proyecto sigue un patrón de "Clean Architecture Lite" para el backend y una estructura basada en componentes para el frontend.

```text
pet-price-venezuela/
├── backend/               # API en FastAPI
│   ├── app/
│   │   ├── api/           # Controladores y rutas (Endpoints)
│   │   ├── models/        # Modelos de BD (SQLModel)
│   │   ├── schemas/       # Esquemas de validación (Pydantic)
│   │   ├── repositories/  # Lógica de acceso a datos
│   │   └── services/      # Lógica de negocio (Cálculos, APIs externas)
│   ├── tests/             # Pruebas automatizadas (Pytest)
│   └── alembic/           # Archivos de migración de BD
├── frontend/              # Web en Next.js
│   ├── src/
│   │   ├── app/           # Rutas y layouts (App Router)
│   │   ├── components/    # Componentes UI reutilizables
│   │   ├── hooks/         # Custom hooks para lógica de UI y fetching
│   │   ├── services/      # Cliente HTTP para conectar con la API
│   │   └── types/         # Interfaces TypeScript
├── docker-compose.yml     # Orquestación de contenedores locales
└── README.md              # Documentación principal
```

## 🧪 Pruebas (QA)

El backend incluye suites de pruebas para asegurar la calidad de la lógica de negocio y los endpoints.

**Backend (Pytest)**
```powershell
cd backend
uv run pytest
```

**Frontend (Vitest)**
```powershell
cd frontend
npm run test
```

```powershell
# Con reporte de cobertura (mínimo 80%)
npm run test:coverage
```
*Asegúrate de configurar una base de datos de pruebas si se requiere en tu entorno local.*

## 🌐 Despliegue (Producción)

- **Backend**: Desplegado en Railway. Se manejan las variables de entorno (`DATABASE_URL`, etc.) desde el panel de Railway, y las migraciones se ejecutan automáticamente en el build o start.
- **Frontend**: Desplegado en Vercel. La variable de entorno `NEXT_PUBLIC_API_URL` debe apuntar al dominio público del backend provisto por Railway.

## ⚡ Inicio Rápido (Comandos Directos)

### 🪟 En Windows (PowerShell)

> [!IMPORTANT]
> En PowerShell **no se puede usar `&&`**. Usa `;` para encadenar comandos o ejecútalos línea por línea.

#### 🖥️ Terminal 1 — Base de Datos + Backend
```powershell
# Levantar base de datos, instalar dependencias, migrar e iniciar backend
docker compose up -d ; cd backend ; uv sync ; uv run alembic upgrade head ; uv run uvicorn app.main:app --reload --port 8000
```
*(Si quieres cargar datos de prueba iniciales, puedes correr antes: `uv run python scripts/seed_data.py`)*

- 🟢 API: `http://localhost:8000`
- 📖 Swagger Docs: `http://localhost:8000/docs`

---

#### 🌐 Terminal 2 — Frontend
```powershell
# Instalar dependencias e iniciar Next.js
cd frontend ; npm install ; npm run dev
```

- 🌐 App: `http://localhost:3000`

---

### 🐧 / 🍎 En Linux / macOS (Bash)

#### 🖥️ Terminal 1 — Base de Datos + Backend
```bash
docker compose up -d && cd backend && uv sync && uv run alembic upgrade head && uv run uvicorn app.main:app --reload --port 8000
```

#### 🌐 Terminal 2 — Frontend
```bash
cd frontend && npm install && npm run dev
```

---

### 🧪 Terminal 3 (opcional) — Tests

```powershell
# Frontend
cd frontend ; npm run test

# Backend
cd backend ; uv run pytest
```

---
*Desarrollado como MVP para automatización de precios en el mercado venezolano.*