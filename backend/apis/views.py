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
                          CustomUserRegisterSerializer, OrderSerializer, UserSerializer, 
                          BusinessBranchSerializer, ItemsBranchSerializer, 
                          BusinessExpensesSerializer, FeaturesSerializer,
                          BusinessBranchOrdersSerializer, PlansSerializer)
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.permissions import IsAuthenticatedEmployee, IsOwnerOrAdmin, IsAdminOrOwnerOrManager, IsAdmin, IsManager,IsSales,IsWarehouse
from django.http import Http404
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import generics
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from categories.models import Categories
from .serializers import CategoriesSerializer
from django.utils import timezone
from .serializers import (UserOperationSerializer, ExpenseOperationSerializer)
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from subscriptions.models import Subscriptions
from orders.models import Orders, Order_items
from django.db import transaction as db_transaction
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
        
        # Create a trial subscription
        try:
            from subscriptions.models import Subscriptions
            from plans.models import Plans
            from django.utils import timezone
            import datetime
            
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
        

class UserOperationAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminOrOwnerOrManager]

    def get(self, request):
        user = request.user
        business = user.business
        
        print(f"=== DEBUG: UserOperationAPIView GET request ===")
        print(f"Requesting user: {user.id} ({user.username})")
        print(f"Business: {getattr(business, 'id', None)} ({getattr(business, 'name', None)})")
        
        if business is None:
            print("ERROR: User has no business")
            return Response({'error': 'User is not registered with any business'}, 
                        status=status.HTTP_400_BAD_REQUEST)
        
        # Get all users with their branch data
        users = User.objects.filter(business=business).select_related('business_branch')
        print(f"Found {users.count()} users")
        
        # Diagnostic for each user
        for user_obj in users:
            print(f"User {user_obj.id} ({user_obj.username})")
            print(f"  - business_branch: {getattr(user_obj.business_branch, 'id', None)}")
            print(f"  - branch_name: {getattr(user_obj.business_branch, 'name', None)}")
        
        # Manually construct response
        result = []
        for user_obj in users:
            # Check explicitly if business_branch is not None
            if user_obj.business_branch is not None:
                branch_id = user_obj.business_branch.id
                branch_name = user_obj.business_branch.name
                print(f"User {user_obj.id}: Found branch data: {branch_id}, {branch_name}")
            else:
                branch_id = None
                branch_name = None
                print(f"User {user_obj.id}: No branch data available")
            
            user_data = {
                'id': user_obj.id,
                'username': user_obj.username,
                'email': user_obj.email,
                'fullname': user_obj.fullname,
                'phone': user_obj.phone,
                'role': user_obj.role,
                'is_active': user_obj.is_active,
                'created_at': user_obj.created_at,
                'updated_at': user_obj.updated_at,
                'business_branch': branch_id,
                'branch_name': branch_name
            }
            result.append(user_data)
        
        # Print the final result
        print("Final result sample (first user):")
        if result:
            first_user = result[0]
            print(f"  - fields: {list(first_user.keys())}")
            print(f"  - business_branch: {first_user.get('business_branch')}")
            print(f"  - branch_name: {first_user.get('branch_name')}")
        
        return Response(result, status=status.HTTP_200_OK)
    

