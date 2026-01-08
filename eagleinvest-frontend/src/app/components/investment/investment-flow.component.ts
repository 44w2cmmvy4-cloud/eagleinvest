import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InvestmentService, InvestmentPlanType, InvestmentLevel } from '../../../services/investment.service';
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../services/auth.service';
import { NavbarComponent } from '../shared/navbar/navbar.component';

@Component({
  selector: 'app-investment-flow',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    
    <div class="investment-container" style="background: linear-gradient(135deg, #0A0E27 0%, #13172E 50%, #0A0E27 100%); min-height: 100vh; padding: 40px 20px;">
      <div class="container-fluid">
        <!-- Paso 1: Validar Monto -->
        @if (!investmentCreated()) {
          <div class="investment-card" style="background: linear-gradient(135deg, rgba(0,240,255,0.1), rgba(77,124,255,0.08)); border: 2px solid rgba(0,240,255,0.3); border-radius: 20px; padding: 40px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: white; margin-bottom: 30px; text-align: center; font-weight: 800;">💰 Crear Inversión</h2>
            
            <div style="margin-bottom: 25px;">
              <label style="display: block; color: #CDD2E5; margin-bottom: 10px; font-weight: 600; font-size: 1rem;">Monto a Invertir</label>
              <div style="display: flex; gap: 10px;">
                <span style="color: #00F0FF; font-weight: 700; font-size: 1.3rem;">$</span>
                <input 
                  type="number" 
                  [(ngModel)]="investmentAmount"
                  (ngModelChange)="onAmountChange()"
                  placeholder="Ingresa el monto"
                  style="flex: 1; padding: 15px; background: rgba(13,17,46,0.8); border: 1px solid rgba(0,240,255,0.3); border-radius: 10px; color: white; font-size: 1.1rem;">
              </div>
              @if (investmentAmount > 0) {
                <p style="color: #7581A8; font-size: 0.9rem; margin-top: 8px;">
                  Mínimo: $10 | Máximo: Ilimitado
                </p>
              }
            </div>

            <!-- Plan Sugerido -->
            @if (suggestedPlan()) {
              <div style="background: rgba(0,240,255,0.1); padding: 20px; border-radius: 12px; border-left: 3px solid #00F0FF; margin-bottom: 25px;">
                <h4 style="color: #00F0FF; margin: 0 0 10px 0; font-weight: 700;">Plan Sugerido</h4>
                <div style="color: white; font-weight: 600; font-size: 1.1rem; margin-bottom: 8px;">
                  {{ formatPlanName(suggestedPlan()!) }}
                </div>
                <p style="color: #A1A9C9; margin: 0; font-size: 0.95rem;">
                  {{ getPlanDescription(suggestedPlan()!) }}
                </p>
                <div style="color: #4D7CFF; font-weight: 700; margin-top: 10px;">
                  Nivel: {{ suggestedLevel() }}
                </div>
              </div>
            }

            <!-- Validación -->
            @if (validationError()) {
              <div style="background: rgba(255,61,0,0.1); padding: 15px; border-radius: 10px; border-left: 3px solid #FF3D00; margin-bottom: 25px;">
                <p style="color: #FF6B6B; margin: 0; font-weight: 600;">⚠️ {{ validationError() }}</p>
              </div>
            }

            <!-- Botones -->
            <div style="display: flex; gap: 15px;">
              <button 
                (click)="cancelInvestment()"
                style="flex: 1; padding: 15px; background: transparent; border: 2px solid rgba(0,240,255,0.3); color: #00F0FF; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 1rem;">
                Cancelar
              </button>
              <button 
                (click)="proceedWithInvestment()"
                [disabled]="!isValidAmount()"
                style="flex: 1; padding: 15px; background: linear-gradient(135deg, #00F0FF, #4D7CFF); color: #0A0E27; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 1rem; opacity: {{ isValidAmount() ? 1 : 0.5 }};"
              >
                Proceder → {{ investmentAmount > 0 ? investmentAmount | currency : 'Ingresar Monto' }}
              </button>
            </div>
          </div>
        }

        <!-- Paso 2: Confirmación -->
        @if (investmentCreated() && !investmentConfirmed()) {
          <div class="investment-card" style="background: linear-gradient(135deg, rgba(0,240,255,0.1), rgba(77,124,255,0.08)); border: 2px solid rgba(0,240,255,0.3); border-radius: 20px; padding: 40px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: white; margin-bottom: 30px; text-align: center; font-weight: 800;">✓ Confirmar Inversión</h2>
            
            <div style="background: rgba(0,240,255,0.1); padding: 25px; border-radius: 15px; border: 1px solid rgba(0,240,255,0.2); margin-bottom: 30px;">
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                  <p style="color: #7581A8; font-size: 0.9rem; margin: 0 0 8px 0;">Monto</p>
                  <p style="color: #00F0FF; font-size: 1.5rem; font-weight: 800; margin: 0;">$ {{ investmentAmount | number:'1.2-2' }}</p>
                </div>
                <div>
                  <p style="color: #7581A8; font-size: 0.9rem; margin: 0 0 8px 0;">Plan</p>
                  <p style="color: white; font-size: 1.2rem; font-weight: 700; margin: 0;">{{ formatPlanName(suggestedPlan()!) }}</p>
                </div>
                <div>
                  <p style="color: #7581A8; font-size: 0.9rem; margin: 0 0 8px 0;">Nivel</p>
                  <p style="color: #4D7CFF; font-size: 1.2rem; font-weight: 700; margin: 0;">{{ suggestedLevel() }}</p>
                </div>
                <div>
                  <p style="color: #7581A8; font-size: 0.9rem; margin: 0 0 8px 0;">Retorno Mensual</p>
                  <p style="color: #00F0FF; font-size: 1.2rem; font-weight: 700; margin: 0;">{{ getMonthlyReturn() }}%</p>
                </div>
              </div>
            </div>

            <!-- Términos -->
            <div style="background: rgba(13,17,46,0.6); padding: 15px; border-radius: 10px; margin-bottom: 25px; border-left: 3px solid #4D7CFF;">
              <label style="display: flex; align-items: flex-start; gap: 10px; color: #CDD2E5; cursor: pointer; margin: 0;">
                <input 
                  type="checkbox" 
                  [(ngModel)]="acceptTerms"
                  style="margin-top: 3px; cursor: pointer;">
                <span>Acepto los términos y condiciones de inversión. La inversión será registrada con fecha de hoy y tendrá un período de ratificación según el plan seleccionado.</span>
              </label>
            </div>

            <!-- Botones -->
            <div style="display: flex; gap: 15px;">
              <button 
                (click)="goBackToAmount()"
                style="flex: 1; padding: 15px; background: transparent; border: 2px solid rgba(0,240,255,0.3); color: #00F0FF; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 1rem;">
                ← Atrás
              </button>
              <button 
                (click)="confirmInvestment()"
                [disabled]="!acceptTerms"
                style="flex: 1; padding: 15px; background: linear-gradient(135deg, #00F0FF, #4D7CFF); color: #0A0E27; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 1rem; opacity: {{ acceptTerms ? 1 : 0.5 }};"
              >
                Confirmar Inversión ✓
              </button>
            </div>
          </div>
        }

        <!-- Paso 3: Éxito -->
        @if (investmentCreated() && investmentConfirmed()) {
          <div class="investment-card" style="background: linear-gradient(135deg, rgba(0,240,255,0.1), rgba(77,124,255,0.08)); border: 2px solid rgba(0,240,255,0.3); border-radius: 20px; padding: 40px; max-width: 600px; margin: 0 auto; text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 20px;">✅</div>
            <h2 style="color: white; margin-bottom: 15px; font-weight: 800;">¡Inversión Registrada!</h2>
            <p style="color: #A1A9C9; font-size: 1.1rem; margin-bottom: 30px;">Tu inversión ha sido registrada exitosamente en nuestra base de datos.</p>
            
            <div style="background: rgba(0,240,255,0.1); padding: 20px; border-radius: 12px; border-left: 3px solid #00F0FF; margin-bottom: 30px; text-align: left;">
              <p style="color: #7581A8; margin: 0 0 8px 0; font-size: 0.9rem;">📅 Fecha de Inicio</p>
              <p style="color: white; margin: 0 0 20px 0; font-weight: 600; font-size: 1.1rem;">{{ new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
              
              <p style="color: #7581A8; margin: 0 0 8px 0; font-size: 0.9rem;">⏳ Período de Ratificación</p>
              <p style="color: white; margin: 0; font-weight: 600; font-size: 1.1rem;">{{ getRatificationDays() }} días según tu plan</p>
            </div>

            <button 
              (click)="goToDashboard()"
              style="width: 100%; padding: 15px; background: linear-gradient(135deg, #00F0FF, #4D7CFF); color: #0A0E27; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 1rem;">
              Ir al Dashboard →
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .investment-container {
      min-height: 100vh;
    }

    .investment-card {
      box-shadow: 0 0 30px rgba(0, 240, 255, 0.1);
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

    const result = this.investmentService.validateAndClassifyInvestment(this.investmentAmount);
    
    if (!result.valid) {
      this.validationError.set(result.error || 'Monto inválido');
      this.suggestedPlan.set(null);
      this.suggestedLevel.set(null);
    } else {
      this.suggestedPlan.set(result.plan || null);
      this.suggestedLevel.set(result.level || null);
    }
  }

  isValidAmount(): boolean {
    return this.investmentAmount >= 10 && this.suggestedPlan() !== null;
  }

  proceedWithInvestment() {
    if (!this.isValidAmount()) return;
    this.investmentCreated.set(true);
  }

  goBackToAmount() {
    this.investmentCreated.set(false);
    this.acceptTerms = false;
  }

  confirmInvestment() {
    if (!this.acceptTerms || !this.suggestedPlan()) return;

    const userId = this.authService.getCurrentUser()?.id || '';
    
    this.investmentService.createDetailedInvestment(userId, this.investmentAmount).subscribe({
      next: (response) => {
        this.investmentConfirmed.set(true);
        this.notificationService.show('¡Inversión registrada exitosamente!', 'success', 3000);
      },
      error: (error) => {
        this.notificationService.show('Error al crear la inversión', 'error', 3000);
        console.error(error);
      }
    });
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  cancelInvestment() {
    this.router.navigate(['/dashboard']);
  }

  formatPlanName(plan: InvestmentPlanType): string {
    const names: Record<InvestmentPlanType, string> = {
      MICRO_IMPACTO: '🔷 Micro Impacto',
      RAPIDO_SOCIAL: '🟦 Rápido Social',
      ESTANQUE_SOLIDARIO: '🔶 Estanque Solidario',
      PREMIUM_HUMANITARIO: '💎 Premium Humanitario'
    };
    return names[plan];
  }

  getPlanDescription(plan: InvestmentPlanType): string {
    const descriptions: Record<InvestmentPlanType, string> = {
      MICRO_IMPACTO: 'Plan de bajo monto con ganancias micro ($10-$99)',
      RAPIDO_SOCIAL: 'Plan social con retorno rápido ($100-$999)',
      ESTANQUE_SOLIDARIO: 'Plan solidario con ganancia equilibrada ($1,000-$4,999)',
      PREMIUM_HUMANITARIO: 'Plan premium con máximas ganancias ($5,000+)'
    };
    return descriptions[plan];
  }

  getMonthlyReturn(): string {
    if (!this.suggestedPlan()) return '0';
    const plan = this.investmentService.getPlanDetails(this.suggestedPlan()!);
    return plan.monthlyRentability.toString();
  }

  getRatificationDays(): number {
    if (!this.suggestedPlan()) return 0;
    
    const daysMap: Record<InvestmentPlanType, number> = {
      MICRO_IMPACTO: 15,
      RAPIDO_SOCIAL: 10,
      ESTANQUE_SOLIDARIO: 30,
      PREMIUM_HUMANITARIO: 35
    };
    
    return daysMap[this.suggestedPlan()!];
  }
}
