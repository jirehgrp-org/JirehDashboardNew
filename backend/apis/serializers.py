# apis/serializers.py

from rest_framework import serializers
from business.models import Business
from items.models import Items
from categories.models import Categories
from expenses.models import Expenses
from features.models import Features
from orders.models import Orders
from orders.models import Order_items
from plans.models import Plans
from branches.models import Branches
from dj_rest_auth.registration.serializers import RegisterSerializer
from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class CustomUserRegisterSerializer(RegisterSerializer):
    fullname = serializers.CharField(required=True)
    phone = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ('fullname', 'username', 'email', 'password1', 'password2', 'phone')

    def save(self, request):
        user = super().save(request)
        user.fullname = self.validated_data.get('fullname', '')
        user.phone = self.validated_data.get('phone', '')
        user.save()
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'fullname', 'phone', 'role', 'is_active']

class BusinessRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Business
        fields = [
            'name',
            'address_street',
            'address_city',
            'address_country',
            'contact_number',
            'registration_number',
            'owner',
            'admin',
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, data):
        
        if data.get('registration_number') == 'UnRegistered':
            raise serializers.ValidationError("Please provide a valid registration number.")
        return data

    def create(self, validated_data):
        request = self.context.get('request')
        if request:
            if not validated_data.get('owner'):
                validated_data['owner'] = request.user
                
        business = Business.objects.create(**validated_data)
        return business


class BusinessModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Business
        fields = ('name', 'contact_number', 'created_at', 'updated_at')

class BusinessBranchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Branches
        fields = ('id', 'name', 'address', 'contact_number', 'business', 'is_active', 'created_at', 'updated_at')

class ItemsBranchSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField()
    branch_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Items
        fields = ['id', 'name', 'price', 'quantity', 'category', 'category_name', 
                 'business_branch', 'branch_name', 'is_active', 'unit_of_measure', 
                 'created_at', 'updated']
    
    def get_category_name(self, obj):
        return obj.category.name if obj.category else None
    
    def get_branch_name(self, obj):
        return obj.business_branch.name if obj.business_branch else None

class CategoriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categories
        fields = "__all__"

class BusinessExpensesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expenses
        fields = "__all__"

class FeaturesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Features
        fields = "__all__"

class BusinessBranchOrdersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Orders
        fields = "__all__"

class PlansSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plans
        fields = "__all__"
