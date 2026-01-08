import { Component, OnInit, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DashboardService, DashboardData } from '../../services/dashboard.service';
import { NotificationService } from '../../services/notification.service';
import { MarketDataService, CryptoPrice } from '../../services/market-data.service';
import { AchievementService } from '../../services/achievement.service';
import { PriceAlertService } from '../../services/price-alert.service';
import { UnilevelService } from '../../services/unilevel.service';
import { WithdrawalService } from '../../services/withdrawal.service';
import { Subscription, interval } from 'rxjs';
import { InvestmentPlan } from '../../models/api-models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  dashboardData = signal<DashboardData | null>(null);
  cryptoPrices = signal<CryptoPrice[]>([]);
  achievements = signal<any[]>([]);
  
  // Nuevos datos del sistema
  networkStats = signal<any>({
    totalReferrals: 0,
    activeReferrals: 0,
    level: 'Bronce',
    nextLevel: 'Plata',
    progressToNext: 0
  });
  
  withdrawalStats = signal<any>({
    availableBalance: 0,
    pendingWithdrawals: 0,
    totalWithdrawn: 0
  });
  
  commissionStats = signal<any>({
    monthlyEarned: 0,
    totalEarned: 0,
    pendingCommissions: 0
  });

  plans = signal<InvestmentPlan[]>([
    {
      id: 1,
      name: 'Plan Básico',
      min_amount: 100,
      max_amount: 1000,
      daily_return_rate: 1.2,
      duration_days: 30,
      withdrawal_interval_days: 10,
      minimum_withdrawal_amount: 10,
      is_active: true,
      features: ['Retorno diario garantizado', 'Capital protegido', 'Soporte 24/7', 'Retiro instantáneo'],
      recommended: false,
      accent: '#00F0FF',
      tagline: 'Perfecto para principiantes. Inversión segura.',
      risk_level: 'Bajo',
      liquidity: '24h',
      roi_display: '36% Total'
    },
    {
      id: 2,
      name: 'Plan Intermedio',
      min_amount: 1000,
      max_amount: 5000,
      daily_return_rate: 1.8,
      duration_days: 45,
      withdrawal_interval_days: 10,
      minimum_withdrawal_amount: 50,
      is_active: true,
      features: ['Retorno diario del 1.8%', 'Bonus de bienvenida', 'Asesor personal', 'Análisis de mercado'],
      recommended: true,
      accent: '#D4AF37',
      tagline: 'Mayor rentabilidad para inversores con experiencia.',
      risk_level: 'Medio',
      liquidity: '48h',
      roi_display: '81% Total'
    },
    {
      id: 3,
      name: 'Plan Premium',
      min_amount: 5000,
      max_amount: 25000,
      daily_return_rate: 2.5,
      duration_days: 60,
      withdrawal_interval_days: 15,
      minimum_withdrawal_amount: 100,
      is_active: true,
      features: ['Retorno diario del 2.5%', 'Acceso VIP', 'Estrategias exclusivas', 'Retiros prioritarios'],
      recommended: false,
      accent: '#9D00FF',
      tagline: 'Para inversores que buscan máxima rentabilidad.',
      risk_level: 'Alto',
      liquidity: '72h',
      roi_display: '150% Total'
    },
    {
      id: 4,
      name: 'Plan Elite',
      min_amount: 25000,
      max_amount: 100000,
      daily_return_rate: 3.2,
      duration_days: 90,
      withdrawal_interval_days: 30,
      minimum_withdrawal_amount: 500,
      is_active: true,
      features: ['Retorno diario del 3.2%', 'Cuenta gerenciada', 'Acceso a mercados exclusivos', 'Gestor dedicado'],
      recommended: false,
      accent: '#FF0000',
      tagline: 'El plan más exclusivo para grandes inversores.',
      risk_level: 'Muy Alto',
      liquidity: 'Instantánea',
      roi_display: '288% Total'
    }
  ]);
  
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  private marketDataService = inject(MarketDataService);
  private achievementService = inject(AchievementService);
  private priceAlertService = inject(PriceAlertService);
  private unilevelService = inject(UnilevelService);
  private withdrawalService = inject(WithdrawalService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  
  private subscriptions: Subscription[] = [];
  private refreshInterval?: Subscription;

  ngOnInit() {
    console.log('DashboardComponent ngOnInit called');
    
    // Verificar autenticación
    if (!this.authService.isAuthenticated()) {
      console.log('User not authenticated, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }
    
    console.log('User authenticated, loading dashboard data');
    
    // Suscribirse al observable del usuario actual
    const userSub = this.authService.currentUser$.subscribe(user => {
      console.log('User observable changed:', user);
      if (user?.id) {
        this.loadDashboardDataForUserId(user.id);
        // Sincronizar logros con datos del usuario
        this.syncAchievements();
      } else {
        // Fallback: intentar con localStorage
        this.loadDashboardData();
      }
    });
    this.subscriptions.push(userSub);

    // Cargar datos de mercado en tiempo real
    const cryptoSub = this.marketDataService.getCryptoPricesStream().subscribe(prices => {
      this.cryptoPrices.set(prices);
      
      // Verificar alertas de precio
      prices.forEach(crypto => {
        this.priceAlertService.checkAlerts(crypto.symbol, crypto.current_price);
      });
    });
    this.subscriptions.push(cryptoSub);

    // Iniciar actualización automática de datos de mercado
    this.marketDataService.fetchCryptoPrices().subscribe();

    // Refrescar datos cada 2 minutos
    this.refreshInterval = interval(120000).subscribe(() => {
      this.loadDashboardData();
    });
    
    // Cargar logros
    const achievementsSub = this.achievementService.achievements$.subscribe(achievements => {
      this.achievements.set(achievements);
    });
    this.subscriptions.push(achievementsSub);
    
    // Cargar estadísticas de red
    this.loadNetworkStats();
    
    // Cargar estadísticas de retiros
    this.loadWithdrawalStats();
    
    // Cargar estadísticas de comisiones
    this.loadCommissionStats();
  }

  ngOnDestroy() {
    // Limpiar suscripciones
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.refreshInterval?.unsubscribe();
  }

  syncAchievements() {
    const data = this.dashboardData();
    if (data?.stats) {
      this.achievementService.syncWithUserData(data.stats);
    }
  }
  
  loadDashboardData() {
    const user = this.authService.getCurrentUser();
    console.log('Current user from AuthService:', user);
    
    if (user?.id) {
      console.log('Loading dashboard data for user ID:', user.id);
      this.dashboardService.getDashboardData(user.id).subscribe({
        next: (data) => {
          console.log('Dashboard data received:', data);
          this.dashboardData.set(data);
        },
        error: (error) => {
          console.error('Error loading dashboard data:', error);
        }
      });
    } else {
      console.log('No user found, trying to get from localStorage');
      const userId = localStorage.getItem('userId');
      if (userId) {
        console.log('Loading dashboard data for userId from localStorage:', userId);
        this.dashboardService.getDashboardData(parseInt(userId)).subscribe({
          next: (data) => {
            console.log('Dashboard data received from localStorage userId:', data);
            this.dashboardData.set(data);
          },
          error: (error) => {
            console.error('Error loading dashboard data:', error);
          }
        });
      }
    }
  }

  logout() {
    this.authService.logoutWithConfirmation().subscribe(confirmed => {
      if (confirmed) {
        this.notificationService.info('Sesión Cerrada', 'Has cerrado sesión exitosamente.');
        this.router.navigate(['/login']);
      }
    });
  }

  refreshData() {
    console.log('Manual refresh triggered');
    this.loadDashboardData();
  }

  loadDashboardDataForUserId(userId: number) {
    console.log('Loading dashboard data for user ID:', userId);
    this.dashboardService.getDashboardData(userId).subscribe({
      next: (data) => {
        console.log('Dashboard data received:', data);
        this.dashboardData.set(data);
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
      }
    });
  }

  hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '0, 0, 0';
  }
  
  loadNetworkStats() {
    this.unilevelService.getUserLevel().subscribe({
      next: (levelInfo) => {
        const totalRefs = this.unilevelService.getTotalNetworkCount();
        const activeRefs = this.unilevelService.getActiveReferralsCount();
        
        this.networkStats.set({
          totalReferrals: totalRefs,
          activeReferrals: activeRefs,
          level: levelInfo.currentLevel.name,
          nextLevel: levelInfo.nextLevel?.name || 'Máximo',
          progressToNext: levelInfo.progressToNext
        });
      },
      error: (err) => console.error('Error cargando estadísticas de red:', err)
    });
  }
  
  loadWithdrawalStats() {
    const userId = this.authService.getCurrentUser()?.id || 0;
    
    // Balance disponible
    this.withdrawalService.getAvailableBalance(userId).subscribe({
      next: (balance) => {
        this.withdrawalStats.update(stats => ({
          ...stats,
          availableBalance: balance
        }));
      },
      error: (err) => console.error('Error cargando balance:', err)
    });
    
    // Retiros pendientes
    this.withdrawalService.getUserWithdrawals(userId).subscribe({
      next: (withdrawals) => {
        const pending = withdrawals.filter(w => w.status === 'pending').length;
        const total = withdrawals
          .filter(w => w.status === 'completed')
          .reduce((sum, w) => sum + w.amount, 0);
        
        this.withdrawalStats.update(stats => ({
          ...stats,
          pendingWithdrawals: pending,
          totalWithdrawn: total
        }));
      },
      error: (err) => console.error('Error cargando retiros:', err)
    });
  }
  
  loadCommissionStats() {
    const userId = this.authService.getCurrentUser()?.id || 0;
    
    this.unilevelService.getUserCommissions(userId).subscribe({
      next: (commissions) => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const monthlyEarned = commissions
          .filter(c => {
            const date = new Date(c.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
          })
          .reduce((sum, c) => sum + c.amount, 0);
        
        const totalEarned = commissions.reduce((sum, c) => sum + c.amount, 0);
        
        const pendingCommissions = commissions
          .filter(c => c.status === 'pending')
          .reduce((sum, c) => sum + c.amount, 0);
        
        this.commissionStats.set({
          monthlyEarned,
          totalEarned,
          pendingCommissions
        });
      },
      error: (err) => console.error('Error cargando comisiones:', err)
    });
  }
}