from rest_framework import serializers
from business.models import Business
from dj_rest_auth.registration.serializers import RegisterSerializer
from django.contrib.auth import get_user_model

class BusinessModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Business
        fields = ('name', 'description', 'website', 'created_at', 'updated_at')

class CustomRegisterSerializer(RegisterSerializer):
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    class Meta:
        model = get_user_model()
        fields = ('first_name', 'last_name', 'username', 'email', 'password1', 'password2')

    def save(self, request):
        user = super().save(request)
        user.first_name = self.validated_data.get('first_name', '')
        user.last_name = self.validated_data.get('last_name', '')
        user.save()
        return user
