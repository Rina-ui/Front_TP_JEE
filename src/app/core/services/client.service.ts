import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, map } from 'rxjs';
import { GET_ALL_CLIENTS, GET_CLIENT_BY_ID } from '../../graphQL/query/client.queries';
import { REGISTER_MUTATION } from '../../graphQL/mutation/auth.mutations';
import { UPDATE_CLIENT, DELETE_CLIENT } from '../../graphQL/mutation/client.mutations';
import { Client } from '../models/user.model';

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
      map(res => {
        if (!res.data) {
          throw new Error('No clients data returned');
        }
        return res.data.getAllClients;
      })
    );
  }

  getClientById(id: string): Observable<Client> {
    return this.apollo.query<{ getClientById: Client }>({
      query: GET_CLIENT_BY_ID,
      variables: { id }
    }).pipe(
      map(res => {
        if (!res.data) {
          throw new Error('No client data returned');
        }
        return res.data.getClientById;
      })
    );
  }

  createClient(input: any): Observable<boolean> {
    return this.apollo.mutate({
      mutation: REGISTER_MUTATION,
      variables: { input }
    }).pipe(map(() => true));
  }

  updateClient(id: string, input: any): Observable<Client> {
    return this.apollo.mutate<{ updateClient: Client }>({
      mutation: UPDATE_CLIENT,
      variables: { id, input }
    }).pipe(
      map(res => {
        if (!res.data) {
          throw new Error('Update client failed');
        }
        return res.data.updateClient;
      })
    );
  }

  deleteClient(id: string): Observable<boolean> {
    return this.apollo.mutate<{ deleteClient: boolean }>({
      mutation: DELETE_CLIENT,
      variables: { id }
    }).pipe(
      map(res => {
        if (!res.data) {
          throw new Error('Delete client failed');
        }
        return res.data.deleteClient;
      })
    );
  }
}
