import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { InvestmentPlan } from '../../models/api-models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
<!-- Navbar -->
<nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm">
  <div class="container-fluid">
    <a class="navbar-brand fw-bold d-flex align-items-center" [routerLink]="['/']">
      <img src="/assets/logo/logo.png" alt="EagleInvest" class="me-2" style="width: 28px; height: 28px; object-fit: contain;" />
      EagleInvest
    </a>
    <button 
      class="navbar-toggler" 
      type="button" 
      (click)="toggleNavbar()"
      [attr.aria-expanded]="!isNavbarCollapsed()"
      aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div 
      class="collapse navbar-collapse" 
      [class.show]="!isNavbarCollapsed()">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item"><a class="nav-link active" href="#features">Características</a></li>
        <li class="nav-item"><a class="nav-link" href="#plans">Planes</a></li>
        <li class="nav-item"><a class="nav-link" href="#about">Acerca de</a></li>
        <li class="nav-item ms-2">
          <button class="btn btn-primary btn-sm" [routerLink]="['/login']">Iniciar Sesión</button>
        </li>
      </ul>
    </div>
  </div>
</nav>

<!-- Hero Section -->
<section class="hero-section py-5 bg-gradient text-white">
  <div class="container">
    <div class="row align-items-center min-vh-50">
      <div class="col-lg-6 mb-4 mb-lg-0">
        <div class="mb-4">
          <span class="badge bg-warning text-dark px-4 py-2 fs-5 mb-3 d-inline-block" style="letter-spacing: 2px; animation: pulse 2s infinite;">
            TRADING CON PROPÓSITO
          </span>
        </div>
        <h1 class="display-4 fw-bold mb-3" style="background: linear-gradient(135deg, #00F0FF, #5FF4FF); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
          Tu futuro financiero comienza aquí
        </h1>
        <p class="lead mb-4 opacity-90">
          Invierte de forma inteligente con EagleInvest. Accede a herramientas profesionales de análisis, seguridad de nivel bancario y ejecución instantánea.
        </p>
        <div class="d-flex flex-wrap gap-3">
          <button class="btn btn-warning btn-lg" [routerLink]="['/login']">
            <i class="bi bi-rocket-takeoff me-2"></i>Comenzar Ahora
          </button>
          <a href="#features" class="btn btn-outline-light btn-lg">
            <i class="bi bi-play-circle me-2"></i>Ver Más
          </a>
        </div>
      </div>
      <div class="col-lg-6 text-center">
        <div class="hero-illustration">
          <div class="floating-card card bg-light text-dark p-4 shadow-lg" style="transform: rotate(-5deg); width: 280px; margin: 0 auto 20px;">
            <div class="card-body">
              <h5 class="card-title text-center">Tu Cartera</h5>
              <div class="text-center">
                <h3 class="text-success">+18.5%</h3>
                <p class="text-muted small">Rentabilidad anual</p>
              </div>
            </div>
          </div>
          <div class="floating-card card bg-light text-dark p-4 shadow-lg" style="transform: rotate(5deg); width: 280px; margin: 0 auto;">
            <div class="card-body">
              <h5 class="card-title text-center">Mercado</h5>
              <div class="text-center">
                <p class="text-muted small mb-2">S&P 500</p>
                <h4>4,852.36 <i class="bi bi-graph-up text-success"></i></h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Features Section -->
<section id="features" class="features-section py-5 bg-light">
  <div class="container">
    <div class="row mb-5">
      <div class="col-lg-8 mx-auto text-center">
        <h2 class="display-5 fw-bold mb-3">Características Poderosas</h2>
        <p class="lead text-muted">
          Todo lo que necesitas para invertir con confianza y seguridad
        </p>
      </div>
    </div>
    
    <div class="row g-4">
      <div class="col-md-6 col-lg-3" *ngFor="let feature of features(); let idx = index">
        <div class="feature-card card h-100 border-0 shadow-sm hover-lift">
          <div class="card-body text-center">
            <div class="feature-icon mb-3">
              <i [class]="'bi ' + feature.icon + ' text-warning'"></i>
            </div>
            <h5 class="card-title">{{ feature.title }}</h5>
            <p class="card-text text-muted">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Stats Section -->
