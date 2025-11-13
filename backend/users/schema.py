import graphene
from graphene_django import DjangoObjectType
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User


# GraphQL Types
class UserType(DjangoObjectType):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'display_name', 'avatar', 'date_joined')


# Input Types for Mutations
class RegisterInput(graphene.InputObjectType):
    username = graphene.String(required=True)
    email = graphene.String(required=True)
    password = graphene.String(required=True)
    first_name = graphene.String()
    last_name = graphene.String()
    display_name = graphene.String()


class LoginInput(graphene.InputObjectType):
    email = graphene.String()
    username = graphene.String()
    password = graphene.String(required=True)


# Mutations
class Register(graphene.Mutation):
    class Arguments:
        user_data = RegisterInput(required=True)

    user = graphene.Field(UserType)
    access_token = graphene.String()
    refresh_token = graphene.String()
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    @staticmethod
    def mutate(root, info, user_data):
        try:
            # Validate password
            validate_password(user_data.password)
            
            # Check if username exists
            if User.objects.filter(username=user_data.username).exists():
                return Register(success=False, errors=['Username already exists'])
            
            # Check if email exists
            if User.objects.filter(email=user_data.email).exists():
                return Register(success=False, errors=['Email already exists'])

            # Create user
            user = User.objects.create_user(
                username=user_data.username,
                email=user_data.email,
                password=user_data.password,
                first_name=user_data.get('first_name', ''),
                last_name=user_data.get('last_name', ''),
                display_name=user_data.get('display_name', '')
            )

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            return Register(
                user=user,
                access_token=access_token,
                refresh_token=refresh_token,
                success=True,
                errors=[]
            )

        except ValidationError as e:
            return Register(success=False, errors=e.messages)
        except Exception as e:
            return Register(success=False, errors=[str(e)])


class Login(graphene.Mutation):
    class Arguments:
        credentials = LoginInput(required=True)

    user = graphene.Field(UserType)
    access_token = graphene.String()
    refresh_token = graphene.String()
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    @staticmethod
    def mutate(root, info, credentials):
        try:
            # Try to authenticate with email or username
            user = None
            
            if credentials.get('email'):
                try:
                    user_obj = User.objects.get(email=credentials.email)
                    user = authenticate(username=user_obj.username, password=credentials.password)
                except User.DoesNotExist:
                    pass
            elif credentials.get('username'):
                user = authenticate(username=credentials.username, password=credentials.password)

            if user is None:
                return Login(success=False, errors=['Invalid credentials'])

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            return Login(
                user=user,
                access_token=access_token,
                refresh_token=refresh_token,
                success=True,
                errors=[]
            )

        except Exception as e:
            return Login(success=False, errors=[str(e)])


# Queries
class Query(graphene.ObjectType):
    me = graphene.Field(UserType)
    user = graphene.Field(UserType, id=graphene.ID(required=True))

    def resolve_me(self, info):
        user = info.context.user
        if user.is_authenticated:
            return user
        return None

    def resolve_user(self, info, id):
        try:
            return User.objects.get(id=id)
        except User.DoesNotExist:
            return None


# Mutations
class Mutation(graphene.ObjectType):
    register = Register.Field()
    login = Login.Field()