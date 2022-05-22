"""Added description to course

Revision ID: 5adfbb5e4fd6
Revises: 9586bf705fdf
Create Date: 2021-09-16 15:05:07.102420

"""
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision = "5adfbb5e4fd6"
down_revision = "9586bf705fdf"
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    try:
        op.add_column(
            "course", sa.Column("description", sa.String(length=255), nullable=True)
        )
    except Exception as e:
        print(e)
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column("course", "description")
    # ### end Alembic commands ###
