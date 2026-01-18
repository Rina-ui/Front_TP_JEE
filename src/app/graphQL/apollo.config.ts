import { HttpLink } from 'apollo-angular/http';
import { InMemoryCache, ApolloLink } from '@apollo/client/core';
import { HttpHeaders } from '@angular/common/http';

export function createApollo(httpLink: HttpLink) {
  const http = httpLink.create({
    uri: 'http://localhost:8080/graphql',
  });

  const authLink = new ApolloLink((operation, forward) => {
    const token = localStorage.getItem('token');

    if (token) {
      operation.setContext(({ headers = new HttpHeaders() }) => ({
        headers: headers.set('Authorization', `Bearer ${token}`),
      }));
    }

    return forward(operation);
  });

  return {
    link: ApolloLink.from([authLink, http]),
    cache: new InMemoryCache(),
  };
}
