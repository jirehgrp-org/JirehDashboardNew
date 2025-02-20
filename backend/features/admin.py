from django.contrib import admin

# Register your models here.
from .models import Features

class FeaturesAdmin(admin.ModelAdmin):
    list_display = ('title_en', 'created_at', 'updated_at')

admin.site.register(Features, FeaturesAdmin)