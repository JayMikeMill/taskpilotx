export interface LinkedAccount {
  id: string;
  serviceName: ServiceName;
  accountIdentifier: string;
  isActive: boolean;
  addedAt: string;
  lastSyncedAt?: string;
  owner: {
    id: string;
    username: string;
  };
}

export type ServiceName =
  | 'gmail'
  | 'discord'
  | 'slack'
  | 'teams'
  | 'telegram'
  | 'whatsapp'
  | 'twitter'
  | 'linkedin';

export interface LinkedAccountInput {
  serviceName: ServiceName;
  accountIdentifier: string;
  token: string;
  refreshToken?: string;
}

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}
