from django.test import TestCase

from identity.models.user import User


class DashboardViewTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="user@example.com", password="password123"
        )

    def test_renders_for_a_logged_in_user(self):
        self.client.force_login(self.user)

        response = self.client.get("/dashboard/")

        self.assertEqual(response.status_code, 200)

    def test_redirects_anonymous_user_to_signin(self):
        response = self.client.get("/dashboard/")

        self.assertEqual(response.status_code, 302)
        self.assertIn("/identity/signin", response.url)
