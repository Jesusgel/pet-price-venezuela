# Tareas de Implementación: CRUD de Productos

## Backend (FastAPI)
- [x] Actualizar esquemas (`ProductCreate`, `ProductUpdate`) en `schemas/product.py`
- [x] Implementar métodos CRUD (`get_by_id`, `create`, `update`, `delete`) en `ProductRepository`
- [x] Implementar lógica de negocio en `ProductService`
- [x] Agregar endpoints (`POST`, `GET /{id}`, `PUT`, `DELETE`) en `api/products.py`
- [x] Escribir tests unitarios y de integración para el CRUD (`tests/api/test_products.py`)

## Frontend (Next.js)
- [x] Añadir dependencias auxiliares si es necesario (ej. react-hot-toast)
- [x] Actualizar tipos `ProductCreate`, `ProductUpdate` en `types/index.ts`
- [x] Añadir métodos HTTP (`createProduct`, `updateProduct`, `deleteProduct`) en `services/api.ts`
- [x] Crear hooks de mutación en `hooks/useProducts.ts` (con invalidación de caché)
- [x] Desarrollar componente `ProductModal.tsx` para el formulario
- [x] Actualizar `ProductCard.tsx` con botones de editar/eliminar
- [x] Actualizar `page.tsx` para incluir el botón "Nuevo Producto" y el renderizado del Modal
- [x] Verificar funcionamiento End-to-End
