# Pet-Price Venezuela - Frontend

Este es el frontend de la aplicación web, construido con [Next.js 14+](https://nextjs.org) (App Router), Tailwind CSS y TanStack Query.

## 🚀 Inicio Rápido

Para iniciar toda la aplicación (Frontend + Backend), necesitas dos terminales.

### 1. Iniciar el Backend (Terminal 1)
Desde la raíz del proyecto (`C:\proyectos\pet-price-venezuela`), ejecuta:
```bash
docker-compose up -d
cd backend
uv run uvicorn app.main:app --reload
```

### 2. Iniciar el Frontend (Terminal 2)
Desde la raíz del proyecto, navega a esta carpeta y ejecuta el servidor de desarrollo:
```bash
cd frontend
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.
El backend y la API estarán corriendo en [http://localhost:8000](http://localhost:8000).

> **Nota:** Para instrucciones más detalladas sobre la arquitectura, la base de datos y despliegue, consulta el `README.md` principal en la raíz del proyecto.
