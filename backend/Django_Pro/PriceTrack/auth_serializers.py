from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

# ---------------------------------------------
# 🔑 LoginSerializer
# Extends SimpleJWT's TokenObtainPairSerializer
# ---------------------------------------------
class LoginSerializer(TokenObtainPairSerializer):
    """
    Extends SimpleJWT to also return a minimal user object along with access/refresh tokens.
    """

    @classmethod
    def get_token(cls, user):
        """
        Customize JWT token payload (optional claims)
        Adds username and email to the token for easier client use.
        """
        token = super().get_token(user)
        token["username"] = user.username
        token["email"] = user.email
        return token

    def validate(self, attrs):
        """
        Called during login to validate credentials.
        Adds user info to the response payload alongside tokens.
        """
        # Run the default SimpleJWT validation to get access & refresh tokens
        data = super().validate(attrs)

        # Add minimal user details to the response
        user = self.user
        data["user"] = {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_admin": user.is_staff or user.is_superuser,
            "is_superuser": user.is_superuser,
            "is_staff": user.is_staff
}
        return data
