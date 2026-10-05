"""
Script CLI para administración y gestión de usuarios (Local y Producción en Railway).

Comandos disponibles:
    # 1. Listar todos los usuarios
    uv run python -m scripts.manage_users list

    # 2. Restablecer contraseña de un administrador
    uv run python -m scripts.manage_users reset-password <username>

    # 3. Activar o suspender acceso a un usuario
    uv run python -m scripts.manage_users toggle-active <username>
"""

import asyncio
import argparse
import getpass
import sys
from datetime import datetime, timezone

from sqlmodel import select
from app.core.database import async_session_maker
from app.core.security import get_password_hash
from app.models.user import User


async def list_users():
    async with async_session_maker() as session:
        result = await session.exec(select(User).order_by(User.id))
        users = result.all()

        if not users:
            print("\n⚠️ No hay usuarios registrados en la base de datos.")
            return

        print("\n" + "=" * 80)
        print(f"{'ID':<4} | {'USUARIO':<16} | {'ROL':<8} | {'ESTADO':<8} | {'SESIÓN (TV)':<11} | {'CORREO':<24}")
        print("=" * 80)
        for u in users:
            status = "ACTIVO" if u.is_active else "INACTIVO"
            print(f"{u.id:<4} | {u.username:<16} | {u.role:<8} | {status:<8} | {u.token_version:<11} | {u.email:<24}")
        print("=" * 80)
        print(f"Total: {len(users)} usuario(s) registrado(s).\n")


async def reset_password(username: str, new_password: str | None = None):
    async with async_session_maker() as session:
        result = await session.exec(select(User).where(User.username == username))
        user = result.first()

        if not user:
            print(f"\n❌ Error: El usuario '{username}' no existe.")
            sys.exit(1)

        if not new_password:
            new_password = getpass.getpass(f"Nueva contraseña para '{username}' (mínimo 8 caracteres): ")
            confirm = getpass.getpass("Confirmar nueva contraseña: ")
            if new_password != confirm:
                print("\n❌ Error: Las contraseñas no coinciden.")
                sys.exit(1)

        if len(new_password) < 8:
            print("\n❌ Error: La contraseña debe contener al menos 8 caracteres.")
            sys.exit(1)

        user.hashed_password = get_password_hash(new_password)
        # Invalidar de inmediato todas las sesiones abiertas previas
        user.token_version += 1
        user.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)

        session.add(user)
        await session.commit()
        print(f"\n✅ Contraseña actualizada exitosamente para '{username}'.")
        print(f"🔒 Todas las sesiones previas han sido revocadas automáticamente (Nueva versión: {user.token_version}).\n")


async def toggle_active(username: str):
    async with async_session_maker() as session:
        result = await session.exec(select(User).where(User.username == username))
        user = result.first()

        if not user:
            print(f"\n❌ Error: El usuario '{username}' no existe.")
            sys.exit(1)

        user.is_active = not user.is_active
        # Si se desactiva, invalidar sus tokens actuales
        if not user.is_active:
            user.token_version += 1
        user.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)

        session.add(user)
        await session.commit()
        estado = "ACTIVADO" if user.is_active else "DESACTIVADO (Acceso bloqueado)"
        print(f"\n✅ El usuario '{username}' ahora está: {estado}.\n")


def main():
    parser = argparse.ArgumentParser(description="Gestión CLI de Administradores (Pet-Price Venezuela)")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # list
    subparsers.add_parser("list", help="Listar todos los administradores registrados")

    # reset-password
    p_reset = subparsers.add_parser("reset-password", help="Restablecer la contraseña de un administrador")
    p_reset.add_argument("username", help="Nombre de usuario del administrador")
    p_reset.add_argument("--password", help="Nueva contraseña (opcional, si se omite se solicita ocultamente)", default=None)

    # toggle-active
    p_toggle = subparsers.add_parser("toggle-active", help="Activar o suspender la cuenta de un administrador")
    p_toggle.add_argument("username", help="Nombre de usuario del administrador")

    args = parser.parse_args()

    if args.command == "list":
        asyncio.run(list_users())
    elif args.command == "reset-password":
        asyncio.run(reset_password(args.username, args.password))
    elif args.command == "toggle-active":
        asyncio.run(toggle_active(args.username))


if __name__ == "__main__":
    main()
