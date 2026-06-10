from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    # Ini yang membuat kolom is_admin dan is_member muncul di daftar tabel
    list_display = ('username', 'email', 'is_admin', 'is_member', 'is_staff')
    
    # Ini agar saat edit user, field tersebut bisa diubah
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('is_admin', 'is_member')}),
    )

admin.site.register(CustomUser, CustomUserAdmin)