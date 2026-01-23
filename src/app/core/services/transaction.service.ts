import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, map } from 'rxjs';
import {GENERER_RELEVE, GET_ALL_TRANSACTIONS} from '../../graphQL/query/transaction.queries';
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
    }).pipe(
      map(result => {
        if (!result.data) {
          throw new Error('No transactions data returned');
        }
        return result.data.getAllTransactions;
      })
    );
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


  genererReleve(numeroCompte: string, dateDebut: string, dateFin: string): Observable<any> {
    return this.apollo.query({
      query: GENERER_RELEVE,
      variables: {
        numeroCompte,
        dateDebut,
        dateFin
      },
      fetchPolicy: 'network-only'
    }).pipe(
      map((result: any) => result.data.genererReleve)
    );
  }

  // Méthode utilitaire pour télécharger le PDF
  downloadPdf(pdfBase64: string, filename: string = 'releve.pdf'): void {
    const byteCharacters = atob(pdfBase64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' });

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();

    window.URL.revokeObjectURL(link.href);
  }

}
