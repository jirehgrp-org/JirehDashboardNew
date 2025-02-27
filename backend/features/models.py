# features/models.py

from django.db import models

# Create your models here.

class Features(models.Model):
    title_en = models.CharField(max_length=255)
    title_am = models.CharField(max_length=255)
    included = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    plan_id = models.ForeignKey('plans.Plans', on_delete=models.CASCADE)

    class Meta:
        indexes = [
            models.Index(fields=['plan_id'], name='idx_plan_id'),
        ]