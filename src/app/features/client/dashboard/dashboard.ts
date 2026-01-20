import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {CompteService} from '../../../core/services/compte.service';
import {TransactionService} from '../../../core/services/transaction.service';
import {AuthService} from '../../../core/services/auth.service';
import {Compte} from '../../../core/models/compte.model';
import {Transaction, TypeTransaction} from '../../../core/models/transaction.model';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'dashboard.html',
  styleUrl: 'dashboard.css'
})
export class ClientDashboard implements OnInit {
  showBalance = true;
  comptes: Compte[] = [];
  allTransactions: Transaction[] = [];
  loading = true;
  userName = '';
  userId = '';
  totalBalance = 0;
  monthlyIncome = 0;
  monthlyExpenses = 0;

  chartData: { date: string; value: number }[] = [];

  constructor(
    private compteService: CompteService,
    private transactionService: TransactionService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadClientData();
  }

  loadUserInfo(): void {
    const user = this.authService.getUser();
    if (user) {
      this.userId = user.id;
      this.userName = `${user.email || ''} ${user.email || ''}`.trim() || user.email;
    }
  }

  loadClientData(): void {
    // Charger les comptes du client connecté
    this.compteService.getComptesByClient(this.userId).subscribe({
      next: (comptes) => {
        this.comptes = comptes;
        this.calculateTotalBalance();

        // Charger les transactions pour chaque compte
        this.loadAllTransactions();

        console.log('✅ Comptes chargés:', comptes);
      },
      error: (error) => {
        console.error('❌ Erreur comptes:', error);
        this.loading = false;
      }
    });
  }

  loadAllTransactions(): void {
    if (this.comptes.length === 0) {
      this.loading = false;
      return;
    }

    let loadedCount = 0;
    this.allTransactions = [];

    this.comptes.forEach(compte => {
      this.transactionService.getAllTransactions(compte.accountNumber).subscribe({
        next: (transactions) => {
          this.allTransactions.push(...transactions);
          loadedCount++;

          if (loadedCount === this.comptes.length) {
            // Toutes les transactions sont chargées
            this.allTransactions.sort((a, b) =>
              new Date(b.dateTransaction).getTime() - new Date(a.dateTransaction).getTime()
            );
            this.calculateMonthlyStats();
            this.generateChartData();
            this.loading = false;
            console.log('✅ Transactions chargées:', this.allTransactions);
          }
        },
        error: (error) => {
          console.error('❌ Erreur transactions:', error);
          loadedCount++;
          if (loadedCount === this.comptes.length) {
            this.loading = false;
          }
        }
      });
    });
  }

  calculateTotalBalance(): void {
    this.totalBalance = this.comptes.reduce((sum, compte) => sum + compte.solde, 0);
  }

  calculateMonthlyStats(): void {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    this.monthlyIncome = 0;
    this.monthlyExpenses = 0;

    this.allTransactions.forEach(transaction => {
      const transactionDate = new Date(transaction.dateTransaction);
      if (transactionDate >= firstDayOfMonth) {
        if (transaction.type === TypeTransaction.DEPOT) {
          this.monthlyIncome += transaction.montant;
        } else if (transaction.type === TypeTransaction.RETRAIT) {
          this.monthlyExpenses += transaction.montant;
        }
      }
    });
  }


  generateChartData(): void {
    // Générer les 12 derniers points de données (derniers 12 jours avec transactions)
    const groupedByDate = new Map<string, number>();

    this.allTransactions.forEach(transaction => {
      const date = new Date(transaction.dateTransaction);
      const dateKey = `${date.getDate()}/${date.getMonth() + 1}`;

      const currentValue = groupedByDate.get(dateKey) || 0;

      if (transaction.type === TypeTransaction.DEPOT) {
        groupedByDate.set(dateKey, currentValue + transaction.montant);
      } else if (transaction.type === TypeTransaction.RETRAIT) {
        groupedByDate.set(dateKey, currentValue - transaction.montant);
      }
    });

    // Convertir en tableau et prendre les 12 derniers
    this.chartData = Array.from(groupedByDate.entries())
      .map(([date, value]) => ({ date, value }))
      .slice(-12);

    // Si pas assez de données, générer des données par défaut
    if (this.chartData.length === 0) {
      this.chartData = this.generateDefaultChartData();
    }
  }

  generateDefaultChartData(): { date: string; value: number }[] {
    const data = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      data.push({
        date: `${date.getDate()}/${date.getMonth() + 1}`,
        value: Math.random() * 2000 + 1000
      });
    }

    return data;
  }

  toggleBalance(): void {
    this.showBalance = !this.showBalance;
  }

  getAccountClass(index: number): string {
    const classes = ['account-emerald', 'account-blue', 'account-purple', 'account-orange'];
    return classes[index % classes.length];
  }

  getChartHeight(value: number): string {
    if (this.chartData.length === 0) return '0%';
    const maxValue = Math.max(...this.chartData.map(d => d.value));
    return `${(value / maxValue) * 100}%`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  formatAmount(amount: number): string {
    return Math.abs(amount).toFixed(2);
  }

  isCredit(transaction: Transaction): boolean {
    return transaction.type === TypeTransaction.DEPOT;
  }

  formatCardNumber(numero: string): string {
    const cleaned = numero.replace(/[^0-9]/g, '');
    const padded = cleaned.padEnd(16, '0');
    return padded.match(/.{1,4}/g)?.join(' ') || numero;
  }

  getCompteTypeLabel(type: string): string {
    return type === 'EPARGNE' ? 'Compte Épargne' : 'Compte Courant';
  }

  viewCompteDetails(compte: Compte): void {
    this.router.navigate(['/transactions'], {
      queryParams: { numeroCompte: compte.accountNumber }
    });
  }

  handleQuickAction(action: string): void {
    const firstCompte = this.comptes[0];

    if (!firstCompte) {
      alert('Aucun compte disponible');
      return;
    }

    switch(action) {
      case 'deposit':
        this.router.navigate(['/transactions'], {
          queryParams: {
            numeroCompte: firstCompte.accountNumber,
            action: 'versement'
          }
        });
        break;
      case 'withdraw':
        this.router.navigate(['/transactions'], {
          queryParams: {
            numeroCompte: firstCompte.accountNumber,
            action: 'retrait'
          }
        });
        break;
      case 'transfer':
        this.router.navigate(['/transactions'], {
          queryParams: {
            numeroCompte: firstCompte.accountNumber,
            action: 'virement'
          }
        });
        break;
      case 'history':
        this.router.navigate(['/transactions'], {
          queryParams: { numeroCompte: firstCompte.accountNumber }
        });
        break;
    }
  }

  viewAllTransactions(): void {
    if (this.comptes.length > 0) {
      this.router.navigate(['/transactions'], {
        queryParams: { numeroCompte: this.comptes[0].accountNumber }
      });
    }
  }

  get recentTransactions(): Transaction[] {
    return this.allTransactions.slice(0, 6);
  }
}
