# METTON-357: removes dashboard's now-redundant User state now that identity.User (see
# identity/migrations/0000_user.py) is the live, active model. SeparateDatabaseAndState keeps the
# real `dashboard_user` table untouched.

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0031_alter_user_height_field_alter_user_width_field'),
        ('identity', '0000_user'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.DeleteModel(
                    name='User',
                ),
            ],
            database_operations=[],
        ),
    ]
