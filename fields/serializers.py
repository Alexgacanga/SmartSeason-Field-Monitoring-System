from rest_framework import serializers
from .models import Field, FieldUpdate, UserProfile, User

class FieldUpdateSerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.CharField(source='recorded_by.username', read_only=True)

    class Meta:
        model = FieldUpdate
        fields = ['id', 'notes', 'stage_at_time', 'requires_attention', 'recorded_at', 'recorded_by_name']
        read_only_fields = ['recorded_at', 'recorded_by']

class FieldSerializer(serializers.ModelSerializer):
    # This automatically pulls the @property method from the model
    status = serializers.CharField(source='computed_status', read_only=True) 
    agent_name = serializers.CharField(source='agent.username', read_only=True)
    recent_updates = FieldUpdateSerializer(source='updates', many=True, read_only=True)
    latest_observation = serializers.SerializerMethodField()
    last_updated = serializers.SerializerMethodField()

    class Meta:
        model = Field
        fields = [
            'id', 'name', 'crop_type', 'planting_date', 'current_stage', 
            'agent', 'agent_name', 'status', 'created_at', 'recent_updates'
        ]
    def get_latest_observation(self, obj):
        try:
            last_update = obj.updates.order_by('-recorded_at').first() 
            return last_update.notes if last_update else "No updates yet"
        except Exception:
            return "No updates yet"

    def get_last_updated(self, obj):
        last_update = obj.updates.order_by('-recorded_at').first()
        return last_update.recorded_at if last_update else None