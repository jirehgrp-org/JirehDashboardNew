# expenses/admin.py

from django.contrib import admin
from .models import Expenses

class ExpensesAdmin(admin.ModelAdmin):
    list_display = ('name', 'amount', 'description', 'expense_date', 'recurring_frequency', 'business', 'is_active')
    list_filter = ('is_active', 'recurring_frequency', 'payment_method', 'business')
    search_fields = ('name', 'description')
    date_hierarchy = 'expense_date'

admin.site.register(Expenses, ExpensesAdmin)