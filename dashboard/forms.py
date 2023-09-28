from django import forms
from django.contrib.auth import get_user_model


class EditProfileForm(forms.ModelForm):
    name = forms.CharField(label="Name")
    # company = forms.CharField(label="Company Name")
    # position = forms.CharField(label="Company Position")
    # about_you = forms.CharField(widget=forms.Textarea)

    class Meta:
        model = get_user_model()
        exclude = ("user",)
        fields = ["name", "company", "position", "profile_summary"]
