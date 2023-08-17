from django import forms


class RegisterForm(forms.Form):
    username = forms.CharField(required=True, min_length=4, max_length=16, strip=True)
    email = forms.EmailField(
        required=True,
        widget=forms.TextInput(
            attrs={
                "class": "form-control",
                "placeholder": "Please enter a valid email address",
            }
        ),
    )
