# business/admin.py

from django.contrib import admin
from .models import Business
# from .forms import BusinessChangeForm, BusinessCreationForm

class BusinessAdmin(admin.ModelAdmin):
    # model = Business
    # add_form = BusinessCreationForm
    # form = BusinessChangeForm
    list_display = ('name', 'contact_number') 


admin.site.register(Business, BusinessAdmin)
