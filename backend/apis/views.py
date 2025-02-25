# apis/views.py

from django.shortcuts import render

# Create your views here.

from dj_rest_auth.registration.views import RegisterView
from business.models import Business
from branches.models import Branches
from items.models import Items
from expenses.models import Expenses
from features.models import Features
from plans.models import Plans
from orders.models import Orders
from orders.models import Order_items
from rest_framework import viewsets, status
from rest_framework import permissions
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import (BusinessRegistrationSerializer, BusinessModelSerializer, 
                          CustomUserRegisterSerializer, UserSerializer, 
                          BusinessBranchSerializer, ItemsBranchSerializer, 
                          BusinessExpensesSerializer, FeaturesSerializer,
                          BusinessBranchOrdersSerializer, PlansSerializer)
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.permissions import IsOwnerOrAdmin, IsAdminOrOwnerOrManager, IsAdmin, IsManager,IsSales,IsWarehouse
from django.http import Http404
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import generics
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from categories.models import Categories
from .serializers import CategoriesSerializer


class BusinessAPIViewSet(viewsets.ModelViewSet):
    queryset = Business.objects.all()
    serializer_class = BusinessModelSerializer
    # permission_classes = [permissions.IsAuthenticated]
    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

@method_decorator(csrf_exempt, name='dispatch')
class BusinessRegisterAPIView(generics.CreateAPIView):
    # queryset = Business.objects.all()
    serializer_class = BusinessRegistrationSerializer
    authentication_classes = [JWTAuthentication]

    def perform_create(self, serializer):
        # If you want to enforce that the owner/admin come from the authenticated user,
        # you can also pass the request to the serializer context here.
        
        serializer.save()


class CustomUserRegisterAPIView(RegisterView):
    serializer_class = CustomUserRegisterSerializer

