// src/app/features/auth/login/login.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Logo } from '../../../shared/components/logo/logo';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    // Pour avior les formulaires reactifs
    ReactiveFormsModule,
    Logo
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Création du formulaire avec validation
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Getters pour faciliter l'accès aux champs dans le template
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    // Marque tous les champs comme "touchés" pour afficher les erreurs
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    // simulation apres je vais lier au back api graph
    console.log('Login:', { email, password });

    // Simulation d'un délai
    setTimeout(() => {
      this.isLoading = false;

      // Simulation : si email contient "admin", on dit que c'est bon
      if (email.includes('admin')) {
        console.log('Connexion réussie !');
        // TODO: Rediriger vers le dashboard
      } else {
        this.errorMessage = 'Email ou mot de passe incorrect';
      }
    }, 1500);
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
