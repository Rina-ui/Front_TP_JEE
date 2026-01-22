import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {CompteService} from '../../../core/services/compte.service';
import {TransactionService} from '../../../core/services/transaction.service';
import {AuthService} from '../../../core/services/auth.service';
import {Compte} from '../../../core/models/compte.model';
import {Transaction, TypeTransaction, VersementInput, RetraitInput, VirementInput} from '../../../core/models/transaction.model';

interface Income {
  id: string;
  label: string;
  sublabel: string;
  amount: number;
  type: 'salaire' | 'cours' | 'autre';
}

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  selectedCompteIndex = 0;
  showActionMenu = false;
  showTransactionModal = false;
  showIncomeModal = false;
  currentAction: 'versement' | 'retrait' | 'virement' | null = null;

  // Revenus fixes
  incomes: Income[] = [];

  chartData: { date: string; value: number }[] = [];

  constructor(
    private compteService: CompteService,
    private transactionService: TransactionService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();

    if (!user) {
      console.error('❌ Utilisateur non connecté');
      this.router.navigate(['/login']);
      return;
    }

    this.userId = user.id;
    this.userName = user.email;

    this.loadIncomes();
    this.loadClientData();
  }

  loadIncomes(): void {
    const savedIncomes = localStorage.getItem(`incomes_${this.userId}`);
    if (savedIncomes) {
      this.incomes = JSON.parse(savedIncomes);
    }
  }

  saveIncomes(): void {
    localStorage.setItem(`incomes_${this.userId}`, JSON.stringify(this.incomes));
  }

  loadClientData(): void {
    console.log('🚀 Début du chargement des données client');
    this.loading = true;
    this.cdr.detectChanges();

    this.compteService.getComptesByClient(this.userId).subscribe({
      next: (comptes) => {
        console.log('✅ Comptes reçus:', comptes.length);
        this.comptes = comptes;
        this.calculateTotalBalance();

        if (this.comptes.length === 0) {
          console.log('⚠️ Aucun compte trouvé');
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }

        this.loadAllTransactions();
      },
      error: (error) => {
        console.error('❌ Erreur comptes:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadAllTransactions(): void {
    if (this.comptes.length === 0) {
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    let loadedCount = 0;
    const totalComptes = this.comptes.length;
    this.allTransactions = [];

    this.comptes.forEach((compte) => {
      this.transactionService.getAllTransactions(compte.accountNumber).subscribe({
        next: (transactions) => {
          this.allTransactions.push(...transactions);
          loadedCount++;

          if (loadedCount === totalComptes) {
            this.allTransactions.sort((a, b) =>
              new Date(b.dateTransaction).getTime() - new Date(a.dateTransaction).getTime()
            );
            this.calculateMonthlyStats();
            this.generateChartData();

            this.loading = false;
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          console.error('❌ Erreur transactions:', error);
          loadedCount++;
          if (loadedCount === totalComptes) {
            this.loading = false;
            this.cdr.detectChanges();
          }
        }
      });
    });
  }

  calculateTotalBalance(): void {
    this.totalBalance = this.comptes.reduce((sum, compte) => sum + compte.sold, 0);
  }

  calculateMonthlyStats(): void {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    this.monthlyIncome = 0;
    this.monthlyExpenses = 0;

    this.allTransactions.forEach(transaction => {
      const transactionDate = new Date(transaction.dateTransaction);
      if (transactionDate >= firstDayOfMonth) {
        if (transaction.typeTransaction === TypeTransaction.DEPOT) {
          this.monthlyIncome += transaction.amount;
        } else if (transaction.typeTransaction === TypeTransaction.RETRAIT) {
          this.monthlyExpenses += transaction.amount;
        }
      }
    });
  }

  generateChartData(): void {
    const last12Days = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      last12Days.push(date);
    }

    this.chartData = last12Days.map(date => {
      const dateStr = `${date.getDate()}/${date.getMonth() + 1}`;
      const dayTransactions = this.allTransactions.filter(t => {
        const tDate = new Date(t.dateTransaction);
        return tDate.getDate() === date.getDate() &&
          tDate.getMonth() === date.getMonth() &&
          tDate.getFullYear() === date.getFullYear();
      });

      let value = 0;
      dayTransactions.forEach(t => {
        if (t.typeTransaction === TypeTransaction.DEPOT) {
          value += t.amount;
        } else if (t.typeTransaction === TypeTransaction.RETRAIT) {
          value -= t.amount;
        }
      });

      return { date: dateStr, value: Math.abs(value) };
    });
  }

  toggleBalance(): void {
    this.showBalance = !this.showBalance;
  }

  selectCompte(index: number): void {
    this.selectedCompteIndex = index;
  }

  get selectedCompte(): Compte | null {
    return this.comptes[this.selectedCompteIndex] || null;
  }

  getChartHeight(value: number): string {
    if (this.chartData.length === 0) return '0%';
    const maxValue = Math.max(...this.chartData.map(d => d.value), 1);
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
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(amount));
  }

  isCredit(transaction: Transaction): boolean {
    return transaction.typeTransaction === TypeTransaction.DEPOT;
  }

  formatCardNumber(numero: string): string {
    const cleaned = numero.replace(/[^0-9]/g, '');
    return cleaned.match(/.{1,4}/g)?.join(' ') || numero;
  }

  getCompteTypeLabel(type: string): string {
    return type === 'EPARGNE' ? 'Épargne' : 'Courant';
  }

  downloadPDF(): void {
    alert('Téléchargement du relevé PDF en cours...');
  }

  toggleActionMenu(): void {
    this.showActionMenu = !this.showActionMenu;
  }

  openTransactionModal(action: 'versement' | 'retrait' | 'virement'): void {
    this.currentAction = action;
    this.showTransactionModal = true;
    this.showActionMenu = false;
  }

  closeTransactionModal(): void {
    this.showTransactionModal = false;
    this.currentAction = null;
  }

  openIncomeModal(): void {
    this.showIncomeModal = true;
  }

  closeIncomeModal(): void {
    this.showIncomeModal = false;
  }

  addIncome(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const newIncome: Income = {
      id: Date.now().toString(),
      label: formData.get('label') as string,
      sublabel: formData.get('sublabel') as string,
      amount: parseFloat(formData.get('amount') as string),
      type: formData.get('type') as 'salaire' | 'cours' | 'autre'
    };

    this.incomes.push(newIncome);
    this.saveIncomes();
    this.closeIncomeModal();
    form.reset();
  }

  deleteIncome(id: string): void {
    this.incomes = this.incomes.filter(i => i.id !== id);
    this.saveIncomes();
  }

  handleTransactionSubmit(event: Event): void {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const amount = parseFloat(formData.get('amount') as string);

    if (!this.selectedCompte || !this.currentAction) return;

    switch(this.currentAction) {
      case 'versement':
        const versementInput: VersementInput = {
          numeroCompte: this.selectedCompte.accountNumber,
          montant: amount
        };
        this.transactionService.versement(versementInput).subscribe({
          next: () => {
            this.closeTransactionModal();
            this.loadClientData();
          },
          error: (err) => {
            console.error('Erreur versement:', err);
            alert('Erreur lors du versement');
          }
        });
        break;

      case 'retrait':
        const retraitInput: RetraitInput = {
          numeroCompte: this.selectedCompte.accountNumber,
          montant: amount
        };
        this.transactionService.retrait(retraitInput).subscribe({
          next: () => {
            this.closeTransactionModal();
            this.loadClientData();
          },
          error: (err) => {
            console.error('Erreur retrait:', err);
            alert('Erreur lors du retrait');
          }
        });
        break;

      case 'virement':
        const numeroCompteDestinataire = formData.get('numeroCompteDestinataire') as string;
        const virementInput: VirementInput = {
          numeroCompteSource: this.selectedCompte.accountNumber,
          numeroCompteDestination: numeroCompteDestinataire,
          montant: amount
        };
        this.transactionService.virement(virementInput).subscribe({
          next: () => {
            this.closeTransactionModal();
            this.loadClientData();
          },
          error: (err) => {
            console.error('Erreur virement:', err);
            alert('Erreur lors du virement');
          }
        });
        break;
    }
  }

  navigateTo(page: string): void {
    this.router.navigate([`/${page}`]);
  }

  get recentTransactions(): Transaction[] {
    return this.allTransactions.slice(0, 5);
  }

  get totalIncomes(): number {
    return this.incomes.reduce((sum, income) => sum + income.amount, 0);
  }

  get savings(): number {
    return this.monthlyIncome - this.monthlyExpenses;
  }
}
