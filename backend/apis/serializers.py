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
from subscriptions.models import Subscriptions
from orders.models import Orders, Order_items
from items.models import Items 
import datetime
from plans.models import Plans

from dj_rest_auth.registration.serializers import RegisterSerializer
from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.utils import timezone
import uuid

User = get_user_model()

class CustomUserRegisterSerializer(RegisterSerializer):
    fullname = serializers.CharField(required=True)
    phone = serializers.CharField(required=True)
    business_name = serializers.CharField(required=False)  # Optional business name field

    class Meta:
        model = User
        fields = ('fullname', 'username', 'email', 'password1', 'password2', 'phone', 'business_name')

    def save(self, request):
        user = super().save(request)
        user.fullname = self.validated_data.get('fullname', '')
        user.phone = self.validated_data.get('phone', '')
        user.save()
        
        # Create business if business_name is provided
        business_name = self.validated_data.get('business_name')
        if business_name:
            import time
            registration_number = f"BMS{int(time.time())}"
            
            try:
                from business.models import Business
                business = Business.objects.create(
                    name=business_name,
                    contact_number=user.phone,
                    registration_number=registration_number,
                    owner=user
                )
                
                # Update user's business field - fetch fresh instance
                from django.contrib.auth import get_user_model
                User = get_user_model()
                user_obj = User.objects.get(id=user.id)
                user_obj.business = business
                user_obj.save(update_fields=['business'])  # Force update specific field
                print(f"Business created: {business.name}, ID: {business.id}")
                print(f"Updated user {user.username} business reference to: {business.name} (ID: {business.id})")
                
                # Create a trial subscription
                try:
                    # Get the first active plan as the default trial plan
                    default_plan = Plans.objects.filter(is_active=True).first()
                    if default_plan:
                        today = timezone.now().date()
                        trial_end_date = today + datetime.timedelta(days=14)
                        
                        Subscriptions.objects.create(
                            business=business,
                            plan=default_plan,
                            start_date=today,
                            end_date=trial_end_date,
                            subscription_status='TRIAL',
                            is_trial=True
                        )
                        print(f"Trial subscription created for business: {business.name}")
                except Exception as e:
                    print(f"Error creating trial subscription: {e}")
                    
            except Exception as e:
                print(f"Error creating business during registration: {e}")
        
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
        print(f"Validating business data: {data}")
        
        # Check if registration number is provided or use dynamic one
        if not data.get('registration_number'):
            import time
            data['registration_number'] = f"BMS{int(time.time())}"
            print(f"Generated registration number: {data['registration_number']}")
        elif data.get('registration_number') == 'UnRegistered':
            raise serializers.ValidationError("Please provide a valid registration number.")
            
        return data

    def create(self, validated_data):
        request = self.context.get('request')
        print(f"Creating business from validated data: {validated_data}")
        
        if request and not validated_data.get('owner'):
            print(f"Setting owner to requesting user: {request.user.username}")
            validated_data['owner'] = request.user
        
        # Create the business
        try:
            business = Business.objects.create(**validated_data)
            print(f"Business created successfully: {business.name} (ID: {business.id})")
            
            # Ensure user's business reference is updated
            if request and request.user:
                request.user.business = business
                request.user.save()
                print(f"Updated user {request.user.username} business reference")
                
            return business
        except Exception as e:
            print(f"Error creating business: {e}")
            raise serializers.ValidationError(f"Failed to create business: {str(e)}")


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


class UserOperationSerializer(serializers.ModelSerializer):
    branch_name = serializers.SerializerMethodField()
    business_branch = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'fullname', 'phone', 'role', 
                  'business_branch', 'branch_name', 'is_active', 
                  'created_at', 'updated_at']
    
    def get_branch_name(self, obj):
        try:
            if hasattr(obj, 'business_branch') and obj.business_branch:
                return obj.business_branch.name
            return None
        except Exception as e:
            print(f"Error getting branch name for user {obj.id}: {e}")
            return None
    
    def to_representation(self, instance):
        """Ensure all fields are properly included in the serialized output"""
        representation = super().to_representation(instance)
        
        # Explicitly ensure business_branch is included
        if hasattr(instance, 'business_branch') and instance.business_branch:
            representation['business_branch'] = instance.business_branch.id
            representation['branch_name'] = instance.business_branch.name
        else:
            representation['business_branch'] = None
            representation['branch_name'] = None
            
        # Debug output
        print(f"Serializing user {instance.id}, fields: {representation.keys()}")
        
        return representation

class ExpenseOperationSerializer(serializers.ModelSerializer):
    branch_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    frequency = serializers.CharField(source='recurring_frequency', required=False)
    active = serializers.BooleanField(source='is_active', required=False)
    
    class Meta:
        model = Expenses
        fields = ['id', 'name', 'amount', 'description', 'expense_date', 'payment_method',
                  'receipt_number', 'frequency', 'recurring_frequency', 'recurring_end_date',
                  'business', 'business_branch', 'branch_name', 'created_by', 
                  'created_by_name', 'created_at', 'updated_at', 'active', 'is_active']
    
    def get_branch_name(self, obj):
        return obj.business_branch.name if obj.business_branch else None
        
    def get_created_by_name(self, obj):
        return obj.created_by.fullname if obj.created_by else None
    

class OrderItemSerializer(serializers.ModelSerializer):
    item_name = serializers.SerializerMethodField()
    category_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Order_items
        fields = ['id', 'quantity', 'unit_price', 'subtotal', 'item', 'item_name', 
                  'category', 'category_name', 'created_at', 'updated_at']
    
    def get_item_name(self, obj):
        return obj.item.name if obj.item else None
        
    def get_category_name(self, obj):
        return obj.category.name if obj.category else None

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True, source='order_items_set')
    created_by_name = serializers.SerializerMethodField()
    branch_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Orders
        fields = ['id', 'order_number', 'customer_name', 'customer_phone', 'customer_email',
                  'order_date', 'status', 'total_amount', 'payment_status', 'payment_method',
                  'paid_amount', 'remaining_amount', 'created_at', 'updated_at', 
                  'business', 'business_branch', 'branch_name', 'user', 'created_by_name', 'items']
    
    def get_created_by_name(self, obj):
        return obj.user.fullname if obj.user else None
        
    def get_branch_name(self, obj):
        return obj.business_branch.name if obj.business_branch else None