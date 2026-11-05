import importlib
import json
from datetime import date, datetime, time, timedelta
from datetime import timezone as dt_timezone
from unittest.mock import patch

from django.core import mail
from icalendar import Calendar

from django.apps import apps as real_apps
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase

from event.enums import EventTypes
from event.models import Event, Schedule, ScheduleOverride, ScheduleWeeklyHours
from core.services import EmailService, EventService
from event.services import AvailabilityService, BookingInviteService, ScheduleService
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

    def test_saved_event_uses_the_submitted_timezone_not_a_hardcoded_utc(self):
        tomorrow = date.today() + timedelta(days=1)
        self.client.post(
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
                    "user_timezone": "America/New_York",
                }
            ),
            content_type="application/json",
        )

        event = Event.objects.get(user=self.host)
        self.assertEqual(event.timezone, "America/New_York")

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


class BookingDuplicatePreventionTests(TestCase):
    def setUp(self):
        self.host = User.objects.create_user(
            email="host@example.com", password="password123"
        )
        self.tomorrow = date.today() + timedelta(days=1)

    def _book(self, start_time="10:00", end_time="10:30"):
        return self.client.post(
            f"/meet/{self.host.public_id}/book",
            data=json.dumps(
                {
                    "start_date": str(self.tomorrow),
                    "start_time": start_time,
                    "end_date": str(self.tomorrow),
                    "end_time": end_time,
                    "frequencies": "['no']",
                    "title": "Intro call",
                    "email": "guest@example.com",
                    "note": "Looking forward to it",
                    "user_timezone": "UTC",
                }
            ),
            content_type="application/json",
        )

    def test_overlapping_booking_is_rejected_by_default(self):
        first = self._book()
        self.assertEqual(first.status_code, 200)

        second = self._book(start_time="10:15", end_time="10:45")

        self.assertEqual(second.status_code, 400)
        self.assertEqual(Event.objects.filter(user=self.host).count(), 1)

    def test_overlapping_booking_allowed_when_host_opts_in(self):
        schedule = Schedule.objects.create(
            user=self.host, name="Working Hours", timezone="UTC", is_default=True
        )
        ScheduleService.update_booking_rules(schedule, allow_multiple_per_slot=True)

        self._book()
        second = self._book(start_time="10:15", end_time="10:45")

        self.assertEqual(second.status_code, 200)
        self.assertEqual(Event.objects.filter(user=self.host).count(), 2)

    def test_overlapping_booking_rejected_even_with_no_schedule_at_all(self):
        # Default-false path: no Schedule/ScheduleBookingRules exists for this host yet.
        self._book()
        second = self._book(start_time="10:00", end_time="10:30")

        self.assertEqual(second.status_code, 400)
        self.assertEqual(Event.objects.filter(user=self.host).count(), 1)

    def test_non_overlapping_bookings_both_succeed(self):
        first = self._book(start_time="09:00", end_time="09:30")
        second = self._book(start_time="10:00", end_time="10:30")

        self.assertEqual(first.status_code, 200)
        self.assertEqual(second.status_code, 200)
        self.assertEqual(Event.objects.filter(user=self.host).count(), 2)


class BookingCalendarViewTests(TestCase):
    def setUp(self):
        self.host = User.objects.create_user(
            email="host@example.com", password="password123"
        )

    def test_repeat_choices_are_the_three_ui_options(self):
        response = self.client.get(f"/meet/{self.host.public_id}")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.context["repeat_choices"],
            {"no": "Does not repeat", "daily": "Daily", "weekly": "Weekly"},
        )

    def test_day_choices_are_the_seven_days_with_no_no_repeat_entry(self):
        response = self.client.get(f"/meet/{self.host.public_id}")

        day_choices = response.context["day_choices"]
        self.assertNotIn("no", day_choices)
        self.assertEqual(len(day_choices), 7)
        self.assertEqual(day_choices["0"], "Every Sunday")
        self.assertEqual(day_choices["6"], "Every Saturday")


