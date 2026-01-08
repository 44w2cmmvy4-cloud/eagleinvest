import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InvestmentService, InvestmentLevel, LevelBenefits } from '../../services/investment.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-investment-levels',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen" style="background: linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);">
      
      <div class="container mx-auto px-4 py-12 max-w-7xl">
        
        <!-- Header -->
        <div class="text-center mb-16">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 mb-6 shadow-lg shadow-cyan-500/50">
            <span class="text-4xl">📊</span>
          </div>
          <h1 class="text-5xl font-bold text-white mb-4">Niveles de Inversión</h1>
          <p class="text-slate-400 text-xl max-w-2xl mx-auto">
            Descubre los beneficios exclusivos de cada nivel y desbloquea mayores comisiones
          </p>
        </div>

        <!-- Levels Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div *ngFor="let level of levels()" 
               class="group relative"
               (click)="selectLevel(level.level)">
            
            <!-- Card -->
            <div class="relative h-full p-8 rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden"
                 [class]="selectedLevel() === level.level ? 
                          'bg-gradient-to-br ' + level.gradientFrom + ' ' + level.gradientTo + ' shadow-2xl scale-105 ring-4 ' + level.ringColor : 
                          'bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-slate-600 hover:shadow-xl hover:scale-102'">
              
              <!-- Background Glow Effect -->
              <div *ngIf="selectedLevel() === level.level" 
                   class="absolute inset-0 opacity-30 blur-3xl"
                   [style.background]="'radial-gradient(circle, ' + level.color + ' 0%, transparent 70%)'">
              </div>
              
              <!-- Content -->
              <div class="relative z-10">
                <!-- Icon Badge -->
                <div class="flex justify-center mb-6">
                  <div class="w-20 h-20 rounded-full flex items-center justify-center text-5xl"
                       [class]="selectedLevel() === level.level ? 'bg-white/20 shadow-lg' : 'bg-slate-700/50'">
                    {{ level.icon }}
                  </div>
                </div>

                <!-- Level Name -->
                <h3 class="text-2xl font-bold text-center mb-4"
                    [class]="selectedLevel() === level.level ? 'text-white' : 'text-slate-200'">
                  {{ level.name }}
                </h3>

                <!-- Investment Range -->
                <div class="text-center mb-6 p-4 rounded-xl"
                     [class]="selectedLevel() === level.level ? 'bg-black/20' : 'bg-slate-900/50'">
                  <p class="text-slate-400 text-xs uppercase tracking-wide mb-2">Rango de Inversión</p>
                  <p class="text-white font-bold text-xl">
                    \${{ level.minAmount | number:'1.0-0' }}
                    <span class="text-slate-300 mx-2">-</span>
                    <span *ngIf="level.maxAmount !== Infinity">\${{ level.maxAmount | number:'1.0-0' }}</span>
                    <span *ngIf="level.maxAmount === Infinity">∞</span>
                  </p>
                </div>

                <!-- Key Stats -->
                <div class="space-y-3 mb-6">
                  <div class="flex items-center justify-between p-3 rounded-lg"
                       [class]="selectedLevel() === level.level ? 'bg-black/20' : 'bg-slate-700/30'">
                    <span class="text-slate-300 text-sm">Niveles de Red</span>
                    <span class="font-bold text-white">{{ level.levels }}</span>
                  </div>
                  <div class="flex items-center justify-between p-3 rounded-lg"
                       [class]="selectedLevel() === level.level ? 'bg-black/20' : 'bg-slate-700/30'">
                    <span class="text-slate-300 text-sm">Tope Mensual</span>
                    <span class="font-bold" [style.color]="level.color">\${{ level.topAmount | number:'1.0-0' }}+</span>
                  </div>
                </div>

                <!-- Benefits Preview -->
                <div class="space-y-2 mb-6">
                  <div class="flex items-center space-x-2 text-sm"
                       [class]="selectedLevel() === level.level ? 'text-white' : 'text-slate-300'">
                    <svg class="w-5 h-5 flex-shrink-0" [style.color]="level.color" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <span>Comisiones garantizadas</span>
                  </div>
                  <div class="flex items-center space-x-2 text-sm"
                       [class]="selectedLevel() === level.level ? 'text-white' : 'text-slate-300'">
                    <svg class="w-5 h-5 flex-shrink-0" [style.color]="level.color" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <span>Red multinivel</span>
                  </div>
                  <div class="flex items-center space-x-2 text-sm"
                       [class]="selectedLevel() === level.level ? 'text-white' : 'text-slate-300'">
                    <svg class="w-5 h-5 flex-shrink-0" [style.color]="level.color" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <span>Soporte 24/7</span>
                  </div>
                </div>

                <!-- CTA Button -->
                <button (click)="investInLevel(level.level); $event.stopPropagation()"
                        class="w-full py-3 rounded-xl font-semibold transition-all duration-300"
                        [class]="selectedLevel() === level.level ? 
                                 'bg-white text-slate-900 hover:bg-slate-100 shadow-lg' : 
                                 'bg-gradient-to-r ' + level.gradientFrom + ' ' + level.gradientTo + ' text-white hover:shadow-lg'">
                  <span *ngIf="selectedLevel() !== level.level">Ver Detalles</span>
                  <span *ngIf="selectedLevel() === level.level">Invertir Ahora →</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Detailed View -->
        <div *ngIf="selectedLevel()" class="animate-fadeIn">
          <div class="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-10 border border-slate-700 shadow-2xl">
            
            <!-- Header -->
            <div class="flex items-center justify-between mb-10">
              <div class="flex items-center space-x-4">
                <div class="w-16 h-16 rounded-full flex items-center justify-center text-4xl"
                     [style.background]="'linear-gradient(135deg, ' + getSelectedLevelData()?.color + '40, ' + getSelectedLevelData()?.color + '20)'">
                  {{ getSelectedLevelData()?.icon }}
                </div>
                <div>
                  <h2 class="text-3xl font-bold text-white mb-1">{{ getSelectedLevelData()?.name }}</h2>
                  <p class="text-slate-400">Nivel de Inversión</p>
                </div>
              </div>
              <button (click)="selectedLevel.set(null)"
                      class="p-3 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div class="p-6 bg-slate-900/50 rounded-xl border border-slate-700">
                <p class="text-slate-400 text-sm mb-2">Inversión Mínima</p>
                <p class="text-3xl font-bold text-white">\${{ getSelectedLevelData()?.minAmount | number:'1.0-0' }}</p>
              </div>
              <div class="p-6 bg-slate-900/50 rounded-xl border border-slate-700">
                <p class="text-slate-400 text-sm mb-2">Profundidad de Red</p>
                <p class="text-3xl font-bold text-white">{{ getSelectedLevelData()?.levels }} Niveles</p>
              </div>
              <div class="p-6 bg-slate-900/50 rounded-xl border border-slate-700">
                <p class="text-slate-400 text-sm mb-2">Tope Mensual</p>
                <p class="text-3xl font-bold" [style.color]="getSelectedLevelData()?.color">
                  \${{ getSelectedLevelData()?.topAmount | number:'1.0-0' }}+
                </p>
              </div>
            </div>

            <!-- Benefits -->
            <div class="mb-10">
              <h3 class="text-xl font-bold text-white mb-6 flex items-center">
                <span class="mr-3">✨</span> Beneficios Exclusivos
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex items-start space-x-4 p-5 bg-slate-900/30 rounded-xl border border-slate-700">
                  <div class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                       [style.background]="'linear-gradient(135deg, ' + getSelectedLevelData()?.color + '40, ' + getSelectedLevelData()?.color + '20)'">
                    <span class="text-2xl">💰</span>
                  </div>
                  <div>
                    <h4 class="font-semibold text-white mb-1">Comisiones Mensuales</h4>
                    <p class="text-sm text-slate-400">Gana hasta \${{ getSelectedLevelData()?.topAmount | number:'1.0-0' }} mensuales en comisiones por red</p>
                  </div>
                </div>

                <div class="flex items-start space-x-4 p-5 bg-slate-900/30 rounded-xl border border-slate-700">
                  <div class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                       [style.background]="'linear-gradient(135deg, ' + getSelectedLevelData()?.color + '40, ' + getSelectedLevelData()?.color + '20)'">
                    <span class="text-2xl">🔗</span>
                  </div>
                  <div>
                    <h4 class="font-semibold text-white mb-1">Red Unilevel</h4>
                    <p class="text-sm text-slate-400">Acceso a {{ getSelectedLevelData()?.levels }} niveles de profundidad en tu red</p>
                  </div>
                </div>

                <div class="flex items-start space-x-4 p-5 bg-slate-900/30 rounded-xl border border-slate-700">
                  <div class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                       [style.background]="'linear-gradient(135deg, ' + getSelectedLevelData()?.color + '40, ' + getSelectedLevelData()?.color + '20)'">
                    <span class="text-2xl">📈</span>
                  </div>
                  <div>
                    <h4 class="font-semibold text-white mb-1">Retornos Garantizados</h4>
                    <p class="text-sm text-slate-400">Retornos mensuales sobre tu inversión principal</p>
                  </div>
                </div>

                <div class="flex items-start space-x-4 p-5 bg-slate-900/30 rounded-xl border border-slate-700">
                  <div class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                       [style.background]="'linear-gradient(135deg, ' + getSelectedLevelData()?.color + '40, ' + getSelectedLevelData()?.color + '20)'">
                    <span class="text-2xl">📞</span>
                  </div>
                  <div>
                    <h4 class="font-semibold text-white mb-1">Soporte Premium</h4>
                    <p class="text-sm text-slate-400">Asesor dedicado disponible 24/7 para todas tus consultas</p>
                  </div>
                </div>

                <div class="flex items-start space-x-4 p-5 bg-slate-900/30 rounded-xl border border-slate-700">
                  <div class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                       [style.background]="'linear-gradient(135deg, ' + getSelectedLevelData()?.color + '40, ' + getSelectedLevelData()?.color + '20)'">
                    <span class="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h4 class="font-semibold text-white mb-1">Oportunidades Exclusivas</h4>
                    <p class="text-sm text-slate-400">Acceso prioritario a nuevas inversiones y ofertas</p>
                  </div>
                </div>

                <div class="flex items-start space-x-4 p-5 bg-slate-900/30 rounded-xl border border-slate-700">
                  <div class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                       [style.background]="'linear-gradient(135deg, ' + getSelectedLevelData()?.color + '40, ' + getSelectedLevelData()?.color + '20)'">
                    <span class="text-2xl">🔒</span>
                  </div>
                  <div>
                    <h4 class="font-semibold text-white mb-1">Seguridad Garantizada</h4>
                    <p class="text-sm text-slate-400">Tu inversión respaldada por contratos inteligentes</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- CTA -->
            <div class="flex gap-4">
              <button (click)="selectedLevel.set(null)"
                      class="flex-1 px-8 py-4 bg-slate-700 text-white rounded-xl font-semibold hover:bg-slate-600 transition-colors">
                Ver Otros Niveles
              </button>
              <button (click)="investInLevel(selectedLevel()!)"
                      class="flex-1 px-8 py-4 rounded-xl font-semibold text-white text-lg transition-all duration-300 hover:shadow-lg"
                      [style.background]="'linear-gradient(135deg, ' + getSelectedLevelData()?.color + ', ' + getSelectedLevelData()?.color + 'dd)'"
                      [style.box-shadow]="'0 10px 40px ' + getSelectedLevelData()?.color + '40'">
                Invertir en {{ getSelectedLevelData()?.name }} →
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

    .scale-102 {
      transform: scale(1.02);
    }
  `]
})
export class InvestmentLevelsComponent implements OnInit {
  private investmentService = inject(InvestmentService);
  private authService = inject(AuthService);
  private router = inject(Router);

  selectedLevel = signal<InvestmentLevel | null>(null);

  levels = signal([
    {
      level: 'BRONCE' as InvestmentLevel,
      name: 'Bronce',
      icon: '🥉',
      minAmount: 10,
      maxAmount: 99,
      levels: 3,
      topAmount: 150,
      color: '#CD7F32',
      gradientFrom: 'from-amber-700',
      gradientTo: 'to-orange-600',
      ringColor: 'ring-amber-500/50'
    },
    {
      level: 'PLATA' as InvestmentLevel,
      name: 'Plata',
      icon: '🥈',
      minAmount: 100,
      maxAmount: 499,
      levels: 5,
      topAmount: 750,
      color: '#C0C0C0',
      gradientFrom: 'from-slate-400',
      gradientTo: 'to-slate-500',
      ringColor: 'ring-slate-400/50'
    },
    {
      level: 'ORO' as InvestmentLevel,
      name: 'Oro',
      icon: '🥇',
      minAmount: 500,
      maxAmount: 4999,
      levels: 7,
      topAmount: 5000,
      color: '#FFD700',
      gradientFrom: 'from-yellow-500',
      gradientTo: 'to-yellow-600',
      ringColor: 'ring-yellow-500/50'
    },
    {
      level: 'PLATINO' as InvestmentLevel,
      name: 'Platino',
      icon: '💎',
      minAmount: 5000,
      maxAmount: Infinity,
      levels: 10,
      topAmount: 100000,
      color: '#00F0FF',
      gradientFrom: 'from-cyan-500',
      gradientTo: 'to-blue-500',
      ringColor: 'ring-cyan-500/50'
    }
  ]);

  ngOnInit() {
    // Initialize if needed
  }

  selectLevel(level: InvestmentLevel) {
    this.selectedLevel.set(level);
  }

  getSelectedLevelData() {
    return this.levels().find(l => l.level === this.selectedLevel());
  }

  investInLevel(level: InvestmentLevel) {
    this.router.navigate(['/invest']);
  }
}
