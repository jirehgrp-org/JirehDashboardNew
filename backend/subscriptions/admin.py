from django.contrib import admin

# Register your models here.
from .models import Subscriptions

class SubscriptionsAdmin(admin.ModelAdmin):
    list_display = ('business', 'plan', 'start_date', 'end_date', 'subscription_status')

admin.site.register(Subscriptions, SubscriptionsAdmin)