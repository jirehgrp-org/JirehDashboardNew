# expenses/models.py

from django.db import models

class Expenses(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('Cash', 'Cash'),
        ('Telebirr', 'Telebirr'),
        ('Bank Transfer', 'Bank Transfer'),
        ('Credit', 'Credit')
    ]

    RECURRING_FREQUENCY_CHOICES = [
        ('once', 'One Time'),
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('halfYearly', 'Half Yearly'),
        ('yearly', 'Yearly')
    ]

    amount = models.DecimalField(max_digits=10, decimal_places=2)
    name = models.CharField(max_length=100, default="Expense")
    description = models.TextField(null=True, blank=True)
    expense_date = models.DateField()
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    receipt_number = models.CharField(max_length=50, null=True, blank=True)
    recurring_frequency = models.CharField(max_length=20, choices=RECURRING_FREQUENCY_CHOICES, null=True, blank=True)
    recurring_end_date = models.DateField(null=True, blank=True)    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    business = models.ForeignKey('business.Business', on_delete=models.CASCADE)
    business_branch = models.ForeignKey('branches.Branches', on_delete=models.SET_NULL, null=True, blank=True)
    created_by = models.ForeignKey('accounts.CustomUser', on_delete=models.CASCADE)
    is_active = models.BooleanField(default=True)

    class Meta:
        indexes = [
            models.Index(fields=['expense_date', 'amount'], name='idx_expense_date_amount'),
            models.Index(fields=['recurring_frequency'], name='idx_recurring_frequency'),
            models.Index(fields=['business', 'business_branch', 'expense_date'], name='idx_expense_lookup'),
        ]