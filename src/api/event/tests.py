import importlib
import json
from datetime import date, time, timedelta

from django.apps import apps as real_apps
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase

from event.enums import EventTypes
from event.models import Event, Schedule, ScheduleOverride, ScheduleWeeklyHours
from event.services import AvailabilityService, ScheduleService
from identity.models.user import User


class BookingViewTests(TestCase):
    def setUp(self):
        self.host = User.objects.create_user(
            email="host@example.com", password="password123"
        )

    def test_valid_booking_creates_a_public_event(self):
        tomorrow = date.today() + timedelta(days=1)
        response = self.client.post(
            f"/meet/{self.host.public_id}/book",
            data=json.dumps(
                {
                    "start_date": str(tomorrow),
                    "start_time": "10:00",
                    "end_date": str(tomorrow),
                    "end_time": "10:30",
                    "frequencies": "['no']",
                    "title": "Intro call",
                    "email": "guest@example.com",
                    "note": "Looking forward to it",
                    "user_timezone": "UTC",
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        event = Event.objects.get(user=self.host)
        self.assertEqual(event.type, EventTypes.PUBLIC.value)
        self.assertEqual(event.title, "Intro call")

    def test_booking_for_unknown_user_returns_400(self):
        tomorrow = date.today() + timedelta(days=1)
        response = self.client.post(
            "/meet/no-such-user/book",
            data=json.dumps(
                {
                    "start_date": str(tomorrow),
                    "start_time": "10:00",
                    "end_date": str(tomorrow),
                    "end_time": "10:30",
                    "frequencies": "['no']",
                    "title": "Intro call",
                    "email": "guest@example.com",
                    "note": "Looking forward to it",
                    "user_timezone": "UTC",
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertFalse(Event.objects.exists())


class UserBusinessHoursViewTests(TestCase):
    def setUp(self):
        self.host = User.objects.create_user(
            email="host@example.com", password="password123"
        )

    def test_returns_business_hours_for_the_host(self):
        Event.objects.create(
            user=self.host,
            title="Business Hours",
            type=EventTypes.BUSINESS_HOURS.value,
            start_date=date.today(),
            start_time=time(9, 0),
            end_date=date.today(),
            end_time=time(17, 0),
            timezone="UTC",
        )

        response = self.client.get(f"/business-hours/{self.host.public_id}")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)


def _next_occurrence(day_of_week_ours: int) -> date:
    """The next date matching our day-of-week convention (Sunday=0..Saturday=6), always
    strictly in the future so tests never land on "today" and collide with min-notice logic."""
    today = date.today()
    target_python_weekday = (day_of_week_ours - 1) % 7
    days_ahead = (target_python_weekday - today.weekday()) % 7
    if days_ahead == 0:
        days_ahead = 7
    return today + timedelta(days=days_ahead)


MONDAY = 1  # our day_of_week convention


class ScheduleDetailViewTests(APITestCase):
    url = "/api/v1/event/schedule/"

    def setUp(self):
        self.host = User.objects.create_user(
            email="host@example.com", password="password123"
        )
        self.client.force_authenticate(user=self.host)

    def test_get_returns_404_when_no_schedule_exists(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_patch_creates_default_schedule_and_sets_weekly_hours(self):
        response = self.client.patch(
            self.url,
            {
                "timezone": "UTC",
                "weekly_hours": [
                    {"day_of_week": MONDAY, "start_time": "09:00", "end_time": "17:00"}
                ],
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        schedule = Schedule.objects.get(user=self.host, is_default=True)
        self.assertEqual(schedule.timezone, "UTC")
        self.assertEqual(ScheduleWeeklyHours.objects.filter(schedule=schedule).count(), 1)

    def test_patch_replaces_weekly_hours_rather_than_appending(self):
        self.client.patch(
            self.url,
            {"weekly_hours": [{"day_of_week": MONDAY, "start_time": "09:00", "end_time": "12:00"}]},
            format="json",
        )

        response = self.client.patch(
            self.url,
            {"weekly_hours": [{"day_of_week": MONDAY, "start_time": "13:00", "end_time": "17:00"}]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        schedule = Schedule.objects.get(user=self.host, is_default=True)
        hours = ScheduleWeeklyHours.objects.filter(schedule=schedule)
        self.assertEqual(hours.count(), 1)
        self.assertEqual(str(hours.first().start_time), "13:00:00")

    def test_patch_updates_booking_rules(self):
        response = self.client.patch(
            self.url,
            {"booking_rules": {"min_notice_minutes": 60, "daily_booking_limit": 3}},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        schedule = Schedule.objects.get(user=self.host, is_default=True)
        self.assertEqual(schedule.booking_rules.min_notice_minutes, 60)
        self.assertEqual(schedule.booking_rules.daily_booking_limit, 3)

    def test_patch_rejects_end_time_before_start_time(self):
        response = self.client.patch(
            self.url,
            {"weekly_hours": [{"day_of_week": MONDAY, "start_time": "17:00", "end_time": "09:00"}]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)

    def test_get_returns_schedule_after_patch(self):
        self.client.patch(
            self.url,
            {"weekly_hours": [{"day_of_week": MONDAY, "start_time": "09:00", "end_time": "17:00"}]},
            format="json",
        )

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()["data"]["schedule"]["weekly_hours"]), 1)


class ScheduleOverrideViewTests(APITestCase):
    create_url = "/api/v1/event/schedule/overrides/"

    def setUp(self):
        self.host = User.objects.create_user(
            email="host@example.com", password="password123"
        )
        self.client.force_authenticate(user=self.host)
        self.override_date = _next_occurrence(MONDAY)

    def test_post_creates_an_override(self):
        response = self.client.post(
            self.create_url, {"date": str(self.override_date)}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(ScheduleOverride.objects.filter(date=self.override_date).exists())

    def test_post_duplicate_date_returns_400(self):
        self.client.post(self.create_url, {"date": str(self.override_date)}, format="json")

        response = self.client.post(
            self.create_url, {"date": str(self.override_date)}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_post_custom_hours_without_times_returns_422(self):
        response = self.client.post(
            self.create_url,
            {"date": str(self.override_date), "is_unavailable": False},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)

    def test_delete_removes_override(self):
        self.client.post(self.create_url, {"date": str(self.override_date)}, format="json")

        response = self.client.delete(f"{self.create_url}{self.override_date}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(ScheduleOverride.objects.filter(date=self.override_date).exists())

    def test_delete_unknown_date_returns_404(self):
        response = self.client.delete(f"{self.create_url}{self.override_date}/")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_invalid_date_format_returns_422(self):
        response = self.client.delete(f"{self.create_url}not-a-date/")

        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)


class AvailabilityServiceTests(TestCase):
    def setUp(self):
        self.host = User.objects.create_user(
            email="host@example.com", password="password123"
        )
        self.schedule = Schedule.objects.create(
            user=self.host, name="Working Hours", timezone="UTC", is_default=True
        )
        self.monday = _next_occurrence(MONDAY)

    def _set_weekly_hours(self, day_of_week, start, end):
        return ScheduleWeeklyHours.objects.create(
            schedule=self.schedule,
            day_of_week=day_of_week,
            start_time=time.fromisoformat(start),
            end_time=time.fromisoformat(end),
        )

    def test_generates_slots_within_weekly_hours(self):
        self._set_weekly_hours(MONDAY, "09:00", "10:00")

        slots = AvailabilityService.get_available_slots(
            self.schedule, self.monday, self.monday, duration_minutes=30
        )

        self.assertEqual(len(slots), 2)

    def test_no_weekly_hours_means_no_slots(self):
        slots = AvailabilityService.get_available_slots(
            self.schedule, self.monday, self.monday, duration_minutes=30
        )

        self.assertEqual(slots, [])

    def test_split_hours_same_day(self):
        self._set_weekly_hours(MONDAY, "09:00", "10:00")
        self._set_weekly_hours(MONDAY, "13:00", "14:00")

        slots = AvailabilityService.get_available_slots(
            self.schedule, self.monday, self.monday, duration_minutes=30
        )

        self.assertEqual(len(slots), 4)

    def test_override_blocks_a_normally_available_day(self):
        self._set_weekly_hours(MONDAY, "09:00", "10:00")
        ScheduleOverride.objects.create(
            schedule=self.schedule, date=self.monday, is_unavailable=True
        )

        slots = AvailabilityService.get_available_slots(
            self.schedule, self.monday, self.monday, duration_minutes=30
        )

        self.assertEqual(slots, [])

    def test_override_with_custom_hours_replaces_weekly_hours(self):
        self._set_weekly_hours(MONDAY, "09:00", "10:00")
        ScheduleOverride.objects.create(
            schedule=self.schedule,
            date=self.monday,
            is_unavailable=False,
            start_time=time(14, 0),
            end_time=time(15, 0),
        )

        slots = AvailabilityService.get_available_slots(
            self.schedule, self.monday, self.monday, duration_minutes=30
        )

        self.assertEqual(len(slots), 2)
        self.assertEqual(slots[0]["start"].hour, 14)

    def test_excludes_slots_overlapping_existing_booking(self):
        self._set_weekly_hours(MONDAY, "09:00", "10:00")
        Event.objects.create(
            user=self.host,
            title="Existing booking",
            type=EventTypes.PUBLIC.value,
            start_date=self.monday,
            start_time=time(9, 0),
            end_date=self.monday,
            end_time=time(9, 30),
            timezone="UTC",
        )

        slots = AvailabilityService.get_available_slots(
            self.schedule, self.monday, self.monday, duration_minutes=30
        )

        self.assertEqual(len(slots), 1)
        self.assertEqual(slots[0]["start"].hour, 9)
        self.assertEqual(slots[0]["start"].minute, 30)

    def test_buffer_prevents_back_to_back_booking(self):
        self._set_weekly_hours(MONDAY, "09:00", "10:00")
        ScheduleService.update_booking_rules(
            self.schedule, buffer_before_minutes=15, buffer_after_minutes=15
        )
        Event.objects.create(
            user=self.host,
            title="Existing booking",
            type=EventTypes.PUBLIC.value,
            start_date=self.monday,
            start_time=time(9, 0),
            end_date=self.monday,
            end_time=time(9, 30),
            timezone="UTC",
        )

        slots = AvailabilityService.get_available_slots(
            self.schedule, self.monday, self.monday, duration_minutes=30
        )

        # 09:30 slot would start right when the buffer-padded booking ends at 09:45 —
        # still blocked, so only nothing fits before 10:00 closes the window.
        self.assertEqual(slots, [])

    def test_daily_booking_limit_blocks_further_slots(self):
        self._set_weekly_hours(MONDAY, "09:00", "12:00")
        ScheduleService.update_booking_rules(self.schedule, daily_booking_limit=1)
        Event.objects.create(
            user=self.host,
            title="Existing booking",
            type=EventTypes.PUBLIC.value,
            start_date=self.monday,
            start_time=time(9, 0),
            end_date=self.monday,
            end_time=time(9, 30),
            timezone="UTC",
        )

        slots = AvailabilityService.get_available_slots(
            self.schedule, self.monday, self.monday, duration_minutes=30
        )

        self.assertEqual(slots, [])

    def test_min_notice_excludes_todays_slots(self):
        self._set_weekly_hours(MONDAY, "09:00", "10:00")
        ScheduleService.update_booking_rules(self.schedule, min_notice_minutes=24 * 60)
        today = date.today()
        self._set_weekly_hours((today.weekday() + 1) % 7, "00:00", "23:59")

        slots = AvailabilityService.get_available_slots(
            self.schedule, today, today, duration_minutes=30
        )

        self.assertEqual(slots, [])


class UserAvailableSlotsViewTests(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(
            email="host@example.com", password="password123"
        )
        self.schedule = Schedule.objects.create(
            user=self.host, name="Working Hours", timezone="UTC", is_default=True
        )
        self.monday = _next_occurrence(MONDAY)
        ScheduleWeeklyHours.objects.create(
            schedule=self.schedule,
            day_of_week=MONDAY,
            start_time=time(9, 0),
            end_time=time(10, 0),
        )

    def test_returns_slots_for_public_id(self):
        response = self.client.get(
            f"/api/v1/event/{self.host.public_id}/slots/",
            {"start": str(self.monday), "end": str(self.monday), "duration": 30},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()["data"]["slots"]), 2)

    def test_unknown_public_id_returns_404(self):
        response = self.client.get(
            "/api/v1/event/no-such-user/slots/",
            {"start": str(self.monday), "end": str(self.monday)},
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_missing_schedule_returns_empty_list(self):
        other_host = User.objects.create_user(
            email="other@example.com", password="password123"
        )

        response = self.client.get(
            f"/api/v1/event/{other_host.public_id}/slots/",
            {"start": str(self.monday), "end": str(self.monday)},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["data"]["slots"], [])

    def test_invalid_date_format_returns_422(self):
        response = self.client.get(
            f"/api/v1/event/{self.host.public_id}/slots/",
            {"start": "not-a-date", "end": str(self.monday)},
        )

        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)


class LegacyScheduleMigrationTests(TestCase):
    """Exercises the METTON-530 data migration's transform function directly against the
    real (current) model classes — same field shapes the migration's historical `apps.get_model`
    would see, since nothing about these fields has changed since. No migration-replay tooling
    is installed in this project, so this is the practical equivalent."""

    def setUp(self):
        self.migration = importlib.import_module(
            "event.migrations."
            "0002_schedule_schedulebookingrules_scheduleweeklyhours_and_more"
        )
        self.host = User.objects.create_user(
            email="host@example.com", password="password123"
        )

    def test_business_hours_events_become_weekly_hours(self):
        Event.objects.create(
            user=self.host,
            title="Business Hours",
            type=EventTypes.BUSINESS_HOURS.value,
            start_date=date(2026, 1, 5),  # a Monday
            start_time=time(9, 0),
            end_date=date(2026, 1, 5),
            end_time=time(17, 0),
            frequency="1,2,3,4,5",
            timezone="Europe/London",
        )

        self.migration.migrate_legacy_business_hours_and_unavailable(real_apps, None)

        schedule = Schedule.objects.get(user=self.host, is_default=True)
        self.assertEqual(schedule.timezone, "Europe/London")
        days = set(
            ScheduleWeeklyHours.objects.filter(schedule=schedule).values_list(
                "day_of_week", flat=True
            )
        )
        self.assertEqual(days, {1, 2, 3, 4, 5})

    def test_unavailable_events_become_overrides(self):
        Event.objects.create(
            user=self.host,
            title="Unavailable",
            type=EventTypes.UNAVAILABLE.value,
            start_date=date(2026, 12, 25),
            start_time=time(0, 0),
            end_date=date(2026, 12, 25),
            end_time=time(23, 59),
            timezone="UTC",
        )

        self.migration.migrate_legacy_business_hours_and_unavailable(real_apps, None)

        schedule = Schedule.objects.get(user=self.host, is_default=True)
        self.assertTrue(
            ScheduleOverride.objects.filter(
                schedule=schedule, date=date(2026, 12, 25), is_unavailable=True
            ).exists()
        )
