# METTON-357 phase 1 of 2: state-only, purely additive.
#
# Registers a `User` model in identity's migration STATE (Django's internal bookkeeping),
# pointing at the same physical table as dashboard.User (`db_table="dashboard_user"`), without
# touching the database and without creating any real/importable identity.User Python class.
# `AUTH_USER_MODEL` stays "dashboard.User" — dashboard.User remains the live, active model.
#
# This exists purely so that identity.User is already present in Django's "currently applied
# migrations" state before phase 2 (a separate, later migration) flips AUTH_USER_MODEL to
# "identity.User" and removes dashboard.User's state. Doing both in one migration/deploy breaks:
# every historical FK declared as `to=settings.AUTH_USER_MODEL` (dashboard.Event, workspace.*,
# identity.VerificationToken, knox.AuthToken, admin.LogEntry) resolves against the *current*
# settings value at every migrate run, and Django's pre-migrate state snapshot only includes
# already-applied migrations — so if identity.User isn't already applied by the time
# AUTH_USER_MODEL flips, `manage.py migrate` fails project-wide with a dangling lazy-reference
# error before any operation runs. Applying this inert migration first avoids that.
#
# No custom manager is declared on the state model — it's never instantiated or used, so this
# stays a plain Python-only migration file with zero real-code dependencies.

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
        ('identity', '0005_alter_verificationtoken_type'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            state_operations=[
                migrations.CreateModel(
                    name='User',
                    fields=[
                        ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                        ('password', models.CharField(max_length=128, verbose_name='password')),
                        ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                        ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                        ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                        ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                        ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                        ('email', models.EmailField(max_length=254, unique=True, verbose_name='email_address')),
                        ('name', models.CharField(blank=True, max_length=190, verbose_name='name')),
                        ('company', models.CharField(blank=True, max_length=190, verbose_name='company')),
                        ('position', models.CharField(blank=True, max_length=190, verbose_name='position')),
                        ('profile_summary', models.TextField(blank=True, verbose_name='profile_summary')),
                        ('profile_photo', models.ImageField(blank=True, height_field='height_field', null=True, upload_to='dashboard.models.user.rename_file', width_field='width_field')),
                        ('public_id', models.CharField(blank=True, max_length=190, unique=True, verbose_name='public_id')),
                        ('height_field', models.IntegerField(blank=True, default=180, null=True)),
                        ('width_field', models.IntegerField(blank=True, default=180, null=True)),
                        ('email_verified', models.BooleanField(default=False)),
                        ('email_verified_at', models.DateTimeField(blank=True, null=True)),
                        ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                        ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
                    ],
                    options={
                        'db_table': 'dashboard_user',
                    },
                ),
            ],
            database_operations=[],
        ),
    ]