<section class="stats-section py-5 bg-dark text-white">
  <div class="container">
    <div class="row text-center">
      <div class="col-md-4 mb-4 mb-md-0">
        <h3 class="display-6 fw-bold text-warning">50K+</h3>
        <p class="lead">Inversores Activos</p>
      </div>
      <div class="col-md-4 mb-4 mb-md-0">
        <h3 class="display-6 fw-bold text-warning">$2.5B</h3>
        <p class="lead">Activos Bajo Gestión</p>
      </div>
      <div class="col-md-4">
        <h3 class="display-6 fw-bold text-warning">98.9%</h3>
        <p class="lead">Satisfacción de Clientes</p>
      </div>
    </div>
  </div>
</section>

<!-- Plans Section -->
<section id="plans" class="plans-section py-5">
  <div class="container">
    <div class="row mb-5">
      <div class="col-lg-8 mx-auto text-center">
        <h2 class="display-5 fw-bold mb-3" style="color: var(--text-primary);">Paquetes de Inversión</h2>
        <p class="lead" style="color: var(--text-tertiary);">
          Selecciona el paquete perfecto para tu nivel de inversión
        </p>
      </div>
    </div>
    
    <div class="row g-4">
      <div class="col-md-6 col-lg-4" *ngFor="let plan of plans(); let idx = index">
        <div class="plan-card h-100 border-0 shadow-sm" 
             [class.plan-recommended]="plan.recommended"
             [style.--plan-color]="plan.accent"
             [style.--plan-gradient]="'linear-gradient(135deg, ' + plan.accent + ', ' + plan.accent + 'dd)'">
          <div *ngIf="plan.recommended" class="badge position-absolute top-0 start-50 translate-middle-x" 
               style="margin-top: -8px; background: linear-gradient(135deg, #00F0FF, #4D7CFF); color: #0A0E27; font-weight: 800; letter-spacing: 0.6px; padding: 6px 16px; box-shadow: 0 4px 18px rgba(0,240,255,0.25);">
            MÁS POPULAR
          </div>
          <div class="card-body p-4">
            <div class="text-center mb-4">
              <div class="plan-icon-wrapper mb-3" [style.background]="'linear-gradient(135deg, ' + plan.accent + ', ' + plan.accent + 'dd)'">
                <i class="bi bi-graph-up-arrow" style="font-size: 2.5rem; color: white;"></i>
              </div>
              <h4 class="fw-bold mb-2" [style.color]="plan.accent">{{ plan.name }}</h4>
              <span class="badge px-3 py-2" [style.background]="'rgba(' + hexToRgb(plan.accent || '#00F0FF') + ', 0.15)'" [style.color]="plan.accent">
                {{plan.risk_level}}
              </span>
            </div>
            
            <div class="price-section my-4 text-center p-4" [style.background]="'linear-gradient(135deg, rgba(' + hexToRgb(plan.accent || '#00F0FF') + ', 0.05), rgba(' + hexToRgb(plan.accent || '#00F0FF') + ', 0.15))'" style="border-radius: 12px;">
              <p class="small mb-2 text-uppercase" style="letter-spacing: 1px; color: var(--text-tertiary);">Inversión Mínima</p>
              <h2 class="fw-bold mb-2" [style.color]="plan.accent">
                $ {{ plan.min_amount | number }}
              </h2>
              <div class="d-flex justify-content-center gap-3 small" style="color: var(--text-secondary);">
                <span><i class="bi bi-graph-up me-1"></i>{{ plan.roi_display }}</span>
                <span><i class="bi bi-calendar me-1"></i>{{ plan.duration_days }} días</span>
              </div>
            </div>
            
            <ul class="list-unstyled mb-4">
              <li class="mb-3 d-flex align-items-start" *ngFor="let feature of plan.features; let idxf = index">
                <i class="bi bi-check-circle-fill me-2 mt-1" [style.color]="plan.accent"></i>
                <span style="color: var(--text-secondary);">{{ feature }}</span>
              </li>
            </ul>
            
            <button class="btn w-100 btn-plan" 
                    [style.background]="plan.recommended ? 'linear-gradient(135deg, ' + plan.accent + ', ' + plan.accent + 'dd)' : 'transparent'"
                    [style.border]="'2px solid ' + plan.accent"
                    [style.color]="plan.recommended ? 'white' : plan.accent"
                    [routerLink]="['/login']">
              <i class="bi bi-arrow-right-circle me-2"></i>Comenzar Ahora
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- CTA Section -->
<section class="cta-section py-5 bg-gradient text-white">
  <div class="container text-center">
    <h2 class="display-5 fw-bold mb-4">¿Listo para comenzar?</h2>
    <p class="lead mb-4">Únete a miles de inversores que confían en EagleInvest</p>
    <button class="btn btn-light btn-lg px-5" [routerLink]="['/register']">
      <i class="bi bi-check-circle me-2"></i>Crear Cuenta Gratis
    </button>
  </div>
