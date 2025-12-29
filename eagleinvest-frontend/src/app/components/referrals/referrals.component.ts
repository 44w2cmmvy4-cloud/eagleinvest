import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ReferralService, Referral, ReferralStats } from '../../services/referral.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { NavbarComponent } from '../shared/navbar/navbar.component';

interface LevelData {
  level: number;
  count: number;
  commissions: number;
  users: any[];
}

interface NetworkResponse {
  success: boolean;
  total_referrals: number;
  total_commissions: number;
  levels: LevelData[];
}

@Component({
  selector: 'app-referrals',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './referrals-responsive.component.html',
  styleUrls: ['./referrals.component.css']
})
export class ReferralsComponent implements OnInit {
  referrals = signal<Referral[]>([]);
  referralStats = signal<ReferralStats | null>(null);
  referralCode = signal<string>('');
  referralLink = signal<string>('');
  networkData = signal<NetworkResponse | null>(null);
  selectedLevel = signal<number>(1);
  isLoadingNetwork = signal<boolean>(false);
  invitationToken = signal<string>('');
  showInvitationModal = signal<boolean>(false);

  private referralService = inject(ReferralService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private http = inject(HttpClient);

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadReferralData();
    this.loadNetworkData();
  }

  loadReferralData() {
    const user = this.authService.getCurrentUser();
    if (user?.id) {
      // Load referral stats
      this.referralService.getReferralStats(user.id).subscribe({
        next: (stats) => {
          this.referralStats.set(stats);
        },
        error: (error) => {
          console.error('Error loading referral stats:', error);
        }
      });

      // Load referrals list
      this.referralService.getReferrals(user.id).subscribe({
        next: (referrals) => {
          this.referrals.set(referrals);
        },
        error: (error) => {
          console.error('Error loading referrals:', error);
        }
      });

      // Set referral code and link
      const refCode = (user as any).referral_code || 'EAGLE' + user.id;
      this.referralCode.set(refCode);
      this.referralLink.set(`https://eagleinvest.com/register?ref=${this.referralCode()}`);
    }
  }

  copyReferralCode() {
    navigator.clipboard.writeText(this.referralCode()).then(() => {
      this.notificationService.show('Código copiado al portapapeles', 'success');
    });
  }

  shareOnWhatsApp() {
    const message = `¡Únete a EagleInvest y comienza a invertir de manera inteligente! Usa mi código de referido: ${this.referralCode()}. ${this.referralLink()}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  }

  shareOnFacebook() {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.referralLink())}`, '_blank');
  }

  shareOnTwitter() {
    const text = `¡Únete a EagleInvest! Usa mi código de referido: ${this.referralCode()}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(this.referralLink())}`, '_blank');
  }

  shareOnTelegram() {
    const text = `¡Únete a EagleInvest! Usa mi código de referido: ${this.referralCode()}. ${this.referralLink()}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(this.referralLink())}&text=${encodeURIComponent(text)}`, '_blank');
  }

  loadNetworkData() {
    this.isLoadingNetwork.set(true);
    const token = localStorage.getItem('token');
    
    this.http.get<NetworkResponse>('http://127.0.0.1:8000/api/referrals/network', {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (data) => {
        this.networkData.set(data);
        this.isLoadingNetwork.set(false);
      },
      error: (error) => {
        console.error('Error loading network data:', error);
        this.isLoadingNetwork.set(false);
      }
    });
  }

  selectLevel(level: number) {
    this.selectedLevel.set(level);
  }

  getLevelData(level: number): LevelData | undefined {
    return this.networkData()?.levels.find(l => l.level === level);
  }

  generateInvitationLink() {
    const token = localStorage.getItem('token');
    
    this.http.post<any>('http://127.0.0.1:8000/api/referrals/generate-invitation', {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (response) => {
        this.invitationToken.set(response.token);
        this.referralLink.set(response.invitation_link);
        this.showInvitationModal.set(true);
        this.notificationService.show('Link de invitación generado', 'success');
      },
      error: (error) => {
        console.error('Error generating invitation:', error);
        this.notificationService.show('Error al generar invitación', 'error');
      }
    });
  }

  copyInvitationLink() {
    navigator.clipboard.writeText(this.referralLink()).then(() => {
      this.notificationService.show('Link copiado al portapapeles', 'success');
    });
  }

  closeInvitationModal() {
    this.showInvitationModal.set(false);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
