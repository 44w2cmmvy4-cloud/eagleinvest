import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FirebaseAuthService } from '../../services/firebase-auth.service';
import { ReferralService, RegisterByInvitationPayload } from '../../services/referral.service';

@Component({
  selector: 'app-register-with-phone',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="card shadow">
            <div class="card-header bg-primary text-white">
              <h4 class="mb-0">Registro con Verificación Telefónica</h4>
            </div>
            <div class="card-body">
              
              <!-- Paso 1: Datos básicos -->
              <form [formGroup]="registerForm" *ngIf="currentStep() === 1" (ngSubmit)="goToPhoneVerification()">
                <h5 class="mb-3">Paso 1: Información Personal</h5>
                
                <div class="mb-3">
                  <label class="form-label">Nombre Completo</label>
                  <input type="text" class="form-control" formControlName="name" placeholder="Juan Pérez">
                  <div class="text-danger" *ngIf="registerForm.get('name')?.invalid && registerForm.get('name')?.touched">
                    Nombre es requerido
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input type="email" class="form-control" formControlName="email" placeholder="juan@ejemplo.com">
                  <div class="text-danger" *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
                    Email válido es requerido
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Contraseña</label>
                  <input type="password" class="form-control" formControlName="password">
                  <div class="text-danger" *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
                    Mínimo 8 caracteres
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Confirmar Contraseña</label>
                  <input type="password" class="form-control" formControlName="password_confirmation">
                </div>

                <div class="mb-3">
                  <label class="form-label">Wallet (Dirección de Pago)</label>
                  <input type="text" class="form-control" formControlName="wallet" placeholder="0x...">
                  <div class="text-danger" *ngIf="registerForm.get('wallet')?.invalid && registerForm.get('wallet')?.touched">
                    Wallet es requerida
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Código de Referido</label>
                  <input type="text" class="form-control" formControlName="referral_code" placeholder="ABC12345">
                  <div class="text-danger" *ngIf="registerForm.get('referral_code')?.invalid && registerForm.get('referral_code')?.touched">
                    Código de referido es requerido
                  </div>
                </div>

                <button type="submit" class="btn btn-primary w-100" [disabled]="registerForm.invalid">
                  Continuar a Verificación
                </button>
              </form>

              <!-- Paso 2: Verificación de teléfono -->
              <div *ngIf="currentStep() === 2">
                <h5 class="mb-3">Paso 2: Verificación Telefónica</h5>
                
                <div class="mb-3" *ngIf="!codeSent()">
                  <label class="form-label">Número de Teléfono</label>
                  <input 
                    type="tel" 
                    class="form-control" 
                    [(ngModel)]="phoneNumber"
                    placeholder="+521234567890"
                    [disabled]="sendingCode()">
                  <small class="text-muted">Formato internacional: +52 para México, +1 para USA</small>
                </div>

                <!-- reCAPTCHA container -->
                <div id="recaptcha-container" class="mb-3" *ngIf="!codeSent()"></div>

                <div class="alert alert-info" *ngIf="!codeSent()">
                  <i class="bi bi-info-circle"></i>
                  Se enviará un código de 6 dígitos a tu teléfono
                </div>

                <button 
                  class="btn btn-primary w-100 mb-3" 
                  (click)="sendCode()"
                  *ngIf="!codeSent()"
                  [disabled]="sendingCode() || !phoneNumber">
                  <span *ngIf="!sendingCode()">Enviar Código</span>
                  <span *ngIf="sendingCode()">
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Enviando...
                  </span>
                </button>

                <!-- Verificar código -->
                <div *ngIf="codeSent()">
                  <div class="mb-3">
                    <label class="form-label">Código de Verificación</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      [(ngModel)]="verificationCode"
                      placeholder="123456"
                      maxlength="6"
                      [disabled]="verifying()">
                    <small class="text-muted">Ingresa el código de 6 dígitos recibido</small>
                  </div>

                  <button 
                    class="btn btn-success w-100 mb-2" 
                    (click)="verifyAndRegister()"
                    [disabled]="verifying() || verificationCode.length !== 6">
                    <span *ngIf="!verifying()">Verificar y Completar Registro</span>
                    <span *ngIf="verifying()">
                      <span class="spinner-border spinner-border-sm me-2"></span>
                      Verificando...
                    </span>
                  </button>

                  <button 
                    class="btn btn-link w-100" 
                    (click)="resendCode()"
                    [disabled]="sendingCode()">
                    Reenviar código
                  </button>
                </div>

                <button class="btn btn-secondary w-100 mt-3" (click)="backToForm()">
                  Volver
                </button>
              </div>

              <!-- Mensajes de error -->
              <div class="alert alert-danger mt-3" *ngIf="errorMessage()">
                <i class="bi bi-exclamation-triangle"></i>
                {{ errorMessage() }}
              </div>

              <!-- Mensaje de éxito -->
              <div class="alert alert-success mt-3" *ngIf="successMessage()">
                <i class="bi bi-check-circle"></i>
                {{ successMessage() }}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border-radius: 10px;
    }
    .card-header {
      border-radius: 10px 10px 0 0 !important;
    }
    #recaptcha-container {
      display: flex;
      justify-content: center;
    }
  `]
})
export class RegisterWithPhoneComponent implements OnInit {
  registerForm: FormGroup;
  currentStep = signal(1);
  phoneNumber = '';
  verificationCode = '';
  codeSent = signal(false);
  sendingCode = signal(false);
  verifying = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private firebaseAuth: FirebaseAuthService,
    private referralService: ReferralService
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', Validators.required],
      wallet: ['', Validators.required],
      referral_code: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  goToPhoneVerification(): void {
    if (this.registerForm.valid) {
      this.currentStep.set(2);
      // Inicializar reCAPTCHA
      setTimeout(() => {
        this.firebaseAuth.initRecaptcha('recaptcha-container');
      }, 100);
    }
  }

  sendCode(): void {
    this.errorMessage.set('');
    this.sendingCode.set(true);

    this.firebaseAuth.sendVerificationCode(this.phoneNumber).subscribe({
      next: () => {
        this.codeSent.set(true);
        this.sendingCode.set(false);
        this.successMessage.set('Código enviado exitosamente');
      },
      error: (error) => {
        this.sendingCode.set(false);
        this.errorMessage.set(this.getErrorMessage(error));
      }
    });
  }

  verifyAndRegister(): void {
    this.errorMessage.set('');
    this.verifying.set(true);

    // Primero verificar el código
    this.firebaseAuth.verifyCode(this.verificationCode).subscribe({
      next: (idToken: any) => {
        // Token verificado, ahora registrar en backend
        const payload: RegisterByInvitationPayload = {
          name: this.registerForm.get('name')?.value,
          email: this.registerForm.get('email')?.value,
          password: this.registerForm.get('password')?.value,
          password_confirmation: this.registerForm.get('password_confirmation')?.value,
          wallet: this.registerForm.get('wallet')?.value,
          referral_code: this.registerForm.get('referral_code')?.value,
          phone_number: this.phoneNumber,
          firebase_id_token: idToken
        };

        this.referralService.registerByInvitation(payload).subscribe({
          next: (response) => {
            this.verifying.set(false);
            this.successMessage.set('¡Registro exitoso! Redirigiendo al dashboard...');
            // Aquí redireccionar al dashboard
            setTimeout(() => {
              // router.navigate(['/dashboard']);
            }, 2000);
          },
          error: (error) => {
            this.verifying.set(false);
            this.errorMessage.set(error.error?.message || 'Error al registrar usuario');
          }
        });
      },
      error: (error) => {
        this.verifying.set(false);
        this.errorMessage.set(this.getErrorMessage(error));
      }
    });
  }

  resendCode(): void {
    this.codeSent.set(false);
    this.verificationCode = '';
    this.firebaseAuth.reset();
    setTimeout(() => {
      this.firebaseAuth.initRecaptcha('recaptcha-container');
    }, 100);
  }

  backToForm(): void {
    this.currentStep.set(1);
    this.codeSent.set(false);
    this.verificationCode = '';
    this.phoneNumber = '';
    this.firebaseAuth.reset();
  }

  private getErrorMessage(error: any): string {
    const errorCode = error.code || '';
    
    switch (errorCode) {
      case 'auth/invalid-phone-number':
        return 'Número de teléfono inválido. Usa formato internacional (+52...)';
      case 'auth/too-many-requests':
        return 'Demasiados intentos. Intenta más tarde.';
      case 'auth/invalid-verification-code':
        return 'Código de verificación incorrecto';
      case 'auth/code-expired':
        return 'El código expiró. Solicita uno nuevo.';
      default:
        return error.message || 'Error en la verificación';
    }
  }
}
