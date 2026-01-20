import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Apollo, gql } from 'apollo-angular';

interface Account {
  id: string;
  numero: string;
  solde: number;
  type: string;
}

interface Transaction {
  id: string;
  montant: number;
  type: string;
  dateTransaction: string;
  statut: string;
  description?: string;
}

const GET_CLIENT_DATA = gql`
  query GetClientData {
    currentUser {
      id
      nom
      prenom
      comptes {
        id
        numero
        solde
        type
      }
    }
    transactions(first: 10) {
      id
      montant
      type
      dateTransaction
      statut
      description
    }
  }
`;

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'dashboard.html',
  styleUrls: ['dashboard.css']
})
export class ClientDashboard implements OnInit {
  showBalance = true;
  accounts: Account[] = [];
  transactions: Transaction[] = [];
  loading = true;
  userName = '';
  totalBalance = 0;
  monthlyIncome = 4250; // Revenus du mois

  // Données pour le graphique de flux de trésorerie
  chartData = [
    { date: '15 Sep', value: 1200 },
    { date: '20 Sep', value: 1800 },
    { date: '25 Sep', value: 1500 },
    { date: '30 Sep', value: 2200 },
    { date: '05 Oct', value: 1900 },
    { date: '10 Oct', value: 2500 },
    { date: '15 Oct', value: 2100 },
    { date: '20 Oct', value: 2800 },
    { date: '25 Oct', value: 3200 },
    { date: '30 Oct', value: 2900 },
    { date: '05 Nov', value: 3500 },
    { date: '10 Nov', value: 3100 }
  ];

  constructor(private apollo: Apollo) {}

  ngOnInit(): void {
    this.loadClientData();

    // DONNÉES DE TEST (à retirer quand vous aurez les vraies données)
    this.accounts = [
      {
        id: '1',
        numero: 'TG-2024-001-8672',
        solde: 8672.20,
        type: 'Compte Courant'
      },
      {
        id: '2',
        numero: 'TG-2024-002-3785',
        solde: 3785.35,
        type: 'Compte Épargne'
      }
    ];

    this.transactions = [
      { id: '1', montant: 3500, type: 'DEPOT', dateTransaction: '2025-03-01', statut: 'VALIDEE', description: 'Virement salaire' },
      { id: '2', montant: -1200, type: 'RETRAIT', dateTransaction: '2025-03-01', statut: 'VALIDEE', description: 'Paiement loyer' },
      { id: '3', montant: -89.50, type: 'RETRAIT', dateTransaction: '2025-02-28', statut: 'VALIDEE', description: 'Courses alimentaires' },
      { id: '4', montant: 750, type: 'DEPOT', dateTransaction: '2025-02-27', statut: 'VALIDEE', description: 'Freelance' },
      { id: '5', montant: -156.30, type: 'RETRAIT', dateTransaction: '2025-02-26', statut: 'ECHOUEE', description: 'Facture électricité' },
      { id: '6', montant: -245.99, type: 'RETRAIT', dateTransaction: '2025-02-25', statut: 'VALIDEE', description: 'Achat en ligne' }
    ];

    this.userName = 'Jean Dupont';
    this.calculateTotalBalance();
    this.loading = false;
  }

  loadClientData(): void {
    this.apollo
      .watchQuery<any>({
        query: GET_CLIENT_DATA
      })
      .valueChanges.subscribe({
      next: (result) => {
        const user = result.data?.currentUser;
        if (user) {
          this.userName = `${user.prenom} ${user.nom}`;
          this.accounts = user.comptes || [];
          this.calculateTotalBalance();
        }
        this.transactions = result.data?.transactions || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement données:', error);
        this.loading = false;
      }
    });
  }

  calculateTotalBalance(): void {
    this.totalBalance = this.accounts.reduce((sum, acc) => sum + acc.solde, 0);
  }

  toggleBalance(): void {
    this.showBalance = !this.showBalance;
  }

  getAccountClass(index: number): string {
    const classes = ['account-emerald', 'account-blue'];
    return classes[index % classes.length];
  }

  getChartHeight(value: number): string {
    const maxValue = Math.max(...this.chartData.map(d => d.value));
    return `${(value / maxValue) * 100}%`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }

  formatAmount(amount: number): string {
    return Math.abs(amount).toFixed(2);
  }

  isCredit(transaction: Transaction): boolean {
    return transaction.type === 'DEPOT' || transaction.montant > 0;
  }

  formatCardNumber(numero: string): string {
    // Formater le numéro de compte en format carte bancaire (XXXX XXXX XXXX XXXX)
    const cleaned = numero.replace(/[^0-9]/g, '');
    const padded = cleaned.padEnd(16, '0');
    return padded.match(/.{1,4}/g)?.join(' ') || numero;
  }

  downloadStatement(accountId: string): void {
    // Logique pour télécharger le relevé de compte
    console.log('Téléchargement du relevé pour le compte:', accountId);

    // TODO: Appel GraphQL pour générer et télécharger le relevé
    // Exemple d'implémentation:
    /*
    this.apollo.query({
      query: gql`
        query GenerateStatement($accountId: ID!) {
          generateAccountStatement(accountId: $accountId) {
            url
          }
        }
      `,
      variables: { accountId }
    }).subscribe({
      next: (result: any) => {
        const url = result.data.generateAccountStatement.url;
        window.open(url, '_blank');
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement du relevé:', error);
      }
    });
    */

    // Version temporaire pour tester
    alert(`Téléchargement du relevé pour le compte ${accountId}`);
  }

  handleQuickAction(action: string): void {
    console.log('Action rapide:', action);

    switch(action) {
      case 'transfer':
        alert('🔄 Virement - Fonctionnalité à implémenter');
        break;
      case 'deposit':
        alert('➕ Dépôt - Fonctionnalité à implémenter');
        break;
      case 'withdraw':
        alert('➖ Retrait - Fonctionnalité à implémenter');
        break;
      case 'history':
        alert('📜 Historique complet - Fonctionnalité à implémenter');
        break;
    }
  }
}
