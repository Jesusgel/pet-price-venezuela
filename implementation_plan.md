# 🐾 Pet-Price Venezuela — Plan de Implementación (MVP)

## Objetivo

Automatizar el cálculo de precios en Bolívares (Bs) para un negocio de comida de mascotas, usando la tasa oficial del BCV y exponiéndolo a través de una **interfaz web responsive** (desktop y móvil) con un asistente de IA integrado.

---

## Stack Tecnológico y Justificación

| Capa | Tecnología | ¿Por qué? |
|------|-----------|-----------| 
| **Backend** | Python 3.12+ / FastAPI | Framework asíncrono líder. Validación con Pydantic nativa. Altísima demanda global. |
| **ORM** | SQLModel + Alembic | Combina Pydantic y SQLAlchemy en una sola clase. |
| **Base de Datos** | PostgreSQL (Docker) | BD relacional open-source más demandada. Docker evita instalar nada en el sistema. |
| **Frontend** | Next.js 14+ (App Router) / TypeScript / Tailwind CSS v3 | Framework React #1. TypeScript es estándar en el mercado chileno/global. Tailwind acelera el diseño. |
| **Data Fetching** | TanStack Query (React Query) | Cache, refetch automático y manejo de estados simplificado. |
| **Tasa USD/BCV** | DolarAPI.com (API REST pública) | API open-source gratuita que ya consume la tasa oficial del BCV. Cero scraping. |

---

## Fases de Desarrollo

### Fase 1: Backend Completo (APIs funcionales) ← **COMPLETADA**
- Infraestructura y Base de datos configurada.
- Modelos y rutas para listar productos.
- Integración con DolarAPI.

### Fase 2: Frontend (Next.js) ← **COMPLETADA**
- Interfaz gráfica implementada.
- Visualización de productos con precio en Bs y Skeleton Loaders.
- Filtros por nombre y categoría funcionales.

### Fase 3: Agente de IA — *Feature futura*
- Endpoint `POST /api/v1/chat` con LangChain + Gemini.

---

## Fase 4: CRUD de Productos ← **NUEVO REQUERIMIENTO (ACTUAL)**

El objetivo es permitir la gestión completa del catálogo de productos (Crear, Leer un producto específico, Actualizar, Eliminar) en el backend y reflejar estas operaciones en el frontend.

### 1. Cambios Propuestos en el Backend

#### [MODIFICAR] `backend/app/schemas/product.py`
Se agregarán los esquemas necesarios para la creación y actualización.
- `ProductCreate`: Requerirá `name`, `price_usd`, `category`, `unit`. Opcionales: `brand`, `weight_kg`.
- `ProductUpdate`: Igual a `ProductCreate` pero con todos los campos opcionales para permitir actualizaciones parciales.

#### [MODIFICAR] `backend/app/repositories/product_repository.py`
Se añadirán métodos para interactuar con la base de datos:
- `get_by_id(product_id: int)`: Buscar un producto por ID.
- `create(product_data: ProductCreate)`: Insertar nuevo producto.
- `update(db_product: Product, update_data: ProductUpdate)`: Modificar producto existente.
- `delete(db_product: Product)`: Eliminar un producto.

#### [MODIFICAR] `backend/app/services/product_service.py`
Se implementará la lógica de negocio y validación:
- `get_product_by_id`: Validará existencia o lanzará HTTP 404.
- `create_product`: Guardará en la BD.
- `update_product`: Buscará, validará, actualizará y retornará datos frescos.
- `delete_product`: Buscará y eliminará.

#### [MODIFICAR] `backend/app/api/products.py`
Se agregarán los endpoints RESTful estándar:
- `POST /`: Crea un nuevo producto.
- `GET /{product_id}`: Detalle de un producto (incluyendo precio en Bs calculado dinámicamente).
- `PUT /{product_id}`: Actualiza un producto existente.
- `DELETE /{product_id}`: Elimina un producto.

---

### 2. Cambios Propuestos en el Frontend

#### [MODIFICAR] `frontend/src/types/index.ts`
- Definir tipos `ProductCreate` y `ProductUpdate` alineados con los esquemas del backend.

#### [MODIFICAR] `frontend/src/services/api.ts`
- Agregar funciones asíncronas para el cliente HTTP: `createProduct`, `updateProduct`, y `deleteProduct`.

#### [MODIFICAR] `frontend/src/hooks/useProducts.ts`
- Agregar mutaciones de TanStack Query (`useMutation`) para cada acción (Crear, Editar, Eliminar).
- Implementar la invalidación del caché (`queryClient.invalidateQueries({ queryKey: ['products'] })`) para que la vista se actualice instantáneamente sin recargar la página.

#### [NUEVO] `frontend/src/components/ProductModal.tsx`
- Un componente Modal para el formulario de Creación/Edición. Contendrá campos para nombre, precio (USD), categoría, marca, unidad y peso. Mantendrá el diseño Glassmorphism establecido.

#### [MODIFICAR] `frontend/src/components/ProductCard.tsx`
- Añadir botones de acción (Editar y Eliminar) en la tarjeta del producto, visibles de forma sutil o al hacer hover.

#### [MODIFICAR] `frontend/src/app/page.tsx`
- Agregar botón primario "Añadir Producto" en la parte superior.
- Integrar el estado del `ProductModal` para mostrarlo/ocultarlo.
- Manejar los diálogos de confirmación al intentar eliminar un producto.

---

## 🛑 User Review Required

> [!WARNING]
> Este cambio afecta toda la arquitectura desde la base de datos (repositorios) hasta la UI. Por favor, revisa el enfoque para los modales y formularios.

## ❓ Open Questions

1. **Formularios en Frontend:** ¿Deseas que usemos la librería `react-hook-form` para manejar el estado y validaciones del formulario de productos, o prefieres un estado simple nativo de React (`useState`) para mantenerlo lo más sencillo posible?
2. **Notificaciones (Toasts):** Al crear, editar o eliminar exitosamente un producto, es buena práctica mostrar una notificación temporal en pantalla. ¿Te gustaría instalar alguna librería como `react-hot-toast` o `sonner` para esto?

---

## Plan de Verificación

### Backend
- Pruebas manuales usando `/docs` (Swagger UI) para asegurar que POST, PUT y DELETE funcionen correctamente, respeten validaciones e interactúen bien con la base de datos PostgreSQL.

### Frontend
- Navegar a `http://localhost:3000`.
- Crear un nuevo producto y verificar que aparezca inmediatamente en la lista.
- Editar el producto recién creado (cambiar el precio USD) y confirmar que el precio en Bs se actualice.
- Eliminar el producto y verificar que desaparezca del catálogo.
