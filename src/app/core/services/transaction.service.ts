import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, map } from 'rxjs';
import { GET_ALL_TRANSACTIONS } from '../../graphQL/query/transaction.queries';
import { VERSEMENT_MUTATION, RETRAIT_MUTATION, VIREMENT_MUTATION } from '../../graphQL/mutation/transaction.mutations';
import { Transaction, VersementInput, RetraitInput, VirementInput } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  constructor(private apollo: Apollo) {}

  getAllTransactions(numeroCompte: string): Observable<Transaction[]> {
    return this.apollo.query<{ getAllTransactions: Transaction[] }>({
      query: GET_ALL_TRANSACTIONS,
      variables: { numeroCompte },
      fetchPolicy: 'network-only'
    }).pipe(map(result => result.data.getAllTransactions));
  }

  versement(input: VersementInput): Observable<Transaction> {
    return this.apollo.mutate<{ versement: Transaction }>({
      mutation: VERSEMENT_MUTATION,
      variables: { input }
    }).pipe(map(result => result.data!.versement));
  }

  retrait(input: RetraitInput): Observable<Transaction> {
    return this.apollo.mutate<{ retrait: Transaction }>({
      mutation: RETRAIT_MUTATION,
      variables: { input }
    }).pipe(map(result => result.data!.retrait));
  }

  virement(input: VirementInput): Observable<Transaction> {
    return this.apollo.mutate<{ virement: Transaction }>({
      mutation: VIREMENT_MUTATION,
      variables: { input }
    }).pipe(map(result => result.data!.virement));
  }
}
