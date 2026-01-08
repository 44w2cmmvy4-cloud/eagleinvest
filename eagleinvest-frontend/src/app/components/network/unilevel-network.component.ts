import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UnilevelService, UnilevelLevel, UnilevelMember, NetworkTree } from '../../services/unilevel.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-unilevel-network',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen" style="background: linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);">
      
      <!-- Loading State -->
      <div *ngIf="isLoading()" class="flex items-center justify-center min-h-screen">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent"></div>
          <p class="text-white text-lg mt-4 font-medium">Cargando tu red...</p>
        </div>
      </div>

      <!-- Content -->
      <div *ngIf="!isLoading()" class="container mx-auto px-4 py-8 max-w-7xl">
        
        <!-- Header -->
        <div class="text-center mb-10">
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mb-4 shadow-lg shadow-blue-500/50">
            <span class="text-4xl">🌐</span>
          </div>
          <h1 class="text-4xl font-bold text-white mb-2">Mi Red Unilevel</h1>
          <p class="text-slate-400 text-lg">Visualiza tu red y ganancias generadas</p>
        </div>

        <!-- Stats Card -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <div class="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl">
            <p class="text-blue-100 text-sm mb-1">Tu Nivel</p>
            <p class="text-4xl font-bold text-white mb-1">{{ userLevel() }}</p>
            <p class="text-blue-200 text-sm">{{ getLevelIcon(userLevel()) }}</p>
          </div>
          
          <div class="p-6 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 shadow-xl">
            <p class="text-slate-400 text-sm mb-1">Total Invertido</p>
            <p class="text-3xl font-bold text-white">\${{ totalInvested() }}</p>
          </div>
          
          <div class="p-6 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 shadow-xl">
            <p class="text-slate-400 text-sm mb-1">Red Activa</p>
            <p class="text-3xl font-bold text-white">{{ networkCount() }}</p>
            <p class="text-slate-400 text-sm">personas</p>
          </div>
          
          <div class="p-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl">
            <p class="text-green-100 text-sm mb-1">Comisiones del Mes</p>
            <p class="text-3xl font-bold text-white">\${{ monthlyEarnings() }}</p>
            <p class="text-green-200 text-sm">Tope: \${{ monthlyTop() }}</p>
          </div>
        </div>

        <!-- Level Benefits -->
        <div class="mb-10">
          <h2 class="text-2xl font-bold text-white mb-6 flex items-center">
            <span class="mr-3">📊</span> Niveles y Beneficios
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div *ngFor="let level of allLevels()" 
                 class="p-6 rounded-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
                 [class]="level.level === userLevel() ? 
                          'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500 shadow-lg shadow-cyan-500/30' : 
                          'bg-slate-800/50 backdrop-blur-sm border border-slate-700'">
              <div class="text-center">
                <div class="text-4xl mb-3">{{ getLevelIcon(level.level) }}</div>
                <h3 class="text-xl font-bold mb-2" 
                    [class]="level.level === userLevel() ? 'text-cyan-400' : 'text-white'">
                  {{ level.level }}
                </h3>
                <div class="space-y-2 text-sm">
                  <div class="text-slate-400">
                    <span class="font-mono text-white">\${{ level.rangeMin | number:'1.0-0' }}</span>
                    - 
                    <span class="font-mono text-white">{{ level.rangeMax === 999999 ? '∞' : ('\$' + (level.rangeMax | number:'1.0-0')) }}</span>
                  </div>
                  <div class="py-2 px-3 bg-slate-900/50 rounded-lg">
                    <div class="text-slate-400 text-xs mb-1">Profundidad Red</div>
                    <div class="text-white font-bold">{{ level.networkLevels }} niveles</div>
                  </div>
                  <div class="text-slate-400 text-xs">
                    Tope mensual: <span class="text-white font-semibold">\${{ level.topAmount }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Commission Structure -->
        <div class="mb-10">
          <h2 class="text-2xl font-bold text-white mb-6 flex items-center">
            <span class="mr-3">💰</span> Estructura de Comisiones
          </h2>
          
          <div class="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
            <div class="grid grid-cols-5 gap-3 mb-4">
              <div *ngFor="let level of [1,2,3,4,5]" 
                   class="p-4 rounded-xl text-center transition-all"
                   [class]="level <= getLevelNetworkDepth() ? 
                            'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30' : 
                            'bg-slate-700/30 border border-slate-600'">
                <div class="text-2xl font-bold mb-1" 
                     [class]="level <= getLevelNetworkDepth() ? 'text-cyan-400' : 'text-slate-500'">
                  {{ getCommissionPercentage(level) }}%
                </div>
                <div class="text-xs" 
                     [class]="level <= getLevelNetworkDepth() ? 'text-white' : 'text-slate-500'">
                  Nivel {{ level }}
                </div>
                <div *ngIf="level > getLevelNetworkDepth()" class="text-xs text-red-400 mt-1">🔒</div>
              </div>
            </div>
            
            <div class="grid grid-cols-5 gap-3">
              <div *ngFor="let level of [6,7,8,9,10]" 
                   class="p-4 rounded-xl text-center transition-all"
                   [class]="level <= getLevelNetworkDepth() ? 
                            'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30' : 
                            'bg-slate-700/30 border border-slate-600'">
                <div class="text-2xl font-bold mb-1" 
                     [class]="level <= getLevelNetworkDepth() ? 'text-cyan-400' : 'text-slate-500'">
                  {{ getCommissionPercentage(level) }}%
                </div>
                <div class="text-xs" 
                     [class]="level <= getLevelNetworkDepth() ? 'text-white' : 'text-slate-500'">
                  Nivel {{ level }}
                </div>
                <div *ngIf="level > getLevelNetworkDepth()" class="text-xs text-red-400 mt-1">🔒</div>
              </div>
            </div>

            <div class="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <div class="flex items-start space-x-3">
                <svg class="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-yellow-400 text-sm">
                  <strong>Tip:</strong> Aumenta tu inversión para desbloquear niveles más profundos y ganar más comisiones.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Network Tree -->
        <div class="mb-10">
          <h2 class="text-2xl font-bold text-white mb-6 flex items-center">
            <span class="mr-3">🌳</span> Tu Red de Referidos
          </h2>
          
          <div class="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
            <!-- You -->
            <div class="flex justify-center mb-8">
              <div class="relative">
                <div class="p-6 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl shadow-lg shadow-cyan-500/50">
                  <div class="text-center">
                    <div class="text-3xl mb-2">👤</div>
                    <div class="font-bold text-white text-lg">TÚ</div>
                    <div class="text-sm text-cyan-100">{{ userLevel() }}</div>
                  </div>
                </div>
                <div class="absolute top-full left-1/2 -translate-x-1/2 w-px h-8 bg-slate-600"></div>
              </div>
            </div>

            <!-- Direct Referrals -->
            <div *ngIf="level1Members().length > 0" class="mb-8">
              <div class="text-center mb-4">
                <span class="px-4 py-2 bg-slate-700 rounded-full text-slate-300 text-sm font-medium">Nivel 1 - Directos</span>
              </div>
              <div class="flex justify-center gap-4 flex-wrap">
                <div *ngFor="let member of level1Members()" 
                     class="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl text-center min-w-[140px] hover:scale-105 transition-transform">
                  <div class="text-2xl mb-2">👥</div>
                  <div class="font-semibold text-white text-sm mb-1">{{ member.firstName }}</div>
                  <div class="text-xs text-slate-400 mb-2">{{ member.currentLevel }}</div>
                  <div class="text-xs font-bold text-blue-400">\${{ member.totalInvested }}</div>
                </div>
              </div>
            </div>

            <!-- Deeper Levels -->
            <div *ngIf="networkCount() > level1Members().length" class="text-center">
              <div class="inline-block p-8 bg-slate-700/30 rounded-2xl border border-slate-600">
                <div class="text-5xl font-bold text-white mb-2">{{ networkCount() - level1Members().length }}</div>
                <p class="text-slate-400 mb-4">Miembros en niveles 2-{{ getLevelNetworkDepth() }}</p>
                <button class="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300">
                  Ver Árbol Completo
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Commissions -->
        <div>
          <h2 class="text-2xl font-bold text-white mb-6 flex items-center">
            <span class="mr-3">📈</span> Comisiones Recientes
          </h2>
          
          <div class="bg-slate-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-700">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="bg-slate-900/50">
                    <th class="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Fecha</th>
                    <th class="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Usuario</th>
                    <th class="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Nivel</th>
                    <th class="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Inversión</th>
                    <th class="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">%</th>
                    <th class="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Comisión</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-700">
                  <tr *ngFor="let commission of recentCommissions()" class="hover:bg-slate-700/30 transition-colors">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {{ commission.date | date:'short' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {{ commission.fromUser }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                      <span class="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs font-semibold">
                        Nivel {{ commission.networkLevel }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      \${{ commission.investmentAmount }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {{ commission.percentage }}%
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-400">
                      +\${{ commission.commission }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="px-6 py-4 bg-slate-900/30 flex justify-between items-center">
              <div class="text-sm text-slate-400">
                Mostrando {{ recentCommissions().length }} comisiones recientes
              </div>
              <button class="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm font-medium">
                Ver Historial Completo
              </button>
            </div>
          </div>
        </div>

        <!-- Level Up Card -->
        <div *ngIf="canAdvanceToNextLevel()" class="mt-10">
          <div class="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 shadow-xl">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-3 mb-3">
                  <span class="text-5xl">🎉</span>
                  <h3 class="text-3xl font-bold text-white">¡Puedes Avanzar de Nivel!</h3>
                </div>
                <p class="text-green-100 text-lg mb-4">
                  Has alcanzado el monto necesario para avanzar a <strong class="text-white">{{ nextLevel() }}</strong>
                </p>
                <div class="flex items-center space-x-6">
                  <div>
                    <div class="text-green-100 text-sm mb-1">Necesitas</div>
                    <div class="text-3xl font-bold text-white">\${{ nextLevelRequirement() }}</div>
                  </div>
                  <div class="text-3xl text-green-200">→</div>
                  <div>
                    <div class="text-green-100 text-sm mb-1">Tienes</div>
                    <div class="text-3xl font-bold text-white">\${{ totalInvested() }}</div>
                  </div>
                </div>
              </div>
              <button class="px-8 py-4 bg-white text-green-600 rounded-xl font-bold text-lg hover:bg-green-50 transition-colors shadow-lg ml-6">
                Avanzar Ahora →
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    
    .animate-spin {
      animation: spin 1s linear infinite;
    }
  `]
})
export class UnilevelNetworkComponent implements OnInit {
  isLoading = signal(true);
  userLevel = signal<UnilevelLevel>('PLATA');
  totalInvested = signal(450);
  networkCount = signal(24);
  monthlyEarnings = signal(185.50);
  monthlyTop = signal(750);
  
  allLevels = signal<any[]>([]);
  level1Members = signal<UnilevelMember[]>([]);
  recentCommissions = signal<any[]>([]);

  constructor(
    private unilevelService: UnilevelService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadUserData();
    this.loadLevelRules();
    this.loadNetwork();
    this.loadCommissions();
  }

  loadUserData() {
    const user = this.authService.getCurrentUser();
    if (user) {
      setTimeout(() => {
        this.userLevel.set('PLATA');
        this.totalInvested.set(450);
        this.networkCount.set(24);
        this.monthlyEarnings.set(185.50);
        this.isLoading.set(false);
      }, 800);
    } else {
      this.isLoading.set(false);
    }
  }

  loadLevelRules() {
    this.allLevels.set(this.unilevelService.getAllLevelRules());
  }

  loadNetwork() {
    this.level1Members.set([
      { userId: '1', email: 'user1@example.com', firstName: 'Juan', lastName: 'Pérez', sponsorId: 'me', currentLevel: 'BRONCE', networkLevel: 1, totalInvested: 50, joinDate: new Date(), isActive: true },
      { userId: '2', email: 'user2@example.com', firstName: 'María', lastName: 'García', sponsorId: 'me', currentLevel: 'PLATA', networkLevel: 1, totalInvested: 200, joinDate: new Date(), isActive: true },
      { userId: '3', email: 'user3@example.com', firstName: 'Carlos', lastName: 'López', sponsorId: 'me', currentLevel: 'BRONCE', networkLevel: 1, totalInvested: 75, joinDate: new Date(), isActive: true },
    ]);
  }

  loadCommissions() {
    this.recentCommissions.set([
      { date: new Date(), fromUser: 'Juan P.', networkLevel: 1, investmentAmount: 50, percentage: 10, commission: 5 },
      { date: new Date(), fromUser: 'María G.', networkLevel: 1, investmentAmount: 200, percentage: 10, commission: 20 },
      { date: new Date(), fromUser: 'Pedro M.', networkLevel: 2, investmentAmount: 100, percentage: 5, commission: 5 },
      { date: new Date(), fromUser: 'Ana R.', networkLevel: 3, investmentAmount: 150, percentage: 3, commission: 4.5 },
    ]);
  }

  getLevelIcon(level: UnilevelLevel): string {
    const icons = {
      'BRONCE': '🥉',
      'PLATA': '🥈',
      'ORO': '🥇',
      'PLATINO': '💎'
    };
    return icons[level] || '⭐';
  }

  getLevelNetworkDepth(): number {
    const rules = this.unilevelService.getLevelRules(this.userLevel());
    return rules.networkLevels;
  }

  getCommissionPercentage(level: number): number {
    const percentages: Record<number, number> = {
      1: 10, 2: 5, 3: 3, 4: 2, 5: 2, 6: 1, 7: 1, 8: 1, 9: 0.5, 10: 0.5
    };
    return percentages[level] || 0;
  }

  canAdvanceToNextLevel(): boolean {
    const levels: UnilevelLevel[] = ['BRONCE', 'PLATA', 'ORO', 'PLATINO'];
    const currentIndex = levels.indexOf(this.userLevel());
    if (currentIndex === levels.length - 1) return false;
    
    const nextLevelRules = this.unilevelService.getLevelRules(levels[currentIndex + 1]);
    return this.totalInvested() >= nextLevelRules.rangeMin;
  }

  nextLevel(): UnilevelLevel {
    const levels: UnilevelLevel[] = ['BRONCE', 'PLATA', 'ORO', 'PLATINO'];
    const currentIndex = levels.indexOf(this.userLevel());
    return levels[currentIndex + 1] || 'PLATINO';
  }

  nextLevelRequirement(): number {
    const nextLevelRules = this.unilevelService.getLevelRules(this.nextLevel());
    return nextLevelRules.rangeMin;
  }
}
