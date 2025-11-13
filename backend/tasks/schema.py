import graphene
from graphene_django import DjangoObjectType
from django.conf import settings
from django.utils import timezone
from .models import Task, TaskExecution


# GraphQL Types
class TaskType(DjangoObjectType):
    class Meta:
        model = Task
        fields = '__all__'


class TaskExecutionType(DjangoObjectType):
    class Meta:
        model = TaskExecution
        fields = '__all__'


# Input Types for Mutations
class TaskInput(graphene.InputObjectType):
    title = graphene.String(required=True)
    description = graphene.String()
    status = graphene.String()
    priority = graphene.String()
    prompt = graphene.String()
    due_date = graphene.DateTime()
    is_active = graphene.Boolean()
    max_executions = graphene.Int()
    ai_config = graphene.JSONString()


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
                owner=user,
                title=task_data.title,
                description=task_data.get('description', ''),
                status=task_data.get('status', 'pending'),
                priority=task_data.get('priority', 'medium'),
                prompt=task_data.get('prompt', ''),
                due_date=task_data.get('due_date'),
                is_active=task_data.get('is_active', True),
                max_executions=task_data.get('max_executions', 0),
                ai_config=task_data.get('ai_config', {})
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
            for field, value in task_data.items():
                if value is not None:
                    setattr(task, field, value)
            
            if task_data.get('status') == 'completed':
                task.completed = True
                task.completed_at = timezone.now()
                
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


# Queries
class Query(graphene.ObjectType):
    # Task queries
    tasks = graphene.List(TaskType, user_id=graphene.Int())
    task = graphene.Field(TaskType, id=graphene.ID(required=True))
    my_tasks = graphene.List(TaskType)
    tasks_by_status = graphene.List(TaskType, status=graphene.String(required=True))

    def resolve_tasks(self, info, user_id=None):
        user = info.context.user
        if not user.is_authenticated:
            return []
        
        # Users can only see their own tasks
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


# Mutations
class Mutation(graphene.ObjectType):
    create_task = CreateTask.Field()
    update_task = UpdateTask.Field()
    delete_task = DeleteTask.Field()