from typing import List, Optional
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from app.models.category import Category

class CategoryRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(self) -> List[Category]:
        statement = select(Category).where(Category.is_active).order_by(Category.name.asc())
        result = await self.session.exec(statement)
        return result.all()

    async def get_by_id(self, category_id: int) -> Optional[Category]:
        category = await self.session.get(Category, category_id)
        if category and category.is_active:
            return category
        return None

    async def get_by_name(self, name: str) -> Optional[Category]:
        statement = select(Category).where(Category.name.ilike(name.strip()))
        result = await self.session.exec(statement)
        return result.first()

    async def create(self, category: Category) -> Category:
        self.session.add(category)
        await self.session.commit()
        await self.session.refresh(category)
        return category
