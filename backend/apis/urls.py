# apis/urls.py - Fixed imports

from django.urls import path, include
from rest_framework.routers import SimpleRouter

from .views import (
    BusinessAPIViewSet, BusinessRegisterAPIView, 
    CustomUserRegisterAPIView, UserProfileView,
    BusinessRelatedUsersView, BusinessListAPIView,
    BusinessBranchListAPIView, BusinessBranchRegisterAPIView,
    BusinessBranchDetailAPIView,
    BusinessBranchRelatedItemView, BusinessBranchRelatedRegisterItemView,
    CategoriesListAPIView, CategoriesRegisterAPIView,
    CategoriesDetailAPIView,
    BusinessExpensesAPIView, BusinessExpensesRegisterAPIView,
    FeaturesAPIView, FeaturesRegisterAPIView,
    BusinessOrdersAPIView, BusinessOrdersRegisterAPIView,
    PlansAPIView, PlansRegisterAPIView,
    ItemsDetailAPIView
)  
# Import subscription views - Fixed imports
from subscriptions.views import (
    BusinessSubscriptionAPIView,
    SubscriptionRenewalAPIView
)           
                
router = SimpleRouter()
router.register('business', BusinessAPIViewSet, basename='business')

urlpatterns = [
    path('', include(router.urls)),
    # Authentication & User Management
    path('register/user/', CustomUserRegisterAPIView.as_view(), name='custom_user_register'),
    path('register/business/', BusinessRegisterAPIView.as_view(), name='business_register'),
    path('user/', UserProfileView.as_view(), name='user_profile'),
    path('users/list/', BusinessRelatedUsersView.as_view(), name='business_related_users'),
    path('auth/user/', UserProfileView.as_view(), name='current_user'),
    path('user/<int:user_id>/', UserProfileView.as_view(), name='user-detail'),
    
    # Business Management
    path('business/list/', BusinessListAPIView.as_view(), name='business-list'),
    path('business/<int:business_id>/', BusinessListAPIView.as_view(), name='business-detail'),
    
    # Branch Management
    path('business/branch/list/', BusinessBranchListAPIView.as_view(), name='business-branch-list'),
    path('business/branch/register/', BusinessBranchRegisterAPIView.as_view(), name='business-branch-register'),
    path('business/branch/<int:branch_id>/', BusinessBranchDetailAPIView.as_view(), name='branch-detail'),
    
    # Category Management
    path('categories/list/', CategoriesListAPIView.as_view(), name='categories-list'),
    path('categories/register/', CategoriesRegisterAPIView.as_view(), name='categories-register'),
    path('categories/<int:category_id>/', CategoriesDetailAPIView.as_view(), name='category-detail'),
    
    # Item Management
    path('business/branch/item/list/', BusinessBranchRelatedItemView.as_view(), name='business-branch-item-list'),
    path('item/register/', BusinessBranchRelatedRegisterItemView.as_view(), name='item-register'),
    path('item/<int:item_id>/', ItemsDetailAPIView.as_view(), name='item-detail'),
    
    # Expense Management
    path('business/expenses/list/', BusinessExpensesAPIView.as_view(), name='business-expenses-list'),
    path('business/expenses/register/', BusinessExpensesRegisterAPIView.as_view(), name='business-expenses-register'),
    path('business/expenses/<int:expense_id>/', BusinessExpensesAPIView.as_view(), name='expense-detail'),
    
    # Order Management
    path('orders/list/', BusinessOrdersAPIView.as_view(), name='business-branch-orders-list'),
    path('order/register/', BusinessOrdersRegisterAPIView.as_view(), name='order-register'),
    path('order/<int:order_id>/', BusinessOrdersAPIView.as_view(), name='order-detail'),
    
    # Feature & Plan Management
    path('features/list/', FeaturesAPIView.as_view(), name='features'),
    path('feature/register/', FeaturesRegisterAPIView.as_view(), name='feature-register'),
    path('feature/<int:feature_id>/', FeaturesAPIView.as_view(), name='feature-detail'),
    path('plans/list/', PlansAPIView.as_view(), name='plans'),
    path('plan/register/', PlansRegisterAPIView.as_view(), name='plan-register'),
    path('plan/<int:plan_id>/', PlansAPIView.as_view(), name='plan-detail'),
    
    # Subscription Management
    path('subscription/status/', BusinessSubscriptionAPIView.as_view(), name='subscription-status'),
    path('subscription/renew/', SubscriptionRenewalAPIView.as_view(), name='subscription-renew'),
]