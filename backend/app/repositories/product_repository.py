from typing import List, Optional
from sqlalchemy import func, asc, desc
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.product import Product

import unicodedata

# Columnas permitidas para ordenar (evita SQL injection por nombre de columna)
_ALLOWED_SORT_FIELDS = {"name", "price_usd", "category", "created_at"}

_ACCENT_MAP = (
    ("á", "a"), ("é", "e"), ("í", "i"), ("ó", "o"), ("ú", "u"),
    ("ü", "u"), ("ñ", "n"),
    ("Á", "a"), ("É", "e"), ("Í", "i"), ("Ó", "o"), ("Ú", "u"),
    ("Ü", "u"), ("Ñ", "n")
)

def _normalize_text(text: str) -> str:
    """Normaliza texto eliminando acentos y pasando a minúsculas."""
    nfkd = unicodedata.normalize("NFKD", text)
    stripped = "".join(c for c in nfkd if not unicodedata.combining(c))
    return stripped.lower().strip()

def _normalized_column(col):
    """Crea una expresión SQL normalizada (minúsculas y sin acentos) compatible con PostgreSQL y SQLite."""
    res = func.lower(col)
    for accented, plain in _ACCENT_MAP:
        res = func.replace(res, accented, plain)
    return res

class ProductRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(
        self,
        search: Optional[str] = None,
        category: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
        sort_by: str = "name",
        sort_order: str = "asc",
    ) -> List[Product]:
        statement = select(Product).where(Product.is_active)
        if search:
            normalized_query = f"%{_normalize_text(search)}%"
            statement = statement.where(_normalized_column(Product.name).like(normalized_query))
        if category:
            statement = statement.where(Product.category == category)

        # Ordenamiento seguro contra columnas no permitidas
        safe_sort_by = sort_by if sort_by in _ALLOWED_SORT_FIELDS else "name"
        sort_col = getattr(Product, safe_sort_by)
        statement = statement.order_by(asc(sort_col) if sort_order == "asc" else desc(sort_col))
        statement = statement.offset(skip).limit(limit)

        result = await self.session.exec(statement)
        return result.all()

    async def count_all(
        self,
        search: Optional[str] = None,
        category: Optional[str] = None,
    ) -> int:
        """Cuenta el total de productos activos para calcular páginas."""
        statement = select(func.count()).select_from(Product).where(Product.is_active)
        if search:
            normalized_query = f"%{_normalize_text(search)}%"
            statement = statement.where(_normalized_column(Product.name).like(normalized_query))
        if category:
            statement = statement.where(Product.category == category)
        result = await self.session.exec(statement)
        return result.one()

    async def get_by_id(self, product_id: int) -> Optional[Product]:
        product = await self.session.get(Product, product_id)
        if product and product.is_active:
            return product
        return None

    async def create(self, product: Product) -> Product:
        self.session.add(product)
        await self.session.commit()
        await self.session.refresh(product)
        return product

    async def update(self, db_product: Product, update_data: dict) -> Product:
        for key, value in update_data.items():
            setattr(db_product, key, value)
        self.session.add(db_product)
        await self.session.commit()
        await self.session.refresh(db_product)
        return db_product

    async def delete(self, db_product: Product) -> None:
        db_product.is_active = False
        self.session.add(db_product)
        await self.session.commit()
