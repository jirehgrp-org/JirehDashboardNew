from django.contrib import admin
from .models import Categories

class CategoriesAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'is_active', 'business')
    list_filter = ('is_active', 'business')
    search_fields = ('name', 'description')

admin.site.register(Categories, CategoriesAdmin)