</section>

<!-- Footer -->
<footer class="footer bg-dark text-white py-5">
  <div class="container">
    <div class="row mb-4">
      <div class="col-md-3 mb-4">
        <h5 class="fw-bold text-warning">EagleInvest</h5>
        <p class="text-muted small">Tu plataforma de inversiones de confianza.</p>
      </div>
      <div class="col-md-3 mb-4">
        <h6 class="fw-bold">Producto</h6>
        <ul class="list-unstyled">
          <li><a href="#features" class="text-muted text-decoration-none small">Características</a></li>
          <li><a href="#plans" class="text-muted text-decoration-none small">Paquetes</a></li>
          <li><a href="#" class="text-muted text-decoration-none small">Blog</a></li>
        </ul>
      </div>
      <div class="col-md-3 mb-4">
        <h6 class="fw-bold">Legal</h6>
        <ul class="list-unstyled">
          <li><a href="#" class="text-muted text-decoration-none small">Privacidad</a></li>
          <li><a href="#" class="text-muted text-decoration-none small">Términos</a></li>
          <li><a href="#" class="text-muted text-decoration-none small">Contacto</a></li>
        </ul>
      </div>
      <div class="col-md-3 mb-4">
        <h6 class="fw-bold">Síguenos</h6>
        <div class="d-flex gap-3">
          <a href="#" class="text-warning"><i class="bi bi-facebook"></i></a>
          <a href="#" class="text-warning"><i class="bi bi-twitter"></i></a>
          <a href="#" class="text-warning"><i class="bi bi-linkedin"></i></a>
          <a href="#" class="text-warning"><i class="bi bi-instagram"></i></a>
        </div>
      </div>
    </div>
    <hr class="border-secondary">
    <div class="row">
      <div class="col-md-6">
        <p class="text-muted small mb-0">&copy; 2025 EagleInvest. Todos los derechos reservados.</p>
      </div>
      <div class="col-md-6 text-md-end">
        <p class="text-muted small mb-0">Hecho con <i class="bi bi-heart-fill text-danger"></i> por el equipo de EagleInvest</p>
      </div>
    </div>
  </div>
</footer>
  `,
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  private navbarCollapsed = signal(true);
  
  toggleNavbar() {
    this.navbarCollapsed.update(value => !value);
  }
  
  isNavbarCollapsed() {
    return this.navbarCollapsed();
  }
  
  features = signal([
    {
      icon: 'bi-shield-check',
      title: 'Seguridad Avanzada',
      description: 'Protección de nivel bancario con encriptación de extremo a extremo.'
    },
    {
      icon: 'bi-graph-up',
      title: 'Análisis en Tiempo Real',
      description: 'Herramientas avanzadas de análisis técnico y fundamental.'
    },
    {
      icon: 'bi-lightning',
      title: 'Ejecución Instantánea',
      description: 'Órdenes ejecutadas en milisegundos con la mejor tecnología.'
    },
    {
      icon: 'bi-phone',
      title: 'App Móvil',
      description: 'Invierte desde cualquier lugar con nuestra app móvil.'
    }
  ]);
  
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

  hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '0, 0, 0';
  }
}