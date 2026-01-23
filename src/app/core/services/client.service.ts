import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, map } from 'rxjs';
import { gql } from 'apollo-angular';
import { Client } from '../models/user.model';
import { REGISTER_MUTATION } from '../../graphQL/mutation/auth.mutations';

// QUERIES
const GET_ALL_CLIENTS = gql`
  query GetAllClients {
    getAllClients {
      id
      email
      role
      firstName
      lastName
      dateNaissance
      city
      nationality
      numberNationality
    }
  }
`;

const GET_CLIENT_BY_ID = gql`
  query GetClientById($id: ID!) {
    getClientById(id: $id) {
      id
      email
      role
      firstName
      lastName
      dateNaissance
      city
      nationality
      numberNationality
    }
  }
`;

const UPDATE_CLIENT = gql`
  mutation UpdateClient($id: ID!, $input: UpdateClientInput!) {
    updateClient(id: $id, input: $input) {
      id
      email
      firstName
      lastName
      dateNaissance
      city
      nationality
      numberNationality
    }
  }
`;

const DELETE_CLIENT = gql`
  mutation DeleteClient($id: ID!) {
    deleteClient(id: $id)
  }
`;

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  constructor(private apollo: Apollo) {}

  getAllClients(): Observable<Client[]> {
    return this.apollo.query<{ getAllClients: Client[] }>({
      query: GET_ALL_CLIENTS,
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => {
        if (!result.data) {
          throw new Error('No clients data returned');
        }
        return result.data.getAllClients;
      })
    );
  }

  getClientById(id: string): Observable<Client> {
    return this.apollo.query<{ getClientById: Client }>({
      query: GET_CLIENT_BY_ID,
      variables: { id },
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => {
        if (!result.data) {
          throw new Error('No client data returned');
        }
        return result.data.getClientById;
      })
    );
  }

  createClient(input: any): Observable<any> {
    return this.apollo.mutate({
      mutation: REGISTER_MUTATION,
      variables: { input }
    }).pipe(
      map(result => result.data)
    );
  }

  updateClient(id: string, input: any): Observable<Client> {
    return this.apollo.mutate<{ updateClient: Client }>({
      mutation: UPDATE_CLIENT,
      variables: { id, input }
    }).pipe(
      map(result => result.data!.updateClient)
    );
  }

  deleteClient(id: string): Observable<boolean> {
    return this.apollo.mutate<{ deleteClient: boolean }>({
      mutation: DELETE_CLIENT,
      variables: { id }
    }).pipe(
      map(result => result.data!.deleteClient)
    );
  }
}
