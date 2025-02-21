from django.db import models

# Create your models here.

class Subscriptions(models.Model):
    SUBSCRIPTION_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('EXPIRED', 'Expired')
    ]

    PAYMENT_STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PAID', 'Paid'),
        ('FAILED', 'Failed')
    ]

    start_date = models.DateField(null=False)
    end_date = models.DateField(null=False)
    payment_status = models.CharField(max_length=8, choices=PAYMENT_STATUS_CHOICES, default='PENDING', null=False )
    subscription_status = models.CharField(max_length=9, choices=SUBSCRIPTION_STATUS_CHOICES, default='INACTIVE', null=False)
    last_payment_date = models.DateTimeField(null=True, blank=True)
    next_billing_date = models.DateTimeField(null=False)
    retry_count = models.IntegerField(default=0)
    last_retry_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    business = models.ForeignKey('business.Business', on_delete=models.CASCADE)
    plan = models.ForeignKey('plans.Plans', on_delete=models.CASCADE)
    
    class Meta:
        indexes = [
            models.Index(fields=['business', 'payment_status', 'end_date'], name='idx_subscription_tracking'),
        ]
        