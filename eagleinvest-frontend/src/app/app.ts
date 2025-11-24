import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { PortfolioService, Portfolio, Investment } from './services/portfolio.service';

/**
 * Componente raíz de la aplicación EagleInvest
 * 
 * @class App
 * @implements {OnInit}
 * 
 * @description
 * Componente principal que maneja:
 * - Navegación entre páginas (landing, login, register, dashboard)
 * - Estado global de autenticación
 * - Gestión de portafolio de inversiones
 * - Formularios de login y registro con soporte 2FA
 * - Datos de planes de inversión
 * - Market analysis y transacciones
 * 
 * Este componente utiliza Angular Signals para manejo de estado reactivo
 * y es un standalone component (no requiere NgModule).
 * 
 * @example
 * ```html
 * <!-- Bootstrap de la aplicación en index.html -->
 * <app-root></app-root>
 * ```
 * 
 * @version 1.0.0
 * @since 2025-01-01
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  /** Título de la aplicación */
  protected readonly title = signal('EagleInvest');
  
  /** Referencia a Math para usar en template */
  protected readonly Math = Math;
  
  /** Servicio de autenticación inyectado */
  private authService = inject(AuthService);
  
  /** Servicio de portafolio inyectado */
  private portfolioService = inject(PortfolioService);
  
  // ========== ESTADO DE AUTENTICACIÓN ==========
  
  /** 
   * Estado de autenticación del usuario
   * @type {Signal<boolean>}
   */
  isAuthenticated = signal(false);
  
  /** 
   * Datos del usuario autenticado actual
   * @type {Signal<any | null>}
   */
  currentUser = signal<any>(null);
  
  /** 
   * Página actual de la aplicación
   * @type {Signal<string>}
   * @values 'landing' | 'dashboard' | 'login' | 'register' | 'market-analysis' | 'education' | 'account' | 'blog'
   */
  currentPage = signal('landing');
  
  // ========== NAVEGACIÓN ==========
  
  /** 
   * Estado de colapso del navbar (para móvil)
   * @type {Signal<boolean>}
   */
  isNavbarCollapsed = signal(true);
  
  /**
   * Alterna el estado de colapso del navbar
   * @returns {void}
   */
  toggleNavbar() {
    this.isNavbarCollapsed.update(value => !value);
  }
  
  // ========== FORMULARIOS ==========
  
  /** 
   * Estado del formulario de login con soporte 2FA
   * @type {Signal<LoginForm>}
   * @property {string} email - Email del usuario
   * @property {string} password - Contraseña
   * @property {boolean} loading - Indica si está procesando
   * @property {string} error - Mensaje de error si existe
   * @property {boolean} requires2FA - Si requiere verificación 2FA
   * @property {string} twoFactorCode - Código de 6 dígitos para 2FA
   * @property {string} tempToken - Token temporal para completar 2FA
   */
  loginForm = signal({
    email: '',
    password: '',
    loading: false,
    error: '',
    requires2FA: false,
    twoFactorCode: '',
    tempToken: ''
  });

  /** 
   * Estado del formulario de registro
   * @type {Signal<RegisterForm>}
   * @property {string} name - Nombre completo del usuario
   * @property {string} email - Email único
   * @property {string} password - Contraseña
   * @property {string} password_confirmation - Confirmación de contraseña
   * @property {boolean} loading - Indica si está procesando
   * @property {string} error - Mensaje de error si existe
   */
  registerForm = signal({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    loading: false,
    error: ''
  });

  // Portafolio
  portfolio = signal<Portfolio | null>(null);
  portfolioLoading = signal(false);

  // Datos de dashboard
  marketAnalysis = signal<any>(null);
  transactions = signal<any[]>([]);
  
  // Features destacadas
  features = signal([
    {
      icon: '📊',
      title: 'Análisis en Tiempo Real',
      description: 'Accede a datos del mercado actualizados al segundo'
    },
    {
      icon: '🛡️',
      title: 'Seguridad Garantizada',
      description: 'Tus inversiones están protegidas con encriptación avanzada'
    },
    {
      icon: '💼',
      title: 'Gestión Inteligente',
      description: 'Herramientas avanzadas para optimizar tu cartera'
    },
    {
      icon: '⚡',
      title: 'Ejecución Rápida',
      description: 'Operaciones instantáneas sin intermediarios'
    }
  ]);
  
  // Planes de suscripción
  plans = signal([
    {
      name: 'Starter Focus',
      price: 500,
      features: ['Monitoreo diario', 'Alertas de riesgo', 'Panel móvil incluido'],
      recommended: false,
      accent: '#00F0FF',
      background: 'linear-gradient(135deg, rgba(0,240,255,0.15), rgba(0,48,73,0.8))',
      glow: '0 15px 40px rgba(0,240,255,0.25)',
      tagline: 'Arranca con control total y baja exposición',
      roi: '12% anual',
      lockPeriod: '35 días',
      dailyReturn: '0.35% diario',
      minCapital: '$500',
      risk: 'Bajo',
      liquidity: '24h'
    },
    {
      name: 'Accelerate Pro',
      price: 2500,
      features: ['Estrategias cuantitativas', 'Gestor dedicado', 'Reportes semanales', 'Cobertura multi-activo'],
      recommended: true,
      accent: '#C946FF',
      background: 'linear-gradient(135deg, rgba(201,70,255,0.2), rgba(24,6,49,0.85))',
      glow: '0 20px 45px rgba(201,70,255,0.35)',
      tagline: 'Impulsa tu capital con algoritmos híbridos',
      roi: '24% anual',
      lockPeriod: '60 días',
      dailyReturn: '0.55% diario',
      minCapital: '$2,500',
      risk: 'Medio',
      liquidity: '48h'
    },
    {
      name: 'Elite Quant',
      price: 10000,
      features: ['Despliegue multi-broker', 'Rebalanceo automático', 'Mesa 24/7', 'Backtesting dedicado'],
      recommended: false,
      accent: '#FF750F',
      background: 'linear-gradient(135deg, rgba(255,117,15,0.25), rgba(45,16,0,0.85))',
      glow: '0 20px 45px rgba(255,117,15,0.40)',
      tagline: 'Optimiza portafolios grandes con trading cuantitativo',
      roi: '36% anual',
      lockPeriod: '90 días',
      dailyReturn: '0.8% diario',
      minCapital: '$10,000',
      risk: 'Intermedio-Alto',
      liquidity: '72h'
    }
  ]);

  private investmentThemes: Record<string, { badgeBg: string; badgeColor: string; gradient: string; shadow: string }> = {
    BTC: {
      badgeBg: 'rgba(255, 149, 0, 0.2)',
      badgeColor: '#FF9500',
      gradient: 'linear-gradient(135deg, rgba(255,149,0,0.35), rgba(255,214,153,0.15))',
      shadow: '0 10px 25px rgba(255,149,0,0.3)'
    },
    ETH: {
      badgeBg: 'rgba(0, 240, 255, 0.2)',
      badgeColor: '#00F0FF',
      gradient: 'linear-gradient(135deg, rgba(0,240,255,0.35), rgba(0,58,73,0.15))',
      shadow: '0 10px 25px rgba(0,240,255,0.35)'
    },
    AAPL: {
      badgeBg: 'rgba(77,124,255,0.25)',
      badgeColor: '#4D7CFF',
      gradient: 'linear-gradient(135deg, rgba(77,124,255,0.35), rgba(10,14,39,0.4))',
      shadow: '0 10px 25px rgba(77,124,255,0.35)'
    },
    MSFT: {
      badgeBg: 'rgba(201,70,255,0.25)',
      badgeColor: '#C946FF',
      gradient: 'linear-gradient(135deg, rgba(201,70,255,0.35), rgba(32,6,54,0.4))',
      shadow: '0 10px 25px rgba(201,70,255,0.35)'
    }
  };

  getInvestmentTheme(symbol: string) {
    return this.investmentThemes[symbol] ?? {
      badgeBg: 'rgba(255,255,255,0.08)',
      badgeColor: '#CDD2E5',
      gradient: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(26,31,77,0.4))',
      shadow: '0 10px 25px rgba(0,0,0,0.25)'
    };
  }

  getInvestmentProgress(inv: Investment) {
    const base = inv.change_percentage ?? 0;
    const normalized = 58 + Math.min(32, Math.max(-12, base * 1.1));
    return Math.round(Math.min(98, Math.max(18, normalized)));
  }

  getInvestmentGain(inv: Investment) {
    const invested = (inv.quantity || 0) * (inv.purchase_price || 0);
    return (inv.value || 0) - invested;
  }

  getInvestmentDaysActive(inv: Investment) {
    const meta: any = inv;
    if (meta?.days_active) {
      return meta.days_active;
    }
    if (meta?.days_completed) {
      return meta.days_completed;
    }
    const pseudo = (inv.quantity || 1) * 2.5 + (inv.change_percentage || 0);
    return Math.max(7, Math.round(Math.min(180, pseudo)));
  }

  getInvestmentMaturity(inv: Investment) {
    const meta: any = inv;
    if (meta?.end_date) {
      return meta.end_date;
    }
    const remaining = Math.max(5, 90 - this.getInvestmentDaysActive(inv));
    return `${remaining} días`;
  }

  // Datos de educación y tutoriales
  educationItems = signal([
    {
      id: 1,
      icon: '📚',
      title: 'Inversión para Principiantes',
      description: 'Aprende los conceptos básicos de la inversión en acciones',
      duration: '45 min',
      level: 'Principiante'
    },
    {
      id: 2,
      icon: '📈',
      title: 'Análisis Técnico Avanzado',
      description: 'Domina las herramientas de análisis técnico más efectivas',
      duration: '2h 30min',
      level: 'Intermedio'
    },
    {
      id: 3,
      icon: '🎯',
      title: 'Estrategias de Trading',
      description: 'Aprende estrategias comprobadas de trading profesional',
      duration: '3h',
      level: 'Avanzado'
    },
    {
      id: 4,
      icon: '💡',
      title: 'Gestión de Riesgo',
      description: 'Protege tu capital con técnicas de gestión de riesgo',
      duration: '1h 15min',
      level: 'Intermedio'
    }
  ]);

  // Posts del blog
  blogPosts = signal([
    {
      id: 1,
      title: 'Los 5 Errores Más Comunes de los Inversores Principiantes',
      excerpt: 'Descubre cuáles son los errores que cometen la mayoría de inversores nuevos y cómo evitarlos.',
      date: '17 Nov 2024',
      author: 'Juan García',
      category: 'Tips',
      image: '📰'
    },
    {
      id: 2,
      title: 'Análisis: ¿Por qué el S&P 500 sigue batiendo récords?',
      excerpt: 'Un análisis detallado de los factores que impulsan al índice S&P 500 en 2024.',
      date: '16 Nov 2024',
      author: 'María López',
      category: 'Análisis',
      image: '📊'
    },
    {
      id: 3,
      title: 'Diversificación: La clave para inversiones seguras',
      excerpt: 'Aprende cómo diversificar tu portafolio y reducir riesgos de manera efectiva.',
      date: '15 Nov 2024',
      author: 'Carlos Rodríguez',
      category: 'Educación',
      image: '🎓'
    },
    {
      id: 4,
      title: 'Criptomonedas vs Acciones Tradicionales: ¿Cuál elegir?',
      excerpt: 'Comparativa completa entre inversiones en criptomonedas y acciones tradicionales.',
      date: '14 Nov 2024',
      author: 'Laura Martínez',
      category: 'Comparativa',
      image: '⚔️'
    }
  ]);

  // Datos de cuenta/perfil
  accountSettings = signal({
    name: '',
    email: '',
    phone: '',
    country: 'Colombia',
    language: 'Español',
    notifications: true,
    twoFactor: false
  });

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(authenticated => {
      this.isAuthenticated.set(authenticated);
      if (authenticated) {
        this.loadPortfolio();
      }
    });

    this.authService.currentUser$.subscribe(user => {
      this.currentUser.set(user);
    });
  }

  // Login
  login() {
    const form = this.loginForm();
    if (!form.email || !form.password) {
      this.loginForm.update(f => ({ ...f, error: 'Completa todos los campos' }));
      return;
    }

    this.loginForm.update(f => ({ ...f, loading: true, error: '' }));

    this.authService.login(form.email, form.password).subscribe({
      next: (response) => {
        console.log('Login respuesta:', response);
        if (response.requires_2fa) {
          // 2FA requerido
          this.loginForm.update(f => ({ 
            ...f, 
            loading: false, 
            requires2FA: true, 
            tempToken: response.temp_token || '',
            error: ''
          }));
        } else {
          // Login exitoso sin 2FA
          this.currentPage.set('dashboard');
          this.loginForm.update(f => ({ ...f, loading: false, email: '', password: '', requires2FA: false, twoFactorCode: '' }));
          this.loadPortfolio();
        }
      },
      error: (error) => {
        console.error('Error de login:', error);
        let errorMessage = 'Error al iniciar sesión';
        
        if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.error?.errors) {
          errorMessage = Object.values(error.error.errors).join(', ');
        } else if (error.status === 401) {
          errorMessage = 'Credenciales inválidas';
        }
        
        this.loginForm.update(f => ({ 
          ...f, 
          loading: false, 
          error: errorMessage
        }));
      }
    });
  }

  // Verify 2FA
  verify2FA() {
    const form = this.loginForm();
    if (!form.twoFactorCode || form.twoFactorCode.length !== 6) {
      this.loginForm.update(f => ({ ...f, error: 'Ingresa el código de 6 dígitos' }));
      return;
    }

    this.loginForm.update(f => ({ ...f, loading: true, error: '' }));

    this.authService.verify2FA(form.tempToken, form.twoFactorCode).subscribe({
      next: (response) => {
        console.log('2FA verificado exitosamente');
        this.currentPage.set('dashboard');
        this.loginForm.update(f => ({ ...f, loading: false, email: '', password: '', requires2FA: false, twoFactorCode: '', tempToken: '' }));
        this.loadPortfolio();
      },
      error: (error) => {
        console.error('Error verificando 2FA:', error);
        this.loginForm.update(f => ({ 
          ...f, 
          loading: false, 
          error: 'Código inválido o expirado'
        }));
      }
    });
  }

  // Resend 2FA code
  resend2FA() {
    const form = this.loginForm();
    this.authService.resend2FA(form.tempToken).subscribe({
      next: () => {
        this.loginForm.update(f => ({ ...f, error: 'Código reenviado a tu correo' }));
      },
      error: (error) => {
        console.error('Error reenviando código:', error);
      }
    });
  }

  // Register
  register() {
    const form = this.registerForm();
    if (!form.name || !form.email || !form.password || !form.password_confirmation) {
      this.registerForm.update(f => ({ ...f, error: 'Completa todos los campos' }));
      return;
    }

    if (form.password !== form.password_confirmation) {
      this.registerForm.update(f => ({ ...f, error: 'Las contraseñas no coinciden' }));
      return;
    }

    this.registerForm.update(f => ({ ...f, loading: true, error: '' }));

    this.authService.register(form.name, form.email, form.password, form.password_confirmation).subscribe({
      next: (response) => {
        console.log('Registro exitoso:', response);
        this.currentPage.set('dashboard');
        this.registerForm.update(f => ({ ...f, loading: false, name: '', email: '', password: '', password_confirmation: '' }));
        this.loadPortfolio();
      },
      error: (error) => {
        console.error('Error de registro:', error);
        let errorMessage = 'Error al registrarse';
        
        if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.error?.errors) {
          const errors = error.error.errors;
          errorMessage = Object.keys(errors).map(key => {
            const msgs = Array.isArray(errors[key]) ? errors[key] : [errors[key]];
            return msgs.join('; ');
          }).join(', ');
        }
        
        this.registerForm.update(f => ({ 
          ...f, 
          loading: false, 
          error: errorMessage
        }));
      }
    });
  }

  // Cargar portafolio
  loadPortfolio() {
    this.portfolioLoading.set(true);

    this.portfolioService.getPortfolio().subscribe({
      next: (data) => {
        this.portfolio.set(data);
        this.portfolioLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando portafolio:', error);
        this.portfolioLoading.set(false);
      }
    });

    this.portfolioService.getMarketAnalysis().subscribe({
      next: (data) => {
        this.marketAnalysis.set(data);
      }
    });

    this.portfolioService.getTransactions().subscribe({
      next: (data) => {
        this.transactions.set(data);
      }
    });
  }

  // Logout
  logout() {
    this.authService.logout();
    this.currentPage.set('landing');
    this.portfolio.set(null);
    this.marketAnalysis.set(null);
    this.transactions.set([]);
  }

  // Navegar a página
  navigateTo(page: string) {
    // Páginas públicas
    if (['landing', 'login', 'register', 'education', 'blog'].includes(page)) {
      this.currentPage.set(page);
      return;
    }
    
    // Páginas protegidas
    if (['dashboard', 'market-analysis', 'account'].includes(page)) {
      if (!this.isAuthenticated()) {
        this.currentPage.set('login');
        return;
      }
      this.currentPage.set(page);
    }
  }
}

