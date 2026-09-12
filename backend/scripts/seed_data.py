import asyncio
import csv
import os
import sys

# Agregar la ruta del backend al sys.path para poder importar `app`
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from decimal import Decimal
from sqlmodel import select
from app.core.database import async_session_maker
from app.models.product import Product

async def seed_data():
    csv_file_path = os.path.join(os.path.dirname(__file__), "..", "data", "products_sample.csv")
    
    async with async_session_maker() as session:
        # Check if we already have products
        statement = select(Product)
        results = await session.exec(statement)
        existing_products = results.all()
        
        if existing_products:
            print(f"La base de datos ya tiene {len(existing_products)} productos. Saltando seed...")
            return

        with open(csv_file_path, newline='', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            products_to_add = []
            for row in reader:
                weight = float(row["weight_kg"]) if row["weight_kg"] else None
                is_active = row["is_active"].lower() == "true"
                prod = Product(
                    name=row["name"],
                    price_usd=Decimal(row["price_usd"]),
                    category=row["category"],
                    brand=row["brand"],
                    unit=row["unit"],
                    weight_kg=weight,
                    is_active=is_active
                )
                products_to_add.append(prod)
            
            session.add_all(products_to_add)
            await session.commit()
            print(f"✅ Se han agregado {len(products_to_add)} productos de forma exitosa.")

if __name__ == "__main__":
    asyncio.run(seed_data())
