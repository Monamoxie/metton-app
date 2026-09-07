# METTON-382: removes dashboard's now-redundant Event state now that event.Event is the live,
# active model. SeparateDatabaseAndState keeps the real `dashboard_event` table untouched.

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0032_delete_user'),
        ('event', '0001_initial'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.DeleteModel(
                    name='Event',
                ),
            ],
            database_operations=[],
        ),
    ]
