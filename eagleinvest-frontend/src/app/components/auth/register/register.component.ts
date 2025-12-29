import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
<div class="register-container" style="background: linear-gradient(135deg, #0A0E27 0%, #13172E 50%, #0A0E27 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px;">
  <div class="container">
    <div class="row justify-content-center">
      <!-- Form Card -->
      <div class="col-12 col-lg-10">
        <div class="animate-fade-in-up gpu-accelerated" style="background: rgba(26,31,77,0.5); border: 1px solid rgba(0,240,255,0.2); border-radius: 20px; padding: 0; backdrop-filter: blur(10px); overflow: hidden; box-shadow: 0 0 40px rgba(0,240,255,0.2);">
          <div class="row g-0">
            <!-- Left Side - Form -->
            <div class="col-lg-6" style="padding: clamp(30px, 5vw, 50px);">
              <div class="text-center mb-4">
                <div class="icon-wrapper mb-3" style="background: linear-gradient(135deg, #00F0FF, #4D7CFF); width: 70px; height: 70px; border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto; box-shadow: 0 0 20px rgba(0,240,255,0.5);">
                  <i class="bi bi-person-plus-fill" style="color: #0A0E27; font-size: 2rem;"></i>
                </div>
                <h2 class="icon-glow" style="color: white; font-weight: 800; margin: 0 0 10px 0; font-size: clamp(1.5rem, 4vw, 2rem);">Crear Cuenta</h2>
                <p style="color: #A1A9C9; margin: 0; font-size: clamp(0.9rem, 2vw, 1rem);">Únete a EagleInvest y comienza a invertir</p>
              </div>

              @if (errorMessage()) {
                <div class="animate-shake" style="background: rgba(255,61,0,0.1); border: 1px solid rgba(255,61,0,0.3); border-radius: 12px; padding: 12px 16px; margin-bottom: 20px;">
                  <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-exclamation-triangle-fill" style="color: #FF3D00; font-size: 1.2rem;"></i>
                    <span style="color: #FF3D00; font-weight: 600; font-size: 0.9rem;">{{ errorMessage() }}</span>
                  </div>
                </div>
              }

              @if (successMessage()) {
                <div class="animate-fade-in" style="background: rgba(0,240,255,0.1); border: 1px solid rgba(0,240,255,0.3); border-radius: 12px; padding: 12px 16px; margin-bottom: 20px;">
                  <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-check-circle-fill badge-glow" style="color: #00F0FF; font-size: 1.2rem;"></i>
                    <span style="color: #00F0FF; font-weight: 600; font-size: 0.9rem;">{{ successMessage() }}</span>
                  </div>
                </div>
              }

              <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label style="color: #CDD2E5; margin-bottom: 8px; font-weight: 600; display: block; font-size: 0.9rem;">
                    <i class="bi bi-person me-2"></i>Nombre Completo
                  </label>
                  <input 
                    type="text" 
                    class="gpu-accelerated"
                    formControlName="name"
                    [class.is-invalid]="registerForm.get('name')?.invalid && registerForm.get('name')?.touched"
                    placeholder="Tu nombre completo"
                    style="width: 100%; padding: 12px 16px; background: rgba(13,17,46,0.8); border: 1px solid rgba(0,240,255,0.3); border-radius: 10px; color: white; font-size: 1rem; transition: all 0.3s;">
                  @if (registerForm.get('name')?.invalid && registerForm.get('name')?.touched) {
                    <small style="color: #FF3D00; margin-top: 5px; display: block;">
                      <i class="bi bi-exclamation-circle me-1"></i>Nombre es requerido (mínimo 2 caracteres)
                    </small>
                  }
                </div>

                <div class="mb-3">
                  <label style="color: #CDD2E5; margin-bottom: 8px; font-weight: 600; display: block; font-size: 0.9rem;">
                    <i class="bi bi-envelope me-2"></i>Email
                  </label>
                  <input 
                    type="email" 
                    class="gpu-accelerated"
                    formControlName="email"
                    [class.is-invalid]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
                    placeholder="tu@email.com"
                    style="width: 100%; padding: 12px 16px; background: rgba(13,17,46,0.8); border: 1px solid rgba(0,240,255,0.3); border-radius: 10px; color: white; font-size: 1rem; transition: all 0.3s;">
                  @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
                    <small style="color: #FF3D00; margin-top: 5px; display: block;">
                      <i class="bi bi-exclamation-circle me-1"></i>Email requerido y debe ser válido
                    </small>
                  }
                </div>

                <div class="mb-3">
                  <label style="color: #CDD2E5; margin-bottom: 8px; font-weight: 600; display: block; font-size: 0.9rem;">
                    <i class="bi bi-lock me-2"></i>Contraseña
                  </label>
                  <input 
                    type="password" 
                    class="gpu-accelerated"
                    formControlName="password"
                    [class.is-invalid]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
                    placeholder="Mínimo 8 caracteres"
                    style="width: 100%; padding: 12px 16px; background: rgba(13,17,46,0.8); border: 1px solid rgba(0,240,255,0.3); border-radius: 10px; color: white; font-size: 1rem; transition: all 0.3s;">
                  @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
                    <small style="color: #FF3D00; margin-top: 5px; display: block;">
                      <i class="bi bi-exclamation-circle me-1"></i>Contraseña debe tener al menos 8 caracteres
                    </small>
                  }
                </div>

                <div class="mb-3">
                  <label style="color: #CDD2E5; margin-bottom: 8px; font-weight: 600; display: block; font-size: 0.9rem;">
                    <i class="bi bi-lock-fill me-2"></i>Confirmar Contraseña
                  </label>
                  <input 
                    type="password" 
                    class="gpu-accelerated"
                    formControlName="confirmPassword"
                    [class.is-invalid]="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched"
                    placeholder="Confirma tu contraseña"
                    style="width: 100%; padding: 12px 16px; background: rgba(13,17,46,0.8); border: 1px solid rgba(0,240,255,0.3); border-radius: 10px; color: white; font-size: 1rem; transition: all 0.3s;">
                  @if (registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched) {
                    <small style="color: #FF3D00; margin-top: 5px; display: block;">
                      <i class="bi bi-exclamation-circle me-1"></i>Las contraseñas no coinciden
                    </small>
                  }
                </div>

                <div class="mb-4">
                  <div style="display: flex; align-items: start; gap: 10px;">
                    <input 
                      type="checkbox" 
                      formControlName="acceptTerms"
                      style="width: 20px; height: 20px; cursor: pointer; accent-color: #00F0FF;">
                    <label style="color: #CDD2E5; font-size: 0.85rem; line-height: 1.5; cursor: pointer;">
                      Acepto los <a href="#" style="color: #00F0FF; text-decoration: none; font-weight: 600;">términos y condiciones</a> y la <a href="#" style="color: #00F0FF; text-decoration: none; font-weight: 600;">política de privacidad</a>
                    </label>
                  </div>
                  @if (registerForm.get('acceptTerms')?.invalid && registerForm.get('acceptTerms')?.touched) {
                    <small style="color: #FF3D00; margin-top: 5px; display: block;">
                      <i class="bi bi-exclamation-circle me-1"></i>Debes aceptar los términos y condiciones
                    </small>
                  }
                </div>

                <button 
                  type="submit" 
                  class="btn-neon"
                  [disabled]="registerForm.invalid || isLoading()"
                  [style.opacity]="registerForm.invalid || isLoading() ? '0.6' : '1'"
                  style="width: 100%; padding: 15px; background: linear-gradient(135deg, #00F0FF, #4D7CFF); color: #0A0E27; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 1.1rem; margin-bottom: 15px;">
                  @if (isLoading()) {
                    <i class="bi bi-arrow-repeat processing-spinner me-2"></i>Procesando...
                  } @else {
                    <i class="bi bi-person-plus-fill me-2"></i>Crear Cuenta
                  }
                </button>

                <div class="text-center mb-3">
                  <p style="color: #7581A8; margin: 0; font-size: 0.9rem;">
                    ¿Ya tienes cuenta? 
                    <a [routerLink]="['/login']" style="color: #00F0FF; text-decoration: none; font-weight: 700; margin-left: 5px;">Inicia sesión aquí</a>
                  </p>
                </div>

                <div class="text-center">
                  <button type="button" [routerLink]="['/']" class="btn-bot-control" style="padding: 10px 20px; background: rgba(0,240,255,0.1); border: 1px solid rgba(0,240,255,0.3); color: #00F0FF; border-radius: 8px; font-weight: 600; cursor: pointer;">
                    <i class="bi bi-arrow-left me-2"></i>Volver al Inicio
                  </button>
                </div>
              </form>
            </div>
            
            <!-- Right Side - Benefits -->
            <div class="col-lg-6 d-none d-lg-flex align-items-center justify-content-center" style="background: linear-gradient(135deg, rgba(0,240,255,0.1), rgba(77,124,255,0.08)); padding: 50px;">
              <div class="text-center stagger-children">
                <div class="animate-fade-in icon-glow" style="margin-bottom: 30px;">
                  <i class="bi bi-graph-up-arrow" style="font-size: 5rem; color: #00F0FF;"></i>
                </div>
                <h1 class="animate-slide-in-right" style="color: white; font-weight: 800; margin: 0 0 15px 0; font-size: 2.5rem;">EagleInvest</h1>
                <p class="animate-fade-in-up" style="color: #A1A9C9; margin: 0 0 40px 0; font-size: 1.1rem;">Comienza tu viaje hacia la libertad financiera</p>
                
                <div class="row g-4">
                  <div class="col-12">
                    <div class="stat-card gpu-accelerated" style="background: rgba(13,17,46,0.6); padding: 20px; border-radius: 15px; border: 1px solid rgba(0,240,255,0.2);">
                      <div class="d-flex align-items-center gap-3">
                        <div class="icon-wrapper" style="background: rgba(0,240,255,0.2); width: 60px; height: 60px; border-radius: 15px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                          <i class="bi bi-shield-check" style="color: #00F0FF; font-size: 2rem;"></i>
                        </div>
                        <div style="text-align: left;">
                          <h5 style="color: white; margin: 0 0 5px 0; font-weight: 700;">Seguridad Garantizada</h5>
                          <p style="color: #7581A8; margin: 0; font-size: 0.85rem;">Protección de nivel bancario</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-12">
                    <div class="stat-card gpu-accelerated" style="background: rgba(13,17,46,0.6); padding: 20px; border-radius: 15px; border: 1px solid rgba(0,240,255,0.2);">
                      <div class="d-flex align-items-center gap-3">
                        <div class="icon-wrapper" style="background: rgba(0,240,255,0.15); width: 60px; height: 60px; border-radius: 15px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                          <i class="bi bi-graph-up" style="color: #00F0FF; font-size: 2rem;"></i>
                        </div>
                        <div style="text-align: left;">
                          <h5 style="color: white; margin: 0 0 5px 0; font-weight: 700;">Rendimientos Superiores</h5>
                          <p style="color: #7581A8; margin: 0; font-size: 0.85rem;">Hasta 3.2% de rentabilidad diaria</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-12">
                    <div class="stat-card gpu-accelerated" style="background: rgba(13,17,46,0.6); padding: 20px; border-radius: 15px; border: 1px solid rgba(0,240,255,0.2);">
                      <div class="d-flex align-items-center gap-3">
                        <div class="icon-wrapper" style="background: rgba(0,240,255,0.15); width: 60px; height: 60px; border-radius: 15px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                          <i class="bi bi-people" style="color: #00F0FF; font-size: 2rem;"></i>
                        </div>
                        <div style="text-align: left;">
                          <h5 style="color: white; margin: 0 0 5px 0; font-weight: 700;">Soporte Experto</h5>
                          <p style="color: #7581A8; margin: 0; font-size: 0.85rem;">Asesoría personalizada 24/7</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  `,
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      const existingErrors = confirmPassword.errors || {};
      confirmPassword.setErrors({ ...existingErrors, passwordMismatch: true });
      return { passwordMismatch: true };
    }

    if (confirmPassword.errors) {
      const { passwordMismatch, ...otherErrors } = confirmPassword.errors;

      if (passwordMismatch) {
        const hasOtherErrors = Object.keys(otherErrors).length > 0;
        confirmPassword.setErrors(hasOtherErrors ? otherErrors : null);
      }
    }

    return null;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');
      
      const { name, email, password, confirmPassword } = this.registerForm.value;
      
      this.authService.register(name, email, password, confirmPassword).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.successMessage.set('¡Registro exitoso! Redirigiendo al dashboard...');
          
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1500);
        },
        error: (error) => {
          this.isLoading.set(false);
          console.error('Error en registro:', error);
          
          if (error.error?.errors) {
            const errors = error.error.errors;
            const firstError = Object.values(errors)[0] as string[];
            this.errorMessage.set(firstError[0] || 'Error en el registro');
          } else if (error.error?.error) {
            this.errorMessage.set(error.error.error);
          } else {
            this.errorMessage.set('Error al registrar usuario. Por favor intenta de nuevo.');
          }
        }
      });
    } else {
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
      });
    }
  }
}