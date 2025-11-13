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
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
    canActivate: [AuthGuard],
  },
  {
    path: 'tasks',
    loadComponent: () => import('./components/tasks/tasks.component').then((m) => m.TasksComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'messages',
    loadComponent: () => import('./components/messages/messages').then((m) => m.MessagesComponent),
    canActivate: [AuthGuard],
  },
];
