from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.urls import path
from django.shortcuts import render
from django.http import FileResponse
from django.contrib import messages
from django.core.exceptions import ValidationError

from apps.users.models import User, Ogrenci, Akademisyen, Yonetici
from apps.users.services import UsersService


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
    change_list_template = 'admin/users/ogrenci_change_list.html'

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('toplu-kayit/', self.admin_site.admin_view(self.toplu_kayit_view), name='ogrenci_toplu_kayit'),
        ]
        return custom_urls + urls

    def toplu_kayit_view(self, request):
        if request.method == 'POST' and request.FILES.get('excel_dosya'):
            try:
                dosya = request.FILES['excel_dosya']
                sonuc = UsersService.ogrenci_kaydi_excel(dosya)

                messages.success(
                    request,
                    f"{sonuc['basarili']} öğrenci başarıyla kaydedildi."
                )

                response = FileResponse(
                    sonuc['dosya'],
                    as_attachment=True,
                    filename='ogrenciler_sifreli.xlsx'
                )
                return response

            except ValidationError as e:
                # Ana hata mesajı
                messages.error(request, f"{e.message.split(chr(10))[0]}")  # İlk satır

                # Detayları ayrı mesajlar olarak ekle
                if hasattr(e, 'params') and e.params:
                    for hata in e.params.get('hatalar', []):
                        messages.warning(request, f"Satır {hata['satir']}: {hata['hata']}")

            except Exception as e:
                messages.error(request, f"Beklenmeyen hata: {str(e)}")

        context = {
            **self.admin_site.each_context(request),
            'opts': self.model._meta,
            'title': 'Toplu Öğrenci Kaydı',
        }
        return render(request, 'admin/users/toplu_ogrenci_kaydi.html', context)


@admin.register(Akademisyen)
class AkademisyenAdmin(admin.ModelAdmin):
    search_fields = ["user__ad", "user__soyad"]
    list_display = ["user", "unvan", "bolum"]


@admin.register(Yonetici)
class YoneticiAdmin(admin.ModelAdmin):
    search_fields = ["user__ad", "user__soyad"]
    list_display = ["user"]
