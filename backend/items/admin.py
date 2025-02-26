# items/admin.py

from django.contrib import admin
from .models import Items

class ItemsAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'quantity', 'category', 'business_branch', 'is_active')
    list_filter = ('is_active', 'category', 'business_branch', 'business')
    search_fields = ('name',)
    readonly_fields = ('created_at', 'updated')

admin.site.register(Items, ItemsAdmin)