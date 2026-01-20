import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
  },
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./features/admin/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'AGENT'] }
  },
  {
    path: 'client/dashboard',
    loadComponent: () => import('./features/client/dashboard/dashboard').then(m => m.ClientDashboard),
    canActivate: [authGuard],
    data: { roles: ['CLIENT'] }
  },
  {
    path: 'clients/register',
    loadComponent: () => import('./features/clients/register-client/register-client').then(m => m.RegisterClient),
    canActivate: [authGuard]
  },
  {
    path: 'comptes',
    loadComponent: () => import('./features/comptes/comptes/comptes').then(m => m.Comptes),
    canActivate: [authGuard]
  },
  {
    path: 'transactions',
    loadComponent: () => import('./features/transactions/transactions/transactions').then(m => m.Transactions),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
