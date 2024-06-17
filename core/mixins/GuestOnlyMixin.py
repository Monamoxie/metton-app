from django.contrib.auth.mixins import UserPassesTestMixin
from django.http import HttpRequest
from django.shortcuts import redirect


class GuestOnlyMixin(UserPassesTestMixin):
    request: HttpRequest

    def test_func(self) -> bool:
        return not self.request.user.is_authenticated

    def handle_no_permission(self):
        return redirect("dashboard")
