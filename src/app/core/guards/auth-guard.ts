import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, map, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class authGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const roles = route.data['roles'] as string[];

    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        if (!user) {
          this.router.navigate(['/login']);
          return false;
        }

        // Vérifier si le rôle est autorisé
        if (roles && !roles.includes(user.role)) {
          if (user.role === 'CLIENT') {
            this.router.navigate(['/client/dashboard']);
          } else {
            this.router.navigate(['/admin/dashboard']);
          }
          return false;
        }

        return true;
      })
    );
  }
}
