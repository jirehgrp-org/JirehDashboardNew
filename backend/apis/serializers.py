from rest_framework import serializers
from business.models import Business

class BusinessModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Business
        fields = ('name', 'description', 'website', 'created_at', 'updated_at')