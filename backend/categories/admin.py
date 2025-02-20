from django.contrib import admin

# Register your models here.
from .models import Categories

class CategoriesAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'is_active') 


admin.site.register(Categories, CategoriesAdmin)