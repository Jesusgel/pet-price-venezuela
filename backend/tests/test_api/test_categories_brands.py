import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_get_categories_empty_seeds_defaults(client: AsyncClient):
    response = await client.get("/api/v1/categories/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 5
    names = [item["name"] for item in data]
    assert "Perro" in names
    assert "Gato" in names

@pytest.mark.asyncio
async def test_create_category_normalizes_name(client: AsyncClient):
    response = await client.post("/api/v1/categories/", json={"name": "  reptiles  ", "description": "Mascotas exóticas"})
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Reptiles"

    # Duplicate post should return existing record without error
    response_dup = await client.post("/api/v1/categories/", json={"name": "REPTILES"})
    assert response_dup.status_code == 201
    assert response_dup.json()["id"] == data["id"]

@pytest.mark.asyncio
async def test_get_and_create_brands(client: AsyncClient):
    # Create brand
    create_res = await client.post("/api/v1/brands/", json={"name": "  pedigree  "})
    assert create_res.status_code == 201
    data = create_res.json()
    assert data["name"] == "Pedigree"

    # List brands
    get_res = await client.get("/api/v1/brands/")
    assert get_res.status_code == 200
    brands = get_res.json()
    assert any(b["name"] == "Pedigree" for b in brands)
