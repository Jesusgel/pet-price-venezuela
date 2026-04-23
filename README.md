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

### 1. Iniciar la Base de Datos

El proyecto incluye un archivo `docker-compose.yml` para levantar rápidamente una instancia de PostgreSQL en el entorno local.

```bash
docker-compose up -d
```

### 2. Configurar y Ejecutar el Backend

1. Navega a la carpeta del backend:
   ```bash
   cd backend
   ```
2. Instala las dependencias usando `uv`:
   ```bash
   uv sync
   ```
3. Ejecuta las migraciones para crear las tablas en la base de datos:
   ```bash
   uv run alembic upgrade head
   ```
4. Inicia el servidor de desarrollo:
   ```bash
   uv run uvicorn app.main:app --reload
   ```
El backend estará disponible en `http://localhost:8000`. Puedes acceder a la documentación interactiva de la API en `http://localhost:8000/docs`.

### 3. Configurar y Ejecutar el Frontend

1. Abre una nueva terminal y navega a la carpeta del frontend:
   ```bash
   cd frontend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
El frontend estará disponible en `http://localhost:3000`.

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

El backend incluye una suite de pruebas para asegurar la calidad de la lógica de negocio y los endpoints.

```bash
cd backend
uv run pytest
```
*Asegúrate de configurar una base de datos de pruebas si se requiere en tu entorno local.*

## 🌐 Despliegue (Producción)

- **Backend**: Desplegado en Railway. Se manejan las variables de entorno (`DATABASE_URL`, etc.) desde el panel de Railway, y las migraciones se ejecutan automáticamente en el build o start.
- **Frontend**: Desplegado en Vercel. La variable de entorno `NEXT_PUBLIC_API_URL` debe apuntar al dominio público del backend provisto por Railway.

## ⚡ Inicio Rápido (Copiar y Pegar)

**Terminal 1: Iniciar Base de Datos y Backend**
```bash
docker-compose up -d && cd backend && uv sync && uv run alembic upgrade head && uv run uvicorn app.main:app --reload
```

**Terminal 2: Iniciar Frontend**
```bash
cd frontend && npm install && npm run dev
```

---
*Desarrollado como MVP para automatización de precios en el mercado venezolano.*