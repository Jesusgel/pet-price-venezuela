import pytest
from decimal import Decimal
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.category import Category
from app.models.product import Product
from scripts.seed_clean_inventory import clean_and_seed_inventory


@pytest.mark.asyncio
async def test_clean_and_seed_inventory(db_session: AsyncSession):
    # Arrange: insertar un producto previo "sucio" para verificar que se limpie
    old_product = Product(
        name="Producto Viejo Desactualizado",
        price_usd=Decimal("99.99"),
        category="Vieja",
        unit="Unidad",
        is_active=True,
    )
    db_session.add(old_product)
    await db_session.commit()

    # Act: ejecutar la limpieza y siembra
    count = await clean_and_seed_inventory(session=db_session)

    # Assert: verificar 50 productos insertados
    assert count == 50

    # Verificar que el producto viejo ya no existe
    old_query = await db_session.exec(select(Product).where(Product.name == "Producto Viejo Desactualizado"))
    assert old_query.first() is None

    # Verificar cantidad total de productos
    all_products = (await db_session.exec(select(Product))).all()
    assert len(all_products) == 50

    # Verificar que todas las marcas estén vacías (None) como solicitó el usuario
    for prod in all_products:
        assert prod.brand is None
        assert prod.brand_id is None
        assert prod.category is not None
        assert prod.category_id is not None
        assert prod.unit != ""
        assert prod.is_active is True

    # Verificar categorías creadas
    categories = (await db_session.exec(select(Category))).all()
    cat_names = {c.name for c in categories}
    expected_categories = {
        "Aves", "Ganado", "Gato", "Granja", "Materia Prima", "Perro", "Porcino", "Suplementos"
    }
    assert expected_categories.issubset(cat_names)

    # Verificar datos específicos de productos clave actualizados
    ringo = next(p for p in all_products if p.name == "Ringo Cachorro Perrarina")
    assert ringo.category == "Perro"
    assert ringo.unit == "Saco"
    assert ringo.weight_kg == 30.0
    assert ringo.price_usd == Decimal("77.00")
    assert ringo.price_usd_retail == Decimal("2.98")
    assert ringo.price_usd_cash == Decimal("64.00")

    maiz = next(p for p in all_products if p.name == "Maíz Amarillo")
    assert maiz.category == "Materia Prima"
    assert maiz.weight_kg == 50.0
    assert maiz.price_usd == Decimal("28.00")
    assert maiz.price_usd_retail == Decimal("0.68")
    assert maiz.price_usd_cash == Decimal("24.00")

    melaza = next(p for p in all_products if p.name == "Melaza")
    assert melaza.category == "Suplementos"
    assert melaza.unit == "Tobo"
    assert melaza.weight_kg == 25.0
    assert melaza.price_usd == Decimal("20.00")
    assert melaza.price_usd_retail == Decimal("1.30")
    assert melaza.price_usd_cash == Decimal("18.00")

    # Verificar nuevos productos agregados
    vitalim_top = next(p for p in all_products if p.name == "Vitalim Top Dog 18 Kg")
    assert vitalim_top.category == "Perro"
    assert vitalim_top.unit == "Saco"
    assert vitalim_top.weight_kg == 18.0
    assert vitalim_top.price_usd == Decimal("33.00")
    assert vitalim_top.price_usd_retail == Decimal("2.10")
    assert vitalim_top.price_usd_cash == Decimal("29.00")

    neo_clean = next(p for p in all_products if p.name == "Arena para Gatos Neo Clean 4.15 Kg")
    assert neo_clean.category == "Gato"
    assert neo_clean.unit == "Otro"
    assert neo_clean.weight_kg == 4.2
    assert neo_clean.price_usd == Decimal("7.80")
    assert neo_clean.price_usd_retail == Decimal("7.80")
    assert neo_clean.price_usd_cash == Decimal("6.00")
