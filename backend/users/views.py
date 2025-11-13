from rest_framework import generics, permissions, status, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import RegisterSerializer, UserSerializer
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            try:
                # Find user by email
                user = User.objects.get(email=email)
                # Authenticate with username (which is email in our case)
                user = authenticate(username=user.username, password=password)
                if user and user.is_active:
                    refresh = self.get_token(user)
                    return {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }
            except User.DoesNotExist:
                pass
        
        raise serializers.ValidationError('No active account found with the given credentials')

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            email = request.data.get('email')
            user = User.objects.get(email=email)
            user_serializer = UserSerializer(user)
            
            return Response({
                'user': user_serializer.data,
                'access': serializer.validated_data['access'],
                'refresh': serializer.validated_data['refresh']
            })
        except Exception as e:
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

# Registration endpoint
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]  # allow public access
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens for the new user
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        # Serialize user data
        user_serializer = UserSerializer(user)
        
        return Response({
            'user': user_serializer.data,
            'access': str(access_token),
            'refresh': str(refresh)
        }, status=status.HTTP_201_CREATED)
