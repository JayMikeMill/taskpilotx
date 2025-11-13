import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Apollo } from 'apollo-angular';
import { gql } from 'apollo-angular';
import type { FetchPolicy } from '@apollo/client/core';
import { LinkedAccount, LinkedAccountInput, ServiceName } from '../models';

// GraphQL Queries
const GET_LINKED_ACCOUNTS = gql`
  query GetLinkedAccounts {
    linkedAccounts {
      id
      serviceName
      accountIdentifier
      isActive
      addedAt
      lastSyncedAt
      owner {
        id
        username
      }
    }
  }
`;

const GET_LINKED_ACCOUNT = gql`
  query GetLinkedAccount($id: ID!) {
    linkedAccount(id: $id) {
      id
      serviceName
      accountIdentifier
      isActive
      addedAt
      lastSyncedAt
      owner {
        id
        username
      }
    }
  }
`;

// GraphQL Mutations
const LINK_ACCOUNT = gql`
  mutation LinkAccount(
    $serviceName: String!
    $accountIdentifier: String!
    $token: String!
    $refreshToken: String
  ) {
    linkAccount(
      serviceName: $serviceName
      accountIdentifier: $accountIdentifier
      token: $token
      refreshToken: $refreshToken
    ) {
      account {
        id
        serviceName
        accountIdentifier
        isActive
        addedAt
      }
      success
      errors
    }
  }
`;

