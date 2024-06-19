from django import forms
from django.contrib.auth import get_user_model
from dashboard.enums import ImageUploadTypes


class ProfileUpdateForm(forms.ModelForm):
    MAX_PHOTO_SIZE_KB = 5000

    class Meta:
        model = get_user_model()
        exclude = ("user",)
        fields = ["name", "company", "position", "profile_summary", "profile_photo"]

    def clean_profile_photo(self):
        profile_photo = self.cleaned_data.get("profile_photo", None)
        if profile_photo and hasattr(profile_photo, "content_type"):
            if profile_photo.content_type not in ImageUploadTypes.get_values():
                raise forms.ValidationError(
                    f"Only {ImageUploadTypes.get_names_as_string()} formats are supported"
                )
            elif (profile_photo.size / 1024) > self.MAX_PHOTO_SIZE_KB:
                raise forms.ValidationError("Photo size should not be more than 5 MB")

        return profile_photo
