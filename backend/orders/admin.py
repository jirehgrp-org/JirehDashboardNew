from django.contrib import admin

# Register your models here.
from .models import Orders, Order_items

class OrdersAdmin(admin.ModelAdmin):
    list_display = ('customer_name', 'order_number', 'status', 'business', 'business_branch')

class OrderItemsAdmin(admin.ModelAdmin):
    list_display = ('order_id', 'unit_price', 'subtotal','item', 'quantity', 'category')
    
admin.site.register(Orders, OrdersAdmin)
admin.site.register(Order_items, OrderItemsAdmin)