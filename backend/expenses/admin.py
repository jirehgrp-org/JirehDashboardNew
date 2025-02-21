from django.contrib import admin

# Register your models here.
from .models import Expenses

class ExpensesAdmin(admin.ModelAdmin):
    list_display = ('amount', 'description', 'expense_date', 'business')

admin.site.register(Expenses, ExpensesAdmin)