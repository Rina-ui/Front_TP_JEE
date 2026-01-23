import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CompteService } from '../../../core/services/compte.service';
import { ClientService } from '../../../core/services/client.service';
import { Compte, TypeCompte } from '../../../core/models/compte.model';
import { Client } from '../../../core/models/user.model';

@Component({
  selector: 'app-comptes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: 'comptes.html',
  styleUrl: 'comptes.css'
})
export class Comptes implements OnInit {
  comptes: Compte[] = [];
  clients: Client[] = [];
  loading = true;
  showModal = false;
  compteForm!: FormGroup;
  selectedClientId: string | null = null;

  typeCompteOptions = [
    { value: 'COURANT', label: 'Compte Courant' },
    { value: 'EPARGNE', label: 'Compte Épargne' }
  ];

  constructor(
    private compteService: CompteService,
    private clientService: ClientService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadClients();

    // Vérifier si un clientId est passé en paramètre
    this.route.queryParams.subscribe(params => {
      if (params['clientId']) {
        this.selectedClientId = params['clientId'];
        this.loadComptesByClient(params['clientId']);
      } else {
        this.loadAllComptes();
      }
    });
  }

  initForm(): void {
    this.compteForm = this.fb.group({
      clientId: ['', Validators.required],
      typeCompte: ['COURANT', Validators.required],
      solde: [0, [Validators.required, Validators.min(0)]]
    });
  }

  loadClients(): void {
    this.clientService.getAllClients().subscribe({
      next: (clients) => {
        this.clients = clients;
        console.log('✅ Clients chargés:', clients);
      },
      error: (error) => console.error('❌ Erreur clients:', error)
    });
  }

  loadAllComptes(): void {
    this.compteService.getAllComptes().subscribe({
      next: (comptes) => {
        this.comptes = comptes;
        this.loading = false;
        console.log('✅ Comptes chargés:', comptes);
      },
      error: (error) => {
        console.error('❌ Erreur comptes:', error);
        this.loading = false;
      }
    });
  }

  loadComptesByClient(clientId: string): void {
    this.compteService.getComptesByClient(clientId).subscribe({
      next: (comptes) => {
        this.comptes = comptes;
        this.loading = false;
        console.log('✅ Comptes du client chargés:', comptes);
      },
      error: (error) => {
        console.error('❌ Erreur comptes:', error);
        this.loading = false;
      }
    });
  }

  getClientName(clientId: string): string {
    const client = this.clients.find(c => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : 'Client inconnu';
  }

  getClientInitials(clientId: string): string {
    const client = this.clients.find(c => c.id === clientId);
    return client ? `${client.firstName[0]}${client.lastName[0]}`.toUpperCase() : '??';
  }

  getTypeCompteLabel(type: string): string {
    const option = this.typeCompteOptions.find(o => o.value === type);
    return option ? option.label : type;
  }

  getTypeCompteColor(type: string): string {
    return type === 'EPARGNE' ? '#10b981' : '#2d7a7b';
  }

  openModal(): void {
    this.showModal = true;
    if (this.selectedClientId) {
      this.compteForm.patchValue({ clientId: this.selectedClientId });
    }
  }

  getTotalSolde(): number {
    if (!this.comptes) return 0;
    return this.comptes.reduce((sum, compte) => sum + (compte.sold || 0), 0);
  }

  getActiveAccountsCount(): number {
    if (!this.comptes) return 0;
    return this.comptes.filter(compte => compte.sold > 0).length;
  }

  closeModal(): void {
    this.showModal = false;
    this.compteForm.reset({ typeCompte: 'COURANT', solde: 0 });
  }

  onSubmit(): void {
    if (this.compteForm.invalid) return;

    const { clientId, typeCompte, sold } = this.compteForm.value;

    this.compteService.createCompte(clientId, { typeCompte, sold }).subscribe({
      next: (compte) => {
        console.log('✅ Compte créé:', compte);
        this.closeModal();

        if (this.selectedClientId) {
          this.loadComptesByClient(this.selectedClientId);
        } else {
          this.loadAllComptes();
        }
      },
      error: (error) => console.error('❌ Erreur création:', error)
    });
  }

  viewTransactions(compte: Compte): void {
    this.router.navigate(['/transactions'], {
      queryParams: { numeroCompte: compte.accountNumber }
    });
  }

  deleteCompte(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce compte ?')) {
      this.compteService.deleteCompte(id).subscribe({
        next: () => {
          console.log('✅ Compte supprimé');
          if (this.selectedClientId) {
            this.loadComptesByClient(this.selectedClientId);
          } else {
            this.loadAllComptes();
          }
        },
        error: (error) => console.error('❌ Erreur suppression:', error)
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
