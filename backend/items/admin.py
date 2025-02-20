from django.contrib import admin

# Register your models here.
from .models import Items

class ItemsAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'quantity', 'created_at', 'updated')

admin.site.register(Items, ItemsAdmin)