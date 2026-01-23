import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../../../core/services/auth.service';
import { ClientService } from '../../../core/services/client.service';
import { CompteService } from '../../../core/services/compte.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { Client } from '../../../core/models/user.model';
import { Compte } from '../../../core/models/compte.model';
import {Transaction, TypeTransaction} from '../../../core/models/transaction.model';
import { Router } from '@angular/router';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
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

  constructor(
    private authService: AuthService,
    private clientService: ClientService,
    private compteService: CompteService,
    private transactionService: TransactionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadAllData();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.createLineChart();
      this.createDoughnutChart();
    }, 100);
  }

  loadUserInfo(): void {
    const user = this.authService.getUser();
    if (user) {
      this.currentUserInitials = user.email.substring(0, 2).toUpperCase();
    }
  }

  loadAllData(): void {
    // Charger les clients
    this.clientService.getAllClients().subscribe({
      next: (clients) => {
        this.clients = clients;
        console.log('✅ Clients chargés:', clients);
      },
      error: (error) => console.error('❌ Erreur clients:', error)
    });

    // Charger les comptes
    this.compteService.getAllComptes().subscribe({
      next: (comptes) => {
        this.comptes = comptes;
        console.log('✅ Comptes chargés:', comptes);

        // Calculer les totaux à partir des comptes
        this.calculateFinancialData();

        // Charger les transactions pour chaque compte
        this.loadAllTransactions();

        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Erreur comptes:', error);
        this.loading = false;
      }
    });
  }

  loadAllTransactions(): void {
    if (this.comptes.length === 0) return;

    let loaded = 0;

    this.comptes.forEach(compte => {
      this.transactionService.getAllTransactions(compte.accountNumber).subscribe({
        next: (transactions) => {
          this.allTransactions.push(...transactions);
          loaded++;

          // Quand toutes les transactions sont chargées
          if (loaded === this.comptes.length) {
            this.calculateMonthlyPerformance();

            // CRÉER LES GRAPHIQUES ICI
            this.createLineChart();
            this.createDoughnutChart();
          }
        },
        error: (error) => console.error(error)
      });
    });
  }


  calculateFinancialData(): void {
    // Calculer le total income (somme de tous les soldes)
    this.totalIncome = this.comptes.reduce((sum, compte) => sum + compte.sold, 0);

    // Calculer total paid (exemple: 35% du total income)
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
      }
      else if (transaction.typeTransaction === TypeTransaction.RETRAIT) {
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


  getClientComptesCount(_: string): number {
    return this.comptes.length;
  }


  getInitials(firstName: string, lastName: string): string {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }

  viewClientComptes(clientId: string): void {
    this.router.navigate(['/comptes'], { queryParams: { clientId } });
  }

  editClient(client: Client): void {
    this.router.navigate(['/clients/edit', client.id]);
  }

  deleteClient(clientId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      this.clientService.deleteClient(clientId).subscribe({
        next: () => {
          console.log('✅ Client supprimé');
          this.loadAllData(); // Recharger les données
        },
        error: (error) => console.error('❌ Erreur suppression:', error)
      });
    }
  }

  openAddClientModal(): void {
    this.router.navigate(['/clients/register']);
  }

  createLineChart(): void {
    if (!this.lineChart) return;

    // 🔥 DÉTRUIRE L'ANCIEN GRAPHIQUE
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
    if (!this.doughnutChart) return;

    if (this.doughnutChartInstance) {
      this.doughnutChartInstance.destroy();
    }

    this.doughnutChartInstance = new Chart(this.doughnutChart.nativeElement, {
      type: 'doughnut',
      data: {
        labels: this.comptes.slice(0, 3).map(c => `${c.sold} FCFA`),
        datasets: [{
          data: this.comptes.slice(0, 3).map(c => c.sold),
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
