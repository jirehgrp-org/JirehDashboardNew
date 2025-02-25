# categories/models.py

from django.db import models

# Create your models here.

class Categories(models.Model):
    name = models.CharField(max_length=100, null=False)
    description = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    business = models.ForeignKey('business.Business', on_delete=models.CASCADE, null=True)  # Add this line

    class Meta:
        indexes = [
            models.Index(fields=['is_active'], name='idx_category'),
            models.Index(fields=['business', 'is_active'], name='idx_category_business'),  # Add this index
        ]

    def __str__(self):
        return self.name