import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountsService, AppStateService } from '../../services';
import { LinkedAccount, ServiceName } from '../../models';

@Component({
  selector: 'app-linked-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="linked-accounts-container">
      <!-- Header -->
      <div class="page-header">
        <h1 class="page-title">Connected Accounts</h1>
        <p class="page-description">
          Manage your external service connections for automated task handling
        </p>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading()" class="loading-state">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span class="ml-3">Loading accounts...</span>
      </div>

      <!-- Connected Accounts -->
      <div *ngIf="!loading()" class="accounts-grid">
        <div
          *ngFor="let config of serviceConfigs; trackBy: trackByService"
          class="account-card"
          [ngClass]="getAccountCardClasses(config.service)"
        >
          <!-- Service Header -->
          <div class="service-header">
            <div class="service-icon">
              {{ config.icon }}
            </div>
            <div class="service-info">
              <h3 class="service-name">{{ config.displayName }}</h3>
              <p class="service-description">{{ config.description }}</p>
            </div>
          </div>

          <!-- Connection Status -->
          <div class="connection-status">
            <ng-container *ngIf="getConnectedAccount(config.service) as account; else notConnected">
              <!-- Connected State -->
              <div class="status-connected">
                <div class="status-badge status-active">✓ Connected</div>
                <div class="account-details">
                  <span class="account-name">{{
                    account.accountIdentifier || 'Connected Account'
                  }}</span>
                  <span class="connection-date"> Connected {{ formatDate(account.addedAt) }} </span>
                </div>
              </div>

              <!-- Account Actions -->
              <div class="account-actions">
                <button
                  (click)="testConnection(account)"
                  [disabled]="testing().has(account.id)"
                  class="action-btn action-btn-test"
                >
                  <span *ngIf="!testing().has(account.id)">Test</span>
                  <span *ngIf="testing().has(account.id)">Testing...</span>
                </button>
                <button
                  (click)="refreshConnection(account)"
                  [disabled]="refreshing().has(account.id)"
                  class="action-btn action-btn-refresh"
                >
                  <span *ngIf="!refreshing().has(account.id)">🔄</span>
                  <span *ngIf="refreshing().has(account.id)">♻️</span>
                </button>
                <button
                  (click)="disconnectAccount(account)"
                  class="action-btn action-btn-disconnect"
                >
                  Disconnect
                </button>
              </div>
            </ng-container>

            <ng-template #notConnected>
              <!-- Not Connected State -->
              <div class="status-disconnected">
                <div class="status-badge status-inactive">Not Connected</div>
                <button
                  (click)="connectAccount(config.service)"
                  [disabled]="connecting().has(config.service)"
                  class="connect-btn"
                >
                  <span *ngIf="!connecting().has(config.service)"
                    >Connect {{ config.displayName }}</span
                  >
                  <span *ngIf="connecting().has(config.service)">Connecting...</span>
                </button>
              </div>
            </ng-template>
          </div>

          <!-- Service Capabilities -->
          <div class="service-capabilities">
            <h4 class="capabilities-title">Capabilities:</h4>
            <ul class="capabilities-list">
              <li *ngFor="let capability of config.capabilities">
                {{ capability }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Statistics -->
      <div class="accounts-stats">
        <div class="stat-card">
          <div class="stat-number">{{ connectedCount() }}</div>
          <div class="stat-label">Connected</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ serviceConfigs.length }}</div>
          <div class="stat-label">Available</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ recentActivity() }}</div>
          <div class="stat-label">Recent Activity</div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div *ngIf="recentConnections().length > 0" class="recent-activity">
        <h3 class="activity-title">Recent Connections</h3>
        <div class="activity-list">
          <div *ngFor="let account of recentConnections()" class="activity-item">
            <div class="activity-icon">
              {{ getServiceConfig(account.serviceName)?.icon || '🔗' }}
            </div>
            <div class="activity-content">
              <span class="activity-service">{{ account.serviceName }}</span>
              <span class="activity-date">{{ formatDate(account.addedAt) }}</span>
            </div>
            <div class="activity-status">
              <span [ngClass]="account.isActive ? 'text-green-600' : 'text-gray-500'">
                {{ account.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./linked-accounts.component.scss'],
})
export class LinkedAccountsComponent implements OnInit {
  // State
  accounts = signal<LinkedAccount[]>([]);
  loading = signal<boolean>(false);

