from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.departments.serializers import BolumSerializer
from apps.departments.services import DepartmentsService


class BolumListView(APIView):
    """
    GET /api/departments/
    Sistemdeki tüm bölümleri listeler. Tüm kimlik doğrulanmış kullanıcılar erişebilir.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bolumler = DepartmentsService.bolum_listesi_getir()
        serializer = BolumSerializer(bolumler, many=True)
        return Response(serializer.data)
