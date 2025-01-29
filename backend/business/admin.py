from django.contrib import admin
from .models import Business

class BusinessAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'contact_number') 


admin.site.register(Business, BusinessAdmin)
