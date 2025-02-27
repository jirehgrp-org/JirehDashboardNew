# business/models.py

from django.db import models
from django.utils import timezone

class Business(models.Model):
    name = models.CharField(max_length=100)
    address_street = models.TextField(default='Unknown')
    address_city = models.TextField(default='Unknown')
    address_country = models.TextField(default='Ethiopia')
    contact_number = models.CharField(max_length=15)
    registration_number = models.CharField(max_length=100, unique=True, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    owner = models.ForeignKey('accounts.CustomUser', on_delete=models.SET_NULL, null=True, blank=True, related_name='owner_businesses')
    admin = models.ForeignKey('accounts.CustomUser', on_delete=models.SET_NULL, null=True, blank=True, related_name='admin_businesses')

    class Meta:
        indexes = [
            models.Index(fields=['owner', 'is_active'], name='idx_business_owner'),
            models.Index(fields=['admin', 'is_active'], name='idx_business_admin'),
        ]
        verbose_name = 'Business'
        verbose_name_plural = 'Businesses'

    def __str__(self):
        return self.name
    
    @property
    def current_subscription(self):
        """Get the most recent subscription for this business"""
        from subscriptions.models import Subscriptions
        return Subscriptions.objects.filter(business=self).order_by('-end_date').first()
    
    @property
    def subscription_status(self):
        """Get the current subscription status"""
        subscription = self.current_subscription
        if not subscription:
            return "NO_SUBSCRIPTION"
        return subscription.subscription_status
    
    @property
    def is_subscription_active(self):
        """Check if business has an active subscription"""
        subscription = self.current_subscription
        if not subscription:
            return False
        
        # Check if subscription is active and not expired
        today = timezone.now().date()
        return (subscription.subscription_status in ['ACTIVE', 'TRIAL'] and 
                subscription.end_date >= today)
    
    @property
    def subscription_days_remaining(self):
        """Get number of days remaining in current subscription"""
        subscription = self.current_subscription
        if not subscription:
            return 0
        
        today = timezone.now().date()
        if today > subscription.end_date:
            return 0
        return (subscription.end_date - today).days