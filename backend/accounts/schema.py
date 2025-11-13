import graphene
from graphene_django import DjangoObjectType
from django.conf import settings
from .models import LinkedAccount


# GraphQL Types
class LinkedAccountType(DjangoObjectType):
    class Meta:
        model = LinkedAccount
        exclude = ('encrypted_token', 'refresh_token')  # Don't expose sensitive tokens


# Input Types for Mutations
class LinkedAccountInput(graphene.InputObjectType):
    service_name = graphene.String(required=True)
    account_identifier = graphene.String(required=True)
    token = graphene.String(required=True)
    refresh_token = graphene.String()


# Mutations
class LinkAccount(graphene.Mutation):
    class Arguments:
        service_name = graphene.String(required=True)
        account_identifier = graphene.String(required=True)
        token = graphene.String(required=True)
        refresh_token = graphene.String()

    account = graphene.Field(LinkedAccountType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    @staticmethod
    def mutate(root, info, service_name, account_identifier, token, refresh_token=None):
        user = info.context.user
        if not user.is_authenticated:
            return LinkAccount(success=False, errors=['Authentication required'])

        try:
            # Check if account already exists
            existing_account = LinkedAccount.objects.filter(
                owner=user,
                service_name=service_name,
                account_identifier=account_identifier
            ).first()

            if existing_account:
                # Update existing account
                existing_account.set_token(token)
                if refresh_token:
                    existing_account.set_refresh_token(refresh_token)
                existing_account.is_active = True
                existing_account.save()
                return LinkAccount(account=existing_account, success=True, errors=[])
            else:
                # Create new account
                account = LinkedAccount.objects.create(
                    owner=user,
                    service_name=service_name,
                    account_identifier=account_identifier,
                )
                account.set_token(token)
                if refresh_token:
                    account.set_refresh_token(refresh_token)
                account.save()
                return LinkAccount(account=account, success=True, errors=[])

        except Exception as e:
            return LinkAccount(success=False, errors=[str(e)])


class UnlinkAccount(graphene.Mutation):
    class Arguments:
        account_id = graphene.ID(required=True)

    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    @staticmethod
    def mutate(root, info, account_id):
        user = info.context.user
        if not user.is_authenticated:
            return UnlinkAccount(success=False, errors=['Authentication required'])

        try:
            account = LinkedAccount.objects.get(id=account_id, owner=user)
            account.delete()
            return UnlinkAccount(success=True, errors=[])
        except LinkedAccount.DoesNotExist:
            return UnlinkAccount(success=False, errors=['Account not found'])
        except Exception as e:
            return UnlinkAccount(success=False, errors=[str(e)])


# Queries
class Query(graphene.ObjectType):
    linked_accounts = graphene.List(LinkedAccountType, user_id=graphene.Int())
    linked_account = graphene.Field(LinkedAccountType, id=graphene.ID(required=True))

    def resolve_linked_accounts(self, info, user_id=None):
        user = info.context.user
        if not user.is_authenticated:
            return []
        return LinkedAccount.objects.filter(owner=user)

    def resolve_linked_account(self, info, id):
        user = info.context.user
        if not user.is_authenticated:
            return None
        try:
            return LinkedAccount.objects.get(id=id, owner=user)
        except LinkedAccount.DoesNotExist:
            return None


# Mutations
class Mutation(graphene.ObjectType):
    link_account = LinkAccount.Field()
    unlink_account = UnlinkAccount.Field()