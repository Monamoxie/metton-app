from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.messages.views import SuccessMessageMixin
from django.views.generic.edit import UpdateView
from django.contrib import messages
from django.urls import reverse_lazy
from django.contrib.messages.views import SuccessMessageMixin
from dashboard.forms import PasswordUpdateForm


class PasswordUpdateView(LoginRequiredMixin, SuccessMessageMixin, UpdateView):
    """
    Handles User password updating
    """

    form_class = PasswordUpdateForm
    template_name = "dashboard/password_update.html"
    success_message = "Password update was successful!"
    success_url = reverse_lazy("password_update")

    def get_object(self):
        return self.request.user

    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()

        # Necessary because great-grand base class, forms.Form, does not take instance as an argument
        kwargs.pop("instance")

        kwargs["request"] = self.request
        kwargs["user"] = self.request.user

        return kwargs

    def form_valid(self, form):
        form.save()
        return super().form_valid(form)

    def form_invalid(self, form):
        messages.error(self.request, form.errors)
        return super().form_invalid(form)
