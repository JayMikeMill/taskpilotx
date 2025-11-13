import graphene
from tasks.schema import Query as TaskQuery, Mutation as TaskMutation


class Query(TaskQuery, graphene.ObjectType):
    """
    Main GraphQL Query class that combines all app queries
    """
    pass


class Mutation(TaskMutation, graphene.ObjectType):
    """
    Main GraphQL Mutation class that combines all app mutations
    """
    pass


schema = graphene.Schema(query=Query, mutation=Mutation)