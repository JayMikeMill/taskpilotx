import graphene
from graphene_django import DjangoObjectType
from django.conf import settings
from django.utils import timezone
from .models import Message, MessageThread


# GraphQL Types
class MessageType(DjangoObjectType):
    class Meta:
        model = Message
        fields = '__all__'


class MessageThreadType(DjangoObjectType):
    class Meta:
        model = MessageThread
        fields = '__all__'


# Input Types for Mutations
class MessageInput(graphene.InputObjectType):
    title = graphene.String(required=True)
    content = graphene.String(required=True)
    source_account_id = graphene.ID(required=True)
    external_message_id = graphene.String()
    sender_info = graphene.JSONString()
    priority = graphene.String()


# Mutations
class CreateMessage(graphene.Mutation):
    class Arguments:
        message_data = MessageInput(required=True)

    message = graphene.Field(MessageType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    @staticmethod
    def mutate(root, info, message_data):
        user = info.context.user
        if not user.is_authenticated:
            return CreateMessage(success=False, errors=['Authentication required'])

        try:
            from accounts.models import LinkedAccount
            source_account = LinkedAccount.objects.get(
                id=message_data.source_account_id,
                owner=user
            )

            message = Message.objects.create(
                owner=user,
                title=message_data.title,
                content=message_data.content,
                source_account=source_account,
                external_message_id=message_data.get('external_message_id', ''),
                sender_info=message_data.get('sender_info', {}),
                priority=message_data.get('priority', 'normal'),
            )
            return CreateMessage(message=message, success=True, errors=[])
        except Exception as e:
            return CreateMessage(success=False, errors=[str(e)])


class SummarizeMessage(graphene.Mutation):
    class Arguments:
        message_id = graphene.ID(required=True)

    message = graphene.Field(MessageType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    @staticmethod
    def mutate(root, info, message_id):
        user = info.context.user
        if not user.is_authenticated:
            return SummarizeMessage(success=False, errors=['Authentication required'])

        try:
            message = Message.objects.get(id=message_id, owner=user)
            
            # AI Summarization stub - replace with actual AI integration later
            if message.content:
                # Simple stub summarization - just take first 100 chars with ellipsis
                content_length = len(message.content)
                if content_length > 100:
                    summary = message.content[:100] + "..."
                else:
                    summary = message.content
                
                # Add AI-like prefix for MVP
                summary = f"AI Summary: {summary}"
                
                message.summary = summary
                message.status = 'processed'
                message.processed_at = timezone.now()
                message.save()
                
                return SummarizeMessage(message=message, success=True, errors=[])
            else:
                return SummarizeMessage(success=False, errors=['Message has no content to summarize'])
                
        except Message.DoesNotExist:
            return SummarizeMessage(success=False, errors=['Message not found or not accessible'])
        except Exception as e:
            return SummarizeMessage(success=False, errors=[str(e)])


class DeleteMessage(graphene.Mutation):
    class Arguments:
        message_id = graphene.ID(required=True)

    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    @staticmethod
    def mutate(root, info, message_id):
        user = info.context.user
        if not user.is_authenticated:
            return DeleteMessage(success=False, errors=['Authentication required'])

        try:
            message = Message.objects.get(id=message_id, owner=user)
            message.delete()
            return DeleteMessage(success=True, errors=[])
        except Message.DoesNotExist:
            return DeleteMessage(success=False, errors=['Message not found'])
        except Exception as e:
            return DeleteMessage(success=False, errors=[str(e)])


# Queries
class Query(graphene.ObjectType):
    # Message queries
    messages = graphene.List(MessageType, user_id=graphene.Int())
    message = graphene.Field(MessageType, id=graphene.ID(required=True))
    my_messages = graphene.List(MessageType)
    unprocessed_messages = graphene.List(MessageType)

    def resolve_messages(self, info, user_id=None):
        user = info.context.user
        if not user.is_authenticated:
            return []
        return Message.objects.filter(owner=user)

    def resolve_message(self, info, id):
        user = info.context.user
        if not user.is_authenticated:
            return None
        try:
            return Message.objects.get(id=id, owner=user)
        except Message.DoesNotExist:
            return None

    def resolve_my_messages(self, info):
        user = info.context.user
        if not user.is_authenticated:
            return []
        return Message.objects.filter(owner=user)

    def resolve_unprocessed_messages(self, info):
        user = info.context.user
        if not user.is_authenticated:
            return []
        return Message.objects.filter(owner=user, status='unprocessed')


# Mutations
class Mutation(graphene.ObjectType):
    create_message = CreateMessage.Field()
    summarize_message = SummarizeMessage.Field()
    delete_message = DeleteMessage.Field()