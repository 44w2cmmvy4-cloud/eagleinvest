import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface RegistrationData {
  referrerId?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  countryCode: string;
}

export interface RegistrationResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    sponsor: string;
    networkId: string;
    created_at: string;
  };
  message: string;
  token?: string;
}

export interface ReferrerData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  level: number;
}

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private referrerData$ = new BehaviorSubject<ReferrerData | null>(null);
  private registrationStep$ = new BehaviorSubject<'REFERRER_CHECK' | 'FORM' | 'VERIFY' | 'COMPLETE'>('REFERRER_CHECK');

  constructor(private http: HttpClient) {}

  /**
   * User arrives at web - check for invitation link
   * Based on diagram: "¿Tiene Enlace de Invitación?"
   */
  detectReferrerId(invitationCode?: string): { hasReferrer: boolean; referrerId?: string } {
    if (!invitationCode) {
      return { hasReferrer: false };
    }

    // Extract referrer ID from invitation code/URL
    return {
      hasReferrer: true,
      referrerId: invitationCode
    };
  }

  /**
   * Detect ID del Patrocinador (from URL or session)
   * Based on diagram: "Detectar ID del Patrocinador"
   */
  getSponsorDetails(sponsorId: string): Observable<ReferrerData> {
    return this.http.get<ReferrerData>(`${this.apiUrl}/sponsor/${sponsorId}`);
  }

  /**
   * Show registration form
   * Based on diagram: "Formulario de Registro"
   */
  getRegistrationForm(): Observable<any> {
    return this.http.get(`${this.apiUrl}/registration/form`);
  }

  /**
   * Validate registration data
   * Based on diagram: "¿Datos Válidos?"
   */
  validateRegistrationData(data: RegistrationData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push('Email inválido');
    }

    if (!data.password || data.password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }

    if (!data.firstName || data.firstName.trim().length === 0) {
      errors.push('Nombre requerido');
    }

    if (!data.lastName || data.lastName.trim().length === 0) {
      errors.push('Apellido requerido');
    }

    if (!data.phoneNumber || !this.isValidPhone(data.phoneNumber)) {
      errors.push('Teléfono inválido');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Register user
   * Based on diagram: "Crear Usuario en Base de Datos"
   */
  registerUser(data: RegistrationData): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(`${this.apiUrl}/register`, data);
  }

  /**
   * Request 2FA verification
   * Based on diagram: "Solicitar Verificación 2FA"
   */
  request2FA(email: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/request-2fa`, { email });
  }

  /**
   * Verify 2FA code
   * Based on diagram: "¿2FA Correcto?"
   */
  verify2FA(email: string, code: string): Observable<{ success: boolean; token: string }> {
    return this.http.post<{ success: boolean; token: string }>(`${this.apiUrl}/verify-2fa`, { email, code });
  }

  /**
   * Link user to sponsor's network (Unilevel)
   * Based on diagram: "Vincular a Red Unilevel del Patrocinador"
   */
  linkToNetwork(userId: string, sponsorId: string): Observable<{ success: boolean; networkId: string }> {
    return this.http.post<{ success: boolean; networkId: string }>(`${this.apiUrl}/link-network`, {
      userId,
      sponsorId
    });
  }

  /**
   * Get referrer data observable
   */
  getReferrerData() {
    return this.referrerData$.asObservable();
  }

  /**
   * Set referrer data
   */
  setReferrerData(data: ReferrerData | null) {
    this.referrerData$.next(data);
  }

  /**
   * Get current registration step
   */
  getRegistrationStep() {
    return this.registrationStep$.asObservable();
  }

  /**
   * Update registration step
   */
  setRegistrationStep(step: 'REFERRER_CHECK' | 'FORM' | 'VERIFY' | 'COMPLETE') {
    this.registrationStep$.next(step);
  }

  /**
   * Complete registration and redirect to dashboard
   * Based on diagram: "Fin: Acceso al Dashboard"
   */
  completeRegistration(userId: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/registration/complete`, { userId });
  }

  // Helper methods
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    // Remove common phone formatting
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  }
}
