from django.contrib.auth.forms import PasswordChangeForm
from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth import update_session_auth_hash


class PasswordUpdateForm(PasswordChangeForm):

    class Meta:
        model = get_user_model()
        fields = []

    def __init__(self, *args, request=None, user=None, **kwargs):
        self.request = request
        self.user = user

        super().__init__(user=self.user, *args, **kwargs)

        self.fields["old_password"].widget = forms.PasswordInput(
            attrs={"placeholder": "Existing Password"}
        )
        self.fields["new_password1"].widget = forms.PasswordInput(
            attrs={"placeholder": "New Password"}
        )
        self.fields["new_password2"].widget = forms.PasswordInput(
            attrs={"placeholder": "Confirm New Password"}
        )

        self.fields["old_password"].label = "Current Password"
        self.fields["new_password1"].label = "Choose a new password"
        self.fields["new_password2"].label = "Confirm your new password"

    def clean_password2(self):
        password2 = self.cleaned_data.get("new_password2", None)
        if password2 != self.cleaned_data.get("new_password1"):
            raise forms.ValidationError("Password 1 and 2 does not match")

        return password2

    def save(self, commit=True):
        self.user.set_password(self.cleaned_data["new_password1"])

        if commit:
            self.user.save()
            update_session_auth_hash(self.request, self.user)

        return self.user
