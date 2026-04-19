from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from apps.users.models import User, Ogrenci, Akademisyen, Yonetici


class AkademisyenInline(admin.StackedInline):
    model = Akademisyen
    can_delete = False
    extra = 1


class OgrenciInline(admin.StackedInline):
    model = Ogrenci
    can_delete = False
    extra = 1


class YoneticiInline(admin.StackedInline):
    model = Yonetici
    can_delete = False
    extra = 1



@admin.register(User)
class CustomUserAdmin(UserAdmin):
    search_fields = ["username", "ad", "soyad", "email"]
    list_display = ["username", "ad", "soyad", "role", "is_active"]

    fieldsets = (
        (None, {"fields": ("username", "password")}),
        ("Kişisel Bilgiler", {"fields": ("ad", "soyad", "email")}),
        ("Rol", {"fields": ("role",)}),
        ("İzinler", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Önemli Tarihler", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (None, {"fields": ("username", "password1", "password2")}),
        ("Kişisel Bilgiler", {"fields": ("ad", "soyad", "email")}),
        ("Rol", {"fields": ("role",)}),
    )


    def get_inlines(self, request, obj=None):
        if obj is None:
            return []
        if obj.role == User.Role.OGRENCI:
            return [OgrenciInline]
        if obj.role == User.Role.AKADEMISYEN:
            return [AkademisyenInline]
        if obj.role == User.Role.YONETICI:
            return [YoneticiInline]
        return []


@admin.register(Ogrenci)
class OgrenciAdmin(admin.ModelAdmin):
    search_fields = ["ogr_no", "user__ad", "user__soyad"]
    list_display = ["ogr_no", "user", "bolum", "sinif", "gpa"]


@admin.register(Akademisyen)
class AkademisyenAdmin(admin.ModelAdmin):
    search_fields = ["user__ad", "user__soyad"]
    list_display = ["user", "unvan", "bolum"]


@admin.register(Yonetici)
class YoneticiAdmin(admin.ModelAdmin):
    search_fields = ["user__ad", "user__soyad"]
    list_display = ["user"]
