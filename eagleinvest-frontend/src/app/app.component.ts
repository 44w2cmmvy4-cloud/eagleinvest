import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme.service';
import { InactivityService } from './services/inactivity.service';
import { AuthService } from './services/auth.service';
import { NotificationToastComponent } from './components/shared/notification-toast/notification-toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificationToastComponent],
  template: `
    <router-outlet></router-outlet>
    <app-notification-toast></app-notification-toast>
  `
})
export class AppComponent implements OnInit {
  title = 'EagleInvest';
  
  private themeService = inject(ThemeService);
  private inactivityService = inject(InactivityService);
  private authService = inject(AuthService);

  ngOnInit() {
    // Inicializar el tema
    this.themeService.currentTheme();
    
    // Monitorear autenticación para iniciar/detener el temporizador de inactividad
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this.inactivityService.startWatching();
      } else {
        this.inactivityService.stopWatching();
      }
    });
  }
}
