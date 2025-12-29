import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
<div class="login-container">
  <div class="container-fluid h-100">
    <div class="row h-100">
      <!-- Left Side - Branding -->
      <div class="col-lg-6 d-none d-lg-flex align-items-center justify-content-center bg-gradient">
        <div class="text-center text-white">
          <img src="/assets/logo/logo.png" alt="EagleInvest" class="mb-4" style="max-height: 80px; filter: drop-shadow(0 4px 16px rgba(0,0,0,0.5));">
          <p class="lead" style="color: var(--text-secondary)">Tu plataforma de inversiones de confianza</p>
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
      <div class="col-lg-6 d-flex align-items-center justify-content-center" style="background: var(--bg-primary);">
        <div class="login-form w-100" style="max-width: 400px;">
          <div class="text-center mb-5">
            <h2 class="fw-bold" style="color: var(--text-primary)">{{ requires2FA ? 'Verificación 2FA' : 'Iniciar Sesión' }}</h2>
            <p class="text-muted" style="color: var(--text-secondary) !important">
              {{ requires2FA ? 'Ingresa el código enviado a tu correo' : 'Accede a tu cuenta de EagleInvest' }}
            </p>
          </div>

          @if (errorMessage) {
            <div class="alert alert-danger" role="alert">
              {{ errorMessage }}
            </div>
          }

          @if (successMessage) {
            <div class="alert alert-success" role="alert">
              {{ successMessage }}
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
                <a href="#" class="text-decoration-none" style="color: var(--accent-gold)">¿Olvidaste tu contraseña?</a>
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
                <p class="text-muted" style="color: var(--text-secondary) !important">
                  Bienvenido a EagleInvest
                </p>
              </div>
            </form>
          } @else {
            <form [formGroup]="codeForm" (ngSubmit)="onVerifyCode()">
              <div class="mb-4">
                <label class="form-label">Código de 6 dígitos</label>
                <input
                  type="text"
                  class="form-control form-control-lg text-center"
                  maxlength="6"
                  formControlName="code"
                  [class.is-invalid]="codeForm.get('code')?.invalid && codeForm.get('code')?.touched"
                  placeholder="123456">
                @if (codeForm.get('code')?.invalid && codeForm.get('code')?.touched) {
                  <div class="invalid-feedback">
                    Ingresa el código enviado a tu correo
                  </div>
                }
              </div>

              <button 
                type="submit" 
                class="btn btn-warning btn-lg w-100 mb-3"
                [disabled]="codeForm.invalid || isVerifying">
                @if (isVerifying) {
                  <span class="spinner-border spinner-border-sm me-2"></span>
                  Verificando...
                } @else {
                  Verificar Código
                }
              </button>

              <button
                type="button"
                class="btn btn-outline-secondary w-100"
                (click)="onResendCode()"
                [disabled]="resendLoading">
                @if (resendLoading) {
                  <span class="spinner-border spinner-border-sm me-2"></span>Reenviando...
                } @else {
                  Reenviar Código
                }
              </button>

              <div class="text-center mt-3">
                <p class="text-muted" style="color: var(--text-secondary) !important">Revisa tu correo para el código de verificación</p>
              </div>
            </form>
          }

          <!-- Demo Credentials Removed -->

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
  codeForm: FormGroup;
  isLoading = false;
  isVerifying = false;
  resendLoading = false;
  errorMessage: string = '';
  successMessage: string = '';
  requires2FA = false;
  tempToken: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    this.codeForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
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
            this.tempToken = response.temp_token || this.authService.getTempToken();
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

  onVerifyCode() {
    if (!this.tempToken) {
      this.errorMessage = 'Token temporal no encontrado. Inicia sesión nuevamente.';
      this.requires2FA = false;
      return;
    }

    if (this.codeForm.invalid) {
      this.codeForm.markAllAsTouched();
      return;
    }

    this.isVerifying = true;
    this.errorMessage = '';

    const code = this.codeForm.value.code;
    this.authService.verify2FA(this.tempToken, code).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = response.message || 'Código inválido';
        }
        this.isVerifying = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.error || error.error?.message || 'Código inválido o expirado';
        this.isVerifying = false;
      }
    });
  }

  onResendCode() {
    if (!this.tempToken) {
      this.errorMessage = 'Token temporal no encontrado. Inicia sesión nuevamente.';
      this.requires2FA = false;
      return;
    }  this.successMessage = 'Código reenviado exitosamente. Revisa tu correo.';
        setTimeout(() => this.successMessage = '', 5000);
      

    this.resendLoading = true;
    this.authService.resend2FA(this.tempToken).subscribe({
      next: () => {
        this.resendLoading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo reenviar el código. Intenta de nuevo.';
        this.resendLoading = false;
      }
    });
  }
}