"""add users table and rate audit field

Revision ID: c8f2179b09d1
Revises: a506223d6d8e
Create Date: 2026-09-19 02:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'c8f2179b09d1'
down_revision: Union[str, Sequence[str], None] = 'a506223d6d8e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sqlmodel.sql.sqltypes.AutoString(length=50), nullable=False),
        sa.Column('email', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
        sa.Column('hashed_password', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('full_name', sqlmodel.sql.sqltypes.AutoString(length=100), nullable=False),
        sa.Column('role', sqlmodel.sql.sqltypes.AutoString(length=20), nullable=False, server_default='admin'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column('token_version', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
    )
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)

    # 2. Add changed_by_user_id column to exchange_rates
    op.add_column(
        'exchange_rates',
        sa.Column('changed_by_user_id', sa.Integer(), nullable=True)
    )
    op.create_foreign_key(
        'fk_exchange_rates_changed_by_user_id_users',
        'exchange_rates',
        'users',
        ['changed_by_user_id'],
        ['id']
    )


def downgrade() -> None:
    op.drop_constraint('fk_exchange_rates_changed_by_user_id_users', 'exchange_rates', type_='foreignkey')
    op.drop_column('exchange_rates', 'changed_by_user_id')
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_table('users')
