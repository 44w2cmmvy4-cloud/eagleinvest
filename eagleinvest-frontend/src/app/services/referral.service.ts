import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface InvitationTokenValidationResponse {
  valid: boolean;
  message?: string;
  sponsor_id?: number;
  sponsor_name?: string;
  sponsor_email?: string;
}

export interface RegisterByInvitationPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone_number: string;
  wallet: string;
  referral_code: string;
  firebase_id_token: string;
}

export interface RegisterByInvitationResponse {
  success: boolean;
  message?: string;
  user?: any;
  token?: string;
  error?: string;
}

export interface Referral {
  id: number;
  name: string;
  email: string;
  joined_date: string;
  status: 'active' | 'pending' | 'inactive';
  total_invested: number;
  commission_earned: number;
  level: number;
}

export interface ReferralStats {
  total_referrals: number;
  active_referrals: number;
  total_commission: number;
  this_month_commission: number;
  commission_rate: number;
  referral_link: string;
}

// Nuevas interfaces para sistema de diagramas
export interface ReferralCheck {
  has_invitation: boolean;
  sponsor?: {
    id: number;
    name: string;
    referral_code: string;
  };
  can_register: boolean;
  message: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  wallet: string;
  referral_code: string;
  two_factor_code?: string;
}

export interface RegisterResponse {
  message: string;
  user?: any;
  access_token?: string;
  token_type?: string;
  sponsor?: any;
  requires_2fa?: boolean;
  email?: string;
}

export interface ReferralCodeInfo {
  referral_code: string;
  referral_link: string;
  total_referrals: number;
}

export interface NetworkMember {
  id: number;
  name: string;
  email: string;
  level: number;
  joined_at: string;
  children: NetworkMember[];
}

export interface NetworkResponse {
  user: any;
  network: NetworkMember[];
  statistics: {
    direct_referrals: number;
    total_network: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ReferralService {
  private apiUrl = 'http://127.0.0.1:8000/api';
  
  // Signals para el estado
  referrals = signal<Referral[]>([]);
  stats = signal<ReferralStats | null>(null);

  constructor(private http: HttpClient) {}

  /**
   * Valida un token de invitación y retorna info del sponsor.
   * Endpoint público: POST /api/referrals/validate-token
   */
  validateInvitationToken(token: string): Observable<InvitationTokenValidationResponse> {
    return this.http.post<InvitationTokenValidationResponse>(`${this.apiUrl}/referrals/validate-token`, { token });
  }

  /**
   * Registro de usuario por invitación.
   * Endpoint público: POST /api/referrals/register-by-invitation
   */
  registerByInvitation(payload: RegisterByInvitationPayload): Observable<RegisterByInvitationResponse> {
    return this.http.post<RegisterByInvitationResponse>(`${this.apiUrl}/referrals/register-by-invitation`, payload);
  }

  /**
   * Obtiene las estadísticas de referidos
   */
  getReferralStats(userId: number): Observable<ReferralStats> {
    return this.http.get<ReferralStats>(`${this.apiUrl}/demo/referrals/${userId}/stats`).pipe(
      tap(stats => this.stats.set(stats))
    );
  }

  /**
   * Obtiene la lista de referidos
   */
  getReferrals(userId: number): Observable<Referral[]> {
    return this.http.get<Referral[]>(`${this.apiUrl}/demo/referrals/${userId}`).pipe(
      tap(referrals => this.referrals.set(referrals))
    );
  }

  /**
   * Genera un nuevo enlace de referido
   */
  generateReferralLink(userId: number): string {
    return `https://eagleinvest.com/register?ref=${userId}`;
  }

  /**
   * Copia el enlace al portapapeles
   */
  async copyReferralLink(link: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(link);
      return true;
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  }

  /**
   * Comparte el enlace via redes sociales
   */
  shareVia(platform: 'whatsapp' | 'telegram' | 'email', link: string, message?: string) {
    const defaultMessage = message || `¡Únete a EagleInvest y comienza a invertir! ${link}`;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(defaultMessage)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(message || '')}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=Únete a EagleInvest&body=${encodeURIComponent(defaultMessage)}`;
        break;
    }
  }

  /**
   * Calcula la comisión por nivel
   */
  calculateCommission(amount: number, level: number): number {
    const rates = {
      1: 0.05, // 5% nivel 1
      2: 0.03, // 3% nivel 2
      3: 0.02  // 2% nivel 3
    };
    
    return amount * (rates[level as keyof typeof rates] || 0);
  }

  // Nuevos métodos para sistema de diagramas

  /**
   * Verificar código de invitación
   */
  checkInvitation(referralCode: string): Observable<ReferralCheck> {
    return this.http.get<ReferralCheck>(`${this.apiUrl}/referrals/check`, {
      params: { ref: referralCode }
    });
  }

  /**
   * Registro con sistema de invitación obligatoria
   */
  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/referrals/register`, data);
  }

  /**
   * Obtener código de referido del usuario
   */
  getReferralCode(): Observable<ReferralCodeInfo> {
    return this.http.get<ReferralCodeInfo>(`${this.apiUrl}/referrals/code`);
  }

  /**
   * Obtener red unilevel
   */
  getNetwork(): Observable<NetworkResponse> {
    return this.http.get<NetworkResponse>(`${this.apiUrl}/referrals/network`);
  }
}
