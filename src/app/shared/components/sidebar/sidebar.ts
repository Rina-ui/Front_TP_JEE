
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Logo } from '../logo/logo';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, Logo],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent {
  menuItems = [
    { icon: '🏠', label: 'Dashboard', route: '/admin/dashboard', active: true },
    { icon: '👥', label: 'Clients', route: '/admin/clients', active: false },
    { icon: '👨‍💼', label: 'Agents', route: '/admin/agents', active: false },
    { icon: '💳', label: 'Comptes', route: '/admin/comptes', active: false },
    { icon: '💸', label: 'Transactions', route: '/admin/transactions', active: false },
    { icon: '📊', label: 'Rapports', route: '/admin/reports', active: false },
    { icon: '⚙️', label: 'Paramètres', route: '/admin/settings', active: false }
  ];
}
