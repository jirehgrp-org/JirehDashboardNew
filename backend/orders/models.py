# orders/models.py

from django.db import models

# Create your models here.

class Orders(models.Model):
    
    order_number = models.CharField(max_length=30, unique=True, null=False)
    customer_name = models.CharField(max_length=100)
    customer_phone = models.CharField(max_length=20)
    customer_email = models.EmailField(max_length=100, blank=True, null=True)

    order_date = models.DateTimeField()
    status = models.CharField(max_length=10, choices=[('pending', 'Pending'), ('completed', 'Completed'), ('cancelled', 'Cancelled')], default='pending')

    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    payment_status = models.CharField(max_length=10, choices=[('pending', 'Pending'), ('paid', 'Paid'), ('cancelled', 'Cancelled')], default='pending')
    payment_method = models.CharField(max_length=20, choices=[('Cash', 'Cash'), ('Telebirr', 'Telebirr'), ('Bank Transfer', 'Bank Transfer'), ('Credit', 'Credit')], default='Cash')
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    remaining_amount = models.DecimalField(max_digits=10, decimal_places=2, editable=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    business = models.ForeignKey('business.Business', on_delete=models.CASCADE)
    business_branch = models.ForeignKey('branches.Branches', on_delete=models.CASCADE)
    user = models.ForeignKey('accounts.CustomUser', on_delete=models.CASCADE)

    def save(self, *args, **kwargs):
        self.remaining_amount = self.total_amount - self.paid_amount
        super().save(*args, **kwargs)

    class Meta:
        indexes = [
            models.Index(fields=['business', 'business_branch', 'status', 'order_date'], name='idx_order_lookup'),
            models.Index(fields=['payment_status', 'payment_method', 'total_amount'], name='idx_order_payment'),
            models.Index(fields=['customer_phone', 'customer_email'], name='idx_order_customer'),
            models.Index(fields=['order_number', 'status', 'payment_status'], name='idx_order_number_search'),
        ]

    # def __int__(self):
    #     return self.order_number


class Order_items(models.Model):
        
    quantity = models.IntegerField(null=False)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, null=False)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, null=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    order_id = models.ForeignKey(Orders, on_delete=models.CASCADE)
    item = models.ForeignKey('items.Items', on_delete=models.CASCADE)
    category = models.ForeignKey('categories.Categories', on_delete=models.CASCADE)

    # def __int__(self):
    #     return self.order_id