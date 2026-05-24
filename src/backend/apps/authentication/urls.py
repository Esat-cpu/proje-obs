from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import CustomTokenObtainPairView, LogoutView


urlpatterns = [
    # POST /api/auth/token/
    path("token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),

    # POST /api/auth/token/refresh/
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # POST /api/auth/logout/
    path("logout/", LogoutView.as_view(), name="logout"),
]
