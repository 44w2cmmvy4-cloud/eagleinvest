import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
<!-- Navbar -->
<nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm">
  <div class="container-fluid">
    <a class="navbar-brand fw-bold" [routerLink]="['/']">
      <i class="bi bi-graph-up-arrow text-warning me-2"></i>EagleInvest
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
          <button class="btn btn-outline-warning btn-sm me-2" [routerLink]="['/login']">Iniciar Sesión</button>
          <button class="btn btn-warning btn-sm" [routerLink]="['/register']">Registrarse</button>
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
        <h1 class="display-4 fw-bold mb-3">
          Tu futuro financiero comienza aquí
        </h1>
        <p class="lead mb-4 opacity-90">
          Invierte de forma inteligente con EagleInvest. Accede a herramientas profesionales de análisis, seguridad de nivel bancario y ejecución instantánea.
        </p>
        <div class="d-flex flex-wrap gap-3">
          <button class="btn btn-warning btn-lg" [routerLink]="['/register']">
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
      @for (feature of features(); track $index) {
        <div class="col-md-6 col-lg-3">
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
      }
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
        <h2 class="display-5 fw-bold mb-3">Paquetes de Inversión</h2>
        <p class="lead text-muted">
          Selecciona el paquete perfecto para tu nivel de inversión
        </p>
      </div>
    </div>
    
    <div class="row g-4">
      @for (plan of plans(); track $index) {
        <div class="col-md-6 col-lg-4">
          <div class="card h-100 border-0 shadow-sm" [class.border-warning]="plan.recommended" [class.shadow-lg]="plan.recommended">
            @if (plan.recommended) {
              <div class="badge bg-warning text-dark position-absolute top-0 start-50 translate-middle-x" style="margin-top: -8px;">
                Más Popular
              </div>
            }
            <div class="card-body">
              <div class="text-center mb-3">
                <span class="badge" [class]="plan.type === 'Aggressive' ? 'bg-danger' : plan.type === 'Growth' ? 'bg-primary' : plan.type === 'Balanced' ? 'bg-warning' : 'bg-success'">
                  {{plan.type}}
                </span>
              </div>
              <h5 class="card-title fw-bold text-center">{{ plan.name }}</h5>
              <div class="price-section my-4 text-center">
                <p class="text-muted small mb-1">Inversión Mínima</p>
                <h3 class="fw-bold">
                  $<span class="text-warning">{{ plan.minInvestment | number }}</span>
                </h3>
                <p class="text-muted small">Retorno Esperado: {{ plan.expectedReturn }}</p>
              </div>
              
              <ul class="list-unstyled mb-4">
                @for (feature of plan.features; track $index) {
                  <li class="mb-2">
                    <i class="bi bi-check-circle text-success me-2"></i>
                    <span>{{ feature }}</span>
                  </li>
                }
              </ul>
              
              <button class="btn w-100" [class]="plan.recommended ? 'btn-warning' : 'btn-outline-warning'" [routerLink]="['/register']">
                Invertir Ahora
              </button>
            </div>
          </div>
        </div>
      }
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
  
  plans = signal([
    {
      name: 'High Risk High Reward',
      type: 'Aggressive',
      minInvestment: 10000,
      expectedReturn: '15%',
      recommended: false,
      features: [
        'High risk with potential for high rewards',
        'Minimum Investment $10,000',
        'Expected Return 15%',
        'Duration 48 months',
        'Risk Level: High'
      ]
    },
    {
      name: 'Ultra Growth',
      type: 'Aggressive',
      minInvestment: 15000,
      expectedReturn: '15%',
      recommended: true,
      features: [
        'Pushing limits for significant growth',
        'Minimum Investment $15,000',
        'Expected Return 15%',
        'Duration 48 months',
        'Risk Level: High'
      ]
    },
    {
      name: 'Stable Growth',
      type: 'Balanced',
      minInvestment: 2000,
      expectedReturn: '5%',
      recommended: false,
      features: [
        'Balanced approach with moderate risk',
        'Minimum Investment $2,000',
        'Expected Return 5%',
        'Duration 36 months',
        'Risk Level: Medium'
      ]
    },
    {
      name: 'Steady Income',
      type: 'Conservative',
      minInvestment: 1000,
      expectedReturn: '3%',
      recommended: false,
      features: [
        'Focus on low-risk and steady returns',
        'Minimum Investment $1,000',
        'Expected Return 3%',
        'Duration 24 months',
        'Risk Level: Low'
      ]
    },
    {
      name: 'Rapid Development',
      type: 'Growth',
      minInvestment: 5000,
      expectedReturn: '8%',
      recommended: false,
      features: [
        'Aim for rapid capital appreciation',
        'Minimum Investment $5,000',
        'Expected Return 8%',
        'Duration 36 months',
        'Risk Level: High'
      ]
    },
    {
      name: 'Exponential Gains',
      type: 'Growth',
      minInvestment: 20000,
      expectedReturn: '10%',
      recommended: false,
      features: [
        'Focus on exponential growth opportunities',
        'Minimum Investment $20,000',
        'Expected Return 10%',
        'Duration 36 months',
        'Risk Level: High'
      ]
    }
  ]);
}