  // UI State
  connecting = signal<Set<ServiceName>>(new Set());
  testing = signal<Set<string>>(new Set());
  refreshing = signal<Set<string>>(new Set());

  // Service configurations
  serviceConfigs = [
    {
      service: 'gmail' as ServiceName,
      displayName: 'Gmail',
      icon: '📧',
      description: 'Send and receive emails automatically',
      capabilities: ['Send emails', 'Read inbox', 'Filter messages', 'Auto-reply'],
    },
    {
      service: 'discord' as ServiceName,
      displayName: 'Discord',
      icon: '🎮',
      description: 'Send messages and manage Discord channels',
      capabilities: ['Send messages', 'Read channels', 'Manage roles', 'Bot commands'],
    },
    {
      service: 'slack' as ServiceName,
      displayName: 'Slack',
      icon: '💼',
      description: 'Integrate with Slack workspaces',
      capabilities: ['Send messages', 'Read channels', 'File uploads', 'Bot interactions'],
    },
    {
      service: 'teams' as ServiceName,
      displayName: 'Microsoft Teams',
      icon: '🏢',
      description: 'Connect to Teams for collaboration',
      capabilities: ['Send messages', 'Join meetings', 'Share files', 'Calendar integration'],
    },
    {
      service: 'telegram' as ServiceName,
      displayName: 'Telegram',
      icon: '📱',
      description: 'Send messages via Telegram bot',
      capabilities: ['Send messages', 'Inline keyboards', 'File sharing', 'Group management'],
    },
    {
      service: 'whatsapp' as ServiceName,
      displayName: 'WhatsApp Business',
      icon: '📞',
      description: 'Send WhatsApp messages automatically',
      capabilities: ['Send messages', 'Media sharing', 'Status updates', 'Contact management'],
    },
    {
      service: 'twitter' as ServiceName,
      displayName: 'X (Twitter)',
      icon: '🐦',
      description: 'Post tweets and manage your X account',
      capabilities: ['Post tweets', 'Send DMs', 'Upload media', 'Manage lists'],
    },
    {
      service: 'linkedin' as ServiceName,
      displayName: 'LinkedIn',
      icon: '💼',
      description: 'Share professional content on LinkedIn',
      capabilities: ['Post updates', 'Send messages', 'Company pages', 'Job postings'],
    },
  ];

  constructor(
    private accountsService: AccountsService,
    private appState: AppStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
    this.appState.setBreadcrumbs([
      { label: 'Dashboard', route: '/dashboard' },
      { label: 'Accounts', route: '/accounts' },
    ]);
  }

  // Data loading
  loadAccounts(): void {
    this.accountsService.getLinkedAccounts().subscribe({
      next: (accounts) => {
        console.log('Loaded accounts:', accounts.length);
      },
      error: (error) => {
        this.appState.showError('Error', 'Failed to load connected accounts');
        console.error('Error loading accounts:', error);
      },
    });
  }

  // Account operations
  connectAccount(serviceName: ServiceName): void {
    this.connecting.update((set) => new Set(set).add(serviceName));

    this.accountsService.initiateOAuth(serviceName).subscribe({
      next: (response: { authUrl: string; success: boolean }) => {
        if (response.success && response.authUrl) {
          // Open OAuth window
          window.open(response.authUrl, 'oauth', 'width=600,height=700');

          // Listen for OAuth completion
          this.listenForOAuthCompletion(serviceName);
        } else {
          this.appState.showError('Error', 'Failed to initiate connection');
        }
      },
      error: (error) => {
        this.appState.showError('Error', 'Failed to connect to service');
        console.error('OAuth initiation error:', error);
      },
      complete: () => {
        this.connecting.update((set) => {
          const newSet = new Set(set);
          newSet.delete(serviceName);
          return newSet;
        });
      },
    });
  }

