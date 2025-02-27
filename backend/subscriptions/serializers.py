# subscriptions/serializers.py

from rest_framework import serializers
from .models import Subscriptions
from plans.models import Plans

class SubscriptionSerializer(serializers.ModelSerializer):
    plan_name = serializers.SerializerMethodField()
    days_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = Subscriptions
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at')
    
    def get_plan_name(self, obj):
        return obj.plan.name_en
    
    def get_days_remaining(self, obj):
        from django.utils import timezone
        import datetime
        today = timezone.now().date()
        if today > obj.end_date:
            return 0
        return (obj.end_date - today).days