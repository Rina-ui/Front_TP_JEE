// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { Router } from '@angular/router';
import { LOGIN_MUTATION } from '../../graphQL/mutation/auth.mutations';
import { ME_QUERY } from '../../graphQL/query/auth.queries';
import { AuthResponse, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private apollo: Apollo,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.apollo.mutate<{ login: AuthResponse }>({
      mutation: LOGIN_MUTATION,
      variables: { input: { email, password } }
    }).pipe(
      map(result => {
        if (!result.data) throw new Error('No data');
        return result.data.login;
      }),
      tap(authResponse => this.setSession(authResponse))
    );
  }

  getCurrentUser(): Observable<User> {
    return this.apollo.query<{ me: User }>({
      query: ME_QUERY,
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => result.data.me),
      tap(user => this.currentUserSubject.next(user))
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.apollo.client.clearStore();
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): User | null {
    return this.currentUserSubject.value;
  }

  private setSession(authResponse: AuthResponse): void {
    localStorage.setItem('token', authResponse.token);
    localStorage.setItem('user', JSON.stringify(authResponse.user));
    this.currentUserSubject.next(authResponse.user);
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        this.currentUserSubject.next(JSON.parse(userStr));
      } catch (e) {
        this.logout();
      }
    }
  }
}
