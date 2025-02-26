# business/views.py

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from business.models import Business
from branches.models import Branches
from apis.serializers import BusinessRegistrationSerializer
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction

@method_decorator(csrf_exempt, name='dispatch')
class BusinessRegisterAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request, *args, **kwargs):
        # Get the authenticated user
        user = request.user
        
        # Log request information for debugging
        print(f"Business registration request from user: {user.username} (ID: {user.id})")
        print(f"Business registration data: {request.data}")
        
        # Create serializer with context containing request
        serializer = BusinessRegistrationSerializer(data=request.data, context={'request': request})
        
        try:
            serializer.is_valid(raise_exception=True)
            print("Serializer validation successful")
        except Exception as e:
            print(f"Serializer validation error: {e}")
            return Response(
                {"detail": f"Invalid data: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Create the business with owner set to the current user
            business = serializer.save(owner=user)
            print(f"Business created successfully: {business.name} (ID: {business.id})")
            
            # Update the user's business field
            user.business = business
            user.save(update_fields=['business'])
            print(f"Updated user {user.username} business reference to: {business.name}")
            
            # Create a default branch for the business
            default_branch = Branches.objects.create(
                business=business,
                name=f"{business.name} Main Branch",
                address=f"{business.address_street}, {business.address_city}",
                contact_number=business.contact_number,
                is_active=True
            )
            print(f"Created default branch: {default_branch.name} (ID: {default_branch.id})")
            
            # Update user's branch reference
            user.business_branch = default_branch
            user.save(update_fields=['business_branch'])
            print(f"Updated user {user.username} branch reference to: {default_branch.name}")
            
            # Return success response with business ID
            return Response({
                "id": business.id,
                "name": business.name,
                "message": "Business registered successfully with default branch"
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"Error in business creation: {e}")
            return Response(
                {"detail": f"Failed to create business: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )