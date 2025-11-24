import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { NotificationService } from './notification.service';

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
  createdAt: Date;
  triggeredAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PriceAlertService {
  private alerts = new BehaviorSubject<PriceAlert[]>([]);
  public alerts$ = this.alerts.asObservable();

  constructor(private notificationService: NotificationService) {
    this.loadAlerts();
  }

  /**
   * Crear nueva alerta de precio
   */
  createAlert(symbol: string, targetPrice: number, condition: 'above' | 'below'): void {
    const newAlert: PriceAlert = {
      id: this.generateId(),
      symbol: symbol.toUpperCase(),
      targetPrice,
      condition,
      isActive: true,
      createdAt: new Date()
    };

    const currentAlerts = this.alerts.value;
    this.alerts.next([...currentAlerts, newAlert]);
    this.saveAlerts();

    this.notificationService.show(
      `Alerta creada: ${symbol} ${condition === 'above' ? 'por encima' : 'por debajo'} de $${targetPrice}`,
      'success'
    );
  }

  /**
   * Verificar alertas contra precio actual
   */
  checkAlerts(symbol: string, currentPrice: number): void {
    const currentAlerts = this.alerts.value;
    const triggeredAlerts: PriceAlert[] = [];

    const updatedAlerts = currentAlerts.map(alert => {
      if (!alert.isActive || alert.symbol !== symbol.toUpperCase()) {
        return alert;
      }

      const shouldTrigger = 
        (alert.condition === 'above' && currentPrice >= alert.targetPrice) ||
        (alert.condition === 'below' && currentPrice <= alert.targetPrice);

      if (shouldTrigger) {
        triggeredAlerts.push(alert);
        return { ...alert, isActive: false, triggeredAt: new Date() };
      }

      return alert;
    });

    if (triggeredAlerts.length > 0) {
      this.alerts.next(updatedAlerts);
      this.saveAlerts();

      triggeredAlerts.forEach(alert => {
        this.notificationService.show(
          `🔔 Alerta: ${alert.symbol} alcanzó $${currentPrice.toFixed(2)}`,
          'warning',
          10000
        );
      });
    }
  }

  /**
   * Eliminar alerta
   */
  deleteAlert(id: string): void {
    const currentAlerts = this.alerts.value;
    this.alerts.next(currentAlerts.filter(alert => alert.id !== id));
    this.saveAlerts();
  }

  /**
   * Obtener alertas activas
   */
  getActiveAlerts(): PriceAlert[] {
    return this.alerts.value.filter(alert => alert.isActive);
  }

  /**
   * Obtener todas las alertas
   */
  getAllAlerts(): Observable<PriceAlert[]> {
    return this.alerts$;
  }

  private generateId(): string {
    return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private saveAlerts(): void {
    localStorage.setItem('priceAlerts', JSON.stringify(this.alerts.value));
  }

  private loadAlerts(): void {
    const stored = localStorage.getItem('priceAlerts');
    if (stored) {
      try {
        const alerts = JSON.parse(stored);
        this.alerts.next(alerts);
      } catch (e) {
        console.error('Error loading price alerts:', e);
      }
    }
  }
}
