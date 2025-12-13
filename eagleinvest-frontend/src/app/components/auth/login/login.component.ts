import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  template: `
<div class="login-container">
  <div class="container-fluid h-100">
    <div class="row h-100">
      <!-- Left Side - Branding -->
      <div class="col-lg-6 d-none d-lg-flex align-items-center justify-content-center bg-gradient">
        <div class="text-center text-white">
          <h1 class="display-3 fw-bold mb-4">
            <i class="bi bi-graph-up-arrow text-warning me-3"></i>EagleInvest
          </h1>
          <p class="lead">Tu plataforma de inversiones de confianza</p>
          <div class="mt-5">
            <div class="row text-center">
              <div class="col-4">
                <h4 class="text-warning">50K+</h4>
                <small>Inversores</small>
              </div>
              <div class="col-4">
                <h4 class="text-warning">$2.5B</h4>
                <small>Gestionados</small>
              </div>
              <div class="col-4">
                <h4 class="text-warning">98%</h4>
                <small>Satisfacción</small>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Right Side - Login Form -->
      <div class="col-lg-6 d-flex align-items-center justify-content-center bg-light">
        <div class="login-form w-100" style="max-width: 400px;">
          <div class="text-center mb-5">
            <h2 class="fw-bold">Iniciar Sesión</h2>
            <p class="text-muted">Accede a tu cuenta de EagleInvest</p>
          </div>

          @if (errorMessage) {
            <div class="alert alert-danger" role="alert">
              {{ errorMessage }}
            </div>
          }

          @if (!requires2FA) {
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input 
                type="email" 
                class="form-control form-control-lg"
                formControlName="email"
                [class.is-invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                placeholder="tu@email.com">
              @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
                <div class="invalid-feedback">
                  Email requerido y debe ser válido
                </div>
              }
            </div>

            <div class="mb-4">
              <label class="form-label">Contraseña</label>
              <input 
                type="password" 
                class="form-control form-control-lg"
                formControlName="password"
                [class.is-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                placeholder="Tu contraseña">
              @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
                <div class="invalid-feedback">
                  Contraseña requerida
                </div>
              }
            </div>

            <div class="d-flex justify-content-between align-items-center mb-4">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="rememberMe">
                <label class="form-check-label" for="rememberMe">
                  Recordarme
                </label>
              </div>
              <a href="#" class="text-decoration-none">¿Olvidaste tu contraseña?</a>
            </div>

            <button 
              type="submit" 
              class="btn btn-warning btn-lg w-100 mb-3"
              [disabled]="loginForm.invalid || isLoading">
              @if (isLoading) {
                <span class="spinner-border spinner-border-sm me-2"></span>
              }
              Iniciar Sesión
            </button>

            <div class="text-center">
              <p class="text-muted mb-0">
                ¿Necesitas una cuenta? Contacta a tu administrador para habilitar el acceso.
              </p>
            </div>
          </form>
          } @else {
          <!-- 2FA Form -->
          <div class="text-center mb-4">
            <i class="bi bi-shield-check text-warning" style="font-size: 3rem;"></i>
            <h4 class="mt-3">Verificación de Seguridad</h4>
            <p class="text-muted">Ingresa el código de 6 dígitos enviado a tu correo</p>
          </div>

          <div class="mb-4">
            <label class="form-label">Código de Verificación</label>
            <input 
              type="text" 
              class="form-control form-control-lg text-center"
              [(ngModel)]="verificationCode"
              maxlength="6"
              placeholder="000000"
              style="letter-spacing: 0.5rem; font-size: 1.5rem;">
          </div>

          <button 
            class="btn btn-warning btn-lg w-100 mb-3"
            [disabled]="isLoading || !verificationCode"
            (click)="verify2FA()">
            @if (isLoading) {
              <span class="spinner-border spinner-border-sm me-2"></span>
            }
            Verificar Código
          </button>

          <div class="text-center mb-3">
            <button 
              class="btn btn-link text-decoration-none"
              [disabled]="isLoading"
              (click)="resendCode()">
              Reenviar código
            </button>
          </div>

          <div class="text-center">
            <button 
              class="btn btn-outline-secondary"
              [disabled]="isLoading"
              (click)="backToLogin()">
              <i class="bi bi-arrow-left me-2"></i>Volver al login
            </button>
          </div>
          }

          <div class="text-center mt-4">
            <button [routerLink]="['/']" class="btn btn-outline-secondary">
              <i class="bi bi-arrow-left me-2"></i>Volver al Inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  `,
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  requires2FA = false;
  tempToken = '';
  verificationCode = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['demo@eagleinvest.com', [Validators.required, Validators.email]],
      password: ['123456', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const { email, password } = this.loginForm.value;
      
      this.authService.login(email, password).subscribe({
        next: (response) => {
          if (response.requires_2fa) {
            this.requires2FA = true;
            this.tempToken = response.temp_token || '';
            this.errorMessage = '';
          } else if (response.success) {
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage = response.message || 'Error al iniciar sesión';
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Error de conexión. Inténtalo de nuevo.';
          this.isLoading = false;
        }
      });
    }
  }

  verify2FA() {
    if (!this.verificationCode) {
      this.errorMessage = 'Ingresa el código de verificación';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.verify2FA(this.tempToken, this.verificationCode).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = 'Código inválido';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Código inválido';
        this.isLoading = false;
      }
    });
  }

  resendCode() {
    this.isLoading = true;
    this.authService.resend2FA(this.tempToken).subscribe({
      next: () => {
        this.errorMessage = '';
        alert('Código reenviado a tu correo');
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Error al reenviar código';
        this.isLoading = false;
      }
    });
  }

  backToLogin() {
    this.requires2FA = false;
    this.tempToken = '';
    this.verificationCode = '';
    this.errorMessage = '';
  }
}