import { Component, HostListener, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { NotificationService } from '../../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, ThemeToggleComponent],
  template: `
    <ng-container>
      <nav class="navbar navbar-expand-lg sticky-top">
        <div class="container-xl nav-container">
        <a class="navbar-brand" [routerLink]="['/dashboard']" aria-label="EagleInvest">
          <img class="brand-logo me-2" [src]="brandLogo" alt="EagleInvest" />
          <span class="brand-text">EagleInvest</span>
        </a>
        
          <button 
          class="navbar-toggler" 
          type="button" 
          (click)="isCollapsed = !isCollapsed"
          [attr.aria-expanded]="!isCollapsed">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="navbar-collapse" [class.show]="!isCollapsed">
          <ul class="navbar-nav mx-auto">
            <li class="nav-item">
                <a class="nav-link" [routerLink]="['/dashboard']" routerLinkActive="active" (click)="handleNavClick()">
                <i class="bi bi-speedometer2 me-2"></i>Dashboard
              </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" [routerLink]="['/payment']" routerLinkActive="active" (click)="handleNavClick()">
                <i class="bi bi-credit-card me-2"></i>Invertir
              </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" [routerLink]="['/withdrawals']" routerLinkActive="active" (click)="handleNavClick()">
                <i class="bi bi-cash-coin me-2"></i>Retiros
              </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" [routerLink]="['/transactions']" routerLinkActive="active" (click)="handleNavClick()">
                <i class="bi bi-list-check me-2"></i>Transacciones
              </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" [routerLink]="['/referrals']" routerLinkActive="active" (click)="handleNavClick()">
                <i class="bi bi-people me-2"></i>Referidos
              </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" [routerLink]="['/profile']" routerLinkActive="active" (click)="handleNavClick()">
                <i class="bi bi-person me-2"></i>Perfil
              </a>
            </li>
          </ul>

          <div class="navbar-actions d-flex align-items-center gap-2">
            <!-- Theme Toggle -->
            <app-theme-toggle></app-theme-toggle>
            
            <!-- Notificaciones -->
            <div class="notification-badge">
              <button class="btn btn-icon" title="Notificaciones">
                <i class="bi bi-bell"></i>
                @if (notificationService.unreadCount() > 0) {
                  <span class="badge-count">{{ notificationService.unreadCount() }}</span>
                }
              </button>
            </div>

            <!-- Usuario -->
            <div class="user-menu">
              <button class="btn btn-user" (click)="toggleUserMenu()">
                <i class="bi bi-person-circle me-2"></i>
                <span class="d-none d-md-inline">{{ userName }}</span>
                <i class="bi bi-chevron-down ms-2"></i>
              </button>
              
              @if (showUserMenu) {
                <div class="user-dropdown">
                  <a [routerLink]="['/profile']" class="dropdown-item">
                    <i class="bi bi-person me-2"></i>Mi Perfil
                  </a>
                  <div class="dropdown-divider"></div>
                  <button (click)="logout()" class="dropdown-item text-danger">
                    <i class="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
                  </button>
                </div>
              }
            </div>
          </div>
        </div>
        </div>
      </nav>
      @if (!isCollapsed) {
        <div class="navbar-overlay d-lg-none" (click)="closeMobileMenu()"></div>
      }
    </ng-container>
  `,
  styles: [`
    .navbar {
      background: var(--bg-overlay);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border-color);
      box-shadow: var(--shadow-lg);
      padding: 0.75rem 0;
      z-index: 1100;
    }

    .nav-container {
      max-width: 1200px;
    }

    .navbar-brand {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      display: flex;
      align-items: center;
      transition: all var(--transition-base);
    }

    .brand-logo {
      height: 36px;
      width: auto;
      object-fit: contain;
      filter: drop-shadow(0 2px 6px rgba(0,0,0,0.4));
    }

    .navbar-brand:hover {
      transform: scale(1.05);
      color: var(--accent-gold);
    }

    .brand-text {
      background: var(--gradient-accent);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .nav-link {
      color: var(--text-secondary);
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: var(--radius-md);
      transition: all var(--transition-base);
      display: flex;
      align-items: center;
    }

    .nav-link:hover {
      color: var(--accent-gold);
      background: rgba(0, 240, 255, 0.1);
    }

    .nav-link.active {
      background: var(--gradient-accent);
      color: var(--gray-900);
      box-shadow: var(--shadow-glow);
    }

    .navbar-actions {
      margin-left: auto;
    }

    .btn-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-full);
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      transition: all var(--transition-base);
    }

    .btn-icon:hover {
      background: var(--bg-tertiary);
      border-color: var(--accent-gold);
      transform: scale(1.1);
    }

    .badge-count {
      position: absolute;
      top: -5px;
      right: -5px;
      background: var(--danger);
      color: white;
      border-radius: var(--radius-full);
      padding: 2px 6px;
      font-size: 0.7rem;
      font-weight: 600;
    }

    .btn-user {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      padding: 0.5rem 1rem;
      border-radius: var(--radius-lg);
      transition: all var(--transition-base);
    }

    .btn-user:hover {
      background: var(--bg-tertiary);
      border-color: var(--accent-gold);
    }

    .user-menu {
      position: relative;
    }

    .user-dropdown {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      min-width: 200px;
      z-index: 1000;
      animation: fadeIn 0.2s ease-out;
    }

    .dropdown-item {
      display: block;
      padding: 0.75rem 1rem;
      color: var(--text-primary);
      text-decoration: none;
      transition: all var(--transition-fast);
      border: none;
      background: transparent;
      width: 100%;
      text-align: left;
    }

    .dropdown-item:hover {
      background: var(--bg-tertiary);
      color: var(--accent-gold);
    }

    .dropdown-item.text-danger:hover {
      background: rgba(255, 61, 0, 0.1);
      color: var(--danger);
    }

    .dropdown-divider {
      height: 1px;
      background: var(--border-color);
      margin: 0.5rem 0;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .navbar-toggler {
      border: 1px solid var(--border-color);
      color: var(--text-primary);
    }

    .navbar-toggler-icon {
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba(0, 240, 255, 1)' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
    }

    @media (max-width: 991.98px) {
      .navbar-collapse {
        background: var(--bg-card);
        border-radius: var(--radius-lg);
        padding: 1rem;
        margin-top: 1rem;
        box-shadow: var(--shadow-lg);
      }

      .navbar-nav {
        margin-bottom: 1rem;
      }

      .nav-link {
        width: 100%;
        margin: 0.25rem 0;
      }

      .navbar-actions {
        flex-direction: column;
        width: 100%;
        gap: 0.5rem;
      }

      .btn-user {
        width: 100%;
      }
    }

    .navbar-overlay {
      position: fixed;
      inset: 0;
      background: rgba(10, 14, 39, 0.75);
      backdrop-filter: blur(4px);
      z-index: 1000;
    }
  `]
})
export class NavbarComponent implements OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  notificationService = inject(NotificationService);

  isCollapsed = true;
  showUserMenu = false;
  userName = '';
  brandLogo = '/assets/logo/eagle-logo.svg';
  private routerSubscription?: Subscription;

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    this.userName = user?.name || 'Usuario';

    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.closeMobileMenu();
        this.showUserMenu = false;
      }
    });
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  handleNavClick() {
    this.closeMobileMenu();
  }

  closeMobileMenu() {
    this.isCollapsed = true;
    this.showUserMenu = false;
  }

  @HostListener('window:resize')
  onResize() {
    if (window.innerWidth >= 992) {
      this.isCollapsed = true;
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

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
  }
}
