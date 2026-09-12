# Pet-Price Venezuela - Frontend

Este es el frontend de la aplicación web, construido con [Next.js 14+](https://nextjs.org) (App Router), Tailwind CSS y TanStack Query.

## 🚀 Inicio Rápido

Para iniciar toda la aplicación (Frontend + Backend), necesitas dos terminales.

### 1. Iniciar el Backend (Terminal 1)
Desde la raíz del proyecto, ejecuta:
```bash
docker compose up -d
cd backend
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --port 8000
```

### 2. Iniciar el Frontend (Terminal 2)
Desde la raíz del proyecto, configura la variable de entorno si aún no lo has hecho:
```bash
cp .env.example .env.local  # En Windows PowerShell: Copy-Item .env.example .env.local
```
Luego instala dependencias e inicia el servidor de desarrollo:
```bash
cd frontend
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.
El backend y la documentación de la API estarán corriendo en [http://localhost:8000](http://localhost:8000) y [http://localhost:8000/docs](http://localhost:8000/docs).

> **Nota:** Para instrucciones más detalladas sobre la arquitectura, la base de datos y despliegue, consulta el `README.md` principal en la raíz del proyecto.
