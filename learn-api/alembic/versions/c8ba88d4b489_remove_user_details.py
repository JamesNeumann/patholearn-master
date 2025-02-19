"""Remove user details

Revision ID: c8ba88d4b489
Revises: 4334321a1b08
Create Date: 2023-05-01 06:43:46.489491

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = 'c8ba88d4b489'
down_revision = '4334321a1b08'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('user', 'hashed_password')
    op.drop_column('user', 'is_superuser')
    op.drop_column('user', 'is_active')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('user', sa.Column('is_active', mysql.TINYINT(display_width=1), autoincrement=False, nullable=True))
    op.add_column('user', sa.Column('is_superuser', mysql.TINYINT(display_width=1), autoincrement=False, nullable=True))
    op.add_column('user', sa.Column('hashed_password', mysql.VARCHAR(length=255), nullable=True))
    # ### end Alembic commands ###
