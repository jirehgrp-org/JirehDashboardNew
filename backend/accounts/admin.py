from django.contrib import admin

from django.contrib.auth.admin import UserAdmin
from .forms import CustomUserCreationForm, CustomUserChangeForm
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser
    list_display = [
        'email',
        'username',
        'fullname',
        'role',
        'is_staff'
    ]


    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('fullname', 'email', 'phone')}),
        ('Business info', {'fields': ('business', 'business_branch')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        # ('Important dates', {'fields': ('', 'last_login'), 'classes': ('collapse',)}),
    )

    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'fullname', 'email', 'phone', 'role', 'business', 'business_branch', 'password1', 'password2'),
        }),
    )

admin.site.register(CustomUser, CustomUserAdmin)