import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../../../core/services/auth.service';
import { ClientService } from '../../../core/services/client.service';
import { CompteService } from '../../../core/services/compte.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { Client } from '../../../core/models/user.model';
import { Compte } from '../../../core/models/compte.model';
import { Transaction, TypeTransaction } from '../../../core/models/transaction.model';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: 'dashboard.html',
  styleUrl: 'dashboard.css'
})
export class Dashboard implements OnInit, AfterViewInit {

  lineChartInstance?: Chart;
  doughnutChartInstance?: Chart;

  @ViewChild('lineChart') lineChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('doughnutChart') doughnutChart!: ElementRef<HTMLCanvasElement>;

  currentUserInitials = 'AD';
  totalIncome = 0;
  totalPaid = 0;
  monthlyPerformance: any[] = [];

  clients: Client[] = [];
  comptes: Compte[] = [];
  allTransactions: Transaction[] = [];
  loading = true;
  dataLoaded = false; // 🔥 NOUVEAU: flag pour savoir si les données sont chargées

  // Modals
  showClientModal = false;
  showCompteModal = false;
  showTransactionModal = false;

  // Forms
  clientForm!: FormGroup;
  compteForm!: FormGroup;
  transactionForm!: FormGroup;

  // Form steps
  currentStep = 1;
  totalSteps = 3;

  constructor(
    private authService: AuthService,
    private clientService: ClientService,
    private compteService: CompteService,
    private transactionService: TransactionService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.initForms();
    this.loadAllData();
  }

  ngAfterViewInit(): void {
    // Ne rien créer ici - attendre que les données soient chargées
  }

