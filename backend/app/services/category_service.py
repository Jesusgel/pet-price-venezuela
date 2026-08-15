from typing import List
from fastapi import HTTPException, status
from app.models.category import Category
from app.repositories.category_repository import CategoryRepository
from app.schemas.category import CategoryCreate

DEFAULT_CATEGORIES = ["Perro", "Gato", "Ave", "Pez", "Otro"]

class CategoryService:
    def __init__(self, category_repo: CategoryRepository):
        self.category_repo = category_repo

    def normalize_name(self, name: str) -> str:
        clean = name.strip()
        if not clean:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category name cannot be empty")
        return clean.title()

    async def get_all_categories(self) -> List[Category]:
        categories = await self.category_repo.get_all()
        if not categories:
            # Seed default categories if none exist
            for cat_name in DEFAULT_CATEGORIES:
                existing = await self.category_repo.get_by_name(cat_name)
                if not existing:
                    await self.category_repo.create(Category(name=cat_name))
            categories = await self.category_repo.get_all()
        return categories

    async def create_category(self, category_in: CategoryCreate) -> Category:
        normalized_name = self.normalize_name(category_in.name)
        existing = await self.category_repo.get_by_name(normalized_name)
        if existing:
            return existing
        category = Category(
            name=normalized_name,
            description=category_in.description.strip() if category_in.description else None
        )
        return await self.category_repo.create(category)
