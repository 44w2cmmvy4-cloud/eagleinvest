import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ReferralService, RegisterByInvitationPayload } from '../../../services/referral.service';

interface CountryCode {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

@Component({
  selector: 'app-register-by-invitation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register-by-invitation.html',
  styleUrl: './register-by-invitation.css',
})
export class RegisterByInvitation implements OnInit {
  registerForm!: FormGroup;
  invitationToken = signal<string | null>(null);
  sponsorName = signal<string>('Cargando...');
  isLoadingToken = signal<boolean>(true);
  tokenValid = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  isSubmitting = signal<boolean>(false);
  selectedCountry = signal<CountryCode>({
    name: 'Colombia',
    code: 'CO',
    dialCode: '+57',
    flag: '🇨🇴'
  });

  countries: CountryCode[] = [
    { name: 'Argentina', code: 'AR', dialCode: '+54', flag: '🇦🇷' },
    { name: 'Brasil', code: 'BR', dialCode: '+55', flag: '🇧🇷' },
    { name: 'Chile', code: 'CL', dialCode: '+56', flag: '🇨🇱' },
    { name: 'Colombia', code: 'CO', dialCode: '+57', flag: '🇨🇴' },
    { name: 'Ecuador', code: 'EC', dialCode: '+593', flag: '🇪🇨' },
    { name: 'España', code: 'ES', dialCode: '+34', flag: '🇪🇸' },
    { name: 'Estados Unidos', code: 'US', dialCode: '+1', flag: '🇺🇸' },
    { name: 'México', code: 'MX', dialCode: '+52', flag: '🇲🇽' },
    { name: 'Perú', code: 'PE', dialCode: '+51', flag: '🇵🇪' },
    { name: 'Venezuela', code: 'VE', dialCode: '+58', flag: '🇻🇪' },
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private referralService: ReferralService
  ) {}

  ngOnInit(): void {
    // Obtener token de la URL
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.invitationToken.set(token);
        this.validateToken(token);
      } else {
        this.tokenValid.set(false);
        this.isLoadingToken.set(false);
        this.errorMessage.set('No se proporcionó un token de invitación válido.');
      }
    });

    // Inicializar formulario
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{7,15}$/)]],
    }, { validators: this.passwordMatchValidator });
  }

  validateToken(token: string): void {
    this.isLoadingToken.set(true);
    this.errorMessage.set(null);

    this.referralService.validateInvitationToken(token).subscribe({
      next: (res) => {
        if (res.valid) {
          this.tokenValid.set(true);
          this.sponsorName.set(res.sponsor_name || 'Sponsor');
        } else {
          this.tokenValid.set(false);
          this.errorMessage.set(res.message || 'Token inválido o expirado');
        }
        this.isLoadingToken.set(false);
      },
      error: (err) => {
        this.tokenValid.set(false);
        this.isLoadingToken.set(false);
        this.errorMessage.set(err?.error?.message || err?.error?.error || 'No se pudo validar la invitación.');
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('password_confirmation');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  selectCountry(country: CountryCode): void {
    this.selectedCountry.set(country);
  }

  onSubmit(): void {
    if (this.registerForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);
      this.errorMessage.set(null);

      const formData: RegisterByInvitationPayload = {
        ...this.registerForm.value,
        phone: `${this.selectedCountry().dialCode}${this.registerForm.value.phone}`,
        invitation_token: this.invitationToken() || '',
        country_code: this.selectedCountry().code,
      };

      this.referralService.registerByInvitation(formData).subscribe({
        next: (res) => {
          if (res?.success && res.user && res.token) {
            this.successMessage.set(res.message || 'Registro exitoso. Redirigiendo...');
            this.authService.setSession(res.user, res.token);
            this.router.navigate(['/dashboard']);
            return;
          }

          this.errorMessage.set(res?.error || res?.message || 'No se pudo completar el registro.');
          this.isSubmitting.set(false);
        },
        error: (err) => {
          const apiErrors = err?.error?.errors;
          if (apiErrors && typeof apiErrors === 'object') {
            const firstKey = Object.keys(apiErrors)[0];
            const firstMsg = Array.isArray(apiErrors[firstKey]) ? apiErrors[firstKey][0] : String(apiErrors[firstKey]);
            this.errorMessage.set(firstMsg);
          } else {
            this.errorMessage.set(err?.error?.message || err?.error?.error || 'Error de conexión. Inténtalo de nuevo.');
          }
          this.isSubmitting.set(false);
        }
      });
    } else {
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}
