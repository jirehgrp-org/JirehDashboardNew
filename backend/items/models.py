from django.db import models

# Create your models here.
class Items(models.Model):
    UNIT_OF_MEASURE_CHOICES = [
        ('pieces', 'Pieces'),
        ('kg', 'Kilograms'),
        ('g', 'Grams'),
        ('L', 'Liters'),
        ('ml', 'Milliliters'),
        ('m', 'Meters'),
        ('box', 'Box'),
        ('pack', 'Pack'),
    ]
    name = models.CharField(max_length=100, null=False)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=False)
    quantity = models.IntegerField(default=0, null=False)
    last_inventory_update = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    unit_of_measure = models.CharField( max_length=10, choices=UNIT_OF_MEASURE_CHOICES, null=True, blank=True )
    category = models.ForeignKey('categories.Categories', on_delete=models.CASCADE)
    business_branch = models.ForeignKey('branches.Branches', on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['category', 'quantity'], name='idx_item_inventory'),
        ]
