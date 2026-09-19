from typing import List
from fastapi import APIRouter, Depends, status
from app.schemas.category import CategoryResponse, CategoryCreate
from app.services.category_service import CategoryService
from app.api.deps import get_category_service, get_current_active_admin
from app.models.user import User

router = APIRouter()

@router.get("", response_model=List[CategoryResponse])
@router.get("/", response_model=List[CategoryResponse])
async def read_categories(
    category_service: CategoryService = Depends(get_category_service)
):
    """Retrieve all active categories (Public)."""
    return await category_service.get_all_categories()

@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_in: CategoryCreate,
    category_service: CategoryService = Depends(get_category_service),
    _admin: User = Depends(get_current_active_admin),
):
    """Create a new category (Admin)."""
    return await category_service.create_category(category_in)
