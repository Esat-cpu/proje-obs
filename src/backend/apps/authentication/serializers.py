from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from apps.users.models import User, Ogrenci


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        return token

    def validate(self, attrs):
        identifier = attrs.get('username')  # frontend'den gelen değer
        password = attrs.get('password')

        user = None

        # Önce öğrenci numarası ile dene
        ogr = Ogrenci.objects.filter(ogr_no=identifier).first()
        if ogr: user = ogr.user

        # Bulamazsa normal username ile dene
        if not user:
            user = User.objects.filter(
                username=identifier,
            ).exclude(
                role=User.Role.OGRENCI,
            ).first()

        if not user or not user.check_password(password):
            raise AuthenticationFailed('Geçersiz kimlik bilgileri')

        # User bulundu, parent serializer için username'i set et
        attrs['username'] = user.username
        return super().validate(attrs)
