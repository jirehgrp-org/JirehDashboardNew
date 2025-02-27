# plans/admin.py

from django.contrib import admin

# Register your models here.
from .models import Plans

class PlansAdmin(admin.ModelAdmin):
    list_display = ('name_en', 'monthly_price', 'duration')


admin.site.register(Plans, PlansAdmin)