"""Script de limpieza y carga del inventario depurado desde `inventory_clean.csv`.

Vacia la tabla de productos e inserta los 48 productos normalizados,
creando y asociando también las categorías correspondientes.
"""

import asyncio
import csv
import sys
from decimal import Decimal
from pathlib import Path
from typing import Optional

# Agregar la ruta del backend al sys.path para poder importar `app`
sys.path.append(str(Path(__file__).resolve().parent.parent))

from sqlmodel import delete, select  # noqa: E402
from sqlmodel.ext.asyncio.session import AsyncSession  # noqa: E402
from app.core.database import async_session_maker  # noqa: E402
from app.models.category import Category  # noqa: E402
from app.models.product import Product  # noqa: E402

CSV_FILE_PATH = Path(__file__).resolve().parent.parent / "data" / "inventory_clean.csv"


async def clean_and_seed_inventory(session: Optional[AsyncSession] = None) -> int:
    if not CSV_FILE_PATH.exists():
        raise FileNotFoundError(f"No se encontró el archivo CSV en: {CSV_FILE_PATH}")

    with open(CSV_FILE_PATH, newline="", encoding="utf-8") as csvfile:
        reader = csv.DictReader(csvfile)
        rows = list(reader)

    print(f"[INFO] Leídos {len(rows)} productos desde {CSV_FILE_PATH.name}.")

    async def _execute(db: AsyncSession) -> int:
        # 1. Vaciar tabla de productos
        print("[INFO] Vaciando la tabla `products`...")
        await db.exec(delete(Product))
        await db.flush()
        print("[OK] Tabla `products` vaciada.")

        # 2. Sincronizar categorías
        cat_names = sorted(list({r["category"].strip() for r in rows if r.get("category")}))
        cat_stmt = select(Category)
        existing_cats = {c.name.strip().lower(): c for c in (await db.exec(cat_stmt)).all()}

        categories_created = 0
        for cat_name in cat_names:
            key = cat_name.lower()
            if key not in existing_cats:
                new_cat = Category(name=cat_name, is_active=True)
                db.add(new_cat)
                await db.flush()
                existing_cats[key] = new_cat
                categories_created += 1

        print(f"[OK] Categorías listas (creadas: {categories_created}, existentes: {len(existing_cats) - categories_created}).")

        # 3. Preparar e insertar productos
        products_to_add: list[Product] = []
        for r in rows:
            cat_name = r["category"].strip()
            cat_obj = existing_cats.get(cat_name.lower())
            cat_id = cat_obj.id if cat_obj else None

            weight = float(r["weight_kg"]) if r.get("weight_kg") and r["weight_kg"].strip() else None
            price_usd = Decimal(r["price_usd"].strip())
            price_retail = Decimal(r["price_usd_retail"].strip()) if r.get("price_usd_retail") and r["price_usd_retail"].strip() else None
            price_cash = Decimal(r["price_usd_cash"].strip()) if r.get("price_usd_cash") and r["price_usd_cash"].strip() else None

            prod = Product(
                name=r["name"].strip(),
                price_usd=price_usd,
                price_usd_retail=price_retail,
                price_usd_cash=price_cash,
                price_usd_retail_cash=None,
                category=cat_name,
                category_id=cat_id,
                brand=None,
                brand_id=None,
                unit=r["unit"].strip(),
                weight_kg=weight,
                is_active=True,
            )
            products_to_add.append(prod)

        db.add_all(products_to_add)
        await db.commit()
        print(f"🎉 [ÉXITO] Se insertaron {len(products_to_add)} productos limpios en la base de datos.")
        return len(products_to_add)

    if session is not None:
        return await _execute(session)
    else:
        async with async_session_maker() as new_session:
            return await _execute(new_session)


if __name__ == "__main__":
    asyncio.run(clean_and_seed_inventory())
