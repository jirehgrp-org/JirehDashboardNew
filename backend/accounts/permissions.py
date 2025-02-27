# accounts/permissions.py

from rest_framework.permissions import BasePermission


class IsAdminOrOwnerOrManager(BasePermission):

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['owner', 'admin', 'manager']
        # return True
    # def has_permission(self, request, view):
    #     if not request.user.is_authenticated:
    #         print("User is not authenticated")
    #         return False
    #     user_role = getattr(request.user, 'role', None)
    #     print(f"User Role: {user_role}")
    #     result = user_role in ['admin', 'manager']
    #     print(f"Permission Check (IsAdminOrManager): {result}")
    #     return result

    # def has_permission(self, request, view):
    #     print(f"Request User: {request.user}")  # Debugging
    #     print(f"Is Authenticated: {request.user.is_authenticated}")  # Debugging
    #     print(f"User Role: {getattr(request.user, 'role', None)}")  # Debugging

    #     if not request.user.is_authenticated:
    #         return False
        
    #     return request.user.role in ['admin', 'manager']

    # def has_permission(self, request, view):
    #     print(f"Request User: {request.user}")  
    #     print(f"Is Authenticated: {request.user.is_authenticated}")  
    #     print(f"User Role: {getattr(request.user, 'role', None)}")  

    #     if not request.user.is_authenticated:
    #         print("User is NOT authenticated")
    #         return False  # This will trigger a 403 Forbidden error
        
    #     if request.user.role in ['admin', 'manager']:
    #         print("User has the correct role")
    #         return True
        
    #     print("User does NOT have the required role")
    #     return False  # This will trigger a 403 Forbidden error
class IsOwnerOrAdmin(BasePermission):

    # def has_permission(self, request, view):
    #     return request.user.is_authenticated and request.user.role in ['admin', 'manager']
    pass

class IsAdmin(BasePermission):
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class IsManager(BasePermission):
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'manager'
        # return True

class IsSales(BasePermission):
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'sales'

class IsWarehouse(BasePermission):
    
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'warehouse'


class IsAuthenticatedEmployee(BasePermission):
    """
    Allow access to any authenticated user with a valid role in the business.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['owner', 'admin', 'manager', 'sales', 'warehouse']