class UserOperationDebugView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        business = user.business
        
        if business is None:
            return Response({'error': 'User is not registered with any business'}, 
                        status=status.HTTP_400_BAD_REQUEST)
        
        # Direct database query
        from django.db import connection
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    u.id, u.username, u.email, u.fullname, u.phone, u.role, u.is_active,
                    u.created_at, u.updated_at,
                    b.id as branch_id, b.name as branch_name
                FROM 
                    accounts_customuser u
                LEFT JOIN
                    branches_branches b ON u.business_branch_id = b.id
                WHERE
                    u.business_id = %s
            """, [business.id])
            
            columns = [col[0] for col in cursor.description]
            users_data = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        return Response(users_data, status=status.HTTP_200_OK)


class UserOperationRegisterAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminOrOwnerOrManager]
    
    def post(self, request):
        user = request.user
        business = user.business

        if business is None:
            return Response({'error': 'User is not registered with any business'}, 
                        status=status.HTTP_400_BAD_REQUEST)

        data = request.data

        # Check if username already exists
        if User.objects.filter(username=data.get('username')).exists():
            return Response({'error': 'Username already exists'}, 
                        status=status.HTTP_400_BAD_REQUEST)

        # Check if email already exists (only if email is provided)
        email = data.get('email')
        if email and User.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists'}, 
                        status=status.HTTP_400_BAD_REQUEST)

        # Get branch if provided
        branch = None
        try:
            if data.get('business_branch'):
                branch = Branches.objects.get(id=data.get('business_branch'))
            elif user.business_branch:
                branch = user.business_branch
                
            if not branch:
                return Response({'error': 'Branch is required'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        except Branches.DoesNotExist:
            return Response({'error': f'Branch with id {data.get("business_branch")} does not exist'}, 
                        status=status.HTTP_400_BAD_REQUEST)

        # Format phone number if needed
        phone = data.get('phone', '')
        if phone:
            # Remove any spaces and dashes
            phone = phone.replace(' ', '').replace('-', '')
            if not phone.startswith('+251'):
                # If it starts with 0, remove it before adding +251
                phone = f"+251{phone.lstrip('0')}"

        # Always generate a password
        import string
        import random
        password = ''.join(random.choices(string.ascii_letters + string.digits, k=10))

        try:
            # Use fullname instead of name
            fullname = data.get('fullname', data.get('name', ''))
            
            new_user = User.objects.create_user(
                username=data.get('username'),
                email=data.get('email') or None,  # Allow empty email
                password=password,
                fullname=fullname,
                phone=phone,
                role=data.get('role', 'sales'),
                business=business,
                business_branch=branch,
                is_active=data.get('is_active', True)
            )
            
            serializer = UserOperationSerializer(new_user)
            
            # Add the generated password to the response data
            response_data = serializer.data
            response_data['password_info'] = f'Password has been generated: {password}'
            
            # Send password email only if email is provided
            if data.get('email'):
                try:
                    subject = f"Your Account Has Been Created for {business.name}"
                    message = f"""
            Hello {fullname},

            An account has been created for you on {business.name}'s business management system.

            Here are your login credentials:
            Username: {data.get('username')}
            Password: {password}

            Please log in and change your password as soon as possible.

            Thank you,
            {business.name} Team
                    """
                    from_email = settings.DEFAULT_FROM_EMAIL
                    recipient_list = [data.get('email')]
                    
                    print(f"Attempting to send email to {recipient_list} from {from_email}")
                    print(f"Email settings: HOST={settings.EMAIL_HOST}, PORT={settings.EMAIL_PORT}, USER={settings.EMAIL_HOST_USER}")
                    
                    # Test SMTP connection
                    try:
                        import smtplib
                        server = smtplib.SMTP_SSL(settings.EMAIL_HOST, settings.EMAIL_PORT)
                        server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
                        print("SMTP connection successful")
                        server.quit()
                    except Exception as smtp_err:
                        print(f"SMTP connection test failed: {str(smtp_err)}")
                    
                    send_mail(subject, message, from_email, recipient_list, fail_silently=False)
                    
                    # Add a note in the response
                    response_data['email_sent'] = True
                    print("Email sent successfully!")
                except Exception as e:
                    import traceback
                    print(f"Error sending email: {str(e)}")
                    print(traceback.format_exc())
                    response_data['email_sent'] = False
                    response_data['email_error'] = str(e)
            else:
                # No email provided, so no email was sent
                response_data['email_sent'] = False
                response_data['email_message'] = "No email provided, credentials were not sent"
            
            return Response(response_data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class UserOperationDetailAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminOrOwnerOrManager]
    
    def get_object(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise Http404
    
    def get(self, request, user_id):
        user_obj = self.get_object(user_id)
        # Check permission - only allow access to users in the same business
        if request.user.business != user_obj.business:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = UserOperationSerializer(user_obj)
        
        # Add debug output to see what's being returned
        print(f"Single user serialized data: {serializer.data}")
        
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request, user_id):
        user_obj = self.get_object(user_id)
        # Check permission
        if request.user.business != user_obj.business:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        data = request.data
        
        # Check if branch exists if provided
        if data.get('business_branch'):
            try:
                branch = Branches.objects.get(id=data.get('business_branch'))
                user_obj.business_branch = branch
            except Branches.DoesNotExist:
                return Response({'error': 'Branch does not exist'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        # Update fields - use fullname consistently instead of name
        user_obj.fullname = data.get('fullname', user_obj.fullname)
        user_obj.email = data.get('email', user_obj.email)
        user_obj.role = data.get('role', user_obj.role)
        user_obj.is_active = data.get('is_active', user_obj.is_active)
        
        # Format phone if provided
        if data.get('phone'):
            phone = data.get('phone')
            # Remove any spaces and dashes
            phone = phone.replace(' ', '').replace('-', '')
            if not phone.startswith('+251'):
                # If it starts with 0, remove it before adding +251
                phone = f"+251{phone.lstrip('0')}"
            user_obj.phone = phone
        
        user_obj.save()
        
        serializer = UserOperationSerializer(user_obj)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def delete(self, request, user_id):
        user_obj = self.get_object(user_id)
        # Check permission
        if request.user.business != user_obj.business:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Prevent deleting yourself
        if user_obj.id == request.user.id:
            return Response({'error': 'Cannot delete yourself'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Hard delete (or you could set is_active=False for soft delete)
        user_obj.delete()
        
        return Response({"message": "User deleted successfully"}, 
                      status=status.HTTP_204_NO_CONTENT)

class ExpenseOperationAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminOrOwnerOrManager]

    def get(self, request):
        user = request.user
        business = user.business
        
        if business is None:
            return Response({'error': 'User is not registered with any business'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        expenses = Expenses.objects.filter(business=business)
        serializer = ExpenseOperationSerializer(expenses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class ExpenseOperationRegisterAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminOrOwnerOrManager]
    
    def post(self, request):
        user = request.user
        business = user.business
        
        if business is None:
            return Response({'error': 'User is not registered with any business'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        data = request.data
        
        # Check if branch exists if provided
        branch = None
        if data.get('business_branch') or data.get('branchId'):
            branch_id = data.get('business_branch') or data.get('branchId')
            try:
                branch = Branches.objects.get(id=branch_id)
            except Branches.DoesNotExist:
                return Response({'error': 'Branch does not exist'}, 
                              status=status.HTTP_400_BAD_REQUEST)
        elif user.business_branch:
            branch = user.business_branch
            
        if not branch:
            return Response({'error': 'Branch is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Validate amount 
        try:
            amount = float(data.get('amount', 0))
            if amount <= 0:
                return Response({'error': 'Amount must be greater than zero'}, 
                              status=status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError):
            return Response({'error': 'Invalid amount'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Handle both frequency and recurring_frequency fields
            recurring_frequency = data.get('frequency') or data.get('recurring_frequency', 'once')
            
            # Handle name and description
            name = data.get('name')
            description = data.get('description', '')
            
            if not name and description:
                # If name is empty but description exists, use part of description as name
                name = description[:50]
            elif not name and not description:
                # If both are empty, use default name
                name = "Expense"
            
            expense = Expenses.objects.create(
                name=name,
                amount=amount,
                description=description,
                expense_date=data.get('expense_date', timezone.now().date()),
                payment_method=data.get('payment_method', 'Cash'),
                receipt_number=data.get('receipt_number', ''),
                recurring_frequency=recurring_frequency,
                recurring_end_date=data.get('recurring_end_date'),
                business=business,
                business_branch=branch,
                created_by=user,
                is_active=data.get('is_active', data.get('active', True))
            )
            
            serializer = ExpenseOperationSerializer(expense)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ExpenseOperationDetailAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminOrOwnerOrManager]
    
    def get_object(self, expense_id):
        try:
            return Expenses.objects.get(id=expense_id)
        except Expenses.DoesNotExist:
            raise Http404
    
    def get(self, request, expense_id):
        expense = self.get_object(expense_id)
        # Check permission
        if request.user.business != expense.business:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ExpenseOperationSerializer(expense)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request, expense_id):
        expense = self.get_object(expense_id)
        # Check permission
        if request.user.business != expense.business:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        data = request.data
        
        # Check if branch exists if provided
        if data.get('business_branch') or data.get('branchId'):
            branch_id = data.get('business_branch') or data.get('branchId')
            try:
                branch = Branches.objects.get(id=branch_id)
                expense.business_branch = branch
            except Branches.DoesNotExist:
                return Response({'error': 'Branch does not exist'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        # Update fields
        if 'amount' in data:
            try:
                amount = float(data.get('amount', 0))
                if amount <= 0:
                    return Response({'error': 'Amount must be greater than zero'}, 
                                status=status.HTTP_400_BAD_REQUEST)
                expense.amount = amount
            except (ValueError, TypeError):
                return Response({'error': 'Invalid amount'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        # Handle name field
        if 'name' in data:
            expense.name = data.get('name')
                
        if 'description' in data:
            expense.description = data.get('description')
        
        # Support both frequency and recurring_frequency
        if 'frequency' in data:
            expense.recurring_frequency = data.get('frequency')
        elif 'recurring_frequency' in data:
            expense.recurring_frequency = data.get('recurring_frequency')
        
        if 'expense_date' in data:
            expense.expense_date = data.get('expense_date')
        if 'payment_method' in data:
            expense.payment_method = data.get('payment_method')
        
        # Support both active and is_active
        if 'active' in data:
            expense.is_active = data.get('active')
        elif 'is_active' in data:
            expense.is_active = data.get('is_active')
        
        expense.save()
        
        serializer = ExpenseOperationSerializer(expense)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def delete(self, request, expense_id):
        expense = self.get_object(expense_id)
        # Check permission
        if request.user.business != expense.business:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Hard delete
        expense.delete()
        
        return Response({"message": "Expense deleted successfully"}, 
                      status=status.HTTP_204_NO_CONTENT)
    

        
class SubscriptionCancelAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        business = user.business
        
        if business is None:
            return Response({'error': 'User is not registered with any business'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Get the active subscription for this business
            subscription = Subscriptions.objects.filter(
                business=business,
                subscription_status__in=['ACTIVE', 'TRIAL']
            ).order_by('-end_date').first()
            
            if not subscription:
                return Response({'error': 'No active subscription found'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            # Update subscription status to CANCELLED but keep end date the same
            # This allows users to continue using the service until the end of their paid period
            subscription.subscription_status = 'CANCELLED'
            subscription.save()
            
            # Calculate days remaining
            from django.utils import timezone
            today = timezone.now().date()
            days_remaining = (subscription.end_date - today).days if today <= subscription.end_date else 0
            
            return Response({
                'success': True,
                'message': 'Subscription cancelled successfully',
                'subscription': {
                    'id': subscription.id,
                    'plan_id': subscription.plan.id,
                    'plan_name': subscription.plan.name_en,
                    'subscription_status': subscription.subscription_status,
                    'payment_status': subscription.payment_status,
                    'start_date': subscription.start_date,
                    'end_date': subscription.end_date,
                    'is_trial': subscription.is_trial,
                    'days_remaining': days_remaining
                }
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to cancel subscription: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CustomUserRegisterAPIView(RegisterView):
    serializer_class = CustomUserRegisterSerializer

class UserProfileView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAuthenticatedEmployee]

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
        subscription_info = None
        branch_info = None

        if user.business_branch:
            branch_info = {
                'id': user.business_branch.id,
                'name': user.business_branch.name,
                'address': user.business_branch.address,
                'contact_number': user.business_branch.contact_number,
                'is_active': user.business_branch.is_active
            }
        
        if user.business:
            business_info = {
                'id': user.business.id,
                'name': user.business.name,
                'contact_number': user.business.contact_number
            }
            
            # Get subscription status if business exists
            try:
                from subscriptions.models import Subscriptions
                
                # Get the most recent subscription
                subscription = Subscriptions.objects.filter(
                    business=user.business
                ).order_by('-end_date').first()
                
                if subscription:
                    # Calculate days remaining
                    from django.utils import timezone
                    today = timezone.now().date()
                    days_remaining = (subscription.end_date - today).days if today <= subscription.end_date else 0
                    
                    subscription_info = {
                        'id': subscription.id,
                        'plan_id': subscription.plan.id,
                        'plan_name': subscription.plan.name_en,
                        'subscription_status': subscription.subscription_status,
                        'payment_status': subscription.payment_status,
                        'start_date': subscription.start_date,
                        'end_date': subscription.end_date,
                        'is_trial': subscription.is_trial,
                        'days_remaining': days_remaining
                    }
            except Exception as e:
                print(f"Error getting subscription info: {e}")
        
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
            'business': business_info,
            'business_branch': branch_info,  # Add branch info to response
            'subscription': subscription_info
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
        branch_info = None
        
        if user.business:
            business_info = {
                'id': user.business.id,
                'name': user.business.name,
                'contact_number': user.business.contact_number
            }
        
        # Add branch information
        if user.business_branch:
            branch_info = {
                'id': user.business_branch.id,
                'name': user.business_branch.name,
                'address': user.business_branch.address,
                'contact_number': user.business_branch.contact_number,
                'is_active': user.business_branch.is_active
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
            'business': business_info,
            'business_branch': branch_info  # Add branch info to response
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
        business = user.business
        
        if business is None:
            return Response({'error': 'User is not registered with any business'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Get all users associated with the business
        users = User.objects.filter(business=business)
        
        # If user has a specific branch and isn't an owner or admin, filter by branch
        if user.business_branch and user.role not in ['owner', 'admin']:
            users = users.filter(business_branch=user.business_branch)
            
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
        # users = business.owner.all()
        # print(users)
        # serializer = UserSerializer(users, many=True)
        # return Response(serializer.data, status=status.HTTP_200_OK)

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
    permission_classes = [IsAuthenticated, IsAuthenticatedEmployee]
    
    def get(self, request):
        user = request.user
        business = user.business
        
        if business is None:
            return Response({'error': 'User is not registered with any business'}, 
                        status=status.HTTP_400_BAD_REQUEST)
        
        branches = Branches.objects.filter(business=business)
        
        # Debug log
        print(f"Fetching branches for business: {business.name} (ID: {business.id})")
        for branch in branches:
            print(f"Branch: {branch.id} {branch.name}, Is active: {branch.is_active}")
        
        serializer = BusinessBranchSerializer(branches, many=True)
        
        # Debug log serialized data
        print(f"Serialized branches: {serializer.data}")
        
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
    permission_classes = [IsAuthenticated, IsAuthenticatedEmployee]

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
    permission_classes = [IsAuthenticated, IsAuthenticatedEmployee]
    
    def get_object(self, item_id):

        try:
            return Items.objects.get(id=item_id)
        except Items.DoesNotExist:
            raise Http404
    
    def get(self, request, item_id):
        item = self.get_object(item_id)
        # Simplified permission check
        if request.user.business != item.business:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ItemsBranchSerializer(item)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, item_id):
        item = self.get_object(item_id)
        # Simplified permission check
        if request.user.business != item.business:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ItemsBranchSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, item_id):
        item = self.get_object(item_id)
        # Simplified permission check
        if request.user.business != item.business:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Hard delete the item from the database
        item.delete()
        
        return Response({"message": "Item deleted successfully"}, 
                    status=status.HTTP_204_NO_CONTENT)

class CategoriesListAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAuthenticatedEmployee]

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
    permission_classes = [IsAuthenticated, IsAuthenticatedEmployee]
    
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
        
        # Get data from request and prepare for update
        data = request.data
        update_data = {
            'name': data.get('name', category.name),
            'description': data.get('description', category.description),
            'is_active': data.get('is_active', data.get('active', category.is_active))
        }
        
        # Update the category directly
        for key, value in update_data.items():
            setattr(category, key, value)
        
        try:
            category.save()
            serializer = CategoriesSerializer(category)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
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
            return Response({'error': 'User is not registered with any business branch'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        data = request.data
        
        # Validate amount
        try:
            amount = float(data.get('amount', 0))
            if amount <= 0:
                return Response({'error': 'Amount must be greater than zero'}, 
                              status=status.HTTP_400_BAD_REQUEST)
        except (ValueError, TypeError):
            return Response({'error': 'Invalid amount'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        expense = Expenses(
            amount=amount,
            description=data.get('description'),
            expense_date=data.get('expense_date', timezone.now().date()),
            payment_method=data.get('payment_method', 'Cash'),
            receipt_number=data.get('receipt_number', ''),
            recurring_frequency=data.get('recurring_frequency', 'once'),
            recurring_end_date=data.get('recurring_end_date'),
            business=branch.business,
            business_branch=branch,
            created_by=user,
            is_active=data.get('is_active', True)  # Added is_active field
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
    permission_classes = [IsAuthenticated, IsAuthenticatedEmployee]

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
    permission_classes = [IsAuthenticated, IsAuthenticatedEmployee]

    def get_permissions(self):
        if self.request.method == 'POST':
            # For creating orders, you might want to restrict to just sales roles
            return [IsAuthenticated(), IsSales()]
        # For other methods like GET
        return [IsAuthenticated(), IsAuthenticatedEmployee()]

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

class TransactionOperationAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAuthenticatedEmployee]

    def get(self, request):
        user = request.user
        business = user.business
        
        if business is None:
            return Response({'error': 'User is not registered with any business'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # If user has a specific branch, filter orders by that branch
        if user.business_branch and user.role not in ['owner', 'admin']:
            orders = Orders.objects.filter(business=business, business_branch=user.business_branch)
        else:
            orders = Orders.objects.filter(business=business)
            
        # Get order items for each order
        orders = orders.prefetch_related('order_items_set', 'order_items_set__item', 'order_items_set__category')
        
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class TransactionOperationRegisterAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAuthenticatedEmployee]
    
    def post(self, request):
        user = request.user
        business = user.business
        branch = user.business_branch
        
        if business is None:
            return Response({'error': 'User is not registered with any business'}, 
                          status=status.HTTP_400_BAD_REQUEST)
                          
        if branch is None:
            return Response({'error': 'User is not registered with any branch'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        data = request.data
        
        # Validate required fields
        if not data.get('customer_name'):
            return Response({'error': 'Customer name is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        if not data.get('customer_phone'):
            return Response({'error': 'Customer phone is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        if not data.get('items') or not isinstance(data.get('items'), list) or len(data.get('items')) == 0:
            return Response({'error': 'At least one item is required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            with db_transaction.atomic():
                # Generate a unique order number
                order_number = f"ORD-{int(timezone.now().timestamp())}"
                
                # Create the order
                order = Orders.objects.create(
                    order_number=order_number,
                    customer_name=data.get('customer_name'),
                    customer_phone=data.get('customer_phone'),
                    customer_email=data.get('customer_email'),
                    order_date=data.get('order_date', timezone.now()),
                    status=data.get('status', 'pending'),
                    total_amount=data.get('total_amount', 0),
                    payment_status=data.get('payment_status', 'pending'),
                    payment_method=data.get('payment_method', 'Cash'),
                    paid_amount=data.get('paid_amount', 0),
                    business=business,
                    business_branch=branch,
                    user=user
                )
                
                # Create order items and update inventory
                total_amount = 0
                for item_data in data.get('items', []):
                    item_id = item_data.get('item_id')
                    quantity = int(item_data.get('quantity', 0))
                    unit_price = float(item_data.get('price', 0))
                    
                    if not item_id or quantity <= 0:
                        continue
                    
                    try:
                        item = Items.objects.get(id=item_id)
                        
                        # Check if there is enough stock
                        if item.quantity < quantity:
                            raise Exception(f"Insufficient stock for item {item.name}")
                        
                        # Update inventory quantity
                        item.quantity -= quantity
                        item.save()
                        
                        # Create order item
                        subtotal = unit_price * quantity
                        total_amount += subtotal
                        
                        Order_items.objects.create(
                            order_id=order,
                            item=item,
                            category=item.category,
                            quantity=quantity,
                            unit_price=unit_price,
                            subtotal=subtotal
                        )
                    except Items.DoesNotExist:
                        return Response({'error': f'Item with id {item_id} not found'}, 
                                      status=status.HTTP_400_BAD_REQUEST)
                
                # Update order total
                order.total_amount = total_amount
                order.save()
                
                # Return the created order with items
                serializer = OrderSerializer(order)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
                
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class TransactionOperationDetailAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAuthenticatedEmployee]
    
    def get_object(self, order_id):
        try:
            return Orders.objects.get(id=order_id)
        except Orders.DoesNotExist:
            raise Http404
    
    def get(self, request, order_id):
        order = self.get_object(order_id)
        
        # Check if user has permission to access this order
        if request.user.business != order.business:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get order with related items
        order = Orders.objects.prefetch_related(
            'order_items_set', 
            'order_items_set__item', 
            'order_items_set__category'
        ).get(id=order_id)
        
        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request, order_id):
        order = self.get_object(order_id)
        
        # Check if user has permission to update this order
        if request.user.business != order.business:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        data = request.data
        
        try:
            # Update order fields
            if 'customer_name' in data:
                order.customer_name = data.get('customer_name')
            if 'customer_phone' in data:
                order.customer_phone = data.get('customer_phone')
            if 'customer_email' in data:
                order.customer_email = data.get('customer_email')
            if 'status' in data:
                order.status = data.get('status')
            if 'payment_status' in data:
                order.payment_status = data.get('payment_status')
            if 'payment_method' in data:
                order.payment_method = data.get('payment_method')
            if 'paid_amount' in data:
                order.paid_amount = data.get('paid_amount')
            
            order.save()
            
            # Return updated order
            serializer = OrderSerializer(order)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, order_id):
        order = self.get_object(order_id)
        
        # Check if user has permission to delete this order
        if request.user.business != order.business:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            # Return items to inventory
            order_items = Order_items.objects.filter(order_id=order)
            
            for order_item in order_items:
                item = order_item.item
                item.quantity += order_item.quantity
                item.save()
            
            # Delete the order
            order.delete()
            
            return Response({"message": "Order deleted successfully and inventory restored"}, 
                          status=status.HTTP_204_NO_CONTENT)
                          
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)