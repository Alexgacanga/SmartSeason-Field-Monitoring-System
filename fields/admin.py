from django.contrib import admin
from .models import CropStage, FieldUpdate, UserProfile, UserRole, Field, FieldUpdate

admin.site.register(UserProfile)
admin.site.register(Field)
admin.site.register(FieldUpdate)