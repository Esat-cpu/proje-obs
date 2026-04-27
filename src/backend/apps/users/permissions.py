from rest_framework.permissions import BasePermission

from .models import User


class RolePermission(BasePermission):
    role = None

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == self.role
        )

j
class IsOgrenci(RolePermission):
    role = User.Role.OGRENCI


class IsAkademisyen(RolePermission):
    role = User.Role.AKADEMISYEN


class IsYonetici(RolePermission):
    role = User.Role.YONETICI
