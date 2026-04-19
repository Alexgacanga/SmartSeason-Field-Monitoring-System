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

    class Meta:
        model = Field
        fields = [
            'id', 'name', 'crop_type', 'planting_date', 'current_stage', 
            'agent', 'agent_name', 'status', 'created_at', 'recent_updates'
        ]