import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientService } from '../../../core/services/client.service';

@Component({
  selector: 'app-register-client',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: 'register-client.html',
  styleUrl: 'register-client.css'
})
export class RegisterClient implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  currentStep = 1;
  totalSteps = 3;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.registerForm = this.fb.group({
      // Étape 1: Informations personnelles
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      dateNaissance: ['', Validators.required],

      // Étape 2: Coordonnées
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],

      // Étape 3: Localisation
      city: ['', Validators.required],
      nationality: ['', Validators.required],
      numberNationality: ['', [Validators.required, Validators.pattern(/^\d+$/)]]
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      if (this.isStepValid(this.currentStep)) {
        this.currentStep++;
      }
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
        return !!(this.f['firstName'].valid && this.f['lastName'].valid && this.f['dateNaissance'].valid);
      case 2:
        return !!(this.f['email'].valid && this.f['password'].valid &&
          this.f['confirmPassword'].valid &&
          this.f['password'].value === this.f['confirmPassword'].value);
      case 3:
        return !!(this.f['city'].valid && this.f['nationality'].valid && this.f['numberNationality'].valid);
      default:
        return false;
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (this.f['password'].value !== this.f['confirmPassword'].value) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const input = {
      email: this.f['email'].value,
      password: this.f['password'].value,
      firstName: this.f['firstName'].value,
      lastName: this.f['lastName'].value,
      dateNaissance: this.f['dateNaissance'].value,
      city: this.f['city'].value,
      nationality: this.f['nationality'].value,
      numberNationality: parseInt(this.f['numberNationality'].value)
    };

    this.clientService.createClient(input).subscribe({
      next: () => {
        this.successMessage = '✅ Client créé avec succès !';
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Une erreur est survenue';
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }
}
