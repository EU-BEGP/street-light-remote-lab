from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework.authtoken.models import Token
from urllib.parse import parse_qs


@database_sync_to_async
def return_user(token_string):
    """Retrieve user associated with the given token string, or return an AnonymousUser."""
    try:
        token = Token.objects.get(key=token_string)
        return token.user
    except Token.DoesNotExist:
        return AnonymousUser()


class TokenAuthMiddleware:
    """Middleware for token-based authentication."""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        """Handle incoming requests and assign user to scope."""
        # Initialize user as AnonymousUser
        scope["user"] = AnonymousUser()

        query_string = scope.get("query_string", b"")
        if query_string:
            query_params = query_string.decode()
            query_dict = parse_qs(query_params)
            token = query_dict.get("token", [None])[0]

            if token:
                scope["user"] = await return_user(token)

        # Call the next layer of the application
        return await self.app(scope, receive, send)
