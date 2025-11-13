import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import type { FetchPolicy } from '@apollo/client/core';
import { Message, MessageInput, MessageType, User } from '../models';

// GraphQL Queries
const GET_MY_MESSAGES = gql`
  query GetMyMessages {
    myMessages {
      id
      title
      content
      summary
      status
      priority
      createdAt
      updatedAt
      processedAt
      owner {
        id
        username
      }
      sourceAccount {
        id
        serviceName
        accountIdentifier
      }
      externalMessageId
      senderInfo
      aiAnalysis
    }
  }
`;

const GET_MESSAGE = gql`
  query GetMessage($id: ID!) {
    message(id: $id) {
      id
      title
      content
      summary
      status
      priority
      createdAt
      updatedAt
      processedAt
      owner {
        id
        username
      }
      sourceAccount {
        id
        serviceName
        accountIdentifier
      }
      externalMessageId
      senderInfo
      aiAnalysis
    }
  }
`;

const GET_UNPROCESSED_MESSAGES = gql`
  query GetUnprocessedMessages {
    unprocessedMessages {
      id
      title
      content
      status
      priority
      createdAt
      sourceAccount {
        id
        serviceName
        accountIdentifier
      }
    }
  }
`;

// GraphQL Mutations
const CREATE_MESSAGE = gql`
  mutation CreateMessage($messageData: MessageInput!) {
    createMessage(messageData: $messageData) {
      message {
        id
        title
        content
        status
        priority
        createdAt
        sourceAccount {
          id
          serviceName
          accountIdentifier
        }
      }
      success
      errors
    }
  }
`;

const SUMMARIZE_MESSAGE = gql`
  mutation SummarizeMessage($messageId: ID!) {
    summarizeMessage(messageId: $messageId) {
      message {
        id
        summary
        status
        processedAt
      }
      success
      errors
    }
  }
`;

const DELETE_MESSAGE = gql`
  mutation DeleteMessage($messageId: ID!) {
    deleteMessage(messageId: $messageId) {
      success
      errors
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  // Signals for reactive state
  messages = signal<Message[]>([]);
  selectedMessage = signal<Message | null>(null);
  loading = signal<boolean>(false);

  constructor(private apollo: Apollo) {}

  // Get all messages for the current user
  getMessages(): Observable<Message[]> {
    this.loading.set(true);

    return this.apollo
      .query<{ myMessages: Message[] }>({
        query: GET_MY_MESSAGES,
        fetchPolicy: 'cache-and-network' as FetchPolicy,
      })
      .pipe(
        map((result) => {
          const messages = result.data?.myMessages || [];
          this.messages.set(messages);
          this.loading.set(false);
          return messages;
        })
      );
  }

  // Get a specific message by ID
  getMessage(id: string): Observable<Message | null> {
    return this.apollo
      .query<{ message: Message }>({
        query: GET_MESSAGE,
        variables: { id },
        fetchPolicy: 'cache-first',
      })
      .pipe(
        map((result) => {
          const message = result.data?.message || null;
          if (message) {
            this.selectedMessage.set(message);
          }
          return message;
        })
      );
  }

  // Get unprocessed messages
  getUnprocessedMessages(): Observable<Message[]> {
    return this.apollo
      .query<{ unprocessedMessages: Message[] }>({
        query: GET_UNPROCESSED_MESSAGES,
        fetchPolicy: 'cache-and-network' as FetchPolicy,
      })
      .pipe(map((result) => result.data?.unprocessedMessages || []));
  }

  // Create a new message
  createMessage(
    messageData: MessageInput
  ): Observable<{ message?: Message; success: boolean; errors?: string[] }> {
    this.loading.set(true);

    return this.apollo
      .mutate<{ createMessage: { message?: Message; success: boolean; errors?: string[] } }>({
        mutation: CREATE_MESSAGE,
        variables: { messageData },
        refetchQueries: [{ query: GET_MY_MESSAGES }],
      })
      .pipe(
        map((result) => {
          const response = result.data?.createMessage || { success: false };
          this.loading.set(false);

          if (response.success && response.message) {
            // Update local messages signal
            const currentMessages = this.messages();
            this.messages.set([response.message, ...currentMessages]);
          }

          return response;
        })
      );
  }

  // Summarize a message using AI
  summarizeMessage(
    messageId: string
  ): Observable<{ message?: Message; success: boolean; errors?: string[] }> {
    this.loading.set(true);

    return this.apollo
      .mutate<{ summarizeMessage: { message?: Message; success: boolean; errors?: string[] } }>({
        mutation: SUMMARIZE_MESSAGE,
        variables: { messageId },
        refetchQueries: [{ query: GET_MY_MESSAGES }],
      })
      .pipe(
        map((result) => {
          const response = result.data?.summarizeMessage || { success: false };
          this.loading.set(false);

          if (response.success && response.message) {
            // Update local messages signal
            const currentMessages = this.messages();
            const updatedMessages = currentMessages.map((msg) =>
              msg.id === messageId ? { ...msg, ...response.message } : msg
            );
            this.messages.set(updatedMessages);

            // Update selected message if it's the one being summarized
            if (this.selectedMessage()?.id === messageId) {
              this.selectedMessage.set({ ...this.selectedMessage()!, ...response.message });
            }
          }

          return response;
        })
      );
  }

  // Delete a message
  deleteMessage(messageId: string): Observable<{ success: boolean; errors?: string[] }> {
    this.loading.set(true);

    return this.apollo
      .mutate<{ deleteMessage: { success: boolean; errors?: string[] } }>({
        mutation: DELETE_MESSAGE,
        variables: { messageId },
        refetchQueries: [{ query: GET_MY_MESSAGES }],
      })
      .pipe(
        map((result) => {
          const response = result.data?.deleteMessage || { success: false };
          this.loading.set(false);

          if (response.success) {
            // Update local messages signal
            const currentMessages = this.messages();
            this.messages.set(currentMessages.filter((msg) => msg.id !== messageId));

            // Clear selected message if it's the one being deleted
            if (this.selectedMessage()?.id === messageId) {
              this.selectedMessage.set(null);
            }
          }

          return response;
        })
      );
  }

  // Set selected message
  setSelectedMessage(message: Message | null): void {
    this.selectedMessage.set(message);
  }

  // Clear all local state (useful for logout)
  clearState(): void {
    this.messages.set([]);
    this.selectedMessage.set(null);
    this.loading.set(false);
  }

  // Get message statistics for dashboard
  getMessageStats(): { total: number; unprocessed: number; processed: number; failed: number } {
    const messages = this.messages();

    return {
      total: messages.length,
      unprocessed: messages.filter((m) => m.status === 'unprocessed').length,
      processed: messages.filter((m) => m.status === 'processed').length,
      failed: messages.filter((m) => m.status === 'failed').length,
    };
  }

  // Filter messages by status
  filterByStatus(status: string): Message[] {
    return this.messages().filter((m) => m.status === status);
  }

  // Search messages by content or title
  searchMessages(query: string): Message[] {
    const messages = this.messages();
    const searchTerm = query.toLowerCase();

    return messages.filter(
      (m) =>
        m.title.toLowerCase().includes(searchTerm) ||
        m.content.toLowerCase().includes(searchTerm) ||
        (m.summary && m.summary.toLowerCase().includes(searchTerm))
    );
  }
}
