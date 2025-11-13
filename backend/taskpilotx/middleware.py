from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from django.utils.decorators import sync_and_async_middleware
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError


User = get_user_model()


@sync_and_async_middleware
def JWTAuthenticationMiddleware(get_response):
    """
    Middleware to authenticate users via JWT tokens for GraphQL requests
    """
    
    def middleware(request):
        # Initialize user as anonymous
        request.user = AnonymousUser()
        
        # Get the authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            
            try:
                # Use JWT authentication to validate token
                jwt_auth = JWTAuthentication()
                validated_token = jwt_auth.get_validated_token(token)
                user = jwt_auth.get_user(validated_token)
                
                if user:
                    request.user = user
                    
            except (InvalidToken, TokenError, User.DoesNotExist):
                # Token is invalid or user doesn't exist
                request.user = AnonymousUser()
        
        response = get_response(request)
        return response
    
    return middleware