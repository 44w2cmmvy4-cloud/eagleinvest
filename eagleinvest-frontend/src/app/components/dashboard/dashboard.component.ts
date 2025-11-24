import { Component, OnInit, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DashboardService, DashboardData } from '../../services/dashboard.service';
import { NotificationService } from '../../services/notification.service';
import { MarketDataService, CryptoPrice } from '../../services/market-data.service';
import { AchievementService } from '../../services/achievement.service';
import { PriceAlertService } from '../../services/price-alert.service';
import { Subscription, interval } from 'rxjs';

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
  
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  private marketDataService = inject(MarketDataService);
  private achievementService = inject(AchievementService);
  private priceAlertService = inject(PriceAlertService);
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
}