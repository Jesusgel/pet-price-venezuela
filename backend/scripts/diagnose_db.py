"""Script de diagnóstico para verificar el estado de las tablas y consultas en Neon."""
import asyncio
import traceback

from sqlmodel import select, text
from app.core.database import async_session_maker
from app.models.exchange_rate import ExchangeRate
from app.models.product import Product
from app.models.category import Category
from app.models.user import User
from app.services.dolar_service import DolarService
from app.repositories.rate_repository import ExchangeRateRepository


async def run_diagnostics():
    print("=" * 60)
    print("🔍 DIAGNÓSTICO DE BASE DE DATOS")
    print("=" * 60)

    async with async_session_maker() as session:
        # 1. Probar conexión básica y versión de Alembic
        print("\n[1] Verificando versión de Alembic en BD...")
        try:
            res = await session.exec(text("SELECT version_num FROM alembic_version;"))
            versions = res.all()
            print(f"  ✅ alembic_version registrada: {versions}")
        except Exception as e:
            print(f"  ❌ Error consultando alembic_version: {e}")

        # 2. Consultar columnas de la tabla exchange_rates
        print("\n[2] Verificando columnas de la tabla `exchange_rates`...")
        try:
            res = await session.exec(
                text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'exchange_rates';")
            )
            cols = res.all()
            print(f"  Columnas encontradas: {[c[0] for c in cols]}")
        except Exception as e:
            print(f"  ❌ Error al consultar columnas de exchange_rates: {e}")

        # 3. Probar consulta SQLModel de ExchangeRate
        print("\n[3] Probando consulta select(ExchangeRate)...")
        try:
            res = await session.exec(select(ExchangeRate).limit(1))
            rate = res.first()
            print(f"  ✅ Consulta exitosa! Tasa obtenida: {rate}")
        except Exception as e:
            print(f"  ❌ Error en select(ExchangeRate):\n{traceback.format_exc()}")

        # 4. Probar servicio completo DolarService.get_or_sync_latest_rate()
        print("\n[4] Probando DolarService.get_or_sync_latest_rate()...")
        try:
            repo = ExchangeRateRepository(session)
            service = DolarService(repo)
            rate = await service.get_or_sync_latest_rate()
            print(f"  ✅ DolarService exitoso! Tasa vigente: {rate.rate} (fecha: {rate.rate_date})")
        except Exception as e:
            print(f"  ❌ Error en DolarService:\n{traceback.format_exc()}")

        # 5. Probar consulta de Productos
        print("\n[5] Probando consulta select(Product)...")
        try:
            res = await session.exec(select(Product).limit(5))
            products = res.all()
            print(f"  ✅ Consulta exitosa! {len(products)} productos obtenidos.")
        except Exception as e:
            print(f"  ❌ Error en select(Product):\n{traceback.format_exc()}")

        # 6. Probar consulta de Usuarios
        print("\n[6] Probando consulta select(User)...")
        try:
            res = await session.exec(select(User).limit(5))
            users = res.all()
            print(f"  ✅ Consulta exitosa! {len(users)} usuarios encontrados:")
            for u in users:
                print(f"     - id={u.id}, username={u.username}, role={u.role}")
        except Exception as e:
            print(f"  ❌ Error en select(User):\n{traceback.format_exc()}")

    print("\n" + "=" * 60)
    print("🏁 DIAGNÓSTICO FINALIZADO")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(run_diagnostics())
