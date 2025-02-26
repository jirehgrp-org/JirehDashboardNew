# apis/views.py

from django.shortcuts import render

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
from django.contrib.auth import get_user_model
User = get_user_model()


class BusinessAPIViewSet(viewsets.ModelViewSet):
    queryset = Business.objects.all()
    serializer_class = BusinessModelSerializer
    # permission_classes = [permissions.IsAuthenticated]
    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

@method_decorator(csrf_exempt, name='dispatch')
class BusinessRegisterAPIView(generics.CreateAPIView):
    serializer_class = BusinessRegistrationSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Get the current user
        user = self.request.user
        print(f"Creating business for user: {user.username}")
        
        # Explicitly set the owner to the requesting user
        business = serializer.save(owner=user)
        print(f"Business created: {business.name}, ID: {business.id}")
        
        # Update the user's business field to point to this business
        # Fetch a fresh user instance to avoid caching issues
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user_obj = User.objects.get(id=user.id)
        user_obj.business = business
        user_obj.save(update_fields=['business'])  # Force update specific field
        print(f"Updated user {user.username} business reference to: {business.name} (ID: {business.id})")
        
        # Return the created business
        return business

    def create(self, request, *args, **kwargs):
        print(f"Business registration request from user: {request.user.username}")
        print(f"Business registration data: {request.data}")
        
        # Standard create method from CreateAPIView with added logging
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
            print("Serializer validation successful")
        except Exception as e:
            print(f"Serializer validation error: {e}")
            raise
        
        try:
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            print("Business created successfully")
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as e:
            print(f"Error in business creation: {e}")
            return Response(
                {"detail": f"Failed to create business: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )


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
        
        # Business information
        business_info = None
        if user.business:
            business_info = {
                'id': user.business.id,
                'name': user.business.name,
                'contact_number': user.business.contact_number
            }
        
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
            'updated_at': user.updated_at,
            'business': business_info
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
        
        # Business information
        business_info = None
        if user.business:
            business_info = {
                'id': user.business.id,
                'name': user.business.name,
                'contact_number': user.business.contact_number
            }
        
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
            'updated_at': user.updated_at,
            'business': business_info
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
    
class BusinessBranchDetailAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminOrOwnerOrManager]
    
    def get_object(self, branch_id):
        try:
            return Branches.objects.get(id=branch_id)
        except Branches.DoesNotExist:
            raise Http404
    
    def get(self, request, branch_id):
        branch = self.get_object(branch_id)
        # Check if user has permission to access this branch
        if request.user.business != branch.business:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = BusinessBranchSerializer(branch)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request, branch_id):
        branch = self.get_object(branch_id)
        # Check if user has permission to edit this branch
        if request.user.business != branch.business:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = BusinessBranchSerializer(branch, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, branch_id):
        branch = self.get_object(branch_id)
        # Check if user has permission to delete this branch
        if request.user.business != branch.business:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Hard delete the branch from the database
        branch.delete()
        
        return Response({"message": "Branch deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

# apis/views.py - Update the BusinessBranchRelatedItemView

class BusinessBranchRelatedItemView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminOrOwnerOrManager]

    def get(self, request):
        user = request.user
        branch = user.business_branch
        
        # Check if branch_id is provided as query parameter
        branch_id = request.query_params.get('branch_id')
        
        # Log the request parameters for debugging
        print(f"Fetching items. User branch: {branch}, branch_id param: {branch_id}, query params: {request.query_params}")
        
        if branch is None and branch_id:
            try:
                branch = Branches.objects.get(id=branch_id)
                print(f"Found branch by ID: {branch.id}, {branch.name}")
            except Branches.DoesNotExist:
                return Response({'error': f'Branch with id {branch_id} does not exist'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        if branch is None:
            # If user has a business, return all items from all of their branches
            if user.business:
                print(f"No branch specified, fetching all items for business: {user.business}")
                items = Items.objects.filter(business=user.business)
                serializer = ItemsBranchSerializer(items, many=True)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                # Return empty array instead of error when no branch and no business
                print("No branch or business found, returning empty array")
                return Response([], status=status.HTTP_200_OK)
                
        print(f"Fetching items for branch: {branch.id}, {branch.name}")
        items = Items.objects.filter(business_branch=branch)
        serializer = ItemsBranchSerializer(items, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class BusinessBranchRelatedRegisterItemView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminOrOwnerOrManager]

    def post(self, request):
        user = request.user
        branch = user.business_branch
        
        # Allow explicit business_branch in request data
        if branch is None and 'business_branch' in request.data:
            try:
                branch_id = request.data.get('business_branch')
                branch = Branches.objects.get(id=branch_id)
            except Branches.DoesNotExist:
                return Response({'error': f'Branch with id {branch_id} does not exist'}, 
                            status=status.HTTP_400_BAD_REQUEST)
            
        if branch is None:
            return Response({'error': 'User is not registered with any business branch and no branch ID was provided'}, 
                         status=status.HTTP_400_BAD_REQUEST)
        
        data = request.data
        # Validate required fields
        required_fields = ['name', 'price', 'quantity', 'category']
        for field in required_fields:
            if not data.get(field):
                return Response(
                    {'error': f'Missing required field: {field}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        try:
            # Verify category exists
            try:
                category = Categories.objects.get(id=data.get('category'))
            except Categories.DoesNotExist:
                return Response(
                    {'error': f'Category with id {data.get("category")} does not exist'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            item = Items(
                name=data.get('name'),
                price=data.get('price'),
                quantity=data.get('quantity'),
                last_inventory_update=data.get('last_inventory_update'),
                is_active=data.get('is_active', True),
                unit_of_measure=data.get('unit_of_measure'),
                category_id=data.get('category'),
                business_branch=branch,
                business=branch.business
            )
            item.save()
            
            serializer = ItemsBranchSerializer(item)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
class ItemsDetailAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminOrOwnerOrManager]
    
    def get_object(self, item_id):
        try:
            return Items.objects.get(id=item_id)
        except Items.DoesNotExist:
            raise Http404
    
    def get(self, request, item_id):
        item = self.get_object(item_id)
        # Modified permission check - check business instead of branch
        if request.user.business and item.business and request.user.business != item.business:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ItemsBranchSerializer(item)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request, item_id):
        item = self.get_object(item_id)
        # Modified permission check - check business instead of branch
        if request.user.business and item.business and request.user.business != item.business:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ItemsBranchSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, item_id):
        item = self.get_object(item_id)
        # Modified permission check - check business instead of branch
        if request.user.business and item.business and request.user.business != item.business:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Hard delete the item from the database
        item.delete()
        
        return Response({"message": "Item deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

class CategoriesListAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminOrOwnerOrManager]

    def get(self, request):
        user = request.user
        business = user.business
        
        # Filter categories by the user's business
        if business:
            categories = Categories.objects.filter(business=business)
        else:
            # If user has no business, return empty list with message
            return Response({
                'data': [],
                'message': 'User is not registered with any business'
            }, status=status.HTTP_200_OK)
        
        if not categories:
            return Response({'message': 'No categories available for your business'}, 
                           status=status.HTTP_200_OK)
        
        serializer = CategoriesSerializer(categories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CategoriesRegisterAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminOrOwnerOrManager]

    def post(self, request):
        user = request.user
        business = user.business
        if business is None:
            return Response({'error': 'User is not registered with any business'}, status=status.HTTP_400_BAD_REQUEST)
        
        data = request.data
        category = Categories(
            name=data.get('name'),
            description=data.get('description'),
            is_active=data.get('is_active', True),
            business=business  # Set the business field
        )
        category.save()
        
        serializer = CategoriesSerializer(category)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
class CategoriesDetailAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminOrOwnerOrManager]
    
    def get_object(self, category_id):
        try:
            return Categories.objects.get(id=category_id)
        except Categories.DoesNotExist:
            raise Http404
    
    def get(self, request, category_id):
        category = self.get_object(category_id)
        # Check if user has permission to access this category
        if category.business and request.user.business != category.business:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = CategoriesSerializer(category)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request, category_id):
        category = self.get_object(category_id)
        # Check if user has permission to edit this category
        if category.business and request.user.business != category.business:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = CategoriesSerializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, category_id):
        category = self.get_object(category_id)
        # Check if user has permission to delete this category
        if category.business and request.user.business != category.business:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Hard delete the category from the database
        category.delete()
        
        return Response({"message": "Category deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    

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
