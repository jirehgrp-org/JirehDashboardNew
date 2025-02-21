from django.db import models

# Create your models here.

class Branches(models.Model):
    name = models.CharField(max_length=100, null=False)
    address = models.TextField(null=False)
    contact_number = models.CharField(max_length=20, null=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    business = models.ForeignKey('business.Business', on_delete=models.CASCADE)

    class Meta:
        indexes = [
            models.Index(fields=['business', 'is_active'], name='idx_branch_business'),
            models.Index(fields=['is_active', 'business'], name='idx_branch_status'),
        ]

    def __str__(self):
        # return self.name and self.address
        return self.name