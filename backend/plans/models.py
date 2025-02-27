# plans/models.py

from django.db import models

# Create your models here.
from django.core.validators import MinValueValidator

class Plans(models.Model):
    name_en = models.CharField(max_length=100, null=False)
    name_am = models.CharField(max_length=100, null=False)
    monthly_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    yearly_price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    duration = models.IntegerField(validators=[MinValueValidator(1)])
    description_en = models.TextField()
    description_am = models.TextField()
    is_active = models.BooleanField(default=True)
    is_hidden = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name_en and self.name_am
