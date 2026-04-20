from typing import List, Optional
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.product import Product

class ProductRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(self, search: Optional[str] = None, category: Optional[str] = None) -> List[Product]:
        statement = select(Product)
        if search:
            statement = statement.where(Product.name.ilike(f"%{search}%"))
        if category:
            statement = statement.where(Product.category == category)
            
        result = await self.session.exec(statement)
        return result.all()