class UserBusinessHoursViewTests(TestCase):
    def setUp(self):
        self.host = User.objects.create_user(
            email="host@example.com", password="password123"
        )

    def test_returns_business_hours_from_the_schedule_weekly_hours(self):
        schedule = Schedule.objects.create(
            user=self.host, name="Working Hours", timezone="UTC", is_default=True
        )
        ScheduleWeeklyHours.objects.create(
            schedule=schedule,
            day_of_week=1,
            start_time=time(9, 0),
            end_time=time(17, 0),
        )

        response = self.client.get(f"/business-hours/{self.host.public_id}")
        data = response.json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["startTime"], "09:00")
        self.assertEqual(data[0]["endTime"], "17:00")
        self.assertEqual(data[0]["daysOfWeek"], [1])

    def test_ignores_stale_legacy_business_hours_events_with_no_schedule(self):
        # Simulates pre-migration data with no corresponding Schedule — the bug being fixed:
        # this endpoint used to read straight from these Event rows regardless of whether the
        # host's Schedule had since moved on.
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
        self.assertEqual(response.json(), [])

    def test_no_schedule_returns_empty_list(self):
        response = self.client.get(f"/business-hours/{self.host.public_id}")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])

    def test_reflects_hours_changed_via_the_schedule_service_immediately(self):
        schedule = Schedule.objects.create(
            user=self.host, name="Working Hours", timezone="UTC", is_default=True
        )
        ScheduleWeeklyHours.objects.create(
            schedule=schedule, day_of_week=1, start_time=time(9, 0), end_time=time(17, 0)
        )

        ScheduleService.replace_weekly_hours(
            schedule,
            [{"day_of_week": 2, "start_time": time(10, 0), "end_time": time(14, 0)}],
        )

        response = self.client.get(f"/business-hours/{self.host.public_id}")
        data = response.json()

        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["daysOfWeek"], [2])
        self.assertEqual(data[0]["startTime"], "10:00")


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

    def test_has_conflicting_booking_true_for_overlap(self):
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

        self.assertTrue(
            AvailabilityService.has_conflicting_booking(
                self.host, self.monday, time(9, 15), self.monday, time(9, 45), "UTC"
            )
        )

    def test_has_conflicting_booking_false_when_no_overlap(self):
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

        self.assertFalse(
            AvailabilityService.has_conflicting_booking(
                self.host, self.monday, time(9, 30), self.monday, time(10, 0), "UTC"
            )
        )

    def test_has_conflicting_booking_respects_buffers(self):
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

        self.assertTrue(
            AvailabilityService.has_conflicting_booking(
                self.host,
                self.monday,
                time(9, 30),
                self.monday,
                time(10, 0),
                "UTC",
                buffer_before_minutes=15,
            )
        )


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


class PublicProfileViewTests(TestCase):
    def setUp(self):
        self.host = User.objects.create_user(
            email="host@example.com",
            password="password123",
            name="Alex Morgan",
            company="Acme Co",
            position="Consultant",
            profile_summary="Helping founders scope their MVP.",
        )

    def test_returns_the_hosts_public_profile(self):
        response = self.client.get(f"/api/v1/event/{self.host.public_id}/public-profile/")

        self.assertEqual(response.status_code, 200)
        profile = response.json()["data"]["profile"]
        self.assertEqual(profile["name"], "Alex Morgan")
        self.assertEqual(profile["company"], "Acme Co")
        self.assertEqual(profile["position"], "Consultant")
        self.assertEqual(profile["profile_summary"], "Helping founders scope their MVP.")

    def test_unknown_public_id_returns_404(self):
        response = self.client.get("/api/v1/event/no-such-user/public-profile/")

        self.assertEqual(response.status_code, 404)


