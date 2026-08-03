# METTON-357: state-only registration of User in identity's migration history.
#
# Deliberately numbered/positioned as identity's structural ROOT (identity/migrations/0001_initial.py
# depends on this, not the other way round) — every migration project-wide that declares a FK via
# `to=settings.AUTH_USER_MODEL` (including Django/knox's own built-in migrations, which add an
# automatic `swappable_dependency` edge resolving to `('identity', '__first__')`) needs identity.User
# to already exist in migration state by the time it runs, and `'__first__'` resolution requires this
# to genuinely be the app's earliest node — a later position (e.g. after 0005) breaks a from-scratch
# database build, since identity's own `0001_initial` (VerificationToken.user FK) would run first.
#
# SeparateDatabaseAndState + `db_table="dashboard_user"` means no real DDL happens here — the
# physical table is (and stays) the one dashboard's own migration history already created.
# `dashboard/migrations/0032_delete_user.py` removes dashboard's now-redundant state entry once
# this one exists. See dashboard/migrations/0014_event_user.py for the one migration that needed a
# manual dependency edge added here too (it predates this refactor and never had one, since at the
# time it was written the user model was still in the same app).

from django.db import migrations, models
import django.utils.timezone
import identity.models.user


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
        # Real DDL dependency, not just state: the real `dashboard_user` table (created for real by
        # dashboard's own 0001_initial) must exist before any later migration creates a *real* FK to
        # it (e.g. Django's own admin.LogEntry) — this migration is state-only and never touches the
        # DB itself, so it doesn't need dashboard's table to exist for its own sake, but anything
        # that resolves `settings.AUTH_USER_MODEL` after this migration does.
        ('dashboard', '0001_initial'),
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
                        ('profile_photo', models.ImageField(blank=True, height_field='height_field', null=True, upload_to='identity.models.user.rename_file', width_field='width_field')),
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
                    managers=[
                        ('objects', identity.models.user.CustomUserManager()),
                    ],
                ),
            ],
            database_operations=[],
        ),
    ]
