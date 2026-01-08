import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UnilevelService, UnilevelLevel, UnilevelMember } from '../../services/unilevel.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-unilevel-network',
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
        <p class="mt-6 text-xl font-medium text-white animate-pulse">Cargando tu red...</p>
      </div>

      <!-- Content -->
      <div *ngIf="!isLoading()" class="container mx-auto px-4 py-12 max-w-7xl">
        
        <!-- Header -->
        <div class="text-center mb-16 animate-fadeIn">
          <div class="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 mb-8 shadow-2xl shadow-blue-500/20 ring-4 ring-slate-800 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
            <span class="text-5xl filter drop-shadow-md">🌐</span>
          </div>
          <h1 class="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Mi Red <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Unilevel</span>
          </h1>
          <p class="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed">
            Visualiza el crecimiento de tu equipo y gestiona tus ganancias por comisiones en tiempo real.
          </p>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 animate-fadeIn" style="animation-delay: 100ms;">
          <!-- Level Card -->
          <div class="relative overflow-hidden group p-6 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl hover:bg-slate-800/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span class="text-6xl">🏆</span>
            </div>
            <p class="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Tu Nivel Actual</p>
            <div class="flex items-end gap-3">
              <span class="text-4xl font-bold text-white">{{ userLevel() }}</span>
              <span class="text-3xl mb-1 filter drop-shadow-lg">{{ getLevelIcon(userLevel()) }}</span>
            </div>
            <div class="mt-4 h-1.5 w-full bg-slate-700/50 rounded-full overflow-hidden">
               <div class="h-full bg-gradient-to-r from-yellow-500 to-amber-600 w-3/4"></div>
            </div>
          </div>
          
          <!-- Invested Card -->
          <div class="relative overflow-hidden group p-6 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl hover:bg-slate-800/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span class="text-6xl">💎</span>
            </div>
            <p class="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Total Invertido</p>
            <p class="text-4xl font-bold text-white tracking-tight">\${{ totalInvested() | number:'1.0-0' }}</p>
            <p class="mt-2 text-xs text-green-400 font-medium flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
              Activo
            </p>
          </div>
          
          <!-- Network Size Card -->
          <div class="relative overflow-hidden group p-6 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl hover:bg-slate-800/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
            <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span class="text-6xl">👥</span>
            </div>
            <p class="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Red Activa</p>
            <div class="flex items-baseline gap-2">
              <p class="text-4xl font-bold text-white">{{ networkCount() }}</p>
              <span class="text-slate-500">miembros</span>
            </div>
            <div class="flex -space-x-2 mt-4">
              <div *ngFor="let i of [1,2,3,4]" class="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-xs">👤</div>
              <div *ngIf="networkCount() > 4" class="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-xs text-slate-400">+{{networkCount()-4}}</div>
            </div>
          </div>
          
          <!-- Commission Card -->
          <div class="relative overflow-hidden group p-6 bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-xl border border-green-500/30 rounded-3xl hover:bg-green-600/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-green-900/20">
            <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span class="text-6xl">💸</span>
            </div>
            <p class="text-green-300/80 text-sm font-medium uppercase tracking-wider mb-2">Comisiones (Mes)</p>
            <p class="text-4xl font-bold text-white tracking-tight">\${{ monthlyEarnings() | number:'1.2-2' }}</p>
            <div class="mt-3 inline-flex px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-xs text-green-300 font-medium">
              Tope: \${{ monthlyTop() | number:'1.0-0' }}
            </div>
          </div>
        </div>

        <!-- Structure & Benefits Section -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16 animate-fadeIn" style="animation-delay: 200ms;">
          
          <!-- Levels Info (Left Column) -->
          <div class="lg:col-span-2 space-y-8">
            <div class="flex items-center justify-between mb-4">
               <h2 class="text-2xl font-bold text-white flex items-center gap-3">
                <span class="bg-blue-500/20 p-2 rounded-lg">📊</span> Niveles y Beneficios
              </h2>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div *ngFor="let level of allLevels()" 
                   class="group relative p-6 rounded-2xl transition-all duration-300 cursor-default overflow-hidden"
                   [class]="level.level === userLevel() ? 
                            'bg-slate-800 border-2 border-blue-500 shadow-xl shadow-blue-500/20' : 
                            'bg-slate-800/40 border border-slate-700 hover:bg-slate-800/60'">
                
                <!-- Active Indicator -->
                <div *ngIf="level.level === userLevel()" class="absolute top-4 right-4 text-xs font-bold bg-blue-500 text-white px-3 py-1 rounded-full shadow-lg">
                  ACTUAL
                </div>

                <div class="flex items-center gap-4 mb-4">
                  <div class="text-4xl transform group-hover:scale-110 transition-transform duration-300">{{ getLevelIcon(level.level) }}</div>
                  <div>
                    <h3 class="text-lg font-bold text-white">{{ level.level }}</h3>
                    <div class="text-xs text-slate-400 font-mono">
                      \${{ level.rangeMin | number:'1.0-0' }} - {{ level.rangeMax === 999999 ? '∞' : '\$' + (level.rangeMax | number:'1.0-0') }}
                    </div>
                  </div>
                </div>

                <div class="space-y-2">
                  <div class="flex justify-between items-center text-sm p-2 rounded-lg bg-slate-900/50">
                    <span class="text-slate-400">Profundidad</span>
                    <span class="text-white font-bold">{{ level.networkLevels }} Niveles</span>
                  </div>
                  <div class="flex justify-between items-center text-sm p-2 rounded-lg bg-slate-900/50">
                    <span class="text-slate-400">Tope Mensual</span>
                    <span class="text-green-400 font-bold">\${{ level.topAmount | number:'1.0-0' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Commission Rates (Right Column) -->
          <div class="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 h-full">
            <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <span class="bg-green-500/20 p-2 rounded-lg text-lg">💰</span> Tasas de Comisión
            </h2>

            <div class="grid grid-cols-2 gap-3 mb-6">
              <div *ngFor="let level of [1,2,3,4,5,6,7,8,9,10]" 
                   class="relative p-3 rounded-xl border transition-colors flex items-center justify-between group"
                   [class]="level <= getLevelNetworkDepth() ? 
                            'bg-blue-500/10 border-blue-500/30' : 
                            'bg-slate-900/30 border-slate-800 opacity-60'">
                <span class="text-xs font-medium uppercase tracking-wider"
                      [class]="level <= getLevelNetworkDepth() ? 'text-blue-300' : 'text-slate-500'">
                  Nivel {{ level }}
                </span>
                <span class="font-bold text-lg"
                      [class]="level <= getLevelNetworkDepth() ? 'text-white' : 'text-slate-600'">
                  {{ getCommissionPercentage(level) }}%
                </span>
                
                <div *ngIf="level > getLevelNetworkDepth()" class="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span class="text-xs text-white font-bold bg-slate-800 px-2 py-1 rounded">Bloqueado</span>
                </div>
              </div>
            </div>

            <div class="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <p class="text-amber-200/80 text-xs leading-relaxed">
                <strong class="text-amber-400 block mb-1">💡 Pro Tip:</strong>
                Sube de nivel para desbloquear comisiones en niveles más profundos de tu red.
              </p>
            </div>
          </div>
        </div>

        <!-- Network Tree Visual -->
        <div class="bg-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 mb-16 animate-fadeIn" style="animation-delay: 300ms;">
          <h2 class="text-2xl font-bold text-white mb-8 flex items-center justify-center gap-3">
             <span class="text-3xl">🌳</span> Árbol de Referidos
          </h2>

          <div class="flex flex-col items-center">
            <!-- YOU Node -->
            <div class="relative z-10 mb-12">
              <div class="flex flex-col items-center">
                 <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl shadow-lg shadow-blue-500/50 ring-4 ring-slate-900 z-10">
                  👤
                </div>
                <div class="mt-3 text-center bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-700">
                  <p class="font-bold text-white text-sm">TÚ</p>
                  <p class="text-xs text-blue-400 font-medium">{{ userLevel() }}</p>
                </div>
              </div>
              <!-- Connector Line -->
              <div class="absolute top-20 left-1/2 -translate-x-1/2 w-0.5 h-16 bg-gradient-to-b from-blue-600 to-slate-700 -z-0"></div>
            </div>

            <!-- Direct Referrals Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
              <div *ngFor="let member of level1Members()" 
                   class="group bg-slate-800/50 border border-slate-700 rounded-2xl p-4 hover:bg-slate-800 hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center text-2xl group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-colors">
                    👥
                  </div>
                  <div class="overflow-hidden">
                    <h4 class="font-bold text-white truncate">{{ member.firstName }}</h4>
                    <p class="text-xs text-slate-400">Nivel {{ member.currentLevel }}</p>
                  </div>
                </div>
                <div class="mt-4 pt-4 border-t border-slate-700/50 flex justify-between items-center">
                  <span class="text-xs text-slate-500">Inversión</span>
                  <span class="text-sm font-bold text-blue-400">\${{ member.totalInvested }}</span>
                </div>
              </div>
              
              <!-- More Members Placeholder -->
               <div *ngIf="networkCount() > level1Members().length" 
                    class="bg-slate-800/30 border-2 border-dashed border-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center hover:bg-slate-800/50 hover:border-slate-600 transition-colors cursor-pointer group">
                  <div class="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-400 mb-2 group-hover:text-white transition-colors">
                    +{{ networkCount() - level1Members().length }}
                  </div>
                  <span class="text-sm text-slate-400 font-medium group-hover:text-white">Ver Resto</span>
               </div>
            </div>
          </div>
        </div>

        <!-- Recent Commissions Table -->
        <div class="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden animate-fadeIn" style="animation-delay: 400ms;">
          <div class="p-6 border-b border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 class="text-xl font-bold text-white flex items-center gap-2">
              <span class="bg-purple-500/20 p-1.5 rounded-lg text-base">🕒</span> Historial Reciente
            </h2>
            <button class="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-colors">
              Ver Todo
            </button>
          </div>
          
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                  <th class="px-6 py-4 font-semibold">Fecha</th>
                  <th class="px-6 py-4 font-semibold">Usuario</th>
                  <th class="px-6 py-4 font-semibold">Nivel Red</th>
                  <th class="px-6 py-4 font-semibold text-right">Inversión</th>
                  <th class="px-6 py-4 font-semibold text-center">%</th>
                  <th class="px-6 py-4 font-semibold text-right text-green-400">Comisión</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-700/50">
                <tr *ngFor="let comm of recentCommissions()" class="hover:bg-slate-700/20 transition-colors">
                  <td class="px-6 py-4 text-sm text-slate-400">{{ comm.date | date:'dd MMM yyyy' }}</td>
                  <td class="px-6 py-4 text-sm">
                    <span class="text-white font-medium">{{ comm.fromUser }}</span>
                  </td>
                  <td class="px-6 py-4 text-sm">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
                      Nivel {{ comm.networkLevel }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-right text-slate-300 font-mono">
                    \${{ comm.investmentAmount }}
                  </td>
                  <td class="px-6 py-4 text-sm text-center text-slate-400">
                    {{ comm.percentage }}%
                  </td>
                  <td class="px-6 py-4 text-sm text-right font-bold text-green-400 font-mono">
                    +\${{ comm.commission }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
      opacity: 0; 
    }
  `]
})
export class UnilevelNetworkComponent implements OnInit {
  private unilevelService = inject(UnilevelService);
  private authService = inject(AuthService);

  isLoading = signal(true);
  
  // Stats
  userLevel = signal<UnilevelLevel>('PLATA');
  totalInvested = signal(450);
  networkCount = signal(24);
  monthlyEarnings = signal(185.50);
  monthlyTop = signal(750);
  
  // Data Lists
  allLevels = signal<any[]>([]);
  level1Members = signal<UnilevelMember[]>([]);
  recentCommissions = signal<any[]>([]);

  ngOnInit() {
    this.initialDataLoad();
  }

  initialDataLoad() {
    // Simulate Data Loading
    setTimeout(() => {
      this.userLevel.set('PLATA');
      this.totalInvested.set(450);
      this.networkCount.set(24);
      this.monthlyEarnings.set(185.50);
      this.monthlyTop.set(750);
      
      this.loadLevelRules();
      this.loadNetwork();
      this.loadCommissions();
      
      this.isLoading.set(false);
    }, 1200);
  }

  loadLevelRules() {
    this.allLevels.set(this.unilevelService.getAllLevelRules());
  }

  loadNetwork() {
    // Mock Data
    this.level1Members.set([
      { userId: '1', email: 'user1@example.pt', firstName: 'Juan Pérez', lastName: '', sponsorId: 'me', currentLevel: 'BRONCE', networkLevel: 1, totalInvested: 150, joinDate: new Date(), isActive: true },
      { userId: '2', email: 'user2@example.pt', firstName: 'María González', lastName: '', sponsorId: 'me', currentLevel: 'PLATA', networkLevel: 1, totalInvested: 500, joinDate: new Date(), isActive: true },
      { userId: '3', email: 'user3@example.pt', firstName: 'Carlos Silva', lastName: '', sponsorId: 'me', currentLevel: 'BRONCE', networkLevel: 1, totalInvested: 50, joinDate: new Date(), isActive: true },
       { userId: '4', email: 'user4@example.pt', firstName: 'Luis Mendoza', lastName: '', sponsorId: 'me', currentLevel: 'BRONCE', networkLevel: 1, totalInvested: 80, joinDate: new Date(), isActive: true }
    ]);
  }

  loadCommissions() {
    this.recentCommissions.set([
      { date: new Date(), fromUser: 'Juan Pérez', networkLevel: 1, investmentAmount: 150, percentage: 10, commission: 15 },
      { date: new Date(Date.now() - 86400000), fromUser: 'María González', networkLevel: 1, investmentAmount: 500, percentage: 10, commission: 50 },
      { date: new Date(Date.now() - 172800000), fromUser: 'Pedro (N2)', networkLevel: 2, investmentAmount: 200, percentage: 5, commission: 10 },
    ]);
  }

  getLevelIcon(level: UnilevelLevel): string {
    const icons: Record<string, string> = {
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
}
