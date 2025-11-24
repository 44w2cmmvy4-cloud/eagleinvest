import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

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
}
