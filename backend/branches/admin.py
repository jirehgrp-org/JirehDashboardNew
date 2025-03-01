# branches/admin.py

from django.contrib import admin

# Register your models here.
from .models import Branches

class BranchesAdmin(admin.ModelAdmin):
    # list_display = ('name', 'address', 'contact_number', 'is_active')
    list_display = [field.name for field in Branches._meta.fields]
    
admin.site.register(Branches, BranchesAdmin)