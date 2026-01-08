import { Component, OnInit, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TradingBotService } from '../../services/trading-bot.service';
import { NotificationService } from '../../services/notification.service';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-market-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './market-overview.component.html',
  styleUrls: ['./market-overview.component.css', './market-animations.css']
})
export class MarketOverviewComponent implements OnInit, OnDestroy {
  showBotConfig = signal(false);
  showAlertModal = signal(false);
  selectedCrypto = signal<any>(null);
  alertTargetPrice = signal<number | null>(null);
  alertCondition = signal<'above' | 'below'>('above');

  // Bot signals
  botActive = signal(false);
  botStats = signal({ tradesToday: 0, successRate: 0, profitToday: 0, balance: 5000 });
  botTrades = signal<any[]>([]);

  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private tradingBotService = inject(TradingBotService);

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    
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

  refreshData() {
    this.notificationService.show('Actualizando estado del bot...', 'info', 2000);
    this.syncBotData();
  }

  confirmAlert() {
    if (this.alertTargetPrice() && this.selectedCrypto()) {
      this.notificationService.show('Alerta configurada exitosamente', 'success', 3000);
      this.showAlertModal.set(false);
      this.alertTargetPrice.set(null);
    }
  }
}
