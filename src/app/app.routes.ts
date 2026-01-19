import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Dashboard } from './features/admin/dashboard/dashboard';
import { authGuard } from './core/guards/auth-guard';
import { Register } from './features/auth/register/register';
import { ClientDashboard } from './features/client/dashboard/dashboard';

export const routes: Routes = [
  { path: '', redirectTo: '/client/dashboard', pathMatch: 'full' }, // Redirige vers dashboard
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  {
    path: 'admin/dashboard',
    component: Dashboard,
    // canActivate: [authGuard]  ← Commentez cette ligne temporairement
  },
  {
    path: 'client/dashboard',
    component: ClientDashboard,
    // Pas de guard pour tester
  },
  { path: '**', redirectTo: '/client/dashboard' }
];
