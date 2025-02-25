# business/models.py

from django.db import models

# Create your models here.

class Business(models.Model):
    name = models.CharField(max_length=100)
    address_street = models.TextField(default='Unkown')
    address_city = models.TextField(default='Unkown')
    address_country = models.TextField(default='Ethiopia')
    contact_number = models.CharField(max_length=15)
    registration_number = models.CharField(max_length=100, unique=True, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    owner = models.ForeignKey('accounts.CustomUser', on_delete=models.SET_NULL, null=True, blank=True, related_name='owner_businesses')
    admin = models.ForeignKey('accounts.CustomUser', on_delete=models.SET_NULL, null=True, blank=True, related_name='admin_businesses')
    # customuser_set = models.ManyToManyField('accounts.CustomUser', related_name='businesses')

    class Meta:
        indexes = [
            models.Index(fields=['owner', 'is_active'], name='idx_business_owner'),
            models.Index(fields=['admin', 'is_active'], name='idx_business_admin'),
        ]

    def __str__(self):
        return self.name

