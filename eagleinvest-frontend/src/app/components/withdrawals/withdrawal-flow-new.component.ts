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
    <div class="min-h-screen" style="background: linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);">
      
      <!-- Loading State -->
      <div *ngIf="isLoading()" class="flex items-center justify-center min-h-screen">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent"></div>
          <p class="text-white text-lg mt-4 font-medium">Verificando información...</p>
        </div>
      </div>

      <!-- Content -->
      <div *ngIf="!isLoading()" class="container mx-auto px-4 py-8 max-w-5xl">
        
        <!-- Header -->
        <div class="text-center mb-10">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 mb-4 shadow-lg shadow-cyan-500/50">
            <span class="text-4xl">💰</span>
          </div>
          <h1 class="text-4xl font-bold text-white mb-2">Solicitar Retiro</h1>
          <p class="text-slate-400 text-lg">Retira tus ganancias de forma rápida y segura</p>
        </div>

        <!-- Progress Steps -->
        <div class="mb-12">
          <div class="flex items-center justify-between max-w-3xl mx-auto">
            <div *ngFor="let step of steps; let i = index" class="flex-1 flex flex-col items-center relative">
              <!-- Step Circle -->
              <div class="relative z-10">
                <div 
                  class="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 shadow-lg"
                  [class]="currentStep() > i + 1 ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 
                           currentStep() === i + 1 ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white ring-4 ring-cyan-400/30' : 
                           'bg-slate-700 text-slate-400'">
                  <span *ngIf="currentStep() > i + 1">✓</span>
                  <span *ngIf="currentStep() <= i + 1">{{ i + 1 }}</span>
                </div>
              </div>
              <!-- Step Label -->
              <p class="text-sm mt-3 font-medium" 
                 [class]="currentStep() >= i + 1 ? 'text-white' : 'text-slate-500'">
                {{ step }}
              </p>
              <!-- Connector Line -->
              <div *ngIf="i < steps.length - 1" 
                   class="absolute top-6 left-1/2 w-full h-0.5 -z-10 transition-all duration-300"
                   [class]="currentStep() > i + 1 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-slate-700'">
              </div>
            </div>
          </div>
        </div>

        <!-- Step 1: Verify Wallet -->
        <div *ngIf="currentStep() === 1" class="animate-fadeIn">
          <div class="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-slate-700">
            
            <div *ngIf="!hasWallet()" class="text-center py-12">
              <div class="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-white mb-3">Wallet No Configurada</h3>
              <p class="text-slate-400 mb-8 max-w-md mx-auto">
                Necesitas configurar tu billetera antes de realizar retiros. Ve a tu perfil y agrega tus datos de pago.
              </p>
              <button (click)="goToProfile()" 
                      class="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300">
                Configurar Wallet
              </button>
            </div>

            <div *ngIf="hasWallet()" class="space-y-6">
              <div class="flex items-start space-x-4 p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
                <div class="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div class="flex-1">
                  <h4 class="text-lg font-semibold text-white mb-2">Wallet Verificada</h4>
                  <div class="space-y-2 text-sm">
                    <div class="flex items-center space-x-2">
                      <span class="text-slate-400">Red:</span>
                      <span class="px-3 py-1 bg-slate-700 rounded-full text-cyan-400 font-medium">{{ walletNetwork() }}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <span class="text-slate-400">Dirección:</span>
                      <code class="px-3 py-1 bg-slate-900 rounded text-slate-300 font-mono text-xs">{{ walletAddress() }}</code>
                    </div>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="p-4 bg-slate-700/30 rounded-xl border border-slate-600">
                  <p class="text-slate-400 text-sm mb-1">Saldo Disponible (Fin)</p>
                  <p class="text-2xl font-bold text-white">\${{ finBalance() | number:'1.2-2' }}</p>
                </div>
                <div class="p-4 bg-slate-700/30 rounded-xl border border-slate-600">
                  <p class="text-slate-400 text-sm mb-1">Saldo Plan</p>
                  <p class="text-2xl font-bold text-white">\${{ planBalance() | number:'1.2-2' }}</p>
                </div>
              </div>

              <button (click)="nextStep()"
                      class="w-full px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300">
                Continuar →
              </button>
            </div>
          </div>
        </div>

        <!-- Step 2: Amount -->
        <div *ngIf="currentStep() === 2" class="animate-fadeIn">
          <div class="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-slate-700">
            
            <!-- Source Selection -->
            <div class="mb-8">
              <label class="block text-white text-lg font-semibold mb-4">Origen del Retiro</label>
              <div class="grid grid-cols-2 gap-4">
                <button (click)="selectSource('FIN_BALANCE')"
                        class="p-6 rounded-xl border-2 transition-all duration-300 text-left"
                        [class]="withdrawalData.source === 'FIN_BALANCE' ? 
                                 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20' : 
                                 'border-slate-600 bg-slate-700/30 hover:border-slate-500'">
                  <div class="text-sm font-medium mb-2" 
                       [class]="withdrawalData.source === 'FIN_BALANCE' ? 'text-cyan-400' : 'text-slate-400'">
                    Saldo de Fin
                  </div>
                  <div class="text-3xl font-bold text-white">\${{ finBalance() }}</div>
                </button>
                
                <button (click)="selectSource('PLAN_BALANCE')"
                        class="p-6 rounded-xl border-2 transition-all duration-300 text-left"
                        [class]="withdrawalData.source === 'PLAN_BALANCE' ? 
                                 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20' : 
                                 'border-slate-600 bg-slate-700/30 hover:border-slate-500'">
                  <div class="text-sm font-medium mb-2"
                       [class]="withdrawalData.source === 'PLAN_BALANCE' ? 'text-cyan-400' : 'text-slate-400'">
                    Plan Específico
                  </div>
                  <div class="text-3xl font-bold text-white">\${{ planBalance() }}</div>
                </button>
              </div>
            </div>

            <!-- Amount Input -->
            <div class="mb-8">
              <label class="block text-white text-lg font-semibold mb-4">Monto a Retirar</label>
              <div class="relative">
                <div class="absolute left-6 top-1/2 -translate-y-1/2 text-3xl text-cyan-400 font-bold">\$</div>
                <input type="number" 
                       [(ngModel)]="withdrawalData.amount"
                       (input)="validateWithdrawal()"
                       class="w-full pl-16 pr-6 py-5 bg-slate-900 border-2 border-slate-600 rounded-xl text-white text-3xl font-bold focus:border-cyan-500 focus:outline-none transition-colors"
                       placeholder="0.00"
                       step="0.01">
              </div>
              <p class="text-slate-400 text-sm mt-3">
                Disponible: <span class="text-white font-semibold">\${{ withdrawalData.source === 'FIN_BALANCE' ? finBalance() : planBalance() | number:'1.2-2' }}</span>
              </p>
            </div>

            <!-- Validation Messages -->
            <div *ngIf="validationResult() && !validationResult()!.isValid" 
                 class="p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-6">
              <div class="flex items-center space-x-3">
                <svg class="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-red-400 font-medium">{{ validationResult()!.reason }}</p>
              </div>
            </div>

            <div *ngIf="validationResult() && validationResult()!.isValid" 
                 class="p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl mb-6">
              <div class="flex items-start space-x-3 mb-4">
                <svg class="w-6 h-6 text-green-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div class="flex-1">
                  <p class="text-green-400 font-semibold mb-3">Retiro válido</p>
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                      <span class="text-slate-400">Monto solicitado:</span>
                      <span class="text-white font-semibold">\${{ withdrawalData.amount | number:'1.2-2' }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-slate-400">Comisión ({{ feeCalculation()?.description }}):</span>
                      <span class="text-red-400 font-semibold">-\${{ feeCalculation()?.fee.toFixed(2) }}</span>
                    </div>
                    <div class="border-t border-slate-600 pt-2 mt-2">
                      <div class="flex justify-between items-center">
                        <span class="text-white font-semibold text-lg">Recibirás:</span>
                        <span class="text-cyan-400 font-bold text-2xl">\${{ feeCalculation()?.finalAmount.toFixed(2) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex gap-4">
              <button (click)="previousStep()"
                      class="flex-1 px-6 py-4 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-600 transition-colors">
                ← Atrás
              </button>
              <button (click)="nextStep()"
                      [disabled]="!validationResult()?.isValid"
                      class="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300">
                Continuar →
              </button>
            </div>
          </div>
        </div>

        <!-- Step 3: Confirm -->
        <div *ngIf="currentStep() === 3" class="animate-fadeIn">
          <div class="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-slate-700">
            
            <div class="text-center mb-8">
              <div class="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/50">
                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h2 class="text-3xl font-bold text-white mb-2">Confirmar Retiro</h2>
              <p class="text-slate-400">Revisa los detalles antes de confirmar</p>
            </div>

            <div class="space-y-6 mb-8">
              <div class="p-6 bg-slate-900/50 rounded-xl">
                <div class="space-y-4">
                  <div class="flex justify-between items-center">
                    <span class="text-slate-400">Origen:</span>
                    <span class="text-white font-semibold">{{ withdrawalData.source === 'FIN_BALANCE' ? 'Saldo de Fin' : 'Plan Específico' }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-slate-400">Plan:</span>
                    <span class="px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full text-cyan-400 font-semibold">{{ planType() }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-slate-400">Monto solicitado:</span>
                    <span class="text-white font-semibold text-xl">\${{ withdrawalData.amount | number:'1.2-2' }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-slate-400">Comisión:</span>
                    <span class="text-red-400 font-semibold">-\${{ feeCalculation()?.fee.toFixed(2) }}</span>
                  </div>
                  <div class="border-t border-slate-700 pt-4">
                    <div class="flex justify-between items-center">
                      <span class="text-white font-bold text-lg">Total a recibir:</span>
                      <span class="text-cyan-400 font-bold text-3xl">\${{ feeCalculation()?.finalAmount.toFixed(2) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="p-6 bg-slate-900/50 rounded-xl">
                <h4 class="text-white font-semibold mb-3">Detalles de Destino</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex items-center space-x-2">
                    <span class="text-slate-400">Red:</span>
                    <span class="px-3 py-1 bg-slate-700 rounded-full text-cyan-400 font-medium">{{ walletNetwork() }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400">Wallet:</span>
                    <code class="block mt-1 px-3 py-2 bg-slate-800 rounded text-slate-300 font-mono text-xs break-all">{{ walletAddress() }}</code>
                  </div>
                </div>
              </div>

              <div class="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                <div class="flex items-start space-x-3">
                  <svg class="w-6 h-6 text-yellow-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p class="text-yellow-400 text-sm">
                    <strong>Tiempo de procesamiento:</strong> Los retiros se procesan en un plazo máximo de 48 horas. Recibirás una notificación cuando sea completado.
                  </p>
                </div>
              </div>
            </div>

            <div class="flex gap-4">
              <button (click)="previousStep()"
                      class="flex-1 px-6 py-4 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-600 transition-colors">
                ← Atrás
              </button>
              <button (click)="submitWithdrawal()"
                      [disabled]="isSubmitting()"
                      class="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300">
                <span *ngIf="!isSubmitting()">✓ Confirmar Retiro</span>
                <span *ngIf="isSubmitting()">Procesando...</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Step 4: Success -->
        <div *ngIf="currentStep() === 4" class="animate-fadeIn">
          <div class="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-slate-700 text-center">
            
            <div class="w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/50">
              <span class="text-5xl">🎉</span>
            </div>
            
            <h2 class="text-4xl font-bold text-white mb-3">¡Retiro Solicitado!</h2>
            <p class="text-slate-400 text-lg mb-8">Tu solicitud ha sido registrada exitosamente</p>
            
            <div class="inline-block p-8 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl mb-8">
              <p class="text-slate-400 text-sm mb-2">Recibirás en tu wallet</p>
              <p class="text-5xl font-bold text-green-400 mb-2">\${{ feeCalculation()?.finalAmount.toFixed(2) }}</p>
              <p class="text-slate-400 text-sm">Procesamiento: máximo 48 horas</p>
            </div>

            <div class="flex gap-4 max-w-md mx-auto">
              <button (click)="viewWithdrawals()"
                      class="flex-1 px-6 py-3 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-600 transition-colors">
                Ver Historial
              </button>
              <button (click)="goToDashboard()"
                      class="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300">
                Ir al Dashboard
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
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out;
    }

    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  `]
})
export class WithdrawalFlowComponent implements OnInit {
  isLoading = signal(true);
  currentStep = signal(1);
  steps = ['Wallet', 'Monto', 'Confirmar', 'Listo'];
  
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
    const user = this.authService.getCurrentUser();
    if (user) {
      this.withdrawalData.userId = user.id.toString();
      this.loadUserWallet();
      this.loadBalances();
    }
  }

  loadUserWallet() {
    setTimeout(() => {
      this.hasWallet.set(true);
      this.walletAddress.set('0x742d35Cc6634C0532925a3b844Bc9e7595f91f3');
      this.walletNetwork.set('BSC');
      this.isLoading.set(false);
    }, 800);
  }

  loadBalances() {
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
