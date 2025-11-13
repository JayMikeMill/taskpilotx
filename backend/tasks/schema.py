import graphene
from graphene_django import DjangoObjectType
from django.contrib.auth.models import User
from django.utils import timezone
from .models import Task, Message


# GraphQL Types
class UserType(DjangoObjectType):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'date_joined')


class TaskType(DjangoObjectType):
    class Meta:
        model = Task
        fields = '__all__'


class MessageType(DjangoObjectType):
    class Meta:
        model = Message
        fields = '__all__'


# Input Types for Mutations
class TaskInput(graphene.InputObjectType):
    title = graphene.String(required=True)
    description = graphene.String()
    status = graphene.String()
    priority = graphene.String()
    due_date = graphene.DateTime()
    inputs = graphene.List(graphene.String)
    prompt = graphene.String()
    actions = graphene.List(graphene.String)
    settings = graphene.JSONString()


class MessageInput(graphene.InputObjectType):
    title = graphene.String(required=True)
    content = graphene.String(required=True)
    message_type = graphene.String()
    recipient_id = graphene.ID(required=True)
    task_id = graphene.ID()


# Mutations
class CreateTask(graphene.Mutation):
    class Arguments:
        task_data = TaskInput(required=True)

    task = graphene.Field(TaskType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    @staticmethod
    def mutate(root, info, task_data):
        user = info.context.user
        if not user.is_authenticated:
            return CreateTask(success=False, errors=['Authentication required'])

        try:
            task = Task.objects.create(
                title=task_data.title,
                description=task_data.get('description', ''),
                owner=user,
                status=task_data.get('status', 'pending'),
                priority=task_data.get('priority', 'medium'),
                due_date=task_data.get('due_date'),
                inputs=task_data.get('inputs', []),
                prompt=task_data.get('prompt', ''),
                actions=task_data.get('actions', []),
                settings=task_data.get('settings', {})
            )
            return CreateTask(task=task, success=True, errors=[])
        except Exception as e:
            return CreateTask(success=False, errors=[str(e)])


class UpdateTask(graphene.Mutation):
    class Arguments:
        task_id = graphene.ID(required=True)
        task_data = TaskInput(required=True)

    task = graphene.Field(TaskType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    @staticmethod
    def mutate(root, info, task_id, task_data):
        user = info.context.user
        if not user.is_authenticated:
            return UpdateTask(success=False, errors=['Authentication required'])

        try:
            task = Task.objects.get(id=task_id, owner=user)
            
            # Update fields
            if task_data.get('title'):
                task.title = task_data.title
            if task_data.get('description') is not None:
                task.description = task_data.description
            if task_data.get('status'):
                task.status = task_data.status
                if task_data.status == 'completed':
                    task.completed_at = timezone.now()
                elif task.completed_at and task_data.status != 'completed':
                    task.completed_at = None
            if task_data.get('priority'):
                task.priority = task_data.priority
            if task_data.get('due_date') is not None:
                task.due_date = task_data.due_date
            if task_data.get('inputs') is not None:
                task.inputs = task_data.inputs
            if task_data.get('prompt') is not None:
                task.prompt = task_data.prompt
            if task_data.get('actions') is not None:
                task.actions = task_data.actions
            if task_data.get('settings') is not None:
                task.settings = task_data.settings
                
            task.save()
            return UpdateTask(task=task, success=True, errors=[])
        except Task.DoesNotExist:
            return UpdateTask(success=False, errors=['Task not found'])
        except Exception as e:
            return UpdateTask(success=False, errors=[str(e)])


class DeleteTask(graphene.Mutation):
    class Arguments:
        task_id = graphene.ID(required=True)

    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    @staticmethod
    def mutate(root, info, task_id):
        user = info.context.user
        if not user.is_authenticated:
            return DeleteTask(success=False, errors=['Authentication required'])

        try:
            task = Task.objects.get(id=task_id, owner=user)
            task.delete()
            return DeleteTask(success=True, errors=[])
        except Task.DoesNotExist:
            return DeleteTask(success=False, errors=['Task not found'])
        except Exception as e:
            return DeleteTask(success=False, errors=[str(e)])


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
            recipient = User.objects.get(id=message_data.recipient_id)
            task = None
            if message_data.get('task_id'):
                task = Task.objects.get(id=message_data.task_id)

            message = Message.objects.create(
                title=message_data.title,
                content=message_data.content,
                message_type=message_data.get('message_type', 'info'),
                recipient=recipient,
                sender=user,
                task=task
            )
            return CreateMessage(message=message, success=True, errors=[])
        except User.DoesNotExist:
            return CreateMessage(success=False, errors=['Recipient not found'])
        except Task.DoesNotExist:
            return CreateMessage(success=False, errors=['Task not found'])
        except Exception as e:
            return CreateMessage(success=False, errors=[str(e)])


class MarkMessageAsRead(graphene.Mutation):
    class Arguments:
        message_id = graphene.ID(required=True)

    message = graphene.Field(MessageType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    @staticmethod
    def mutate(root, info, message_id):
        user = info.context.user
        if not user.is_authenticated:
            return MarkMessageAsRead(success=False, errors=['Authentication required'])

        try:
            message = Message.objects.get(id=message_id, recipient=user)
            message.is_read = True
            message.read_at = timezone.now()
            message.save()
            return MarkMessageAsRead(message=message, success=True, errors=[])
        except Message.DoesNotExist:
            return MarkMessageAsRead(success=False, errors=['Message not found'])
        except Exception as e:
            return MarkMessageAsRead(success=False, errors=[str(e)])


# Queries
class Query(graphene.ObjectType):
    # Task queries
    all_tasks = graphene.List(TaskType)
    task = graphene.Field(TaskType, id=graphene.ID(required=True))
    my_tasks = graphene.List(TaskType)
    tasks_by_status = graphene.List(TaskType, status=graphene.String(required=True))
    
    # Message queries
    all_messages = graphene.List(MessageType)
    message = graphene.Field(MessageType, id=graphene.ID(required=True))
    my_messages = graphene.List(MessageType)
    unread_messages = graphene.List(MessageType)
    messages_by_type = graphene.List(MessageType, message_type=graphene.String(required=True))
    
    # User queries
    me = graphene.Field(UserType)
    all_users = graphene.List(UserType)

    def resolve_all_tasks(self, info):
        user = info.context.user
        if not user.is_authenticated:
            return []
        return Task.objects.filter(owner=user)

    def resolve_task(self, info, id):
        user = info.context.user
        if not user.is_authenticated:
            return None
        try:
            return Task.objects.get(id=id, owner=user)
        except Task.DoesNotExist:
            return None

    def resolve_my_tasks(self, info):
        user = info.context.user
        if not user.is_authenticated:
            return []
        return Task.objects.filter(owner=user)

    def resolve_tasks_by_status(self, info, status):
        user = info.context.user
        if not user.is_authenticated:
            return []
        return Task.objects.filter(owner=user, status=status)

    def resolve_all_messages(self, info):
        user = info.context.user
        if not user.is_authenticated:
            return []
        return Message.objects.filter(recipient=user)

    def resolve_message(self, info, id):
        user = info.context.user
        if not user.is_authenticated:
            return None
        try:
            return Message.objects.get(id=id, recipient=user)
        except Message.DoesNotExist:
            return None

    def resolve_my_messages(self, info):
        user = info.context.user
        if not user.is_authenticated:
            return []
        return Message.objects.filter(recipient=user)

    def resolve_unread_messages(self, info):
        user = info.context.user
        if not user.is_authenticated:
            return []
        return Message.objects.filter(recipient=user, is_read=False)

    def resolve_messages_by_type(self, info, message_type):
        user = info.context.user
        if not user.is_authenticated:
            return []
        return Message.objects.filter(recipient=user, message_type=message_type)

    def resolve_me(self, info):
        user = info.context.user
        if user.is_authenticated:
            return user
        return None

    def resolve_all_users(self, info):
        # Only return basic info for privacy
        return User.objects.all()


# Mutations
class Mutation(graphene.ObjectType):
    create_task = CreateTask.Field()
    update_task = UpdateTask.Field()
    delete_task = DeleteTask.Field()
    create_message = CreateMessage.Field()
    mark_message_as_read = MarkMessageAsRead.Field()


# Schema
schema = graphene.Schema(query=Query, mutation=Mutation)