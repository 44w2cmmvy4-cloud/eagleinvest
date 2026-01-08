import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  WithdrawalService, 
  WithdrawalPlanType, 
  WithdrawalValidation,
  WithdrawalRequestData 
} from '../../services/withdrawal.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-withdrawal-flow',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div class="max-w-4xl mx-auto">
        
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-white mb-2">💰 Solicitar Retiro</h1>
          <p class="text-gray-300">Retira tus ganancias de forma segura</p>
        </div>

        <!-- Step Indicator -->
        <div class="flex justify-between mb-8">
          <div class="flex-1" *ngFor="let step of steps; let i = index">
            <div class="flex items-center">
              <div 
                class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                [class.bg-purple-600]="currentStep() >= i + 1"
                [class.bg-gray-600]="currentStep() < i + 1">
                {{ i + 1 }}
              </div>
              <div class="flex-1 h-1 mx-2" 
                   [class.bg-purple-600]="currentStep() > i + 1"
                   [class.bg-gray-600]="currentStep() <= i + 1"
                   *ngIf="i < steps.length - 1">
              </div>
            </div>
            <p class="text-xs text-gray-400 mt-2">{{ step }}</p>
          </div>
        </div>

        <!-- Step 1: Check Wallet -->
        <div *ngIf="currentStep() === 1" class="bg-white rounded-lg shadow-xl p-8">
          <h2 class="text-2xl font-bold mb-6">Verificar Wallet</h2>
          
          <div *ngIf="!hasWallet()" class="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">No tienes una wallet configurada</h3>
                <p class="mt-2 text-sm text-red-700">
                  Por favor, configura tu wallet en Perfil > Datos de Pago antes de realizar retiros.
                </p>
                <button (click)="goToProfile()" class="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                  Ir a Configuración
                </button>
              </div>
            </div>
          </div>

          <div *ngIf="hasWallet()" class="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-green-800">✅ Wallet configurada</h3>
                <p class="text-sm text-green-700 mt-1">
                  <strong>Dirección:</strong> {{ walletAddress() }}
                </p>
              </div>
            </div>
          </div>

          <button 
            *ngIf="hasWallet()"
            (click)="nextStep()"
            class="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold">
            Continuar
          </button>
        </div>

        <!-- Step 2: Select Balance & Amount -->
        <div *ngIf="currentStep() === 2" class="bg-white rounded-lg shadow-xl p-8">
          <h2 class="text-2xl font-bold mb-6">Seleccionar Origen y Monto</h2>

          <!-- Balance Source -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Origen del Retiro</label>
            <div class="grid grid-cols-2 gap-4">
              <button 
                (click)="selectSource('FIN_BALANCE')"
                [class.bg-purple-600]="withdrawalData.source === 'FIN_BALANCE'"
                [class.text-white]="withdrawalData.source === 'FIN_BALANCE'"
                [class.bg-gray-100]="withdrawalData.source !== 'FIN_BALANCE'"
                class="p-4 rounded-lg border-2 border-purple-600 hover:bg-purple-50">
                <div class="text-lg font-bold">Saldo de Fin</div>
                <div class="text-2xl font-bold mt-2">\${{ finBalance() }}</div>
              </button>
              
              <button 
                (click)="selectSource('PLAN_BALANCE')"
                [class.bg-purple-600]="withdrawalData.source === 'PLAN_BALANCE'"
                [class.text-white]="withdrawalData.source === 'PLAN_BALANCE'"
                [class.bg-gray-100]="withdrawalData.source !== 'PLAN_BALANCE'"
                class="p-4 rounded-lg border-2 border-purple-600 hover:bg-purple-50">
                <div class="text-lg font-bold">Plan Específico</div>
                <div class="text-2xl font-bold mt-2">\${{ planBalance() }}</div>
              </button>
            </div>
          </div>

          <!-- Amount Input -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Monto a Retirar</label>
            <div class="relative">
              <span class="absolute left-3 top-3 text-gray-500 text-lg">\$</span>
              <input
                type="number"
                [(ngModel)]="withdrawalData.amount"
                (input)="validateWithdrawal()"
                class="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none text-lg"
                placeholder="0.00"
                min="0"
                step="0.01">
            </div>
            <p class="text-sm text-gray-500 mt-2">
              Disponible: <strong>\${{ withdrawalData.source === 'FIN_BALANCE' ? finBalance() : planBalance() }}</strong>
            </p>
          </div>

          <!-- Plan Classification -->
          <div *ngIf="planType()" class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <h4 class="font-semibold text-blue-900 mb-2">Plan Detectado: {{ planType() }}</h4>
            <div class="grid grid-cols-2 gap-2 text-sm text-blue-800">
              <div>⏱️ Días transcurridos: <strong>{{ daysPassed() }}</strong></div>
              <div>💵 Mínimo: <strong>\${{ planRules()?.minimumAmount }}</strong></div>
              <div>📅 Días requeridos: <strong>{{ planRules()?.minimumDays }}</strong></div>
              <div>💸 Fee: <strong>{{ planRules()?.feePercentage }}%</strong></div>
            </div>
          </div>

          <!-- Validation Messages -->
          <div *ngIf="validationResult() && !validationResult()!.isValid" 
               class="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p class="text-red-800 font-semibold">❌ {{ validationResult()!.reason }}</p>
          </div>

          <div *ngIf="validationResult() && validationResult()!.isValid" 
               class="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <p class="text-green-800 font-semibold">✅ Retiro válido</p>
            <div class="mt-2 text-sm text-green-700">
              <div>💰 Monto solicitado: <strong>\${{ withdrawalData.amount }}</strong></div>
              <div>💸 Fee ({{ feeCalculation()?.description }}): <strong>\${{ feeCalculation()?.fee.toFixed(2) }}</strong></div>
              <div class="text-lg font-bold mt-2">🎯 Recibirás: <strong>\${{ feeCalculation()?.finalAmount.toFixed(2) }}</strong></div>
            </div>
          </div>

          <div class="flex gap-4">
            <button 
              (click)="previousStep()"
              class="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold">
              Atrás
            </button>
            <button 
              (click)="nextStep()"
              [disabled]="!validationResult()?.isValid"
              [class.opacity-50]="!validationResult()?.isValid"
              [class.cursor-not-allowed]="!validationResult()?.isValid"
              class="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold">
              Continuar
            </button>
          </div>
        </div>

        <!-- Step 3: Confirm -->
        <div *ngIf="currentStep() === 3" class="bg-white rounded-lg shadow-xl p-8">
          <h2 class="text-2xl font-bold mb-6">Confirmar Retiro</h2>

          <div class="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 class="font-semibold text-lg mb-4">Resumen de Retiro</h3>
            
            <div class="space-y-3 text-gray-700">
              <div class="flex justify-between">
                <span>Origen:</span>
                <strong>{{ withdrawalData.source === 'FIN_BALANCE' ? 'Saldo de Fin' : 'Plan Específico' }}</strong>
              </div>
              <div class="flex justify-between">
                <span>Plan:</span>
                <strong>{{ planType() }}</strong>
              </div>
              <div class="flex justify-between">
                <span>Monto solicitado:</span>
                <strong>\${{ withdrawalData.amount }}</strong>
              </div>
              <div class="flex justify-between text-red-600">
                <span>Fee ({{ feeCalculation()?.description }}):</span>
                <strong>-\${{ feeCalculation()?.fee.toFixed(2) }}</strong>
              </div>
              <hr>
              <div class="flex justify-between text-xl font-bold text-purple-600">
                <span>Total a recibir:</span>
                <strong>\${{ feeCalculation()?.finalAmount.toFixed(2) }}</strong>
              </div>
              <hr>
              <div class="flex justify-between text-sm">
                <span>Wallet destino:</span>
                <strong class="truncate ml-2">{{ walletAddress() }}</strong>
              </div>
              <div class="flex justify-between text-sm">
                <span>Red:</span>
                <strong>{{ walletNetwork() }}</strong>
              </div>
            </div>
          </div>

          <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
            <p class="text-sm text-yellow-800">
              ⏳ <strong>Importante:</strong> Los retiros se procesan en un plazo de <strong>48 horas</strong>. 
              Recibirás una notificación cuando tu retiro sea aprobado y procesado.
            </p>
          </div>

          <div class="flex gap-4">
            <button 
              (click)="previousStep()"
              class="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold">
              Atrás
            </button>
            <button 
              (click)="submitWithdrawal()"
              [disabled]="isSubmitting()"
              class="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">
              {{ isSubmitting() ? 'Procesando...' : '✅ Confirmar Retiro' }}
            </button>
          </div>
        </div>

        <!-- Step 4: Success -->
        <div *ngIf="currentStep() === 4" class="bg-white rounded-lg shadow-xl p-8 text-center">
          <div class="text-6xl mb-4">🎉</div>
          <h2 class="text-3xl font-bold text-green-600 mb-4">¡Retiro Solicitado!</h2>
          
          <div class="bg-green-50 rounded-lg p-6 mb-6">
            <p class="text-lg text-gray-700 mb-4">
              Tu solicitud de retiro ha sido registrada exitosamente.
            </p>
            <div class="text-4xl font-bold text-green-600 mb-2">
              \${{ feeCalculation()?.finalAmount.toFixed(2) }}
            </div>
            <p class="text-sm text-gray-600">Se transferirán a tu wallet</p>
          </div>

          <div class="bg-blue-50 rounded-lg p-4 mb-6">
            <p class="text-sm text-blue-800">
              📧 Recibirás una confirmación por email cuando el retiro sea procesado (máximo 48h)
            </p>
          </div>

          <div class="flex gap-4">
            <button 
              (click)="viewWithdrawals()"
              class="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold">
              Ver Mis Retiros
            </button>
            <button 
              (click)="goToDashboard()"
              class="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold">
              Ir al Dashboard
            </button>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  `]
})
export class WithdrawalFlowComponent implements OnInit {
  currentStep = signal(1);
  steps = ['Verificar Wallet', 'Monto', 'Confirmar', 'Completado'];
  
  hasWallet = signal(true);
  walletAddress = signal('0x742d...91f3');
  walletNetwork = signal('BSC');
  finBalance = signal(1250.50);
  planBalance = signal(890.75);
  
  daysPassed = signal(12);
  planType = signal<WithdrawalPlanType | null>(null);
  planRules = signal<any>(null);
  validationResult = signal<WithdrawalValidation | null>(null);
  feeCalculation = signal<any>(null);
  isSubmitting = signal(false);

  withdrawalData: WithdrawalRequestData = {
    userId: '',
    source: 'FIN_BALANCE',
    amount: 0,
    walletAddress: '',
    walletNetwork: ''
  };

  constructor(
    private withdrawalService: WithdrawalService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Load user data
    const user = this.authService.getCurrentUser();
    if (user) {
      this.withdrawalData.userId = user.id.toString();
      this.loadUserWallet();
      this.loadBalances();
    }
  }

  loadUserWallet() {
    // Simulate API call
    this.hasWallet.set(true);
    this.walletAddress.set('0x742d35Cc6634C0532925a3b844Bc9e7595f91f3');
    this.walletNetwork.set('BSC');
  }

  loadBalances() {
    // Simulate API call
    this.finBalance.set(1250.50);
    this.planBalance.set(890.75);
  }

  selectSource(source: 'FIN_BALANCE' | 'PLAN_BALANCE') {
    this.withdrawalData.source = source;
  }

  validateWithdrawal() {
    if (this.withdrawalData.amount <= 0) {
      this.validationResult.set(null);
      this.planType.set(null);
      return;
    }

    const plan = this.withdrawalService.determinePlanType(this.withdrawalData.amount);
    if (!plan) return;

    this.planType.set(plan);
    const rules = this.withdrawalService.getWithdrawalRules(plan);
    this.planRules.set(rules);

    const validation = this.withdrawalService.validateWithdrawal(
      plan,
      this.withdrawalData.amount,
      this.daysPassed()
    );
    this.validationResult.set(validation);

    if (validation.isValid) {
      const feeCalc = this.withdrawalService.calculateFinalBalance(
        this.withdrawalData.amount,
        plan,
        this.daysPassed()
      );
      this.feeCalculation.set(feeCalc);
    }
  }

  nextStep() {
    this.currentStep.update(step => step + 1);
  }

  previousStep() {
    this.currentStep.update(step => step - 1);
  }

  submitWithdrawal() {
    this.isSubmitting.set(true);

    this.withdrawalData.walletAddress = this.walletAddress();
    this.withdrawalData.walletNetwork = this.walletNetwork();
    this.withdrawalData.planType = this.planType()!;

    this.withdrawalService.createWithdrawal(this.withdrawalData).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.nextStep();
      },
      error: (err) => {
        console.error('Error creating withdrawal:', err);
        this.isSubmitting.set(false);
        alert('Error al procesar el retiro. Por favor intenta de nuevo.');
      }
    });
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  viewWithdrawals() {
    this.router.navigate(['/withdrawals/history']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
