import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, merge, Subject, timer } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {
  private readonly INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutos en milisegundos
  private readonly WARNING_TIME = 2 * 60 * 1000; // Advertir 2 minutos antes
  
  private destroy$ = new Subject<void>();
  private inactivityTimer: any;
  private warningTimer: any;
  
  // Signals para el estado
  isWarning = signal<boolean>(false);
  remainingTime = signal<number>(0);

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  /**
   * Inicia el monitoreo de inactividad
   */
  startWatching(): void {
    this.stopWatching(); // Limpiar watchers previos
    
    // Solo monitorear si el usuario está autenticado
    if (!this.authService.isAuthenticated()) {
      return;
    }

    // Eventos que indican actividad del usuario
    const userActivity$ = merge(
      fromEvent(document, 'mousemove'),
      fromEvent(document, 'mousedown'),
      fromEvent(document, 'keypress'),
      fromEvent(document, 'touchstart'),
      fromEvent(document, 'scroll'),
      fromEvent(window, 'focus')
    ).pipe(
      debounceTime(1000), // Evitar demasiados eventos
      takeUntil(this.destroy$)
    );

    // Reiniciar el temporizador cada vez que hay actividad
    userActivity$.subscribe(() => {
      this.resetTimer();
    });

    // Iniciar el temporizador
    this.resetTimer();
  }

  /**
   * Detiene el monitoreo de inactividad
   */
  stopWatching(): void {
    this.clearTimers();
    this.destroy$.next();
    this.isWarning.set(false);
    this.remainingTime.set(0);
  }

  /**
   * Reinicia el temporizador de inactividad
   */
  private resetTimer(): void {
    this.clearTimers();
    this.isWarning.set(false);
    
    // Timer para la advertencia
    this.warningTimer = setTimeout(() => {
      this.showWarning();
    }, this.INACTIVITY_TIMEOUT - this.WARNING_TIME);

    // Timer para el cierre de sesión
    this.inactivityTimer = setTimeout(() => {
      this.logout();
    }, this.INACTIVITY_TIMEOUT);
  }

  /**
   * Muestra advertencia de inactividad
   */
  private showWarning(): void {
    this.isWarning.set(true);
    this.remainingTime.set(this.WARNING_TIME);
    
    // Notificación de advertencia
    this.notificationService.warning(
      'Sesión por Expirar',
      'Tu sesión se cerrará en 2 minutos por inactividad. Mueve el mouse o presiona una tecla para continuar.'
    );

    // Actualizar tiempo restante cada segundo
    const countdown = setInterval(() => {
      const remaining = this.remainingTime();
      if (remaining > 0) {
        this.remainingTime.set(remaining - 1000);
      } else {
        clearInterval(countdown);
      }
    }, 1000);
  }

  /**
   * Cierra la sesión por inactividad
   */
  private logout(): void {
    this.stopWatching();
    
    // Notificación
    this.notificationService.info(
      'Sesión Cerrada',
      'Tu sesión ha sido cerrada automáticamente por inactividad.'
    );

    // Cerrar sesión
    this.authService.logout();
    
    // Redirigir al login
    this.router.navigate(['/login'], {
      queryParams: { reason: 'inactivity' }
    });
  }

  /**
   * Limpia todos los temporizadores
   */
  private clearTimers(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
  }

  /**
   * Extiende la sesión (cuando el usuario interactúa con la advertencia)
   */
  extendSession(): void {
    this.resetTimer();
    this.notificationService.success(
      'Sesión Extendida',
      'Tu sesión ha sido extendida exitosamente.'
    );
  }

  /**
   * Destructor
   */
  ngOnDestroy(): void {
    this.stopWatching();
  }
}
