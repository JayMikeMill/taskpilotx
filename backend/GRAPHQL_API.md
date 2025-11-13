# TaskPilotX GraphQL API

## Overview

TaskPilotX now features a complete GraphQL API with JWT authentication for managing tasks and messages. The API provides full CRUD operations for both tasks and messages with user-based filtering and permissions.

## Endpoints

- **GraphQL Playground**: `http://127.0.0.1:8000/graphql/` (Development only)
- **GraphQL API**: `http://127.0.0.1:8000/api/graphql/` (For client applications)

## Authentication

The GraphQL API uses the same JWT authentication as the REST API. Include the JWT token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Data Models

### Task

```graphql
type TaskType {
  id: ID!
  title: String!
  description: String
  status: String # pending, in_progress, completed, cancelled
  priority: String # low, medium, high, urgent
  dueDate: DateTime
  completedAt: DateTime
  inputs: [String] # AI monitoring sources
  prompt: String # AI instructions
  actions: [String] # AI actions
  settings: JSONString # Additional metadata
  owner: UserType!
  messages: [MessageType!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

### Message

```graphql
type MessageType {
  id: ID!
  title: String!
  content: String!
  messageType: String # info, warning, error, success, notification
  recipient: UserType!
  sender: UserType
  task: TaskType
  isRead: Boolean!
  isArchived: Boolean!
  metadata: JSONString
  createdAt: DateTime!
  readAt: DateTime
}
```

## Example Queries

### Get All User Tasks

```graphql
query GetMyTasks {
  myTasks {
    id
    title
    description
    status
    priority
    dueDate
    createdAt
    owner {
      username
      email
    }
  }
}
```

### Get Tasks by Status

```graphql
query GetTasksByStatus($status: String!) {
  tasksByStatus(status: $status) {
    id
    title
    status
    priority
    dueDate
  }
}
```

### Get User Messages

```graphql
query GetMyMessages {
  myMessages {
    id
    title
    content
    messageType
    isRead
    createdAt
    sender {
      username
    }
    task {
      title
    }
  }
}
```

### Get Unread Messages

```graphql
query GetUnreadMessages {
  unreadMessages {
    id
    title
    content
    messageType
    createdAt
    sender {
      username
    }
  }
}
```

## Example Mutations

### Create Task

```graphql
mutation CreateTask($taskData: TaskInput!) {
  createTask(taskData: $taskData) {
    success
    errors
    task {
      id
      title
      description
      status
      priority
      dueDate
    }
  }
}
```

**Variables:**

```json
{
  "taskData": {
    "title": "Complete project documentation",
    "description": "Write comprehensive docs for the GraphQL API",
    "status": "pending",
    "priority": "high",
    "dueDate": "2025-11-20T17:00:00Z",
    "prompt": "Monitor for completion signals",
    "inputs": ["github", "slack"],
    "actions": ["send_notification"]
  }
}
```

### Update Task

```graphql
mutation UpdateTask($taskId: ID!, $taskData: TaskInput!) {
  updateTask(taskId: $taskId, taskData: $taskData) {
    success
    errors
    task {
      id
      title
      status
      completedAt
    }
  }
}
```

### Create Message

```graphql
mutation CreateMessage($messageData: MessageInput!) {
  createMessage(messageData: $messageData) {
    success
    errors
    message {
      id
      title
      content
      messageType
      recipient {
        username
      }
    }
  }
}
```

**Variables:**

```json
{
  "messageData": {
    "title": "Task Update",
    "content": "Your task has been completed successfully!",
    "messageType": "success",
    "recipientId": "1",
    "taskId": "5"
  }
}
```

### Mark Message as Read

```graphql
mutation MarkMessageAsRead($messageId: ID!) {
  markMessageAsRead(messageId: $messageId) {
    success
    errors
    message {
      id
      isRead
      readAt
    }
  }
}
```

## Input Types

### TaskInput

```graphql
input TaskInput {
  title: String!
  description: String
  status: String
  priority: String
  dueDate: DateTime
  inputs: [String]
  prompt: String
  actions: [String]
  settings: JSONString
}
```

### MessageInput

```graphql
input MessageInput {
  title: String!
  content: String!
  messageType: String
  recipientId: ID!
  taskId: ID
}
```

## Security Features

1. **Authentication Required**: All queries and mutations require valid JWT authentication
2. **User Isolation**: Users can only access their own tasks and messages
3. **Permission Checks**: Create/Update/Delete operations verify ownership
4. **Input Validation**: All inputs are validated against model constraints

## Error Handling

GraphQL mutations return a standardized error format:

```json
{
  "data": {
    "createTask": {
      "success": false,
      "errors": ["Title is required", "Invalid status value"],
      "task": null
    }
  }
}
```

## Development Testing

1. Start the Django server: `python manage.py runserver`
2. Open GraphQL Playground: `http://127.0.0.1:8000/graphql/`
3. First, obtain a JWT token using the REST login endpoint
4. Add Authorization header in GraphQL Playground:
   ```json
   {
     "Authorization": "Bearer YOUR_JWT_TOKEN"
   }
   ```

## Integration with Frontend

For Angular integration, consider using Apollo Client or similar GraphQL client libraries. The API is fully compatible with any GraphQL client that supports JWT authentication.

Example Apollo Client setup:

```typescript
import { ApolloModule, Apollo } from "apollo-angular";
import { HttpLinkModule, HttpLink } from "apollo-angular-link-http";
import { setContext } from "apollo-link-context";

// Configure authentication link
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("access_token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const httpLink = this.httpLink.create({
  uri: "http://127.0.0.1:8000/api/graphql/",
});

// Create Apollo client
this.apollo.create({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
```
