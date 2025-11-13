import graphene
from graphene_django import DjangoObjectType
from django.conf import settings
from .models import Action, ActionExecution, ActionType as ActionTypeEnum


# GraphQL Types
class ActionObjectType(DjangoObjectType):
    class Meta:
        model = Action
        fields = '__all__'


class ActionExecutionType(DjangoObjectType):
    class Meta:
        model = ActionExecution
        fields = '__all__'


# Input Types for Mutations
class ExecuteActionInput(graphene.InputObjectType):
    action_id = graphene.ID(required=True)
    config_data = graphene.JSONString()
    task_id = graphene.ID()


# Mutations
class ExecuteAction(graphene.Mutation):
    class Arguments:
        execution_data = ExecuteActionInput(required=True)

    execution = graphene.Field(ActionExecutionType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    @staticmethod
    def mutate(root, info, execution_data):
        user = info.context.user
        if not user.is_authenticated:
            return ExecuteAction(success=False, errors=['Authentication required'])

        try:
            action = Action.objects.get(id=execution_data.action_id)
            
            task = None
            if execution_data.get('task_id'):
                from tasks.models import Task
                task = Task.objects.get(id=execution_data.task_id, owner=user)

            execution = ActionExecution.objects.create(
                action=action,
                executed_by=user,
                config_data=execution_data.get('config_data', {}),
                triggering_task=task
            )

            # Simple execution logic for MVP
            try:
                execution.status = 'running'
                execution.save()

                # Placeholder execution logic
                result_data = {"executed": True, "timestamp": str(execution.started_at)}
                
                # TODO: Implement actual action execution logic here
                # This would dispatch to specific handlers based on action_type
                
                execution.status = 'completed'
                execution.result_data = result_data
                execution.save()

                return ExecuteAction(execution=execution, success=True, errors=[])

            except Exception as exec_error:
                execution.status = 'failed'
                execution.error_message = str(exec_error)
                execution.save()
                return ExecuteAction(execution=execution, success=False, errors=[str(exec_error)])

        except Action.DoesNotExist:
            return ExecuteAction(success=False, errors=['Action not found'])
        except Exception as e:
            return ExecuteAction(success=False, errors=[str(e)])


# Queries
class Query(graphene.ObjectType):
    available_actions = graphene.List(ActionObjectType)
    action = graphene.Field(ActionObjectType, id=graphene.ID(required=True))
    my_action_executions = graphene.List(ActionExecutionType)

    def resolve_available_actions(self, info):
        return Action.objects.filter(is_active=True)

    def resolve_action(self, info, id):
        try:
            return Action.objects.get(id=id)
        except Action.DoesNotExist:
            return None

    def resolve_my_action_executions(self, info):
        user = info.context.user
        if not user.is_authenticated:
            return []
        return ActionExecution.objects.filter(executed_by=user)


# Mutations
class Mutation(graphene.ObjectType):
    execute_action = ExecuteAction.Field()