// features/admin/dashboard/dashboard.ts
import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { AuthService } from '../../../core/services/auth.service';
import { CompteService } from '../../../core/services/compte.service';
import { Client } from '../../../core/models/user.model';
import { Compte } from '../../../core/models/compte.model';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'dashboard.html',
  styleUrl: 'dashboard.css'
})
export class Dashboard implements OnInit, AfterViewInit {
  @ViewChild('lineChart') lineChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('doughnutChart') doughnutChart!: ElementRef<HTMLCanvasElement>;

  // Données de l'utilisateur connecté
  currentUserInitials = 'AD';

  // Données financières
  totalIncome = 23154.80;
  totalPaid = 8145.20;

  monthlyPerformance = [
    { month: 'May', income: 15200, expenses: 9500, profit: 5700 },
    { month: 'Jun', income: 16500, expenses: 10200, profit: 6300 },
    { month: 'Jul', income: 17800, expenses: 10800, profit: 7000 },
    { month: 'Aug', income: 18200, expenses: 11100, profit: 7100 },
    { month: 'Sep', income: 19100, expenses: 11500, profit: 7600 },
    { month: 'Oct', income: 20300, expenses: 12000, profit: 8300 },
    { month: 'Nov', income: 21500, expenses: 12500, profit: 9000 },
    { month: 'Dec', income: 23194, expenses: 13700, profit: 9494 },
  ];

  // Données depuis l'API
  clients: Client[] = [];
  comptes: Compte[] = [];
  loading = true;

  constructor(
    private authService: AuthService,
    private compteService: CompteService
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadClients();
    this.loadComptes();
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

  loadClients(): void {
    // TODO: Créer clientService.getAllClients()
    // Pour l'instant, données fictives
    this.clients = [
      {
        id: '1',
        email: 'john.doe@example.com',
        role: 'CLIENT' as any,
        firstName: 'John',
        lastName: 'Doe',
        dateNaissance: '1990-05-15',
        city: 'Lomé',
        nationality: 'Togolaise',
        numberNationality: 12345678
      },
      {
        id: '2',
        email: 'jane.smith@example.com',
        role: 'CLIENT' as any,
        firstName: 'Jane',
        lastName: 'Smith',
        dateNaissance: '1985-08-22',
        city: 'Kara',
        nationality: 'Togolaise',
        numberNationality: 87654321
      }
    ];
  }

  loadComptes(): void {
    this.compteService.getAllComptes().subscribe({
      next: (comptes) => {
        this.comptes = comptes;
        this.loading = false;
        console.log('✅ Comptes chargés:', comptes);
      },
      error: (error) => {
        console.error('❌ Erreur chargement comptes:', error);
        this.loading = false;
      }
    });
  }

  getClientComptesCount(clientId: string): number {
    return this.comptes.filter(c => c.clientId === clientId).length;
  }

  getInitials(firstName: string, lastName: string): string {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }

  viewClientComptes(clientId: string): void {
    console.log('Voir comptes du client:', clientId);
    // TODO: Navigation vers page comptes
  }

  editClient(client: Client): void {
    console.log('Éditer client:', client);
    // TODO: Ouvrir modal d'édition
  }

  deleteClient(clientId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      console.log('Supprimer client:', clientId);
      // TODO: Appel API suppression
    }
  }

  openAddClientModal(): void {
    console.log('Ouvrir modal ajout client');
    // TODO: Ouvrir modal
  }

  createLineChart(): void {
    new Chart(this.lineChart.nativeElement, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Expenses',
            data: [5, 10, 8, 12, 15, 18, 16, 20, 22, 24, 26, 28],
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Income',
            data: [10, 15, 13, 18, 22, 26, 24, 28, 30, 32, 35, 38],
            borderColor: '#2d7a7b',
            backgroundColor: 'rgba(45, 122, 123, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Profit',
            data: [3, 8, 6, 10, 13, 16, 14, 18, 20, 22, 24, 26],
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#f3f4f6'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  createDoughnutChart(): void {
    new Chart(this.doughnutChart.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['$12K', '$8K', '$4K'],
        datasets: [{
          data: [12000, 8000, 4000],
          backgroundColor: ['#2d7a7b', '#4ecdc4', '#a7f3d0'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        cutout: '75%'
      }
    });
  }
}
