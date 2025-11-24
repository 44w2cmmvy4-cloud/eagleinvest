import { Component, OnInit, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MarketDataService, CryptoPrice, NewsArticle } from '../../services/market-data.service';
import { PriceAlertService } from '../../services/price-alert.service';
import { NotificationService } from '../../services/notification.service';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { AuthService } from '../../services/auth.service';
import { TradingBotService } from '../../services/trading-bot.service';

@Component({
  selector: 'app-market-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './market-overview.component.html',
  styleUrls: ['./market-overview.component.css', './market-animations.css']
})
export class MarketOverviewComponent implements OnInit, OnDestroy {
  cryptoPrices = signal<CryptoPrice[]>([]);
  marketIndices = signal<any[]>([]);
  news = signal<NewsArticle[]>([]);
  priceAlerts = signal<any[]>([]);
  
  showAlertModal = signal(false);
  showBotConfig = signal(false);
  selectedCrypto = signal<CryptoPrice | null>(null);
  alertTargetPrice = 0;
  alertCondition: 'above' | 'below' = 'above';

  // Bot signals
  botActive = signal(false);
  botStats = signal({ tradesToday: 0, successRate: 0, profitToday: 0, balance: 5000 });
  botTrades = signal<any[]>([]);

  private marketDataService = inject(MarketDataService);
  private priceAlertService = inject(PriceAlertService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private tradingBotService = inject(TradingBotService);

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    
    this.loadMarketData();
    this.loadAlerts();
    this.syncBotData();
  }

  ngOnDestroy() {
    // Cleanup si es necesario
  }

  syncBotData() {
    this.botActive.set(this.tradingBotService.botActive());
    this.botStats.set(this.tradingBotService.botStats());
    this.botTrades.set(this.tradingBotService.botTrades());
  }

  toggleBot() {
    if (this.tradingBotService.botActive()) {
      this.tradingBotService.stopBot();
      this.notificationService.show('Bot detenido', 'info', 3000);
    } else {
      this.tradingBotService.startBot();
      this.notificationService.show('¡Bot activado! Trading automático iniciado', 'success', 3000);
    }
    this.syncBotData();
  }

  loadMarketData() {
    this.marketDataService.fetchCryptoPrices().subscribe(prices => {
      this.cryptoPrices.set(prices);
    });

    this.marketDataService.getMarketIndices().subscribe(indices => {
      this.marketIndices.set(indices);
    });

    this.marketDataService.getNewsStream().subscribe(articles => {
      this.news.set(articles);
    });
  }

  loadAlerts() {
    this.priceAlertService.getAllAlerts().subscribe(alerts => {
      this.priceAlerts.set(alerts);
    });
  }

  refreshData() {
    this.notificationService.show('Actualizando datos de mercado...', 'info', 2000);
    this.loadMarketData();
    this.syncBotData();
  }

  createPriceAlert(crypto: CryptoPrice) {
    this.selectedCrypto.set(crypto);
    this.alertTargetPrice = crypto.current_price;
    this.showAlertModal.set(true);
  }

  confirmAlert() {
    const crypto = this.selectedCrypto();
    if (!crypto || !this.alertTargetPrice) return;

    this.priceAlertService.createAlert(
      crypto.symbol,
      this.alertTargetPrice,
      this.alertCondition
    );

    this.showAlertModal.set(false);
    this.loadAlerts();
    this.notificationService.show('Alerta creada exitosamente', 'success', 3000);
  }

  deleteAlert(alertId: string) {
    this.priceAlertService.deleteAlert(alertId);
    this.loadAlerts();
    this.notificationService.show('Alerta eliminada', 'info', 2000);
  }
}
