import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InvestmentService, InvestmentPlanType, InvestmentLevel } from '../../services/investment.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-investment-flow',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen" style="background: linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);">
      
      <div class="container mx-auto px-4 py-12 max-w-4xl">
        
        <!-- Header -->
        <div class="text-center mb-12">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 mb-6 shadow-lg shadow-cyan-500/50">
            <span class="text-4xl">💰</span>
          </div>
          <h1 class="text-4xl font-bold text-white mb-2">Crear Inversión</h1>
          <p class="text-slate-400 text-lg">Inicia tu camino hacia la rentabilidad</p>
        </div>

        <!-- Loading State -->
        <div *ngIf="false" class="flex items-center justify-center min-h-[60vh]">
          <div class="text-center">
            <div class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent"></div>
            <p class="text-white text-lg mt-4 font-medium">Cargando...</p>
          </div>
        </div>

        <!-- Step 1: Amount -->
        <div *ngIf="!investmentCreated()" class="animate-fadeIn">
          <div class="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-10 shadow-2xl border border-slate-700">
            
            <div class="text-center mb-10">
              <h2 class="text-3xl font-bold text-white mb-2">Paso 1: Ingresa tu Monto</h2>
              <p class="text-slate-400">Elige cuánto quieres invertir</p>
            </div>

            <!-- Amount Input -->
            <div class="mb-8">
              <label class="block text-white text-lg font-semibold mb-4">Monto a Invertir</label>
              <div class="relative">
                <div class="absolute left-6 top-1/2 -translate-y-1/2 text-4xl text-cyan-400 font-bold">\$</div>
                <input type="number"
                       [(ngModel)]="investmentAmount"
                       (ngModelChange)="onAmountChange()"
                       class="w-full pl-20 pr-6 py-5 bg-slate-900 border-2 border-slate-600 rounded-xl text-white text-3xl font-bold focus:border-cyan-500 focus:outline-none transition-colors"
                       placeholder="0.00"
                       step="0.01"
                       min="10">
              </div>
              <p class="text-slate-400 text-sm mt-3">Mínimo: \$10 | Sin límite máximo</p>
            </div>

            <!-- Suggested Plan -->
            <div *ngIf="suggestedPlan()" class="p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl mb-8">
              <h4 class="text-cyan-400 font-bold text-lg mb-3 flex items-center">
                <span class="mr-2">✨</span> Plan Recomendado
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p class="text-slate-400 text-sm mb-1">Plan</p>
                  <p class="text-white font-bold text-xl">{{ formatPlanName(suggestedPlan()!) }}</p>
                </div>
                <div>
                  <p class="text-slate-400 text-sm mb-1">Nivel</p>
                  <p class="text-cyan-400 font-bold text-xl">{{ suggestedLevel() }}</p>
                </div>
              </div>
              <p class="text-slate-300 text-sm mt-3">{{ getPlanDescription(suggestedPlan()!) }}</p>
            </div>

            <!-- Validation Error -->
            <div *ngIf="validationError()" class="p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-8">
              <div class="flex items-center space-x-3">
                <svg class="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-red-400 font-medium">{{ validationError() }}</p>
              </div>
            </div>

            <!-- Buttons -->
            <div class="flex gap-4">
              <button (click)="cancelInvestment()"
                      class="flex-1 px-6 py-4 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-600 transition-colors">
                Cancelar
              </button>
              <button (click)="proceedWithInvestment()"
                      [disabled]="!isValidAmount()"
                      class="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300">
                Continuar →
              </button>
            </div>
          </div>
        </div>

        <!-- Step 2: Confirmation -->
        <div *ngIf="investmentCreated() && !investmentConfirmed()" class="animate-fadeIn">
          <div class="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-10 shadow-2xl border border-slate-700">
            
            <div class="text-center mb-10">
              <h2 class="text-3xl font-bold text-white mb-2">Paso 2: Confirma tu Inversión</h2>
              <p class="text-slate-400">Revisa los detalles antes de confirmar</p>
            </div>

            <!-- Summary Card -->
            <div class="p-8 bg-slate-900/50 rounded-2xl border border-slate-600 mb-8">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p class="text-slate-400 text-sm mb-2">Monto a Invertir</p>
                  <p class="text-4xl font-bold text-white">\${{ investmentAmount | number:'1.2-2' }}</p>
                </div>
                <div>
                  <p class="text-slate-400 text-sm mb-2">Plan Asignado</p>
                  <p class="text-3xl font-bold text-cyan-400">{{ formatPlanName(suggestedPlan()!) }}</p>
                </div>
                <div>
                  <p class="text-slate-400 text-sm mb-2">Nivel</p>
                  <p class="text-3xl font-bold text-white">{{ suggestedLevel() }}</p>
                </div>
                <div>
                  <p class="text-slate-400 text-sm mb-2">Retorno Mensual</p>
                  <p class="text-3xl font-bold text-green-400">{{ getMonthlyReturn() }}%</p>
                </div>
              </div>
            </div>

            <!-- Terms Checkbox -->
            <div class="p-6 bg-slate-900/30 rounded-xl border border-slate-700 mb-8">
              <label class="flex items-start space-x-4 cursor-pointer">
                <input type="checkbox"
                       [(ngModel)]="acceptTerms"
                       class="mt-1 w-5 h-5 rounded border-slate-500 text-cyan-500 focus:ring-cyan-500">
                <div>
                  <p class="text-white font-medium mb-1">Aceptar Términos y Condiciones</p>
                  <p class="text-slate-400 text-sm">
                    Acepto los términos de inversión. Mi inversión será registrada con fecha de hoy y tendrá un período de ratificación según el plan seleccionado.
                  </p>
                </div>
              </label>
            </div>

            <!-- Info Box -->
            <div class="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl mb-8">
              <div class="flex items-start space-x-3">
                <svg class="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-yellow-400 text-sm">
                  Tu inversión comenzará a generar retornos inmediatamente según el plan seleccionado.
                </p>
              </div>
            </div>

            <!-- Buttons -->
            <div class="flex gap-4">
              <button (click)="goBackToAmount()"
                      class="flex-1 px-6 py-4 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-600 transition-colors">
                ← Atrás
              </button>
              <button (click)="confirmInvestment()"
                      [disabled]="!acceptTerms"
                      class="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300">
                Confirmar Inversión ✓
              </button>
            </div>
          </div>
        </div>

        <!-- Step 3: Success -->
        <div *ngIf="investmentCreated() && investmentConfirmed()" class="animate-fadeIn">
          <div class="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-10 shadow-2xl border border-slate-700 text-center">
            
            <div class="w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/50">
              <span class="text-6xl">🎉</span>
            </div>
            
            <h2 class="text-4xl font-bold text-white mb-3">¡Inversión Registrada!</h2>
            <p class="text-slate-400 text-lg mb-8">Tu inversión ha sido procesada exitosamente</p>
            
            <div class="inline-block p-8 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl mb-10">
              <p class="text-slate-400 text-sm mb-2">Monto Invertido</p>
              <p class="text-5xl font-bold text-green-400 mb-4">\${{ investmentAmount | number:'1.2-2' }}</p>
              <p class="text-slate-400 text-sm">
                Fecha de inicio: <span class="text-white font-semibold">{{ currentDate }}</span>
              </p>
              <p class="text-slate-400 text-sm">
                Período de ratificación: <span class="text-white font-semibold">{{ getRatificationDays() }} días</span>
              </p>
            </div>

            <div class="flex gap-4">
              <button (click)="goToDashboard()"
                      class="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300">
                Ir al Dashboard →
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .animate-fadeIn {
      animation: fadeIn 0.4s ease-out;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    
    .animate-spin {
      animation: spin 1s linear infinite;
    }

    input[type="checkbox"] {
      accent-color: #06b6d4;
    }
  `]
})
export class InvestmentFlowComponent implements OnInit {
  private investmentService = inject(InvestmentService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private router = inject(Router);

  investmentAmount = 0;
  acceptTerms = false;
  investmentCreated = signal(false);
  investmentConfirmed = signal(false);
  suggestedPlan = signal<InvestmentPlanType | null>(null);
  suggestedLevel = signal<InvestmentLevel | null>(null);
  validationError = signal('');
  currentDate = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
    }
  }

  onAmountChange() {
    this.validationError.set('');
    if (this.investmentAmount <= 0) {
      this.suggestedPlan.set(null);
      this.suggestedLevel.set(null);
      return;
    }

    if (this.investmentAmount < 10) {
      this.validationError.set('El monto mínimo de inversión es \$10');
      return;
    }

    const plan = this.investmentService.determinePlanType(this.investmentAmount);
    if (plan) {
      this.suggestedPlan.set(plan);
      this.suggestedLevel.set(this.investmentService.determineLevelFromAmount(this.investmentAmount));
    }
  }

  isValidAmount(): boolean {
    return this.investmentAmount >= 10 && this.validationError() === '';
  }

  proceedWithInvestment() {
    if (this.isValidAmount()) {
      this.investmentCreated.set(true);
    }
  }

  goBackToAmount() {
    this.investmentCreated.set(false);
  }

  confirmInvestment() {
    if (this.acceptTerms && this.investmentCreated()) {
      this.investmentConfirmed.set(true);
    }
  }

  cancelInvestment() {
    this.router.navigate(['/dashboard']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  formatPlanName(plan: InvestmentPlanType): string {
    const names: Record<InvestmentPlanType, string> = {
      'BASIC': 'Plan Básico',
      'INTERMEDIATE': 'Plan Intermedio',
      'PREMIUM': 'Plan Premium',
      'ELITE': 'Plan Elite'
    };
    return names[plan] || plan;
  }

  getPlanDescription(plan: InvestmentPlanType): string {
    const descriptions: Record<InvestmentPlanType, string> = {
      'BASIC': 'Perfecto para principiantes. Retorno diario del 1.2% durante 30 días.',
      'INTERMEDIATE': 'Para inversores con experiencia. Retorno diario del 1.8% durante 45 días.',
      'PREMIUM': 'Máxima rentabilidad. Retorno diario del 2.5% durante 60 días.',
      'ELITE': 'Nivel VIP. Retorno personalizado según el monto invertido.'
    };
    return descriptions[plan] || '';
  }

  getMonthlyReturn(): number {
    const plan = this.suggestedPlan();
    const returns: Record<InvestmentPlanType, number> = {
      'BASIC': 36,
      'INTERMEDIATE': 54,
      'PREMIUM': 75,
      'ELITE': 100
    };
    return plan ? returns[plan] : 0;
  }

  getRatificationDays(): number {
    const plan = this.suggestedPlan();
    const days: Record<InvestmentPlanType, number> = {
      'BASIC': 30,
      'INTERMEDIATE': 45,
      'PREMIUM': 60,
      'ELITE': 90
    };
    return plan ? days[plan] : 0;
  }
}
