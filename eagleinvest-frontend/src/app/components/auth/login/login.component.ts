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
              <p class="text-muted">
                ¿No tienes cuenta? 
                <a [routerLink]="['/register']" class="text-decoration-none fw-bold">Regístrate aquí</a>
              </p>
            </div>
          </form>

          <!-- Demo Credentials -->
          <div class="mt-4 p-3 bg-info bg-opacity-10 rounded">
            <h6 class="fw-bold text-info mb-2">
              <i class="bi bi-info-circle me-2"></i>Credenciales de Prueba
            </h6>
            <p class="small mb-1"><strong>Email:</strong> demo@eagleinvest.com</p>
            <p class="small mb-0"><strong>Contraseña:</strong> 123456</p>
          </div>

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
      
      // Usar el servicio de autenticación real
      this.authService.login(email, password).subscribe({
        next: (response) => {
          if (response.success) {
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
}