import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionService } from '../../../core/services/transaction.service';
import { CompteService } from '../../../core/services/compte.service';
import { Transaction, TypeTransaction } from '../../../core/models/transaction.model';
import { Compte } from '../../../core/models/compte.model';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: 'transactions.html',
  styleUrl: 'transactions.css'
})
export class Transactions implements OnInit {
  transactions: Transaction[] = [];
  compte: Compte | null = null;
  comptes: Compte[] = [];
  loading = true;
  showModal = false;
  modalType: 'VERSEMENT' | 'RETRAIT' | 'VIREMENT' = 'VERSEMENT';
  transactionForm!: FormGroup;
  numeroCompte: string = '';

  constructor(
    private transactionService: TransactionService,
    private compteService: CompteService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadComptes();

    this.route.queryParams.subscribe(params => {
      if (params['numeroCompte']) {
        this.numeroCompte = params['numeroCompte'];
        this.loadTransactions(params['numeroCompte']);
        this.loadCompteInfo(params['numeroCompte']);
      }
    });
  }

  initForm(): void {
    this.transactionForm = this.fb.group({
      montant: ['', [Validators.required, Validators.min(1)]],
      numeroCompteDestinataire: ['']
    });
  }

  loadComptes(): void {
    this.compteService.getAllComptes().subscribe({
      next: (comptes) => {
        this.comptes = comptes;
      },
      error: (error) => console.error('❌ Erreur comptes:', error)
    });
  }

  loadTransactions(numeroCompte: string): void {
    this.transactionService.getAllTransactions(numeroCompte).subscribe({
      next: (transactions) => {
        this.transactions = transactions.sort((a, b) =>
          new Date(b.dateTransaction).getTime() - new Date(a.dateTransaction).getTime()
        );
        this.loading = false;
        console.log('✅ Transactions chargées:', transactions);
      },
      error: (error) => {
        console.error('❌ Erreur transactions:', error);
        this.loading = false;
      }
    });
  }

  loadCompteInfo(numeroCompte: string): void {
    this.compteService.getAllComptes().subscribe({
      next: (comptes) => {
        this.compte = comptes.find(c => c.accountNumber === numeroCompte) || null;
      },
      error: (error) => console.error('❌ Erreur compte:', error)
    });
  }

  openModal(type: 'VERSEMENT' | 'RETRAIT' | 'VIREMENT'): void {
    this.modalType = type;
    this.showModal = true;
    this.transactionForm.reset();

    if (type === 'VIREMENT') {
      this.transactionForm.get('numeroCompteDestinataire')?.setValidators([Validators.required]);
    } else {
      this.transactionForm.get('numeroCompteDestinataire')?.clearValidators();
    }
    this.transactionForm.get('numeroCompteDestinataire')?.updateValueAndValidity();
  }

  closeModal(): void {
    this.showModal = false;
    this.transactionForm.reset();
  }

  onSubmit(): void {
    if (this.transactionForm.invalid) return;

    const montant = this.transactionForm.value.montant;

    if (this.modalType === 'VERSEMENT') {
      this.transactionService.versement({
        numeroCompte: this.numeroCompte,
        montant
      }).subscribe({
        next: () => this.handleSuccess(),
        error: (error) => console.error('❌ Erreur:', error)
      });
    } else if (this.modalType === 'RETRAIT') {
      this.transactionService.retrait({
        numeroCompte: this.numeroCompte,
        montant
      }).subscribe({
        next: () => this.handleSuccess(),
        error: (error) => console.error('❌ Erreur:', error)
      });
    } else if (this.modalType === 'VIREMENT') {
      this.transactionService.virement({
        numeroCompteSource: this.numeroCompte,
        numeroCompteDestination: this.transactionForm.value.numeroCompteDestination,
        montant
      }).subscribe({
        next: () => this.handleSuccess(),
        error: (error) => console.error('❌ Erreur:', error)
      });
    }
  }

  handleSuccess(): void {
    console.log('✅ Transaction effectuée');
    this.closeModal();
    this.loadTransactions(this.numeroCompte);
    this.loadCompteInfo(this.numeroCompte);
  }

  getTransactionIcon(type: string): string {
    switch(type) {
      case 'VERSEMENT': return '⬇️';
      case 'RETRAIT': return '⬆️';
      case 'VIREMENT': return '🔄';
      default: return '💰';
    }
  }

  getTransactionColor(type: string): string {
    switch(type) {
      case 'VERSEMENT': return '#10b981';
      case 'RETRAIT': return '#ef4444';
      case 'VIREMENT': return '#f59e0b';
      default: return '#6b7280';
    }
  }

  getTransactionSign(type: string): string {
    return type === 'VERSEMENT' ? '+' : '-';
  }

  goBack(): void {
    this.router.navigate(['/comptes']);
  }
}
