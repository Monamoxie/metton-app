from django.views import View
from django.contrib.auth import logout
from django.contrib import messages
from django.shortcuts import redirect


class LogoutView(View):
    def post(self, request):
        logout(request)
        messages.success(request, "Goodbye! See you soon")
        return redirect("index")
