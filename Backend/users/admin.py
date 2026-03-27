from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display  = ['name', 'email', 'role', 'active', 'date_joined']
    list_filter   = ['role', 'active']
    search_fields = ['name', 'email']
    ordering      = ['-date_joined']

    fieldsets = (
        ('Login Info',   {'fields': ('email', 'password')}),
        ('Personal',     {'fields': ('name', 'role', 'active')}),
        ('Address',      {'fields': ('street', 'city', 'state', 'zip_code', 'country')}),
        ('Permissions',  {'fields': ('is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields' : ('name', 'email', 'password1', 'password2', 'role'),
        }),
    )