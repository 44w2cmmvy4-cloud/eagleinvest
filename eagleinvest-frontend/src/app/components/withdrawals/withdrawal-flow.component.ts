import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  WithdrawalService, 
  WithdrawalPlanType, 
  WithdrawalValidation 
} from '../../services/withdrawal.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-withdrawal-flow',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen font-sans text-slate-300 selection:bg-cyan-500/30" 
         style="background: linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);">
      
      <!-- Loading State -->
      <div *ngIf="isLoading()" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm">
        <div class="relative">
          <div class="w-20 h-20 border-4 border-slate-700 rounded-full"></div>
          <div class="absolute top-0 left-0 w-20 h-20 border-4 border-cyan-500 rounded-full animate-spin border-t-transparent"></div>
        </div>
        <p class="mt-6 text-xl font-medium text-white animate-pulse">Procesando solicitud...</p>
      </div>

      <div class="container mx-auto px-4 py-8 max-w-4xl min-h-screen flex flex-col justify-center">
        
        <!-- Header -->
        <div class="text-center mb-10 animate-fadeIn">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 mb-6 shadow-lg shadow-cyan-500/30 ring-4 ring-slate-800 transform rotate-3 hover:rotate-6 transition-transform">
            <span class="text-4xl text-white">💸</span>
          </div>
          <h1 class="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
            Solicitar <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Retiro</span>
          </h1>
          <p class="text-slate-400 text-lg">Transfiere tus ganancias a tu billetera personal</p>
        </div>

        <!-- Progress Steps -->
        <div class="mb-12 relative animate-fadeIn" style="animation-delay: 100ms;">
          <!-- Connecting Line -->
          <div class="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -translate-y-1/2 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700 delay-100 ease-out"
                 [style.width.%]="((currentStep() - 1) / (steps.length - 1)) * 100"></div>
          </div>

          <div class="relative flex justify-between">
            <div *ngFor="let step of steps; let i = index" 
                 class="flex flex-col items-center group cursor-default">
              
              <!-- Circle -->
              <div class="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-500 z-10 relative"
                   [class]="currentStep() > i + 1 ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 scale-100' : 
                            currentStep() === i + 1 ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white ring-4 ring-slate-900 shadow-xl shadow-cyan-500/40 scale-110' : 
                            'bg-slate-800 text-slate-500 border-2 border-slate-700'">
                
                <span *ngIf="currentStep() > i + 1">✓</span>
                <span *ngIf="currentStep() <= i + 1">{{ i + 1 }}</span>
                
                <!-- Pulse Effect for Active -->
                <div *ngIf="currentStep() === i + 1" class="absolute inset-0 rounded-full bg-cyan-500/30 animate-ping"></div>
              </div>

              <!-- Label -->
              <span class="mt-3 text-sm font-medium transition-colors duration-300 absolute top-14 w-32 text-center"
                    [class]="currentStep() >= i + 1 ? 'text-white' : 'text-slate-500'">
                {{ step }}
              </span>
            </div>
          </div>
        </div>

        <!-- Main Card -->
        <div class="relative bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 md:p-10 shadow-2xl animate-fadeIn" style="animation-delay: 200ms;">
          
          <!-- Step 1: Wallet Config -->
          <div *ngIf="currentStep() === 1" class="space-y-6">
            <div class="text-center mb-8">
              <h2 class="text-2xl font-bold text-white mb-2">Configuración de Billetera</h2>
              <p class="text-slate-400">Verifica que tu dirección de billetera sea correcta</p>
            </div>

            <div class="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
              <div class="flex items-start gap-4">
                <div class="p-3 bg-orange-500/10 rounded-xl text-orange-500">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                </div>
                <div>
                  <h3 class="text-white font-semibold mb-1">Importante</h3>
                  <p class="text-sm text-slate-400 leading-relaxed">
                    Asegúrate de que tu billetera acepte la red <span class="text-cyan-400 font-bold">BEP-20 (Binance Smart Chain)</span>. 
                    Enviar fondos a una red incorrecta resultará en la pérdida permanente de los activos.
                  </p>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <label class="block text-sm font-medium text-slate-300 ml-1">Dirección de Billetera (USDT BEP-20)</label>
              <div class="relative">
                <input type="text"
                       [class.border-red-500]="walletError()"
                       [value]="walletAddress" 
                       readonly
                       class="w-full pl-12 pr-4 py-4 bg-slate-900/80 border border-slate-700 rounded-xl text-slate-300 focus:outline-none cursor-not-allowed font-mono text-sm shadow-inner">
                <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
                </div>
                <!-- Edit Button (Mock) -->
                <button class="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white transition-colors">
                  <span class="text-xs font-semibold uppercase tracking-wider">Verificado</span>
                </button>
              </div>
            </div>

            <div class="pt-4">
              <button (click)="nextStep()"
                      class="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-cyan-900/40 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                Confirmar Billetera
              </button>
            </div>
          </div>

          <!-- Step 2: Amount -->
           <div *ngIf="currentStep() === 2" class="space-y-8">
            <div class="text-center">
              <h2 class="text-2xl font-bold text-white mb-2">Monto a Retirar</h2>
              <div class="inline-block px-4 py-1.5 rounded-full bg-slate-700/50 border border-slate-600 text-sm text-slate-300">
                Disponible: <span class="text-green-400 font-bold font-mono">\${{ availableBalance() | number:'1.2-2' }}</span>
              </div>
            </div>

            <!-- Amount Input -->
            <div class="relative max-w-sm mx-auto">
              <label class="block text-xs uppercase tracking-wide text-slate-500 mb-2 font-semibold text-center">Ingresa la cantidad</label>
              <div class="relative group">
                <span class="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-light text-slate-500 transition-colors group-focus-within:text-cyan-400">$</span>
                <input type="number" 
                       [(ngModel)]="amount" 
                       (input)="validateAmount()"
                       placeholder="0.00"
                       class="w-full pl-16 pr-6 py-5 bg-slate-900/50 border-2 border-slate-700 rounded-2xl text-4xl text-white font-bold text-center focus:border-cyan-500 focus:ring-0 transition-all outline-none placeholder:text-slate-700 shadow-inner">
              </div>
              
              <!-- Validation Errors -->
              <div class="h-6 mt-2 text-center">
                <p *ngIf="error()" class="text-red-400 text-sm font-medium animate-fadeIn flex items-center justify-center gap-1">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  {{ error() }}
                </p>
              </div>
            </div>

            <!-- Quick Amounts -->
            <div class="grid grid-cols-4 gap-3">
              <button *ngFor="let pct of [25, 50, 75, 100]"
                      (click)="setPercent(pct)"
                      class="py-2.5 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-400 text-sm font-semibold hover:bg-cyan-500/10 hover:text-cyan-400 hover:border-cyan-500/30 transition-all">
                {{ pct }}%
              </button>
            </div>

            <!-- Summary Preview -->
            <div class="bg-slate-900/30 rounded-xl p-5 border border-slate-700/50 space-y-3">
              <div class="flex justify-between items-center text-sm">
                <span class="text-slate-400">Comisión de retiro (5%)</span>
                <span class="text-red-400 font-mono">-\${{ calculateFee() | number:'1.2-2' }}</span>
              </div>
              <div class="flex justify-between items-center border-t border-slate-700 pt-3">
                <span class="text-white font-medium">Recibirás (aprox.)</span>
                <span class="text-xl font-bold text-cyan-400 font-mono">\${{ calculateNet() | number:'1.2-2' }}</span>
              </div>
            </div>

            <div class="flex gap-4 pt-2">
              <button (click)="prevStep()"
                      class="px-6 py-4 rounded-xl border border-slate-600 text-slate-300 font-bold hover:bg-slate-800 transition-colors">
                Atrás
              </button>
              <button (click)="nextStep()"
                      [disabled]="!!error() || !amount || amount <= 0"
                      class="flex-1 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-cyan-900/40 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                Continuar
              </button>
            </div>
          </div>

          <!-- Step 3: Confirm -->
          <div *ngIf="currentStep() === 3" class="space-y-8 animate-fadeIn">
            <div class="text-center">
              <h2 class="text-2xl font-bold text-white mb-2">Confirmar Retiro</h2>
              <p class="text-slate-400">Revisa los detalles antes de procesar</p>
            </div>

            <div class="bg-slate-900/50 rounded-2xl border border-slate-700 overflow-hidden divide-y divide-slate-700">
              <div class="p-5 flex justify-between items-center">
                <span class="text-slate-400">Monto Solicitado</span>
                <span class="text-white font-bold text-lg">\${{ amount | number:'1.2-2' }}</span>
              </div>
              <div class="p-5 flex justify-between items-center">
                <span class="text-slate-400">Fee de transacción</span>
                <span class="text-red-400 font-mono">-\${{ calculateFee() | number:'1.2-2' }}</span>
              </div>
              <div class="p-5 bg-gradient-to-r from-cyan-900/10 to-blue-900/10">
                <div class="flex justify-between items-center mb-1">
                  <span class="text-cyan-200 font-medium">Total a Recibir</span>
                  <span class="text-2xl font-bold text-cyan-400">\${{ calculateNet() | number:'1.2-2' }}</span>
                </div>
                <p class="text-right text-xs text-slate-500">USDT (BEP-20)</p>
              </div>
            </div>

            <div class="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20 flex gap-4 items-start">
              <div class="mt-1 text-blue-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <p class="text-sm text-blue-200 leading-relaxed">
                El retiro se procesará en un plazo máximo de 24 horas. Recibirás una notificación por correo cuando se complete.
              </p>
            </div>

            <div class="flex gap-4 pt-4">
              <button (click)="prevStep()"
                      class="px-6 py-4 rounded-xl border border-slate-600 text-slate-300 font-bold hover:bg-slate-800 transition-colors">
                Corregir
              </button>
              <button (click)="confirmWithdrawal()"
                      class="flex-1 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-900/40 transition-all transform hover:scale-[1.02]">
                Confirmar Retiro
              </button>
            </div>
          </div>

          <!-- Step 4: Success -->
          <div *ngIf="currentStep() === 4" class="text-center py-8 animate-fadeIn">
            <div class="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
              </div>
            </div>
            
            <h2 class="text-3xl font-bold text-white mb-4">¡Solicitud Exitosa!</h2>
            <p class="text-slate-400 max-w-md mx-auto mb-8 text-lg">
              Tu retiro de <strong class="text-white">\${{ amount | number:'1.2-2' }}</strong> ha sido procesado correctamente.
            </p>

            <div class="bg-slate-900/50 p-6 rounded-2xl border border-slate-700 max-w-sm mx-auto mb-8">
              <p class="text-sm text-slate-500 mb-1">ID de Transacción</p>
              <p class="font-mono text-cyan-400 select-all">{{ transactionId }}</p>
            </div>

            <button (click)="finish()"
                    class="px-10 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all w-full md:w-auto">
              Volver al Dashboard
            </button>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.5s ease-out forwards;
    }
    /* Hide number input arrows */
    input[type=number]::-webkit-inner-spin-button, 
    input[type=number]::-webkit-outer-spin-button { 
      -webkit-appearance: none; 
      margin: 0; 
    }
  `]
})
export class WithdrawalFlowComponent implements OnInit {
  private withdrawalService = inject(WithdrawalService);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  currentStep = signal(1);
  steps = ['Wallet', 'Monto', 'Confirmar', 'Listo'];

  walletAddress = '';
  amount: number | null = null;
  availableBalance = signal(0);
  
  error = signal<string>('');
  walletError = signal(false);
  
  transactionId = '';
  feePercent = 0.05;

  ngOnInit() {
    // Simulamos carga de datos
    this.isLoading.set(true);
    setTimeout(() => {
      // Mock data
      this.walletAddress = '0x71C...9A21'; 
      this.availableBalance.set(1250.00); 
      this.isLoading.set(false);
    }, 1000);
  }

  nextStep() {
    if (this.currentStep() === 1) {
      if (!this.walletAddress) {
        this.walletError.set(true);
        return;
      }
      this.walletError.set(false);
    }
    
    if (this.currentStep() === 2) {
      if (!this.validateAmount()) return;
    }

    this.currentStep.update(s => s + 1);
  }

  prevStep() {
    this.currentStep.update(s => s - 1);
  }

  validateAmount(): boolean {
    if (!this.amount || this.amount <= 0) {
      this.error.set('Ingresa un monto válido');
      return false;
    }
    if (this.amount > this.availableBalance()) {
      this.error.set('Saldo insuficiente');
      return false;
    }
    if (this.amount < 10) { // Min withdrawal
      this.error.set('Mínimo de retiro $10');
      return false;
    }
    this.error.set('');
    return true;
  }

  setPercent(percent: number) {
    const val = (this.availableBalance() * percent) / 100;
    this.amount = parseFloat(val.toFixed(2));
    this.validateAmount();
  }

  calculateFee(): number {
    return (this.amount || 0) * this.feePercent;
  }

  calculateNet(): number {
    return (this.amount || 0) - this.calculateFee();
  }

  confirmWithdrawal() {
    this.isLoading.set(true);
    
    // Simular API call
    setTimeout(() => {
      this.isLoading.set(false);
      this.transactionId = 'TX-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      this.nextStep();
    }, 2000);
  }

  finish() {
    this.router.navigate(['/dashboard']);
  }
}
