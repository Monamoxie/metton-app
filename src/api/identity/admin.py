from django.contrib import admin
from identity.models import User, VerificationToken

# Register your models here.
admin.site.register(User)
admin.site.register(VerificationToken)
