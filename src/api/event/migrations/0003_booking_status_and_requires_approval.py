from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("event", "0002_schedule_schedulebookingrules_scheduleweeklyhours_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="event",
            name="status",
            field=models.CharField(
                choices=[
                    ("pending", "Pending"),
                    ("confirmed", "Confirmed"),
                    ("declined", "Declined"),
                ],
                default="confirmed",
                max_length=10,
            ),
        ),
        migrations.AddField(
            model_name="schedulebookingrules",
            name="requires_approval",
            field=models.BooleanField(default=False),
        ),
    ]
