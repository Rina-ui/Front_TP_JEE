import {ApplicationConfig, inject} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideHttpClient, withInterceptors, HttpInterceptorFn, HttpHeaders} from '@angular/common/http';
import {InMemoryCache} from '@apollo/client/core';
import {provideApollo} from 'apollo-angular';
import {HttpLink} from 'apollo-angular/http';
import {provideAnimations} from '@angular/platform-browser/animations';
import {ApolloLink} from '@apollo/client/core';

import {routes} from './app.routes';


// Intercepteur pour les requêtes HTTP normales
const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(cloned);
  }
  return next(req);
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes),

    provideApollo(() => {
      const httpLink = inject(HttpLink);

      // Créer un middleware Apollo pour ajouter le token
      const authMiddleware = new ApolloLink((operation, forward) => {
        const token = sessionStorage.getItem('token');

        // Utiliser HttpHeaders d'Angular
        operation.setContext({
          headers: new HttpHeaders({
            Authorization: token ? `Bearer ${token}` : '',
          }),
        });

        return forward(operation);
      });

      return {
        link: authMiddleware.concat(httpLink.create({
          uri: 'http://localhost:8080/graphql',
        })),
        cache: new InMemoryCache(),
      };
    }),
  ],
};
