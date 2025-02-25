# apis/urls.py

from django.urls import path, include
from rest_framework.routers import SimpleRouter

from .views import (BusinessAPIViewSet,CustomUserRegisterAPIView, 
                    UserProfileView, BusinessRegisterAPIView, 
                    BusinessRelatedUsersView, BusinessListAPIView, 
                    BusinessBranchListAPIView, BusinessBranchRelatedItemView, 
                    CategoriesListAPIView, BusinessExpensesAPIView,
                    FeaturesAPIView, PlansAPIView, 
                    BusinessOrdersAPIView, BusinessBranchRegisterAPIView,
                    CategoriesRegisterAPIView, BusinessExpensesRegisterAPIView,
                    FeaturesRegisterAPIView, BusinessBranchRelatedRegisterItemView,
                    BusinessOrdersRegisterAPIView, PlansRegisterAPIView
                )              
                    

router = SimpleRouter()
router.register('business', BusinessAPIViewSet, basename='business')

urlpatterns = [
    path('', include(router.urls)),
    path('register/user', CustomUserRegisterAPIView.as_view(), name='custom_user_register'),
    path('register/business', BusinessRegisterAPIView.as_view(), name='business_register'),
    path('user/', UserProfileView.as_view(), name='user_profile'),
    path('users/list/', BusinessRelatedUsersView.as_view(), name='business_related_users'),
    path('auth/user/', UserProfileView.as_view(), name='current_user'),
    path('business/list', BusinessListAPIView.as_view(), name='business-list'),
    path('business/branch/list', BusinessBranchListAPIView.as_view(), name='business-branch-list'),
    path('business/branch/item/list', BusinessBranchRelatedItemView.as_view(), name='business-branch-item-list'),
    path('features/list', FeaturesAPIView.as_view(), name='features'),
    path('plans/list', PlansAPIView.as_view(), name='plans'),
    path('orders/list', BusinessOrdersAPIView.as_view(), name='business-branch-orders-list'),
    path('business/branch/register', BusinessBranchRegisterAPIView.as_view(), name='business-branch-register'),
    path('categories/list', CategoriesListAPIView.as_view(), name='categories-list'),
    path('categories/register', CategoriesRegisterAPIView.as_view(), name='categories-register'),
    path('business/expenses/list', BusinessExpensesAPIView.as_view(), name='business-expenses-list'),
    path('business/expenses/register', BusinessExpensesRegisterAPIView.as_view(), name='business-expenses-register'),
    path('feature/register', FeaturesRegisterAPIView.as_view(), name='feature-register'),
    path('plan/register', PlansRegisterAPIView.as_view(), name='plan-register'),
    path('item/register',BusinessBranchRelatedRegisterItemView.as_view(), name='item-register'),
    path('order/register',BusinessOrdersRegisterAPIView.as_view(), name='order-register'),
    path('business/<int:business_id>', BusinessListAPIView.as_view(), name='business-detail'),
    path('business/branch/<int:branch_id>', BusinessBranchListAPIView.as_view(), name='business-branch-detail'),
    path('categories/<int:category_id>', CategoriesListAPIView.as_view(), name='category-detail'),
    path('business/expenses/<int:expense_id>', BusinessExpensesAPIView.as_view(), name='expense-detail'),
    path('feature/<int:feature_id>', FeaturesAPIView.as_view(), name='feature-detail'),
    path('plan/<int:plan_id>', PlansAPIView.as_view(), name='plan-detail'),
    path('item/<int:item_id>', BusinessBranchRelatedItemView.as_view(), name='item-detail'),
    path('order/<int:order_id>', BusinessOrdersAPIView.as_view(), name='order-detail'),
    path('user/<int:user_id>/', UserProfileView.as_view(), name='user-detail'),
]
