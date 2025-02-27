# subscriptions/views.py

from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Subscriptions
from accounts.permissions import IsOwnerOrAdmin, IsAdminOrOwnerOrManager
from django.utils import timezone
import datetime

class BusinessSubscriptionAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminOrOwnerOrManager]
    
    def get(self, request):
        user = request.user
        business = user.business
        
        if business is None:
            return Response({'error': 'User is not registered with any business'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get the active subscription
        subscription = Subscriptions.objects.filter(
            business=business
        ).order_by('-end_date').first()
        
        if subscription is None:
            return Response({
                'has_subscription': False,
                'message': 'No active subscription found'
            }, status=status.HTTP_200_OK)
        
        # Calculate days remaining
        today = timezone.now().date()
        days_remaining = (subscription.end_date - today).days if today <= subscription.end_date else 0
        
        return Response({
            'has_subscription': True,
            'subscription': {
                'id': subscription.id,
                'plan': subscription.plan.id,
                'plan_name': subscription.plan.name_en,
                'start_date': subscription.start_date,
                'end_date': subscription.end_date,
                'subscription_status': subscription.subscription_status,
                'payment_status': subscription.payment_status,
                'is_trial': subscription.is_trial,
                'days_remaining': days_remaining
            }
        }, status=status.HTTP_200_OK)

class SubscriptionRenewalAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminOrOwnerOrManager]
    
    def post(self, request):
        user = request.user
        business = user.business
        
        if business is None:
            return Response({'error': 'User is not registered with any business'}, status=status.HTTP_400_BAD_REQUEST)
        
        data = request.data
        plan_id = data.get('plan_id')
        
        if not plan_id:
            return Response({'error': 'Plan ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            from plans.models import Plans
            plan = Plans.objects.get(id=plan_id)
        except Plans.DoesNotExist:
            return Response({'error': 'Invalid plan ID'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Find current subscription if any
        current_subscription = Subscriptions.objects.filter(
            business=business
        ).order_by('-end_date').first()
        
        # If there's a current subscription that hasn't expired, use its end date as the start date
        if current_subscription and current_subscription.end_date >= timezone.now().date():
            start_date = current_subscription.end_date + datetime.timedelta(days=1)
        else:
            start_date = timezone.now().date()
            
        end_date = start_date + datetime.timedelta(days=plan.duration)
        
        # Create new subscription
        subscription = Subscriptions.objects.create(
            business=business,
            plan=plan,
            start_date=start_date,
            end_date=end_date,
            payment_status='PAID',  # Assuming payment is made
            subscription_status='ACTIVE',
            is_trial=False,
            last_payment_date=timezone.now(),
            next_billing_date=timezone.make_aware(
                datetime.datetime.combine(end_date - datetime.timedelta(days=5), datetime.time.min)
            )
        )
        
        return Response({
            'id': subscription.id,
            'plan': subscription.plan.id,
            'plan_name': subscription.plan.name_en,
            'start_date': subscription.start_date,
            'end_date': subscription.end_date,
            'subscription_status': subscription.subscription_status,
            'payment_status': subscription.payment_status,
            'is_trial': subscription.is_trial,
            'days_remaining': plan.duration
        }, status=status.HTTP_201_CREATED)