import json
from datetime import date, time, timedelta

from django.test import TestCase

from event.enums import EventTypes
from event.models import Event
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
