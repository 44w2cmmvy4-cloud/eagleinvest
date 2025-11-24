import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../../services/notification.service';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 9999;">
      @for (notification of recentNotifications(); track notification.id) {
        <div 
          class="toast show mb-2" 
          [class.toast-success]="notification.type === 'success'"
          [class.toast-error]="notification.type === 'error'"
          [class.toast-warning]="notification.type === 'warning'"
          [class.toast-info]="notification.type === 'info'"
          role="alert">
          <div class="toast-header">
            <i [class]="'bi ' + notification.icon + ' me-2'"></i>
            <strong class="me-auto">{{ notification.title }}</strong>
            <small>Ahora</small>
            <button 
              type="button" 
              class="btn-close" 
              (click)="removeNotification(notification.id)">
            </button>
          </div>
          <div class="toast-body">
            {{ notification.message }}
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      min-width: 300px;
      box-shadow: var(--shadow-xl);
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .toast-header {
      background: var(--bg-tertiary);
      border-bottom: 1px solid var(--border-color);
      color: var(--text-primary);
    }

    .toast-success {
      border-left: 4px solid var(--success);
    }

    .toast-error {
      border-left: 4px solid var(--danger);
    }

    .toast-warning {
      border-left: 4px solid var(--warning);
    }

    .toast-info {
      border-left: 4px solid var(--info);
    }

    .btn-close {
      filter: invert(1);
      opacity: 0.7;
    }

    .btn-close:hover {
      opacity: 1;
    }
  `]
})
export class NotificationToastComponent implements OnInit {
  private notificationService = inject(NotificationService);
  recentNotifications = signal<Notification[]>([]);

  ngOnInit() {
    this.notificationService.notifications$.subscribe(notifications => {
      // Mostrar solo las últimas 3 notificaciones
      this.recentNotifications.set(notifications.slice(0, 3));
      
      // Auto-ocultar después de 5 segundos
      notifications.slice(0, 3).forEach(notification => {
        setTimeout(() => {
          this.removeNotification(notification.id);
        }, 5000);
      });
    });
  }

  removeNotification(id: string) {
    const current = this.recentNotifications();
    this.recentNotifications.set(current.filter(n => n.id !== id));
  }
}
