import os
from django import forms
from django.contrib.auth import get_user_model


class EditProfileForm(forms.ModelForm):
    class Meta:
        model = get_user_model()
        exclude = ("user",)
        fields = ["name", "company", "position", "profile_summary", "profile_photo"]

    def clean_profile_photo(self):
        profile_photo = self.cleaned_data.get("profile_photo", None)
        if profile_photo:
            if profile_photo.content_type not in [
                "image/jpeg",
                "image/jpg",
                "image/png",
            ]:
                raise forms.ValidationError(
                    "Only jpg, jpeg and png formats are supported"
                )
            elif (profile_photo.size / 1000) > 5000:
                raise forms.ValidationError("Photo size should not be more than 5 MB")

        return profile_photo


class ChangePasswordForm(forms.ModelForm):
    existing_password = forms.CharField(
        label="Please enter existing password",
        widget=forms.PasswordInput(
            attrs={
                "class": "form-control",
                "password": "password",
                "placeholder": "Create Password",
            }
        ),
    )

    password1 = forms.CharField(
        label="Choose a new password",
        widget=forms.PasswordInput(
            attrs={
                "class": "form-control",
                "password": "password",
                "placeholder": "Create Password",
            }
        ),
    )

    password2 = forms.CharField(
        label="Confirm your new password",
        widget=forms.PasswordInput(
            attrs={
                "class": "form-control",
                "password": "password",
                "placeholder": "Confirm Password",
            }
        ),
    )

    def clean_password2(self):
        password2 = self.cleaned_data.get("password2", None)
        if password2 != self.cleaned_data.get("password1"):
            raise forms.ValidationError("Password 1 and 2 does not match")

        return password2

    def clean_existing_password(self):
        existing_password = self.cleaned_data.get("existing_password")
        if self.instance.check_password(existing_password) is not True:
            raise forms.ValidationError("The existing password does not match")

        return existing_password

    class Meta:
        model = get_user_model()
        exclude = ("user",)
        fields = []
