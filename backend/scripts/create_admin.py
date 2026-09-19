"""
Script para inicializar usuarios administradores.

Uso interactivo (local):
    uv run python -m scripts.create_admin

Uso desatendido / CI / Producción (Railway via variables de entorno):
    ADMIN_USERNAME=admin ADMIN_EMAIL=admin@elsaman.com ADMIN_PASSWORD=mi_clave_segura \
        uv run python -m scripts.create_admin
"""
import asyncio
import getpass
import os
import sys

from app.core.database import async_session_maker
from app.core.security import get_password_hash
from app.models.user import User
from app.repositories.user_repository import UserRepository


async def main():
    username = os.environ.get("ADMIN_USERNAME")
    email = os.environ.get("ADMIN_EMAIL")
    password = os.environ.get("ADMIN_PASSWORD")
    full_name = os.environ.get("ADMIN_FULL_NAME", "Administrador")

    # Si faltan datos en env vars, solicitar interactivamente por consola
    if not username:
        username = input("Nombre de usuario para el Administrador: ").strip()
    if not email:
        email = input("Correo electrónico: ").strip()
    if not password:
        password = getpass.getpass("Contraseña (mínimo 8 caracteres): ")
        confirm = getpass.getpass("Confirmar contraseña: ")
        if password != confirm:
            print("❌ Error: Las contraseñas no coinciden.")
            sys.exit(1)

    if len(password) < 8:
        print("❌ Error: La contraseña debe contener al menos 8 caracteres.")
        sys.exit(1)

    async with async_session_maker() as session:
        repo = UserRepository(session)
        existing = await repo.get_by_username(username)
        if existing:
            print(f"⚠️ El usuario '{username}' ya existe en la base de datos.")
            sys.exit(0)

        existing_email = await repo.get_by_email(email)
        if existing_email:
            print(f"⚠️ El correo '{email}' ya se encuentra registrado.")
            sys.exit(1)

        user = User(
            username=username,
            email=email,
            hashed_password=get_password_hash(password),
            full_name=full_name,
            role="admin",
            is_active=True,
        )
        await repo.create(user)
        print(f"✅ Administrador '{username}' ({email}) creado exitosamente.")


if __name__ == "__main__":
    asyncio.run(main())
