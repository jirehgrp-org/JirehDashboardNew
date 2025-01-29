from django.db import models

# Create your models here.

class Business(models.Model):
    name = models.CharField(max_length=100, null=False)
    address = models.TextField()
    contact_number = models.CharField(max_length=100, null=False)
    email = models.EmailField()
    website = models.URLField()
    description = models.TextField()
    registration_number = models.CharField(max_length=100, null=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # logo = models.ImageField(upload_to='logos/')
    # cover_photo = models.ImageField(upload_to='cover_photos/')
    # business_type = models.ForeignKey(BusinessType, on_delete=models.CASCADE)
    # business_category = models.ForeignKey(BusinessCategory, on_delete=models.CASCADE)
    # business_sub_category = models.ForeignKey(BusinessSubCategory, on_delete=models.CASCADE)
    # business_location = models.ForeignKey(BusinessLocation, on_delete=models.CASCADE)
    # business_owner = models.ForeignKey(BusinessOwner, on_delete=models.CASCADE)

    def __str__(self):
        return self.name