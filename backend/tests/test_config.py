"""Pruebas unitarias para el validador de configuración de base de datos."""

from sqlalchemy.dialects.postgresql.asyncpg import PGDialect_asyncpg
from sqlalchemy.engine.url import make_url

from app.core.config import Settings


def test_assemble_db_connection_neon_sslmode_normalized():
    """Valida que los parámetros libpq de Neon (?sslmode=require&channel_binding=require)

    se transformen a ssl=require compatible con asyncpg.
    """
    raw_neon_url = (
        "postgresql://neondb_owner:dummy_pass@ep-cool-fog-123.us-east-2.aws.neon.tech/neondb"
        "?sslmode=require&channel_binding=require"
    )
    normalized = Settings.assemble_db_connection(raw_neon_url)

    assert normalized.startswith("postgresql+asyncpg://")
    assert "ssl=require" in normalized
    assert "sslmode=" not in normalized
    assert "channel_binding=" not in normalized

    # Verificar compatibilidad real con el dialecto asyncpg de SQLAlchemy
    dialect = PGDialect_asyncpg()
    _, cparams = dialect.create_connect_args(make_url(normalized))
    assert cparams.get("ssl") == "require"
    assert "sslmode" not in cparams
    assert "channel_binding" not in cparams


def test_assemble_db_connection_standard_postgres():
    """Valida la conversión básica de postgresql:// a postgresql+asyncpg://."""
    raw_url = "postgresql://postgres:secret@localhost:5432/mydb"
    normalized = Settings.assemble_db_connection(raw_url)
    assert normalized == "postgresql+asyncpg://postgres:secret@localhost:5432/mydb"


def test_assemble_db_connection_already_asyncpg():
    """Valida que una URL ya formateada como postgresql+asyncpg:// se conserve."""
    raw_url = "postgresql+asyncpg://postgres:secret@localhost:5432/mydb"
    normalized = Settings.assemble_db_connection(raw_url)
    assert normalized == raw_url
