// features/admin/dashboard/dashboard.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../../shared/components/sidebar/sidebar';
import { Navbar} from '../../../shared/components/navbar/navbar';
import { StatCard } from '../../../shared/components/stat-card/stat-card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    Sidebar,
    Navbar,
    StatCard
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  stats = [
    {
      title: 'Solde Total',
      value: '23 756,89 FCFA',
      subtitle: 'Tous les comptes',
      icon: '💰',
      trend: 'up' as const,
      trendValue: '+12,5%'
    },
    {
      title: 'Clients Actifs',
      value: '1 234',
      subtitle: 'Ce mois',
      icon: '👥',
      trend: 'up' as const,
      trendValue: '+8,2%'
    },
    {
      title: 'Transactions',
      value: '5 678',
      subtitle: 'Aujourd\'hui',
      icon: '💸',
      trend: 'neutral' as const,
      trendValue: '+2,1%'
    },
    {
      title: 'Nouveaux Comptes',
      value: '89',
      subtitle: 'Cette semaine',
      icon: '💳',
      trend: 'up' as const,
      trendValue: '+15,3%'
    }
  ];
}
