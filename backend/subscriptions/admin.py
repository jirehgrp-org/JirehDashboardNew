# subscriptions/admin.py

from django.contrib import admin
from .models import Subscriptions

class SubscriptionsAdmin(admin.ModelAdmin):
    list_display = ('business', 'plan', 'start_date', 'end_date', 'subscription_status', 'payment_status', 'is_trial')
    list_filter = ('subscription_status', 'payment_status', 'is_trial')
    search_fields = ('business__name',)
    date_hierarchy = 'start_date'
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        (None, {
            'fields': ('business', 'plan')
        }),
        ('Subscription Details', {
            'fields': ('subscription_status', 'is_trial', 'start_date', 'end_date')
        }),
        ('Payment Information', {
            'fields': ('payment_status', 'last_payment_date', 'next_billing_date')
        }),
        ('Retry Information', {
            'fields': ('retry_count', 'last_retry_date')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

admin.site.register(Subscriptions, SubscriptionsAdmin)