const UNLINK_ACCOUNT = gql`
  mutation UnlinkAccount($accountId: ID!) {
    unlinkAccount(accountId: $accountId) {
      success
      errors
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class AccountsService {
  // Signals for reactive state
  linkedAccounts = signal<LinkedAccount[]>([]);
  selectedAccount = signal<LinkedAccount | null>(null);
  loading = signal<boolean>(false);

  // Service configurations for OAuth
  private serviceConfigs: Record<ServiceName, any> = {
    gmail: {
      name: 'Gmail',
      icon: '📧',
      color: '#DB4437',
      authUrl: 'https://accounts.google.com/oauth/authorize',
      scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
    },
    discord: {
      name: 'Discord',
      icon: '💬',
      color: '#5865F2',
      authUrl: 'https://discord.com/api/oauth2/authorize',
      scopes: ['guilds', 'messages.read'],
    },
    slack: {
      name: 'Slack',
      icon: '💼',
      color: '#4A154B',
      authUrl: 'https://slack.com/oauth/v2/authorize',
      scopes: ['channels:read', 'chat:write'],
    },
    teams: {
      name: 'Microsoft Teams',
      icon: '👥',
      color: '#6264A7',
      authUrl: 'https://login.microsoftonline.com/oauth2/v2.0/authorize',
      scopes: ['https://graph.microsoft.com/Team.ReadBasic.All'],
    },
    telegram: {
      name: 'Telegram',
      icon: '✈️',
      color: '#0088CC',
      authUrl: 'https://telegram.org/oauth',
      scopes: ['bot'],
    },
    whatsapp: {
      name: 'WhatsApp Business',
      icon: '💚',
      color: '#25D366',
      authUrl: 'https://developers.facebook.com/docs/whatsapp',
      scopes: ['whatsapp_business_messaging'],
    },
    twitter: {
      name: 'Twitter',
      icon: '🐦',
      color: '#1DA1F2',
      authUrl: 'https://twitter.com/i/oauth2/authorize',
      scopes: ['tweet.read', 'users.read'],
    },
    linkedin: {
      name: 'LinkedIn',
      icon: '💼',
      color: '#0077B5',
      authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
      scopes: ['r_liteprofile', 'r_emailaddress'],
    },
  };

  constructor(private apollo: Apollo) {}

  // Get all linked accounts for the current user
  getLinkedAccounts(): Observable<LinkedAccount[]> {
    this.loading.set(true);

    return this.apollo
      .query<{ linkedAccounts: LinkedAccount[] }>({
        query: GET_LINKED_ACCOUNTS,
        fetchPolicy: 'network-only',
      })
      .pipe(
        map((result) => {
          const accounts = result.data?.linkedAccounts || [];
          this.linkedAccounts.set(accounts);
          this.loading.set(false);
          return accounts;
        })
      );
  }

  // Get a specific linked account by ID
  getLinkedAccount(id: string): Observable<LinkedAccount | null> {
    return this.apollo
      .query<{ linkedAccount: LinkedAccount }>({
        query: GET_LINKED_ACCOUNT,
        variables: { id },
        fetchPolicy: 'cache-first',
      })
      .pipe(
        map((result) => {
          const account = result.data?.linkedAccount || null;
          if (account) {
            this.selectedAccount.set(account);
          }
          return account;
        })
      );
  }

  // Link a new account
  linkAccount(
    accountData: LinkedAccountInput
  ): Observable<{ account?: LinkedAccount; success: boolean; errors?: string[] }> {
    this.loading.set(true);

    return this.apollo
      .mutate<{ linkAccount: { account?: LinkedAccount; success: boolean; errors?: string[] } }>({
        mutation: LINK_ACCOUNT,
        variables: {
          serviceName: accountData.serviceName,
          accountIdentifier: accountData.accountIdentifier,
          token: accountData.token,
          refreshToken: accountData.refreshToken,
        },
        refetchQueries: [{ query: GET_LINKED_ACCOUNTS }],
      })
      .pipe(
        map((result) => {
          const response = result.data?.linkAccount || { success: false };
          this.loading.set(false);

          if (response.success && response.account) {
            // Update local accounts signal
            const currentAccounts = this.linkedAccounts();
            this.linkedAccounts.set([response.account, ...currentAccounts]);
          }

          return response;
        })
      );
  }

  // Unlink an account
  unlinkAccount(accountId: string): Observable<{ success: boolean; errors?: string[] }> {
    this.loading.set(true);

    return this.apollo
      .mutate<{ unlinkAccount: { success: boolean; errors?: string[] } }>({
        mutation: UNLINK_ACCOUNT,
        variables: { accountId },
        refetchQueries: [{ query: GET_LINKED_ACCOUNTS }],
      })
      .pipe(
        map((result) => {
          const response = result.data?.unlinkAccount || { success: false };
          this.loading.set(false);

          if (response.success) {
            // Update local accounts signal
            const currentAccounts = this.linkedAccounts();
            this.linkedAccounts.set(currentAccounts.filter((acc) => acc.id !== accountId));

            // Clear selected account if it's the one being unlinked
            if (this.selectedAccount()?.id === accountId) {
              this.selectedAccount.set(null);
            }
          }

          return response;
        })
      );
  }

  // Get service configuration for OAuth
  getServiceConfig(serviceName: ServiceName) {
    return this.serviceConfigs[serviceName];
  }

  // Get all available services
  getAvailableServices(): Array<{ name: ServiceName; config: any }> {
    return Object.entries(this.serviceConfigs).map(([name, config]) => ({
      name: name as ServiceName,
      config,
    }));
  }

  // Check if a service is already linked
  isServiceLinked(serviceName: ServiceName): boolean {
    return this.linkedAccounts().some((account) => account.serviceName === serviceName);
  }

  // Get linked accounts by service
  getAccountsByService(serviceName: ServiceName): LinkedAccount[] {
    return this.linkedAccounts().filter((account) => account.serviceName === serviceName);
  }

  // Set selected account
  setSelectedAccount(account: LinkedAccount | null): void {
    this.selectedAccount.set(account);
  }

  // Clear all local state (useful for logout)
  clearState(): void {
    this.linkedAccounts.set([]);
    this.selectedAccount.set(null);
    this.loading.set(false);
  }

  // OAuth flow helpers
  startOAuthFlow(serviceName: ServiceName): string {
    const config = this.getServiceConfig(serviceName);
    const redirectUri = `${window.location.origin}/oauth/callback`;

    // Build OAuth URL
    const params = new URLSearchParams({
      client_id: 'your_client_id', // In real app, get from environment
      redirect_uri: redirectUri,
      scope: config.scopes.join(' '),
      response_type: 'code',
      state: serviceName, // To identify which service after callback
    });

    return `${config.authUrl}?${params.toString()}`;
  }

  // Handle OAuth callback
  handleOAuthCallback(
    code: string,
    state: string
  ): Observable<{ account?: LinkedAccount; success: boolean; errors?: string[] }> {
    // In a real app, this would exchange the code for tokens
    // For now, return a mock response
    const mockToken = `mock_token_${Date.now()}`;
    const serviceName = state as ServiceName;

    return this.linkAccount({
      serviceName,
      accountIdentifier: `user@${serviceName}.com`,
      token: mockToken,
    });
  }

  // Refresh account tokens (for expired tokens)
  refreshAccountTokens(accountId: string): Observable<boolean> {
    // In a real app, this would refresh the OAuth tokens
    // For now, just return success
    return new Observable((observer) => {
      observer.next(true);
      observer.complete();
    });
  }

  // Test account connection
  testAccountConnection(accountId: string): Observable<boolean> {
    // In a real app, this would make a test API call to verify the account is working
    return new Observable((observer) => {
      setTimeout(() => {
        observer.next(Math.random() > 0.1); // 90% success rate for testing
        observer.complete();
      }, 1000);
    });
  }

  // Initiate OAuth flow
  initiateOAuth(serviceName: ServiceName): Observable<{ authUrl: string; success: boolean }> {
    const authUrl = this.startOAuthFlow(serviceName);
    return new Observable((observer) => {
      observer.next({
        authUrl,
        success: true,
      });
      observer.complete();
    });
  }

  // Test connection wrapper for component
  testConnection(accountId: string): Observable<{ success: boolean; errors?: string[] }> {
    return this.testAccountConnection(accountId).pipe(
      map((success) => ({
        success,
        errors: success ? undefined : ['Connection test failed'],
      }))
    );
  }

  // Refresh tokens wrapper for component
  refreshTokens(accountId: string): Observable<{ success: boolean; errors?: string[] }> {
    return this.refreshAccountTokens(accountId).pipe(
      map((success) => ({
        success,
        errors: success ? undefined : ['Token refresh failed'],
      }))
    );
  }
}
