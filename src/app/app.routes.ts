// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Dashboard } from './features/admin/dashboard/dashboard';
import { authGuard } from './core/guards/auth-guard';
import {Register} from './features/auth/register/register';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  {
    path: 'admin/dashboard',
    component: Dashboard,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/login' }
];
