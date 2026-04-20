from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta

# Define choices for clean data enforcement
class UserRole(models.TextChoices):
    ADMIN = 'ADMIN', 'Coordinator (Admin)'
    AGENT = 'AGENT', 'Field Agent'

class CropStage(models.TextChoices):
    PLANTED = 'PLANTED', 'Planted'
    GROWING = 'GROWING', 'Growing'
    READY = 'READY', 'Ready for Harvest'
    HARVESTED = 'HARVESTED', 'Harvested'

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=10, choices=UserRole.choices, default=UserRole.AGENT)

    def __str__(self):
        return f"{self.user.username} - {self.role}"

class Field(models.Model):
    name = models.CharField(max_length=255)
    crop_type = models.CharField(max_length=100)
    planting_date = models.DateField()
    current_stage = models.CharField(max_length=20, choices=CropStage.choices, default=CropStage.PLANTED)
    agent = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='assigned_fields')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def computed_status(self):
        if self.current_stage == CropStage.HARVESTED:
            return 'Completed'

        latest_update = self.updates.order_by('-recorded_at').first()

        if latest_update:
            # Use timezone.now() for both to ensure they are both 'aware'
            now = timezone.now()
            diff = now - latest_update.recorded_at
            
            if diff.days > 7 or latest_update.requires_attention:
                return 'At Risk'
        else:
            # Logic for no updates since planting
            days_since_planting = (timezone.now().date() - self.planting_date).days
            if days_since_planting > 7:
                 return 'At Risk'

        return 'Active'

    def __str__(self):
        return f"{self.name} ({self.crop_type})"

class FieldUpdate(models.Model):
    field = models.ForeignKey(Field, on_delete=models.CASCADE, related_name='updates')
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    notes = models.TextField()
    stage_at_time = models.CharField(max_length=20, choices=CropStage.choices)
    requires_attention = models.BooleanField(default=False, help_text="Agent can flag if there's an issue (e.g., pests, drought)")
    recorded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Update for {self.field.name} on {self.recorded_at.strftime('%Y-%m-%d')}"