import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  icon?: string;
  action?: {
    label: string;
    callback: () => void;
  };
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = signal<Notification[]>([]);
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  
  notifications$ = this.notificationsSubject.asObservable();
  
  // Signal para contar notificaciones no leídas
  unreadCount = signal<number>(0);

  constructor() {
    this.loadNotifications();
  }

  /**
   * Carga notificaciones desde localStorage
   */
  private loadNotifications(): void {
    const stored = localStorage.getItem('eagleinvest-notifications');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.notifications.set(parsed);
        this.notificationsSubject.next(parsed);
        this.updateUnreadCount();
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }
  }

  /**
   * Guarda notificaciones en localStorage
   */
  private saveNotifications(): void {
    localStorage.setItem('eagleinvest-notifications', JSON.stringify(this.notifications()));
  }

  /**
   * Actualiza el contador de no leídas
   */
  private updateUnreadCount(): void {
    const count = this.notifications().filter(n => !n.read).length;
    this.unreadCount.set(count);
  }

  /**
   * Agrega una nueva notificación
   */
  add(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
      read: false
    };

    const updated = [newNotification, ...this.notifications()];
    this.notifications.set(updated);
    this.notificationsSubject.next(updated);
    this.updateUnreadCount();
    this.saveNotifications();

    // Mostrar toast si está disponible
    this.showToast(newNotification);
  }

  /**
   * Muestra un toast en pantalla
   */
  private showToast(notification: Notification): void {
    // Aquí se puede integrar con un sistema de toasts
    // Por ahora solo console
    console.log(`[${notification.type.toUpperCase()}] ${notification.title}: ${notification.message}`);
  }

  /**
   * Marca una notificación como leída
   */
  markAsRead(id: string): void {
    const updated = this.notifications().map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    this.notifications.set(updated);
    this.notificationsSubject.next(updated);
    this.updateUnreadCount();
    this.saveNotifications();
  }

  /**
   * Marca todas como leídas
   */
  markAllAsRead(): void {
    const updated = this.notifications().map(n => ({ ...n, read: true }));
    this.notifications.set(updated);
    this.notificationsSubject.next(updated);
    this.updateUnreadCount();
    this.saveNotifications();
  }

  /**
   * Elimina una notificación
   */
  remove(id: string): void {
    const updated = this.notifications().filter(n => n.id !== id);
    this.notifications.set(updated);
    this.notificationsSubject.next(updated);
    this.updateUnreadCount();
    this.saveNotifications();
  }

  /**
   * Limpia todas las notificaciones
   */
  clearAll(): void {
    this.notifications.set([]);
    this.notificationsSubject.next([]);
    this.updateUnreadCount();
    this.saveNotifications();
  }

  /**
   * Obtiene todas las notificaciones
   */
  getAll(): Notification[] {
    return this.notifications();
  }

  /**
   * Obtiene solo las no leídas
   */
  getUnread(): Notification[] {
    return this.notifications().filter(n => !n.read);
  }

  /**
   * Genera un ID único
   */
  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Métodos helper para tipos específicos
  success(title: string, message: string): void {
    this.add({ type: 'success', title, message, icon: 'bi-check-circle-fill' });
  }

  error(title: string, message: string): void {
    this.add({ type: 'error', title, message, icon: 'bi-x-circle-fill' });
  }

  warning(title: string, message: string): void {
    this.add({ type: 'warning', title, message, icon: 'bi-exclamation-triangle-fill' });
  }

  info(title: string, message: string): void {
    this.add({ type: 'info', title, message, icon: 'bi-info-circle-fill' });
  }

  // Método show compatible con llamadas de tipo (message, type, duration)
  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration?: number): void {
    this.add({ type, title: type.charAt(0).toUpperCase() + type.slice(1), message });
  }

  // Notificaciones específicas de inversiones
  investmentCreated(amount: number, planName: string): void {
    this.success(
      'Inversión Creada',
      `Tu inversión de $${amount.toLocaleString()} en ${planName} ha sido registrada exitosamente.`
    );
  }

  withdrawalProcessed(amount: number): void {
    this.success(
      'Retiro Procesado',
      `Tu retiro de $${amount.toLocaleString()} está siendo procesado.`
    );
  }

  earningsReceived(amount: number): void {
    this.info(
      'Ganancias Recibidas',
      `Has recibido $${amount.toLocaleString()} en ganancias de tus inversiones.`
    );
  }

  referralBonus(amount: number, referralName: string): void {
    this.success(
      'Bono de Referido',
      `Has ganado $${amount.toLocaleString()} por el referido ${referralName}.`
    );
  }
}
