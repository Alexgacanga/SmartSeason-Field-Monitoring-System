from rest_framework import serializers
from .models import Field, FieldUpdate, UserProfile, User

class FieldUpdateSerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.CharField(source='recorded_by.username', read_only=True)

    class Meta:
        model = FieldUpdate
        fields = ['id', 'notes', 'stage_at_time', 'requires_attention', 'recorded_at', 'recorded_by_name']
        read_only_fields = ['recorded_at', 'recorded_by']

class FieldSerializer(serializers.ModelSerializer):
    status = serializers.CharField(source='computed_status', read_only=True) 
    agent_name = serializers.CharField(source='agent.username', read_only=True)
    recent_updates = FieldUpdateSerializer(source='updates', many=True, read_only=True)
    
    latest_observation = serializers.SerializerMethodField()
    last_updated = serializers.SerializerMethodField()

    class Meta:
        model = Field
        fields = [
            'id', 'name', 'crop_type', 'planting_date', 'current_stage', 
            'agent', 'agent_name', 'status', 'created_at', 'recent_updates',
            'latest_observation', 'last_updated'
        ]

    def get_latest_observation(self, obj):
        try:
            # We try both common naming patterns to prevent the 500 crash
            updates = getattr(obj, 'updates', getattr(obj, 'fieldupdate_set', None))
            if updates:
                last_update = updates.order_by('-recorded_at').first()
                return last_update.notes if last_update else "No updates yet"
            return "No updates yet"
        except Exception as e:
            return f"Update info unavailable"

    def get_last_updated(self, obj):
        try:
            updates = getattr(obj, 'updates', getattr(obj, 'fieldupdate_set', None))
            if updates:
                last_update = updates.order_by('-recorded_at').first()
                return last_update.recorded_at if last_update else None
            return None
        except Exception:
            return None