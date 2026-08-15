from typing import List, Optional
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from app.models.brand import Brand

class BrandRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all(self) -> List[Brand]:
        statement = select(Brand).where(Brand.is_active).order_by(Brand.name.asc())
        result = await self.session.exec(statement)
        return result.all()

    async def get_by_id(self, brand_id: int) -> Optional[Brand]:
        brand = await self.session.get(Brand, brand_id)
        if brand and brand.is_active:
            return brand
        return None

    async def get_by_name(self, name: str) -> Optional[Brand]:
        statement = select(Brand).where(Brand.name.ilike(name.strip()))
        result = await self.session.exec(statement)
        return result.first()

    async def create(self, brand: Brand) -> Brand:
        self.session.add(brand)
        await self.session.commit()
        await self.session.refresh(brand)
        return brand
