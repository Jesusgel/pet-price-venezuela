from typing import List
from fastapi import HTTPException, status
from app.models.brand import Brand
from app.repositories.brand_repository import BrandRepository
from app.schemas.brand import BrandCreate

class BrandService:
    def __init__(self, brand_repo: BrandRepository):
        self.brand_repo = brand_repo

    def normalize_name(self, name: str) -> str:
        clean = name.strip()
        if not clean:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Brand name cannot be empty")
        return clean.title()

    async def get_all_brands(self) -> List[Brand]:
        return await self.brand_repo.get_all()

    async def create_brand(self, brand_in: BrandCreate) -> Brand:
        normalized_name = self.normalize_name(brand_in.name)
        existing = await self.brand_repo.get_by_name(normalized_name)
        if existing:
            return existing
        brand = Brand(name=normalized_name)
        return await self.brand_repo.create(brand)
