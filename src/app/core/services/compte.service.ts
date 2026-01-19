import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, map } from 'rxjs';
import { GET_ALL_COMPTES, GET_COMPTES_BY_CLIENT } from '../../graphQL/query/compte.queries';
import { CREATE_COMPTE, DELETE_COMPTE } from '../../graphQL/mutation/compte.mutations';
import { Compte, CreateCompteInput } from '../models/compte.model';

@Injectable({
  providedIn: 'root'
})
export class CompteService {
  constructor(private apollo: Apollo) {}

  getAllComptes(): Observable<Compte[]> {
    return this.apollo.query<{ getAllComptes: Compte[] }>({
      query: GET_ALL_COMPTES,
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => {
        if (!result.data) {
          throw new Error('No comptes data returned');
        }
        return result.data.getAllComptes;
      })
    );
  }


  getComptesByClient(clientId: string): Observable<Compte[]> {
    return this.apollo.query<{ getComptesByClient: Compte[] }>({
      query: GET_COMPTES_BY_CLIENT,
      variables: { clientId },
      fetchPolicy: 'network-only'
    }).pipe(
      map(result => {
        if (!result.data) {
          throw new Error('No comptes data returned');
        }
        return result.data.getComptesByClient;
      })
    );
  }


  createCompte(clientId: string, input: CreateCompteInput): Observable<Compte> {
    return this.apollo.mutate<{ createCompte: Compte }>({
      mutation: CREATE_COMPTE,
      variables: { clientId, input }
    }).pipe(map(result => result.data!.createCompte));
  }

  deleteCompte(id: string): Observable<boolean> {
    return this.apollo.mutate<{ deleteCompte: boolean }>({
      mutation: DELETE_COMPTE,
      variables: { id }
    }).pipe(map(result => result.data!.deleteCompte));
  }
}
