from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.models import Akademisyen, Ogrenci, User
from apps.users.permissions import IsAkademisyen, IsOgrenci
from apps.users.serializers import AkademisyenOkuSerializer, OgrenciOkuSerializer, UserSerializer


class MeView(APIView):
    """
    GET /api/me/
    Giriş yapan kullanıcının rolünü ve profile bilgilerini döner.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            if user.role == User.Role.OGRENCI:
                profil = OgrenciOkuSerializer(user.ogrenci).data
            elif user.role == User.Role.AKADEMISYEN:
                profil = AkademisyenOkuSerializer(user.akademisyen).data
            else:
                profil = UserSerializer(user).data
        except (Ogrenci.DoesNotExist, Akademisyen.DoesNotExist):
            profil = UserSerializer(user).data

        return Response({"role": user.role, "profil": profil})


class OgrenciProfilView(APIView):
    """
    GET /api/student/profile/
    Oturum açan öğrencinin kendi profilini döner.
    """
    permission_classes = [IsOgrenci]

    def get(self, request):
        try:
            ogrenci = request.user.ogrenci
        except Ogrenci.DoesNotExist:
            return Response(
                {"detail": "Öğrenci profili bulunamadı."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = OgrenciOkuSerializer(ogrenci)
        return Response(serializer.data)


class AkademisyenProfilView(APIView):
    """
    GET /api/academician/profile/
    Oturum açan akademisyenin kendi profilini döner.
    """
    permission_classes = [IsAkademisyen]

    def get(self, request):
        try:
            akademisyen = request.user.akademisyen
        except Akademisyen.DoesNotExist:
            return Response(
                {"detail": "Akademisyen profili bulunamadı."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = AkademisyenOkuSerializer(akademisyen)
        return Response(serializer.data)
