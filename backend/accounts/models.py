# accounts/models.py

from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('owner', 'Owner'),
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('sales', 'Sales'),
        ('warehouse', 'Warehouse'),
    )
    username = models.CharField(max_length=100, unique=True)
    fullname = models.CharField(max_length=100, blank=True)
    email = models.EmailField(max_length=100, unique=True, blank=True, null=True)  # Made email optional
    phone = models.CharField(max_length=20)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='manager')
    is_active = models.BooleanField(default=True)
    last_login = models.DateTimeField(auto_now=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    business = models.ForeignKey('business.Business', on_delete=models.SET_NULL, null=True, blank=True)
    business_branch = models.ForeignKey('branches.Branches', on_delete=models.SET_NULL, null=True, blank=True)

    # These are crucial to avoid any AbstractUser fields
    first_name = None
    last_name = None

    class Meta:
        indexes = [        
            models.Index(fields=['phone', 'username'], name='idx_user_auth'),
            models.Index(fields=['business_branch', 'role'], name='idx_user_business_branch_role'),
            models.Index(fields=['business', 'is_active'], name='idx_user_business_status'),
            models.Index(fields=['business', 'business_branch', 'is_active'], name='idx_employee_lookup'),
            models.Index(fields=['phone', 'email'], name='idx_employee_contact'),
        ]
    
    def __str__(self):
        return self.username