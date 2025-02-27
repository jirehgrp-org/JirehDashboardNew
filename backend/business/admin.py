# business/admin.py

from django.contrib import admin
from .models import Business
from subscriptions.models import Subscriptions
from django.utils import timezone

class BusinessAdmin(admin.ModelAdmin):
    list_display = ('name', 'contact_number', 'registration_number', 'is_active', 'get_subscription_status', 'get_subscription_end_date', 'get_is_trial')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'registration_number', 'contact_number')
    date_hierarchy = 'created_at'
    readonly_fields = ('created_at', 'updated_at', 'get_subscription_info')
    
    fieldsets = (
        (None, {
            'fields': ('name', 'registration_number', 'is_active')
        }),
        ('Contact Information', {
            'fields': ('contact_number', 'address_street', 'address_city', 'address_country')
        }),
        ('Ownership', {
            'fields': ('owner', 'admin')
        }),
        ('Subscription Information', {
            'fields': ('get_subscription_info',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_subscription_status(self, obj):
        subscription = Subscriptions.objects.filter(business=obj).order_by('-end_date').first()
        if not subscription:
            return "No subscription"
        return subscription.subscription_status
    get_subscription_status.short_description = 'Subscription'
    
    def get_subscription_end_date(self, obj):
        subscription = Subscriptions.objects.filter(business=obj).order_by('-end_date').first()
        if not subscription:
            return "N/A"
        
        # Format date as YYYY-MM-DD
        return subscription.end_date.strftime("%Y-%m-%d")
    get_subscription_end_date.short_description = 'Expires'
    
    def get_is_trial(self, obj):
        subscription = Subscriptions.objects.filter(business=obj).order_by('-end_date').first()
        if not subscription:
            return False
        return subscription.is_trial
    get_is_trial.boolean = True
    get_is_trial.short_description = 'Trial'
    
    def get_subscription_info(self, obj):
        subscription = Subscriptions.objects.filter(business=obj).order_by('-end_date').first()
        if not subscription:
            return "No active subscription"
        
        today = timezone.now().date()
        days_remaining = (subscription.end_date - today).days if today <= subscription.end_date else 0
        
        return f"""
        Plan: {subscription.plan.name_en}
        Status: {subscription.subscription_status}
        Payment: {subscription.payment_status}
        Start Date: {subscription.start_date}
        End Date: {subscription.end_date}
        Days Remaining: {days_remaining}
        Trial: {"Yes" if subscription.is_trial else "No"}
        """
    get_subscription_info.short_description = 'Current Subscription'

admin.site.register(Business, BusinessAdmin)