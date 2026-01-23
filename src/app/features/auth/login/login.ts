import { Component, OnInit, Renderer2, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { trigger, transition, style, animate, query, stagger, group } from '@angular/animations';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  animations: [
    trigger('pageTransition', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms ease-out', style({ opacity: 1 }))
      ])
    ]),
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('500ms 300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideInLeft', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-50px)' }),
        animate('500ms 500ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ]),
    trigger('heroFloat', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px) scale(0.9)' }),
        animate('800ms 700ms cubic-bezier(0.34, 1.56, 0.64, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ])
    ])
  ]
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  hidePassword = true;
  isTransitioning = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private renderer: Renderer2,
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Animation d'entrée pour les inputs
    setTimeout(() => {
      this.animateInputs();
    }, 100);
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  animateInputs(): void {
    const inputs = this.el.nativeElement.querySelectorAll('.form-group');
    inputs.forEach((input: HTMLElement, index: number) => {
      this.renderer.setStyle(input, 'opacity', '0');
      this.renderer.setStyle(input, 'transform', 'translateY(20px)');

      setTimeout(() => {
        this.renderer.setStyle(input, 'transition', 'all 0.5s ease-out');
        this.renderer.setStyle(input, 'opacity', '1');
        this.renderer.setStyle(input, 'transform', 'translateY(0)');
      }, 300 + (index * 100));
    });
  }

  onInputFocus(event: FocusEvent): void {
    const inputWrapper = (event.target as HTMLElement).closest('.input-wrapper');
    if (inputWrapper) {
      this.renderer.addClass(inputWrapper, 'focused');

      // Ripple effect
      const ripple = inputWrapper.querySelector('.input-ripple') as HTMLElement;
      if (ripple) {
        const rect = inputWrapper.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        this.renderer.setStyle(ripple, 'width', `${size}px`);
        this.renderer.setStyle(ripple, 'height', `${size}px`);
        // this.renderer.setStyle(ripple, 'left', `${event.clientX - rect.left - size/2}px`);
        // this.renderer.setStyle(ripple, 'top', `${event.clientY - rect.top - size/2}px`);
        this.renderer.setStyle(ripple, 'animation', 'ripple 0.6s linear');
      }
    }
  }

  onInputBlur(event: FocusEvent): void {
    const inputWrapper = (event.target as HTMLElement).closest('.input-wrapper');
    if (inputWrapper) {
      this.renderer.removeClass(inputWrapper, 'focused');
    }
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();

      // Animation shake sur les champs invalides
      const invalidInputs = this.el.nativeElement.querySelectorAll('input.ng-invalid');
      invalidInputs.forEach((input: HTMLElement) => {
        this.renderer.addClass(input, 'shake-animation');
        setTimeout(() => {
          this.renderer.removeClass(input, 'shake-animation');
        }, 500);
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: async (response) => {
        this.isLoading = false;
        console.log('✅ Login réussi:', response);

        // Animation de succès
        await this.playSuccessAnimation();

        // Redirection avec effet de transition
        await this.redirectWithTransition(response.user.role);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('❌ Erreur login:', error);
        this.errorMessage = 'Email ou mot de passe incorrect';

        // Animation d'erreur
        this.playErrorAnimation();
      }
    });
  }

  async playSuccessAnimation(): Promise<void> {
    const container = this.el.nativeElement.querySelector('.login-container');
    const btnSubmit = this.el.nativeElement.querySelector('.btn-submit');

    // Animation du bouton
    this.renderer.addClass(btnSubmit, 'success-animation');

    // Confettis virtuels
    this.createConfetti();

    // Flash de succès
    this.renderer.setStyle(container, 'transition', 'all 0.3s ease');
    this.renderer.setStyle(container, 'transform', 'scale(0.98)');

    await new Promise(resolve => setTimeout(resolve, 300));

    this.renderer.setStyle(container, 'transform', 'scale(1)');

    await new Promise(resolve => setTimeout(resolve, 700));
  }

  createConfetti(): void {
    const container = this.el.nativeElement.querySelector('.login-container');
    const colors = ['#0d9488', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

    for (let i = 0; i < 50; i++) {
      const confetti = this.renderer.createElement('div');
      this.renderer.addClass(confetti, 'confetti');

      // Position aléatoire
      const left = Math.random() * 100;
      const size = Math.random() * 10 + 5;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const rotation = Math.random() * 360;

      this.renderer.setStyle(confetti, 'left', `${left}%`);
      this.renderer.setStyle(confetti, 'width', `${size}px`);
      this.renderer.setStyle(confetti, 'height', `${size}px`);
      this.renderer.setStyle(confetti, 'background', color);
      this.renderer.setStyle(confetti, 'transform', `rotate(${rotation}deg)`);
      this.renderer.setStyle(confetti, 'opacity', '0.8');

      this.renderer.appendChild(container, confetti);

      // Animation de chute
      setTimeout(() => {
        this.renderer.setStyle(confetti, 'transition', 'all 1s cubic-bezier(0.34, 1.56, 0.64, 1)');
        this.renderer.setStyle(confetti, 'transform', `translateY(100vh) rotate(${rotation + 360}deg)`);
        this.renderer.setStyle(confetti, 'opacity', '0');

        // Suppression après l'animation
        setTimeout(() => {
          this.renderer.removeChild(container, confetti);
        }, 1000);
      }, 100);
    }
  }

  playErrorAnimation(): void {
    const btnSubmit = this.el.nativeElement.querySelector('.btn-submit');
    const container = this.el.nativeElement.querySelector('.login-container');

    // Animation shake
    this.renderer.addClass(btnSubmit, 'error-shake');
    this.renderer.addClass(container, 'error-pulse');

    setTimeout(() => {
      this.renderer.removeClass(btnSubmit, 'error-shake');
      this.renderer.removeClass(container, 'error-pulse');
    }, 500);
  }

  async redirectWithTransition(role: string): Promise<void> {
    this.isTransitioning = true;

    // Animation de sortie
    const container = this.el.nativeElement.querySelector('.login-container');
    this.renderer.setStyle(container, 'transition', 'all 0.6s cubic-bezier(0.87, 0, 0.13, 1)');
    this.renderer.setStyle(container, 'opacity', '0');
    this.renderer.setStyle(container, 'transform', 'scale(0.9) translateY(50px)');

    // Créer un tunnel de transition
    const tunnel = this.renderer.createElement('div');
    this.renderer.addClass(tunnel, 'transition-tunnel');
    this.renderer.appendChild(document.body, tunnel);

    await new Promise(resolve => setTimeout(resolve, 600));

    // Redirection
    const route = role === 'ADMIN' || role === 'AGENT' ? '/admin/dashboard' : '/client/dashboard';
    this.router.navigate([route]);
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;

    // Animation sur le bouton
    const toggleBtn = this.el.nativeElement.querySelector('.password-toggle');
    if (toggleBtn) {
      this.renderer.addClass(toggleBtn, 'toggle-active');

      setTimeout(() => {
        this.renderer.removeClass(toggleBtn, 'toggle-active');
      }, 300);
    }
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}
