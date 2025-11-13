import graphene
from tasks.schema import Query as TaskQuery, Mutation as TaskMutation
from messages_app.schema import Query as MessageQuery, Mutation as MessageMutation
from accounts.schema import Query as AccountQuery, Mutation as AccountMutation
from actions.schema import Query as ActionQuery, Mutation as ActionMutation
from users.schema import Query as UserQuery, Mutation as UserMutation


class Query(
    TaskQuery,
    MessageQuery,
    AccountQuery,
    ActionQuery,
    UserQuery,
    graphene.ObjectType
):
    """
    Main GraphQL Query class that combines all app queries
    """
    pass


class Mutation(
    TaskMutation,
    MessageMutation,
    AccountMutation,
    ActionMutation,
    UserMutation,
    graphene.ObjectType
):
    """
    Main GraphQL Mutation class that combines all app mutations
    """
    pass


schema = graphene.Schema(query=Query, mutation=Mutation)