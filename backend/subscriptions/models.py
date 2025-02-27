# subscriptions/models.py

from django.db import models
from django.utils import timezone
import datetime

class Subscriptions(models.Model):
    SUBSCRIPTION_STATUS_CHOICES = [
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('EXPIRED', 'Expired'),
        ('CANCELLED', 'Cancelled'),
        ('TRIAL', 'Trial')
    ]

    PAYMENT_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('FAILED', 'Failed')
    ]

    start_date = models.DateField(null=False)
    end_date = models.DateField(null=False)
    payment_status = models.CharField(max_length=10, choices=PAYMENT_STATUS_CHOICES, default='PENDING', null=False)
    subscription_status = models.CharField(max_length=10, choices=SUBSCRIPTION_STATUS_CHOICES, default='TRIAL', null=False)
    last_payment_date = models.DateTimeField(null=True, blank=True)
    next_billing_date = models.DateTimeField(null=True, blank=True)
    retry_count = models.IntegerField(default=0)
    last_retry_date = models.DateTimeField(null=True, blank=True)
    is_trial = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    business = models.ForeignKey('business.Business', on_delete=models.CASCADE, related_name='subscriptions')
    plan = models.ForeignKey('plans.Plans', on_delete=models.CASCADE)
    
    class Meta:
        indexes = [
            models.Index(fields=['business', 'payment_status', 'end_date'], name='idx_subscription_tracking'),
            models.Index(fields=['subscription_status', 'end_date'], name='idx_subscription_status'),
        ]
        verbose_name = 'Subscription'
        verbose_name_plural = 'Subscriptions'
    
    def __str__(self):
        return f"{self.business.name} - {self.plan.name_en} ({self.subscription_status})"
    
    def save(self, *args, **kwargs):
        # When creating a new subscription record
        if not self.pk:
            # If it's a trial subscription, set appropriate values
            if self.is_trial:
                self.subscription_status = 'TRIAL'
                # If start date isn't provided, use today
                if not self.start_date:
                    self.start_date = timezone.now().date()
                # If end date isn't provided, set to 14 days from start
                if not self.end_date:
                    self.end_date = self.start_date + datetime.timedelta(days=14)
            # If it's a paid subscription and it's active
            elif self.payment_status == 'PAID':
                self.subscription_status = 'ACTIVE'
                # If start date isn't provided, use today
                if not self.start_date:
                    self.start_date = timezone.now().date()
                # If end date isn't provided, set based on plan duration (days)
                if not self.end_date:
                    self.end_date = self.start_date + datetime.timedelta(days=self.plan.duration)
                
                # Set next billing date to 5 days before expiration
                if not self.next_billing_date:
                    self.next_billing_date = timezone.make_aware(
                        datetime.datetime.combine(
                            self.end_date - datetime.timedelta(days=5),
                            datetime.time.min
                        )
                    )
        
        # Check if subscription has expired (but don't change status if it's cancelled)
        if self.subscription_status != 'CANCELLED' and timezone.now().date() > self.end_date:
            self.subscription_status = 'EXPIRED'
        
        super().save(*args, **kwargs)