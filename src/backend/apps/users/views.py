from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.models import Akademisyen, Ogrenci
from apps.users.permissions import IsAkademisyen, IsOgrenci
from apps.users.serializers import AkademisyenOkuSerializer, OgrenciOkuSerializer


class OgrenciProfilView(APIView):
    """
    GET /api/student/profile/
    Oturum açan öğrencinin kendi profilini döner.
    Yalnızca OGRENCI rolüne sahip kullanıcılar erişebilir.
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
    Yalnızca AKADEMISYEN rolüne sahip kullanıcılar erişebilir.
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