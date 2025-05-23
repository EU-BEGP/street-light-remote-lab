# Copyright (c) Universidad Privada Boliviana (UPB) - EU-BEGP
# MIT License - See LICENSE file in the root directory
# Boris Pedraza, Alex Villazon, Omar Ormachea

from django.utils import timezone
from rest_framework import authentication, generics, permissions, status
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.response import Response
from rest_framework.settings import api_settings
from users.models import User
from users.serializers import (
    UserSerializer,
    AuthTokenSerializer,
    UserProfileSerializer,
    AccountActivationSerializer,
)
from utils.tools import send_custom_email
import random


class CreateUserView(generics.CreateAPIView):
    """Create a new user"""

    serializer_class = UserSerializer


class CreateTokenView(ObtainAuthToken):
    """Get token for user"""

    serializer_class = AuthTokenSerializer
    renderer_classes = api_settings.DEFAULT_RENDERER_CLASSES


class ManageUserView(generics.RetrieveUpdateAPIView):
    """Manage the authenticated user"""

    serializer_class = UserProfileSerializer
    authentication_classes = (authentication.TokenAuthentication,)
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        """Retrieve and return authentication user"""
        return self.request.user


class ActivateUserAccount(generics.UpdateAPIView):
    serializer_class = AccountActivationSerializer
    queryset = User.objects.all()

    def update(self, request, *args, **kwargs):
        queryset = self.get_queryset().filter(is_active=False)
        user_id = request.data.get("id", None)
        entered_code = request.data.get("verification_code", None)
        current_time = timezone.now()

        try:
            user = queryset.get(
                id=user_id,
                email_verification_code=entered_code,
                email_expiration_time__gt=current_time,
            )
            user.is_active = True
            user.save()
            return Response({"message": "User account activated successfully"})
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid verification code or code has expired"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class RequestVerificationCode(generics.UpdateAPIView):
    serializer_class = AccountActivationSerializer
    queryset = User.objects.all()

    def update(self, request, *args, **kwargs):
        user_id = request.data.get("id", None)
        verification_code = "".join(random.choices("0123456789", k=6))
        expiration_time = timezone.now() + timezone.timedelta(minutes=15)

        try:
            user = User.objects.get(id=user_id)
            user.email_verification_code = verification_code
            user.email_expiration_time = expiration_time
            user.is_active = False
            user.save()

            subject = "User Account Activation"

            context = {
                "user_name": user.name + " " + user.last_name,
                "verification_code": verification_code,
            }
            template_name = "user_account_activation_template.html"
            recipient = [user.email]

            send_custom_email(subject, template_name, context, recipient)

            return Response({"message": "Verification code sent successfully"})
        except User.DoesNotExist:
            return Response(
                {"error": "User does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )
