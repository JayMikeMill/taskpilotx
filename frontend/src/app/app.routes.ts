import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/register/register').then((m) => m.Register),
  },
  {
    path: '',
    loadComponent: () => import('./core/layout/main-layout/main-layout').then((m) => m.MainLayout),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard-content/dashboard-content').then(
            (m) => m.DashboardContent
          ),
      },
      {
        path: 'tasks',
        loadComponent: () => import('./pages/tasks/tasks-page').then((m) => m.TasksPage),
      },
      {
        path: 'messages',
        loadComponent: () => import('./pages/messages/messages-page').then((m) => m.MessagesPage),
      },
      {
        path: 'accounts',
        loadComponent: () => import('./pages/accounts/accounts-page').then((m) => m.AccountsPage),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./pages/notifications/notifications-page').then((m) => m.NotificationsPage),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
