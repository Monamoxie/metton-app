from dashboard.forms import ProfileUpdateForm
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic.edit import UpdateView
from django.urls import reverse_lazy
from django.contrib.messages.views import SuccessMessageMixin


class ProfileUpdateView(LoginRequiredMixin, SuccessMessageMixin, UpdateView):
    form_class = ProfileUpdateForm
    template_name = "dashboard/profile_update.html"
    success_message = "Profile updated..."

    def get_object(self):
        """
        Override the default. Inherited from
        UpdateView -> BaseUpdateView -> ModelFormMixin -> SingleObjectMixin
        """

        return self.request.user

    def get_success_url(self):
        """
        Override the default. Inherited from
        UpdateView -> BaseUpdateView -> ModelFormMixin -> FormMixin
        """

        return reverse_lazy("profile_update")

    def form_invalid(self, form):
        """
        Override the default. Inherited from
        UpdateView -> BaseUpdateView -> ModelFormMixin -> FormMixin
        """

        messages.error(self.request, form.errors)
        return super().form_invalid(form)
