"""add multi-price fields to products

Revision ID: b7e3d1f09a2c
Revises: a506223d6d8e
Create Date: 2026-09-19 12:27:00.000000

Agrega tres campos de precio opcionales al modelo Product:
- price_usd_retail: precio al detal en USD (se muestra en Bs. usando tasa BCV)
- price_usd_cash: precio del saco en efectivo USD (sin conversión)
- price_usd_retail_cash: precio al detal en efectivo USD (sin conversión)
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'b7e3d1f09a2c'
down_revision: Union[str, None] = 'c8f2179b09d1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'products',
        sa.Column('price_usd_retail', sa.Numeric(precision=10, scale=2), nullable=True),
    )
    op.add_column(
        'products',
        sa.Column('price_usd_cash', sa.Numeric(precision=10, scale=2), nullable=True),
    )
    op.add_column(
        'products',
        sa.Column('price_usd_retail_cash', sa.Numeric(precision=10, scale=2), nullable=True),
    )


def downgrade() -> None:
    op.drop_column('products', 'price_usd_retail_cash')
    op.drop_column('products', 'price_usd_cash')
    op.drop_column('products', 'price_usd_retail')