  disconnectAccount(account: LinkedAccount): void {
    if (confirm(`Are you sure you want to disconnect ${account.serviceName}?`)) {
      this.accountsService.unlinkAccount(account.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.appState.showSuccess(
              'Success',
              `${account.serviceName} disconnected successfully`
            );
          } else {
            this.appState.showError(
              'Error',
              response.errors?.join(', ') || 'Failed to disconnect account'
            );
          }
        },
        error: (error) => {
          this.appState.showError('Error', 'Failed to disconnect account');
          console.error('Disconnect error:', error);
        },
      });
    }
  }

  testConnection(account: LinkedAccount): void {
    this.testing.update((set) => new Set(set).add(account.id));

    this.accountsService.testConnection(account.id).subscribe({
      next: (response: { success: boolean; errors?: string[] }) => {
        if (response.success) {
          this.appState.showSuccess('Success', `${account.serviceName} connection test passed`);
        } else {
          this.appState.showError('Error', response.errors?.join(', ') || 'Connection test failed');
        }
      },
      error: (error) => {
        this.appState.showError('Error', 'Connection test failed');
        console.error('Test connection error:', error);
      },
      complete: () => {
        this.testing.update((set) => {
          const newSet = new Set(set);
          newSet.delete(account.id);
          return newSet;
        });
      },
    });
  }

  refreshConnection(account: LinkedAccount): void {
    this.refreshing.update((set) => new Set(set).add(account.id));

    this.accountsService.refreshTokens(account.id).subscribe({
      next: (response: { success: boolean; errors?: string[] }) => {
        if (response.success) {
          this.appState.showSuccess('Success', `${account.serviceName} tokens refreshed`);
        } else {
          this.appState.showError(
            'Error',
            response.errors?.join(', ') || 'Failed to refresh tokens'
          );
        }
      },
      error: (error) => {
        this.appState.showError('Error', 'Failed to refresh connection');
        console.error('Refresh tokens error:', error);
      },
      complete: () => {
        this.refreshing.update((set) => {
          const newSet = new Set(set);
          newSet.delete(account.id);
          return newSet;
        });
      },
    });
  }

  // OAuth completion handling
  private listenForOAuthCompletion(serviceName: ServiceName): void {
    const checkInterval = setInterval(() => {
      // Check if account was added
      if (this.getConnectedAccount(serviceName)) {
        clearInterval(checkInterval);
        this.appState.showSuccess('Success', `${serviceName} connected successfully!`);
        this.loadAccounts(); // Refresh the list
      }
    }, 1000);

    // Clean up after 5 minutes
    setTimeout(() => {
      clearInterval(checkInterval);
    }, 5 * 60 * 1000);
  }

  // Helper methods
  getConnectedAccount(serviceName: ServiceName): LinkedAccount | undefined {
    return this.accounts().find(
      (account) => account.serviceName === serviceName && account.isActive
    );
  }

  getServiceConfig(serviceName: string) {
    return this.serviceConfigs.find((config) => config.service === serviceName);
  }

  getAccountCardClasses(serviceName: ServiceName): string {
    const isConnected = !!this.getConnectedAccount(serviceName);
    return isConnected ? 'connected' : 'disconnected';
  }

  connectedCount(): number {
    return this.accounts().filter((account) => account.isActive).length;
  }

  recentActivity(): number {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.accounts().filter((account) => new Date(account.addedAt) > oneDayAgo).length;
  }

  recentConnections(): LinkedAccount[] {
    return this.accounts()
      .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
      .slice(0, 5);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  trackByService(index: number, config: any): string {
    return config.service;
  }
}
