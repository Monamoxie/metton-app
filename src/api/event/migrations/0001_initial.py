# METTON-382: state-only move of Event from the dashboard app. SeparateDatabaseAndState keeps
# the real `dashboard_event` table untouched (see Event.Meta.db_table). Unlike the earlier User
# model move, Event has no other app's historical migration holding a real FK to it, so no special
# root-migration positioning is needed here — this can be event's normal initial migration.

import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.CreateModel(
                    name='Event',
                    fields=[
                        ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                        ('title', models.CharField(blank=True, max_length=100, verbose_name='title')),
                        ('start_date', models.DateField(verbose_name='start_date')),
                        ('start_time', models.TimeField(verbose_name='start_time')),
                        ('end_date', models.DateField(blank=True, verbose_name='end_date')),
                        ('end_time', models.TimeField(blank=True, verbose_name='end_time')),
                        ('frequency', models.CharField(blank=True, max_length=100, verbose_name='frequency')),
                        ('type', models.CharField(choices=[('1', 'Public'), ('2', 'Business Hours'), ('3', 'Unavailable')], default='1', max_length=2)),
                        ('note', models.TextField(blank=True, max_length=250, verbose_name='note')),
                        ('timezone', models.CharField(blank=True, max_length=100, verbose_name='timezone')),
                        ('attendees', models.TextField(blank=True, verbose_name='attendee_emails')),
                        ('created_at', models.DateTimeField(auto_now_add=True)),
                        ('end_recur', models.DateField(blank=True, null=True, verbose_name='end_recur')),
                        ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                    ],
                    options={
                        'db_table': 'dashboard_event',
                    },
                ),
            ],
            database_operations=[],
        ),
    ]