  initForms(): void {
    // Client Form
    this.clientForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      dateNaissance: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      city: ['', Validators.required],
      nationality: ['', Validators.required],
      numberNationality: ['', [Validators.required, Validators.pattern(/^\d+$/)]]
    });

    // Compte Form
    this.compteForm = this.fb.group({
      clientId: ['', Validators.required],
      accountType: ['COURANT', Validators.required],
      initialBalance: [0, [Validators.required, Validators.min(0)]]
    });

    // Transaction Form
    this.transactionForm = this.fb.group({
      accountNumber: ['', Validators.required],
      typeTransaction: ['DEPOT', Validators.required],
      amount: [0, [Validators.required, Validators.min(1)]],
      description: ['']
    });
  }

  get cf() { return this.clientForm.controls; }
  get cof() { return this.compteForm.controls; }
  get tf() { return this.transactionForm.controls; }

  loadUserInfo(): void {
    const user = this.authService.getUser();
    if (user) {
      this.currentUserInitials = user.email.substring(0, 2).toUpperCase();
    }
  }

  loadAllData(): void {
    this.loading = true;
    this.dataLoaded = false;

    // Charger les clients
    this.clientService.getAllClients().subscribe({
      next: (clients) => {
        this.clients = clients;
        console.log('✅ Clients chargés:', clients);
        this.checkIfDataLoaded();
      },
      error: (error) => {
        console.error('❌ Erreur clients:', error);
        this.loading = false;
      }
    });

    // Charger les comptes
    this.compteService.getAllComptes().subscribe({
      next: (comptes) => {
        this.comptes = comptes;
        console.log('✅ Comptes chargés:', comptes);

        this.calculateFinancialData();
        this.loadAllTransactions();
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
      this.dataLoaded = true;
      this.createChartsIfReady();
      return;
    }

    let loaded = 0;
    this.allTransactions = []; // Reset

    this.comptes.forEach(compte => {
      this.transactionService.getAllTransactions(compte.accountNumber).subscribe({
        next: (transactions) => {
          this.allTransactions.push(...transactions);
          loaded++;

          if (loaded === this.comptes.length) {
            console.log('✅ Toutes les transactions chargées:', this.allTransactions);
            this.calculateMonthlyPerformance();
            this.loading = false;
            this.dataLoaded = true;

            // 🔥 CRÉER LES GRAPHIQUES ICI APRÈS CHARGEMENT
            this.createChartsIfReady();
          }
        },
        error: (error) => {
          console.error('❌ Erreur transactions:', error);
          loaded++;
          if (loaded === this.comptes.length) {
            this.loading = false;
            this.dataLoaded = true;
            this.createChartsIfReady();
          }
        }
      });
    });
  }

  checkIfDataLoaded(): void {
    // Vérifier si toutes les données nécessaires sont chargées
    if (this.clients.length > 0 && this.comptes.length >= 0) {
      this.createChartsIfReady();
    }
  }

  createChartsIfReady(): void {
    // Attendre un peu pour que les ViewChild soient initialisés
    setTimeout(() => {
      if (this.dataLoaded && this.lineChart && this.doughnutChart) {
        this.createLineChart();
        this.createDoughnutChart();
        console.log('✅ Graphiques créés avec succès');
      }
    }, 100);
  }

  calculateFinancialData(): void {
    this.totalIncome = this.comptes.reduce((sum, compte) => sum + compte.sold, 0);
    this.totalPaid = this.totalIncome * 0.35;
  }

  calculateMonthlyPerformance(): void {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();

    const monthlyData = new Map<string, { income: number; expenses: number }>();

    this.allTransactions.forEach(transaction => {
      const date = new Date(transaction.dateTransaction);
      const monthKey = months[date.getMonth()];

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { income: 0, expenses: 0 });
      }

      const data = monthlyData.get(monthKey)!;

      if (transaction.typeTransaction === TypeTransaction.DEPOT) {
        data.income += transaction.amount;
      } else if (transaction.typeTransaction === TypeTransaction.RETRAIT) {
        data.expenses += transaction.amount;
      }
    });

    this.monthlyPerformance = [];
    for (let i = 7; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const monthKey = months[monthIndex];
      const data = monthlyData.get(monthKey) || { income: 0, expenses: 0 };

      this.monthlyPerformance.push({
        month: monthKey,
        income: data.income,
        expenses: data.expenses,
        profit: data.income - data.expenses
      });
    }
  }

  getClientComptesCount(clientId: string): number {
    return this.comptes.filter(c => c.clientId === clientId).length;
  }

  getInitials(firstName: string, lastName: string): string {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }

  // Modal Management
  openClientModal(): void {
    this.showClientModal = true;
    this.currentStep = 1;
    this.clientForm.reset();
  }

  closeClientModal(): void {
    this.showClientModal = false;
    this.currentStep = 1;
    this.clientForm.reset();
  }

  openCompteModal(): void {
    this.showCompteModal = true;
    this.compteForm.reset();
  }

  closeCompteModal(): void {
    this.showCompteModal = false;
    this.compteForm.reset();
  }

  openTransactionModal(): void {
    this.showTransactionModal = true;
    this.transactionForm.reset();
  }

  closeTransactionModal(): void {
    this.showTransactionModal = false;
    this.transactionForm.reset();
  }

  // Client Form Steps
  nextStep(): void {
    if (this.currentStep < this.totalSteps && this.isStepValid(this.currentStep)) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  isStepValid(step: number): boolean {
    switch(step) {
      case 1:
        return !!(this.cf['firstName'].valid && this.cf['lastName'].valid && this.cf['dateNaissance'].valid);
      case 2:
        return !!(this.cf['email'].valid && this.cf['password'].valid &&
          this.cf['confirmPassword'].valid &&
          this.cf['password'].value === this.cf['confirmPassword'].value);
      case 3:
        return !!(this.cf['city'].valid && this.cf['nationality'].valid && this.cf['numberNationality'].valid);
      default:
        return false;
    }
  }

  // Submit Forms
  submitClient(): void {
    if (this.clientForm.invalid) return;

    const input = {
      email: this.cf['email'].value,
      password: this.cf['password'].value,
      firstName: this.cf['firstName'].value,
      lastName: this.cf['lastName'].value,
      dateNaissance: this.cf['dateNaissance'].value,
      city: this.cf['city'].value,
      nationality: this.cf['nationality'].value,
      numberNationality: parseInt(this.cf['numberNationality'].value)
    };

    this.clientService.createClient(input).subscribe({
      next: () => {
        alert('✅ Client créé avec succès !');
        this.closeClientModal();
        this.loadAllData();
      },
      error: (error) => alert('❌ Erreur: ' + error.message)
    });
  }

  submitCompte(): void {
    if (this.compteForm.invalid) return;

    const clientId = this.cof['clientId'].value;
    const input = {
      typeCompte: this.cof['accountType'].value,
      sold: this.cof['initialBalance'].value
    };

    // Le service attend 2 arguments: clientId et input
    this.compteService.createCompte(clientId, input).subscribe({
      next: () => {
        alert('Compte créé avec succès !');
        this.closeCompteModal();
        this.loadAllData();
      },
      error: (error) => alert('❌ Erreur: ' + error.message)
    });
  }

  submitTransaction(): void {
    if (this.transactionForm.invalid) return;

    const input = {
      accountNumber: this.tf['accountNumber'].value,
      typeTransaction: this.tf['typeTransaction'].value,
      amount: this.tf['amount'].value,
      description: this.tf['description'].value
    };

  }

  deleteClient(clientId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      this.clientService.deleteClient(clientId).subscribe({
        next: () => {
          alert('✅ Client supprimé');
          this.loadAllData();
        },
        error: (error) => alert('❌ Erreur: ' + error.message)
      });
    }
  }

  deleteCompte(accountNumber: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce compte ?')) {
      this.compteService.deleteCompte(accountNumber).subscribe({
        next: () => {
          alert('✅ Compte supprimé');
          this.loadAllData();
        },
        error: (error) => alert('❌ Erreur: ' + error.message)
      });
    }
  }

  createLineChart(): void {
    if (!this.lineChart) {
      console.warn('⚠️ LineChart ViewChild pas encore disponible');
      return;
    }

    if (this.lineChartInstance) {
      this.lineChartInstance.destroy();
    }

    this.lineChartInstance = new Chart(this.lineChart.nativeElement, {
      type: 'line',
      data: {
        labels: this.monthlyPerformance.map(m => m.month),
        datasets: [
          {
            label: 'Expenses',
            data: this.monthlyPerformance.map(m => m.expenses),
            borderColor: '#ef4444',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Income',
            data: this.monthlyPerformance.map(m => m.income),
            borderColor: '#2d7a7b',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Profit',
            data: this.monthlyPerformance.map(m => m.profit),
            borderColor: '#f59e0b',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  createDoughnutChart(): void {
    if (!this.doughnutChart) {
      console.warn('⚠️ DoughnutChart ViewChild pas encore disponible');
      return;
    }

    if (this.doughnutChartInstance) {
      this.doughnutChartInstance.destroy();
    }

    const topComptes = this.comptes.slice(0, 3);

    this.doughnutChartInstance = new Chart(this.doughnutChart.nativeElement, {
      type: 'doughnut',
      data: {
        labels: topComptes.map(c => `${c.sold} FCFA`),
        datasets: [{
          data: topComptes.map(c => c.sold),
          backgroundColor: ['#2d7a7b', '#4ecdc4', '#a7f3d0']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%'
      }
    });
  }
}
