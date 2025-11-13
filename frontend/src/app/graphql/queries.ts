import { gql } from '@apollo/client/core';

// Task Queries
export const GET_MY_TASKS = gql`
  query GetMyTasks {
    myTasks {
      id
      title
      description
      status
      priority
      dueDate
      completedAt
      createdAt
      owner {
        id
        username
        firstName
        lastName
        email
      }
    }
  }
`;

export const GET_TASKS_BY_STATUS = gql`
  query GetTasksByStatus($status: String!) {
    tasksByStatus(status: $status) {
      id
      title
      description
      status
      priority
      dueDate
      completedAt
      createdAt
    }
  }
`;

export const GET_TASK = gql`
  query GetTask($id: ID!) {
    task(id: $id) {
      id
      title
      description
      status
      priority
      dueDate
      completedAt
      inputs
      prompt
      actions
      settings
      createdAt
      updatedAt
      owner {
        id
        username
        firstName
        lastName
      }
      messages {
        id
        title
        content
        messageType
        isRead
        createdAt
        sender {
          username
        }
      }
    }
  }
`;

// Message Queries
export const GET_MY_MESSAGES = gql`
  query GetMyMessages {
    myMessages {
      id
      title
      content
      messageType
      isRead
      isArchived
      createdAt
      readAt
      sender {
        id
        username
        firstName
        lastName
      }
      task {
        id
        title
      }
    }
  }
`;

export const GET_UNREAD_MESSAGES = gql`
  query GetUnreadMessages {
    unreadMessages {
      id
      title
      content
      messageType
      createdAt
      sender {
        id
        username
        firstName
        lastName
      }
      task {
        id
        title
      }
    }
  }
`;

export const GET_MESSAGES_BY_TYPE = gql`
  query GetMessagesByType($messageType: String!) {
    messagesByType(messageType: $messageType) {
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
        id
        title
      }
    }
  }
`;

// User Queries
export const GET_ME = gql`
  query GetMe {
    me {
      id
      username
      email
      firstName
      lastName
      dateJoined
    }
  }
`;

// Task Mutations
export const CREATE_TASK = gql`
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
        createdAt
        owner {
          id
          username
        }
      }
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation UpdateTask($taskId: ID!, $taskData: TaskInput!) {
    updateTask(taskId: $taskId, taskData: $taskData) {
      success
      errors
      task {
        id
        title
        description
        status
        priority
        dueDate
        completedAt
        updatedAt
      }
    }
  }
`;

export const DELETE_TASK = gql`
  mutation DeleteTask($taskId: ID!) {
    deleteTask(taskId: $taskId) {
      success
      errors
    }
  }
`;

// Message Mutations
export const CREATE_MESSAGE = gql`
  mutation CreateMessage($messageData: MessageInput!) {
    createMessage(messageData: $messageData) {
      success
      errors
      message {
        id
        title
        content
        messageType
        createdAt
        recipient {
          id
          username
        }
        sender {
          id
          username
        }
        task {
          id
          title
        }
      }
    }
  }
`;

export const MARK_MESSAGE_AS_READ = gql`
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
`;

export const SUMMARIZE_MESSAGE = gql`
  mutation SummarizeMessage($messageId: ID!) {
    summarizeMessage(messageId: $messageId) {
      success
      errors
      message {
        id
        title
        content
        summary
      }
    }
  }
`;