class CreateBookingViewTests(TestCase):
    def setUp(self):
        self.host = User.objects.create_user(
            email="host@example.com", password="password123"
        )
        self.tomorrow = date.today() + timedelta(days=1)

    def _book(self, **overrides):
        payload = {
            "start_date": str(self.tomorrow),
            "start_time": "10:00:00",
            "end_date": str(self.tomorrow),
            "end_time": "10:30:00",
            "title": "Intro call",
            "email": "guest@example.com",
            "note": "Looking forward to it",
            "user_timezone": "UTC",
            "repeat_type": "no",
        }
        payload.update(overrides)
        return self.client.post(
            f"/api/v1/event/{self.host.public_id}/book/",
            data=json.dumps(payload),
            content_type="application/json",
        )

    def test_valid_single_booking_creates_a_public_event(self):
        response = self._book()

        self.assertEqual(response.status_code, 201)
        event = Event.objects.get(user=self.host)
        self.assertEqual(event.type, EventTypes.PUBLIC.value)
        self.assertEqual(event.title, "Intro call")
        self.assertEqual(event.attendees, "guest@example.com")
        self.assertEqual(event.frequency, "")

    def test_weekly_recurring_booking_persists_the_correct_frequency(self):
        response = self._book(
            repeat_type="weekly",
            days=["1", "3"],
            end_recur=str(self.tomorrow + timedelta(days=30)),
        )

        self.assertEqual(response.status_code, 201)
        event = Event.objects.get(user=self.host)
        self.assertEqual(set(event.frequency.split(",")), {"1", "3"})
        self.assertEqual(event.end_recur, self.tomorrow + timedelta(days=30))

    def test_daily_recurring_booking_persists_all_seven_days(self):
        response = self._book(
            repeat_type="daily",
            end_recur=str(self.tomorrow + timedelta(days=30)),
        )

        self.assertEqual(response.status_code, 201)
        event = Event.objects.get(user=self.host)
        self.assertEqual(set(event.frequency.split(",")), {"0", "1", "2", "3", "4", "5", "6"})

    def test_overlapping_booking_rejected_by_default(self):
        first = self._book()
        self.assertEqual(first.status_code, 201)

        second = self._book(start_time="10:15:00", end_time="10:45:00")

        self.assertEqual(second.status_code, 422)
        self.assertEqual(Event.objects.filter(user=self.host).count(), 1)

    def test_overlapping_booking_allowed_when_host_opts_in(self):
        schedule = Schedule.objects.create(
            user=self.host, name="Working Hours", timezone="UTC", is_default=True
        )
        ScheduleService.update_booking_rules(schedule, allow_multiple_per_slot=True)

        self._book()
        second = self._book(start_time="10:15:00", end_time="10:45:00")

        self.assertEqual(second.status_code, 201)
        self.assertEqual(Event.objects.filter(user=self.host).count(), 2)

    def test_weekly_repeat_without_days_is_rejected_with_a_real_error_message(self):
        response = self._book(
            repeat_type="weekly",
            end_recur=str(self.tomorrow + timedelta(days=30)),
        )

        self.assertEqual(response.status_code, 422)
        self.assertIn("days", response.json()["errors"])
        self.assertFalse(Event.objects.exists())

    def test_repeating_booking_without_end_recur_is_rejected(self):
        response = self._book(repeat_type="weekly", days=["1"])

        self.assertEqual(response.status_code, 422)
        self.assertIn("end_recur", response.json()["errors"])

    def test_unknown_public_id_returns_404(self):
        response = self.client.post(
            "/api/v1/event/no-such-user/book/",
            data=json.dumps(
                {
                    "start_date": str(self.tomorrow),
                    "start_time": "10:00:00",
                    "end_date": str(self.tomorrow),
                    "end_time": "10:30:00",
                    "email": "guest@example.com",
                    "user_timezone": "UTC",
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 404)


class BookingInviteServiceTests(TestCase):
    # 2030-01-08 is a Tuesday
    def setUp(self):
        self.host = User.objects.create_user(
            email="host@example.com", password="password123", name="Host Person"
        )

    def _event(self, **overrides):
        fields = {
            "user": self.host,
            "title": "Intro call",
            "start_date": date(2030, 1, 8),
            "start_time": time(10, 0),
            "end_date": date(2030, 1, 8),
            "end_time": time(10, 30),
            "type": EventTypes.PUBLIC.value,
            "note": "Looking forward to it",
            "timezone": "America/New_York",
            "attendees": "guest@example.com",
        }
        fields.update(overrides)
        return Event.objects.create(**fields)

    def _vevent(self, event):
        ics = BookingInviteService.build_ics(event, "Host Person", "host@example.com")
        calendar = Calendar.from_ical(ics)
        return calendar, calendar.walk("VEVENT")[0]

    def test_one_off_booking_is_an_invite_in_the_booking_timezone(self):
        calendar, vevent = self._vevent(self._event())

        self.assertEqual(calendar["METHOD"], "REQUEST")
        self.assertEqual(vevent["UID"], f"{Event.objects.get().id}@metton")
        self.assertEqual(str(vevent["SUMMARY"]), "Intro call")
        self.assertEqual(str(vevent["DESCRIPTION"]), "Looking forward to it")
        self.assertEqual(vevent.decoded("DTSTART").tzinfo.key, "America/New_York")
        self.assertEqual(vevent.decoded("DTSTART").replace(tzinfo=None), datetime(2030, 1, 8, 10, 0))
        self.assertEqual(vevent.decoded("DTEND").replace(tzinfo=None), datetime(2030, 1, 8, 10, 30))
        self.assertNotIn("RRULE", vevent)
        self.assertEqual(
            [str(tz["TZID"]) for tz in calendar.walk("VTIMEZONE")], ["America/New_York"]
        )

    def test_invite_names_the_host_as_organizer_and_the_guest_as_attendee(self):
        _, vevent = self._vevent(self._event())

        self.assertEqual(str(vevent["ORGANIZER"]), "mailto:host@example.com")
        self.assertEqual(vevent["ORGANIZER"].params["CN"], "Host Person")
        self.assertEqual(str(vevent["ATTENDEE"]), "mailto:guest@example.com")
        self.assertEqual(vevent["ATTENDEE"].params["PARTSTAT"], "ACCEPTED")

    def test_untitled_booking_falls_back_to_meeting_with_host(self):
        _, vevent = self._vevent(self._event(title=""))

        self.assertEqual(str(vevent["SUMMARY"]), "Meeting with Host Person")

    def test_weekly_booking_repeats_on_its_days_until_end_recur(self):
        _, vevent = self._vevent(
            self._event(frequency="1,3", end_recur=date(2030, 1, 31))
        )

        rrule = vevent["RRULE"]
        self.assertEqual(rrule["FREQ"], ["WEEKLY"])
        self.assertEqual(rrule["BYDAY"], ["MO", "WE"])
        # end of 31 Jan in New York (EST, UTC-5), expressed in UTC
        self.assertEqual(
            rrule["UNTIL"], [datetime(2030, 2, 1, 4, 59, 59, tzinfo=dt_timezone.utc)]
        )

    def test_weekly_booking_starts_on_the_first_matching_repeat_day(self):
        # Tuesday start, repeating Mon/Wed -> the first real occurrence is Wednesday 9th
        _, vevent = self._vevent(
            self._event(frequency="1,3", end_recur=date(2030, 1, 31))
        )

        self.assertEqual(vevent.decoded("DTSTART").replace(tzinfo=None), datetime(2030, 1, 9, 10, 0))
        self.assertEqual(vevent.decoded("DTEND").replace(tzinfo=None), datetime(2030, 1, 9, 10, 30))

    def test_daily_booking_repeats_on_all_seven_days(self):
        _, vevent = self._vevent(
            self._event(frequency="0,1,2,3,4,5,6", end_recur=date(2030, 1, 31))
        )

        self.assertEqual(
            vevent["RRULE"]["BYDAY"], ["SU", "MO", "TU", "WE", "TH", "FR", "SA"]
        )

    def test_repeat_that_never_occurs_before_end_recur_is_a_one_off(self):
        # Tuesday start, Mondays only, ends Thursday -> no Monday ever falls in range
        _, vevent = self._vevent(
            self._event(frequency="1", end_recur=date(2030, 1, 10))
        )

        self.assertNotIn("RRULE", vevent)
        self.assertEqual(vevent.decoded("DTSTART").replace(tzinfo=None), datetime(2030, 1, 8, 10, 0))


@patch("dashboard.tasks.email_sender.delay")
class BookingConfirmationEmailTests(TestCase):
    def setUp(self):
        self.host = User.objects.create_user(
            email="host@example.com", password="password123", name="Host Person"
        )

    def _book(self, **overrides):
        payload = {
            "start_date": "2030-01-08",
            "start_time": "10:00:00",
            "end_date": "2030-01-08",
            "end_time": "10:30:00",
            "title": "Intro call",
            "email": "guest@example.com",
            "note": "Looking forward to it",
            "user_timezone": "America/New_York",
            "repeat_type": "no",
        }
        payload.update(overrides)
        # Emails are queued on commit; TestCase never commits, so run the callbacks here
        with self.captureOnCommitCallbacks(execute=True):
            return self.client.post(
                f"/api/v1/event/{self.host.public_id}/book/",
                data=json.dumps(payload),
                content_type="application/json",
            )

    def _sent(self, mock_delay):
        """{recipient: (subject, template, context, attachments)} for each queued email."""
        return {
            call.args[1][0]: (call.args[0], call.args[2], call.args[3], call.args[4])
            for call in mock_delay.call_args_list
        }

    def test_booking_emails_the_guest_and_the_host(self, mock_delay):
        response = self._book()

        self.assertEqual(response.status_code, 201)
        sent = self._sent(mock_delay)
        self.assertEqual(set(sent), {"guest@example.com", "host@example.com"})
        self.assertEqual(sent["guest@example.com"][0], "Confirmed: Intro call")
        self.assertEqual(sent["host@example.com"][0], "New booking: Intro call")
        self.assertTrue(sent["guest@example.com"][1].endswith("booking_confirmation_guest.email.html"))
        self.assertTrue(sent["host@example.com"][1].endswith("booking_confirmation_host.email.html"))

    def test_both_emails_carry_the_ics_invite(self, mock_delay):
        self._book()

        event = Event.objects.get(user=self.host)
        for _, _, _, attachments in self._sent(mock_delay).values():
            [(filename, content, mimetype)] = attachments
            self.assertEqual(filename, "invite.ics")
            self.assertEqual(mimetype, "text/calendar; method=REQUEST; charset=UTF-8")
            vevent = Calendar.from_ical(content).walk("VEVENT")[0]
            self.assertEqual(vevent["UID"], f"{event.id}@metton")

    def test_guest_sees_their_timezone_and_host_sees_their_schedule_timezone(self, mock_delay):
        Schedule.objects.create(
            user=self.host, name="Working Hours", timezone="Europe/London", is_default=True
        )

        self._book()

        sent = self._sent(mock_delay)
        self.assertEqual(
            sent["guest@example.com"][2]["when"],
            "Tuesday, 8 January 2030, 10:00 – 10:30 (America/New_York)",
        )
        self.assertEqual(
            sent["host@example.com"][2]["when"],
            "Tuesday, 8 January 2030, 15:00 – 15:30 (Europe/London)",
        )

    def test_host_without_a_schedule_sees_the_booking_timezone(self, mock_delay):
        self._book()

        self.assertEqual(
            self._sent(mock_delay)["host@example.com"][2]["when"],
            "Tuesday, 8 January 2030, 10:00 – 10:30 (America/New_York)",
        )

    def test_repeating_booking_describes_the_repeat_and_first_occurrence(self, mock_delay):
        self._book(repeat_type="weekly", days=["1", "3"], end_recur="2030-01-31")

        context = self._sent(mock_delay)["guest@example.com"][2]
        self.assertEqual(context["repeats"], "Every Monday, Wednesday until 31 January 2030")
        self.assertTrue(context["when"].startswith("Wednesday, 9 January 2030"))

    def test_rejected_booking_sends_no_email(self, mock_delay):
        self._book()
        mock_delay.reset_mock()

        response = self._book(start_time="10:15:00", end_time="10:45:00")

        self.assertEqual(response.status_code, 422)
        mock_delay.assert_not_called()

    def test_email_failure_does_not_fail_the_saved_booking(self, mock_delay):
        mock_delay.side_effect = ConnectionError("broker down")

        with self.assertLogs("event.utils", level="ERROR"):
            response = self._book()

        self.assertEqual(response.status_code, 201)
        self.assertTrue(Event.objects.filter(user=self.host).exists())


class EmailServiceAttachmentTests(TestCase):
    def test_attachments_are_added_to_the_sent_email(self):
        EmailService.push(
            subject="Confirmed: Intro call",
            recipients=["guest@example.com"],
            template="event/emails/booking_confirmation_guest.email.html",
            context={"host_name": "Host Person", "title": "Intro call"},
            attachments=[["invite.ics", "BEGIN:VCALENDAR\r\nEND:VCALENDAR\r\n", "text/calendar"]],
        )

        [message] = mail.outbox
        self.assertEqual(message.to, ["guest@example.com"])
        self.assertEqual(message.attachments[0][0], "invite.ics")
        self.assertEqual(message.attachments[0][2], "text/calendar")
        self.assertEqual(message.alternatives[0][1], "text/html")

    def test_no_attachments_still_sends_html_email(self):
        EmailService.push(
            subject="Hello",
            recipients="guest@example.com",
            template="event/emails/booking_confirmation_guest.email.html",
            context={"host_name": "Host Person", "title": "Intro call"},
        )

        [message] = mail.outbox
        self.assertEqual(message.attachments, [])
        self.assertIn("Host Person", message.alternatives[0][0])


class RecurringBookingConflictTests(TestCase):
    # 2030-01-07 is a Monday, 2030-01-08 a Tuesday
    def setUp(self):
        self.host = User.objects.create_user(
            email="host@example.com", password="password123"
        )

    def _existing(self, **overrides):
        fields = {
            "user": self.host,
            "title": "Existing booking",
            "type": EventTypes.PUBLIC.value,
            "start_date": date(2030, 1, 7),
            "start_time": time(10, 0),
            "end_date": date(2030, 1, 7),
            "end_time": time(10, 30),
            "timezone": "UTC",
        }
        fields.update(overrides)
        return Event.objects.create(**fields)

    def _conflicts(self, start_date, frequency="", end_recur=None, start="10:00", end="10:30"):
        return AvailabilityService.has_conflicting_booking(
            self.host,
            start_date,
            time.fromisoformat(start),
            start_date,
            time.fromisoformat(end),
            "UTC",
            frequency=frequency,
            end_recur=end_recur,
        )

    def test_later_occurrence_of_an_existing_weekly_booking_blocks_a_one_off(self):
        self._existing(frequency="1", end_recur=date(2030, 2, 28))

        # Three Mondays after the existing booking started
        self.assertTrue(self._conflicts(date(2030, 1, 28)))

    def test_existing_weekly_booking_does_not_block_its_off_days(self):
        self._existing(frequency="1", end_recur=date(2030, 2, 28))

        self.assertFalse(self._conflicts(date(2030, 1, 29)))  # Tuesday

    def test_existing_weekly_booking_blocks_its_end_recur_date(self):
        self._existing(frequency="1", end_recur=date(2030, 1, 28))

        self.assertTrue(self._conflicts(date(2030, 1, 28)))
        self.assertFalse(self._conflicts(date(2030, 2, 4)))

    def test_new_weekly_booking_clashing_on_a_later_occurrence_is_rejected(self):
        self._existing(start_date=date(2030, 1, 21), end_date=date(2030, 1, 21))

        self.assertTrue(
            self._conflicts(date(2030, 1, 7), frequency="1", end_recur=date(2030, 1, 31))
        )

    def test_new_weekly_booking_ignores_its_start_date_when_it_is_not_a_repeat_day(self):
        # Existing one-off on Tuesday 8th; new booking starts that Tuesday but only
        # repeats on Mondays, so it never actually occupies the 8th
        self._existing(start_date=date(2030, 1, 8), end_date=date(2030, 1, 8))

        self.assertFalse(
            self._conflicts(date(2030, 1, 8), frequency="1", end_recur=date(2030, 1, 31))
        )

    def test_two_weekly_bookings_on_different_days_do_not_clash(self):
        self._existing(frequency="1", end_recur=date(2030, 3, 31))

        self.assertFalse(
            self._conflicts(date(2030, 1, 8), frequency="2,4", end_recur=date(2030, 3, 31))
        )

    def test_api_rejects_a_one_off_on_a_later_occurrence_of_a_weekly_booking(self):
        self._existing(frequency="1", end_recur=date(2030, 2, 28))

        response = self.client.post(
            f"/api/v1/event/{self.host.public_id}/book/",
            data=json.dumps(
                {
                    "start_date": "2030-01-28",
                    "start_time": "10:00:00",
                    "end_date": "2030-01-28",
                    "end_time": "10:30:00",
                    "email": "guest@example.com",
                    "user_timezone": "UTC",
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 422)
        self.assertEqual(Event.objects.filter(user=self.host).count(), 1)

    def test_available_slots_exclude_later_occurrences_of_a_weekly_booking(self):
        schedule = Schedule.objects.create(
            user=self.host, name="Working Hours", timezone="UTC", is_default=True
        )
        ScheduleWeeklyHours.objects.create(
            schedule=schedule, day_of_week=MONDAY, start_time=time(9, 0), end_time=time(10, 0)
        )
        monday = _next_occurrence(MONDAY)
        # Started two weeks ago, so `monday` is only reached through the repeat
        self._existing(
            start_date=monday - timedelta(weeks=2),
            end_date=monday - timedelta(weeks=2),
            start_time=time(9, 0),
            end_time=time(9, 30),
            frequency=str(MONDAY),
            end_recur=monday + timedelta(weeks=4),
        )

        slots = AvailabilityService.get_available_slots(
            schedule, monday, monday, duration_minutes=30
        )

        self.assertEqual([(slot["start"].hour, slot["start"].minute) for slot in slots], [(9, 30)])


class CalendarEventDataTests(TestCase):
    def test_end_recur_is_sent_as_the_day_after_because_fullcalendar_excludes_it(self):
        host = User.objects.create_user(email="host@example.com", password="password123")
        event = Event.objects.create(
            user=host,
            title="Weekly",
            type=EventTypes.PUBLIC.value,
            start_date=date(2030, 1, 7),
            start_time=time(10, 0),
            end_date=date(2030, 1, 7),
            end_time=time(10, 30),
            timezone="UTC",
            frequency="1",
            end_recur=date(2030, 1, 28),
        )

        [data] = EventService.prep_event_data([event])

        self.assertEqual(data["endRecur"], date(2030, 1, 29))