class UserProfileView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminOrOwnerOrManager]

    def get_object(self, user_id=None):
        if user_id:
            try:
                user = User.objects.get(id=user_id)
                return user
            except User.DoesNotExist:
                raise Http404
        return self.request.user

    def get(self, request, user_id=None):
        user = self.get_object(user_id)
        
        data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'fullname': user.fullname,
            'role': user.role,
            'phone': user.phone,
            'is_active': user.is_active,
            'created_at': user.created_at,
            'last_login': user.last_login,
            'updated_at': user.updated_at
        }
        return Response(data, status=status.HTTP_200_OK)

    def put(self, request, user_id=None):
        user = self.get_object(user_id)
        data = request.data
        
        # Update user fields
        user.fullname = data.get('fullname', user.fullname)
        user.email = data.get('email', user.email)
        user.role = data.get('role', user.role)
        user.phone = data.get('phone', user.phone)
        
        # If username is provided and different, update it
        new_username = data.get('username')
        if new_username and new_username != user.username:
            # Check if username is already taken
            if User.objects.filter(username=new_username).exists():
                return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)
            user.username = new_username
        
        user.save()
        
        response_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'fullname': user.fullname,
            'role': user.role,
            'phone': user.phone,
            'is_active': user.is_active,
            'created_at': user.created_at,
            'last_login': user.last_login,
            'updated_at': user.updated_at
        }
        return Response(response_data, status=status.HTTP_200_OK)
    
    def delete(self, request, user_id=None):
        if user_id is None:
            return Response({"error": "Cannot delete current user"}, status=status.HTTP_400_BAD_REQUEST)
        
        user = self.get_object(user_id)
        
        # Safety check to prevent deleting yourself
        if user.id == request.user.id:
            return Response({"error": "Cannot delete yourself"}, status=status.HTTP_400_BAD_REQUEST)
        
        user.delete()
        return Response({"message": "User deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

    # def get(self, request):
    #     return Response({'message': 'You are authed Manager or Admin'})

class BusinessRelatedUsersView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminOrOwnerOrManager]

    def get(self, request):
        user = request.user
        # print(user)
        business = user.business_branch
        # print(business)
        if business is None:
            return Response({'error': 'User is not registered with any business'}, status=status.HTTP_400_BAD_REQUEST)
        users = business.customuser_set.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        # users = business.owner.all()
        # print(users)
        # serializer = UserSerializer(users, many=True)
        # return Response(serializer.data, status=status.HTTP_200_OK)

        return Response({'GET-message': 'business related users view'}, status=status.HTTP_200_OK)
    def post(self, request):
        return Response({'POST-message': 'Business related users view'}, status=status.HTTP_200_OK)

class BusinessListAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminOrOwnerOrManager]

    def get(self, request):
        user = request.user
        business = user.business_branch
        
        # Return empty list with message instead of 400 error if no business
        if business is None:
            return Response({
                'data': [],
                'message': 'User is not registered with any business'
            }, status=status.HTTP_200_OK)
            
        # Get all businesses or filter by the user's business
        businesses = Business.objects.all()
        serializer = BusinessModelSerializer(businesses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        return Response({'POST-message': 'Business List View'}, status=status.HTTP_200_OK)


class BusinessBranchListAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminOrOwnerOrManager]
    
    def get(self,request):
        user = request.user
        business = user.business
        # print(business)
        if business is None:
            return Response({'error': 'User is not registered with any business'}, status=status.HTTP_400_BAD_REQUEST)
        branches = Branches.objects.filter(business=business)
        serializer = BusinessBranchSerializer(branches, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        # if business is None:
        #     return Response({'error': 'User is not registered with any business'}, status=status.HTTP_400_BAD_REQUEST)
        # branches = business.branches.all()
        # serializer = BusinessBranchSerializer(branches, many=True)
        # return Response(serializer.data, status=status.HTTP_200_OK)
        # return Response({'POST-message': 'Business List View'}, status=status.HTTP_200_OK)

class BusinessBranchRegisterAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminOrOwnerOrManager]
    
    def post(self, request):
        user = request.user
        business = user.business
        if business is None:
            return Response({'error': 'User is not registered with any business'}, status=status.HTTP_400_BAD_REQUEST)
        
        data = request.data
        branch = Branches(
            business=business,
            name=data.get('name'),
            address=data.get('address'),
            contact_number=data.get('contact_number'),
            is_active=data.get('is_active', True)
        )
        branch.save()
        
        serializer = BusinessBranchSerializer(branch)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class BusinessBranchRelatedItemView(APIView):
    authentication_classes = [JWTAuthentication]
    permissions_classes = [IsAuthenticated, IsAdminOrOwnerOrManager]

    def get(self, request):
        user = request.user
        branch = user.business_branch
        # print(branch)
        if branch is None:
            return Response({'error': 'User is not registered with any business branch'}, status=status.HTTP_400_BAD_REQUEST)
        items = Items.objects.filter(business_branch=branch)
        serializer = ItemsBranchSerializer(items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        

        # return Response({'GET-message': 'Business related products View'}, status=status.HTTP_200_OK)
    # def post(self, reques):
    #     return Response({'POST-message': 'Business related products View'}, status=status.HTTP_200_OK)

class BusinessBranchRelatedRegisterItemView(APIView):
    authentication_classes = [JWTAuthentication]
    permissions_classes = [IsAuthenticated, IsAdminOrOwnerOrManager]

    def post(self, request):
        user = request.user
        branch = user.business_branch
        if branch is None:
            return Response({'error': 'User is not registered with any business branch'}, status=status.HTTP_400_BAD_REQUEST)
        
        data = request.data
        print(data)
        # item = Items(
        #     name=data.get('name'),
        #     price=data.get('price'),
        #     quantity=data.get('quantity'),
        #     last_inventory_update=data.get('last_inventory_update'),
        #     is_active=data.get('is_active', True),
        #     unit_of_measure=data.get('unit_of_measure'),
        #     category_id=data.get('category'),
        #     business_branch=branch
        # )
        # item.save()
        
        # serializer = ItemsBranchSerializer(item)
        # return Response(serializer.data, status=status.HTTP_201_CREATED)
        item = Items(
            name=data.get('name'),
            price=data.get('price'),
            quantity=data.get('quantity'),
            last_inventory_update=data.get('last_inventory_update'),
            is_active=data.get('is_active', True),
            unit_of_measure=data.get('unit_of_measure'),
            category_id=data.get('category'),
            business_branch=branch
        )
        item.save()
        
        serializer = ItemsBranchSerializer(item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class CategoriesListAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminOrOwnerOrManager]

    def get(self, request):
        categories = Categories.objects.all()
        if not categories:
            return Response({'message': 'No categories available'}, status=status.HTTP_200_OK)
        serializer = CategoriesSerializer(categories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    # def post(self, request):
    #     return Response({'POST-message': 'Categories List View'}, status=status.HTTP_200_OK)

class CategoriesRegisterAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminOrOwnerOrManager]

    def post(self, request):
        data = request.data
        category = Categories(
            name=data.get('name'),
            description=data.get('description'),
            is_active=data.get('is_active', True)
        )
        category.save()
        
        serializer = CategoriesSerializer(category)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    

class BusinessExpensesAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminOrOwnerOrManager]

    def get(self, request):
        user = request.user
        branch = user.business_branch
        # print(branch)
        if branch is None:
            return Response({'error': 'User is not registered with any business branch'}, status=status.HTTP_400_BAD_REQUEST)
        expenses = Expenses.objects.filter(business_branch=branch)
        if expenses is None:
            return Response({'error': 'no expence found'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = BusinessExpensesSerializer(expenses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
        # return Response({'GET-message': 'Business Expenses View'}, status=status.HTTP_200_OK)
    # def post(self, request):
    #     return Response({'POST-message': 'Business Expenses View'}, status=status.HTTP_200_OK)


class BusinessExpensesRegisterAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminOrOwnerOrManager]

    def post(self, request):
        user = request.user
        branch = user.business_branch
        if branch is None:
            return Response({'error': 'User is not registered with any business branch'}, status=status.HTTP_400_BAD_REQUEST)
        
        data = request.data
        expense = Expenses(
            amount=data.get('amount'),
            description=data.get('description'),
            expense_date=data.get('expense_date'),
            payment_method=data.get('payment_method'),
            receipt_number=data.get('receipt_number'),
            recurring_frequency=data.get('recurring_frequency'),
            recurring_end_date=data.get('recurring_end_date'),
            business=branch.business,
            business_branch=branch,
            created_by=user
        )
        expense.save()
        
        serializer = BusinessExpensesSerializer(expense)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class FeaturesAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminOrOwnerOrManager]

    def get(self, request):
        expenses = Features.objects.all()
        serializer = FeaturesSerializer(expenses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class FeaturesRegisterAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminOrOwnerOrManager]

    def post(self, request):
        data = request.data
        feature = Features(
            title_en=data.get('title_en'),
            title_am=data.get('title_am'),
            included=data.get('included', False),
            plan_id_id=data.get('plan_id')
        )
        feature.save()

        serializer = FeaturesSerializer(feature)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class BusinessOrdersAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminOrOwnerOrManager]

    def get(self, request):
        user = request.user
        branch = user.business_branch
        # print(branch)
        if branch is None:
            return Response({'error': 'User is not registered with any business branch'}, status=status.HTTP_400_BAD_REQUEST)
        expenses = Orders.objects.filter(business_branch=branch)
        if expenses is None:
            return Response({'error': 'no order found'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = BusinessBranchOrdersSerializer(expenses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class BusinessOrdersRegisterAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminOrOwnerOrManager]

    def post(self, request):
        user = request.user
        branch = user.business_branch
        if branch is None:
            return Response({'error': 'User is not registered with any business branch'}, status=status.HTTP_400_BAD_REQUEST)
        
        data = request.data
        order = Orders(
            order_number=data.get('order_number'),
            customer_name=data.get('customer_name'),
            customer_phone=data.get('customer_phone'),
            customer_email=data.get('customer_email'),
            order_date=data.get('order_date'),
            status=data.get('status', 'pending'),
            total_amount=data.get('total_amount'),
            payment_status=data.get('payment_status', 'pending'),
            payment_method=data.get('payment_method', 'Cash'),
            paid_amount=data.get('paid_amount', 0.00),
            remaining_amount=data.get('total_amount') - data.get('paid_amount', 0.00),
            business=branch.business,
            business_branch=branch,
            user=user
        )
        order.save()
        
        serializer = BusinessBranchOrdersSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class PlansAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminOrOwnerOrManager]

    def get(self, request):
        expenses = Plans.objects.all()
        serializer = PlansSerializer(expenses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class PlansRegisterAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminOrOwnerOrManager]
    def post(self, request):
        data = request.data
        plan = Plans(
            name_en=data.get('name_en'),
            name_am=data.get('name_am'),
            monthly_price=data.get('monthly_price'),
            yearly_price=data.get('yearly_price'),
            duration=data.get('duration'),
            description_en=data.get('description_en'),
            description_am=data.get('description_am'),
            is_active=data.get('is_active', True),
            is_hidden=data.get('is_hidden', False)
        )
        plan.save()

        serializer = PlansSerializer(plan)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
