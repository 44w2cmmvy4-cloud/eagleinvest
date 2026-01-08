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
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4">
      <div class="max-w-7xl mx-auto">
        
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-white mb-2">🌐 Mi Red Unilevel</h1>
          <p class="text-gray-300">Visualiza tu red y comisiones generadas</p>
        </div>

        <!-- User Level Card -->
        <div class="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-xl p-6 mb-8 text-white">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div class="text-sm opacity-80">Tu Nivel</div>
              <div class="text-3xl font-bold">{{ userLevel() }}</div>
              <div class="text-xs mt-1">{{ getLevelIcon(userLevel()) }}</div>
            </div>
            <div>
              <div class="text-sm opacity-80">Total Invertido</div>
              <div class="text-2xl font-bold">\${{ totalInvested() }}</div>
            </div>
            <div>
              <div class="text-sm opacity-80">Red Activa</div>
              <div class="text-2xl font-bold">{{ networkCount() }} personas</div>
            </div>
            <div>
              <div class="text-sm opacity-80">Comisiones del Mes</div>
              <div class="text-2xl font-bold text-green-300">\${{ monthlyEarnings() }}</div>
              <div class="text-xs mt-1">Tope: \${{ monthlyTop() }}</div>
            </div>
          </div>
        </div>

        <!-- Level Rules -->
        <div class="bg-white rounded-lg shadow-xl p-6 mb-8">
          <h2 class="text-2xl font-bold mb-6">📊 Reglas por Nivel</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div 
              *ngFor="let level of allLevels()"
              [class.ring-4]="level.level === userLevel()"
              [class.ring-purple-500]="level.level === userLevel()"
              class="border-2 rounded-lg p-4"
              [style.border-color]="level.color">
              <div class="text-center">
                <div class="text-3xl mb-2">{{ getLevelIcon(level.level) }}</div>
                <h3 class="font-bold text-lg" [style.color]="level.color">{{ level.level }}</h3>
                <div class="text-sm text-gray-600 mt-2">
                  <div>\${{ level.rangeMin }} - \${{ level.rangeMax === 999999 ? '∞' : level.rangeMax }}</div>
                  <div class="font-semibold mt-2">Red: {{ level.networkLevels }} niveles</div>
                  <div class="text-xs">Tope: \${{ level.topAmount }}{{ level.topAmount >= 5000 ? '+' : '' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Commission Breakdown -->
        <div class="bg-white rounded-lg shadow-xl p-6 mb-8">
          <h2 class="text-2xl font-bold mb-6">💰 Comisiones por Nivel de Red</h2>
          
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div *ngFor="let level of [1,2,3,4,5,6,7,8,9,10]" class="text-center p-4 rounded-lg"
                 [class.bg-purple-50]="level <= getLevelNetworkDepth()"
                 [class.bg-gray-100]="level > getLevelNetworkDepth()">
              <div class="text-2xl font-bold" 
                   [class.text-purple-600]="level <= getLevelNetworkDepth()"
                   [class.text-gray-400]="level > getLevelNetworkDepth()">
                {{ getCommissionPercentage(level) }}%
              </div>
              <div class="text-sm" 
                   [class.text-gray-700]="level <= getLevelNetworkDepth()"
                   [class.text-gray-400]="level > getLevelNetworkDepth()">
                Nivel {{ level }}
              </div>
              <div *ngIf="level > getLevelNetworkDepth()" class="text-xs text-red-500 mt-1">
                🔒 Bloqueado
              </div>
            </div>
          </div>
          
          <div class="mt-4 p-4 bg-yellow-50 rounded-lg">
            <p class="text-sm text-yellow-800">
              💡 <strong>Tip:</strong> Aumenta tu nivel invirtiendo más para desbloquear comisiones de niveles más profundos.
            </p>
          </div>
        </div>

        <!-- Network Tree Visualization -->
        <div class="bg-white rounded-lg shadow-xl p-6 mb-8">
          <h2 class="text-2xl font-bold mb-6">🌳 Árbol de Red</h2>
          
          <div class="overflow-x-auto">
            <!-- Level 0: You -->
            <div class="flex justify-center mb-8">
              <div class="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-4 shadow-lg">
                <div class="text-center">
                  <div class="text-2xl mb-1">👤</div>
                  <div class="font-bold">TÚ</div>
                  <div class="text-xs opacity-80">{{ userLevel() }}</div>
                </div>
              </div>
            </div>

            <!-- Level 1: Direct Referrals -->
            <div class="flex justify-center gap-4 mb-8 flex-wrap">
              <div *ngFor="let member of level1Members()" 
                   class="bg-blue-100 border-2 border-blue-500 rounded-lg p-3 text-center min-w-[120px]">
                <div class="text-xl mb-1">👥</div>
                <div class="font-semibold text-sm">{{ member.firstName }}</div>
                <div class="text-xs text-gray-600">Nivel 1</div>
                <div class="text-xs font-bold text-blue-600">\${{ member.totalInvested }}</div>
              </div>
            </div>

            <!-- Level 2-10: Nested Network -->
            <div class="text-center">
              <div class="inline-block bg-gray-100 rounded-lg p-4">
                <div class="text-4xl font-bold text-gray-700">{{ networkCount() - level1Members().length }}</div>
                <div class="text-sm text-gray-600 mt-2">Miembros en niveles 2-{{ getLevelNetworkDepth() }}</div>
                <button class="mt-3 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm">
                  Ver Árbol Completo
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Commissions -->
        <div class="bg-white rounded-lg shadow-xl p-6">
          <h2 class="text-2xl font-bold mb-6">📈 Comisiones Recientes</h2>
          
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">De</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nivel</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inversión</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">%</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comisión</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr *ngFor="let commission of recentCommissions()" class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm">{{ commission.date | date:'short' }}</td>
                  <td class="px-4 py-3 text-sm font-medium">{{ commission.fromUser }}</td>
                  <td class="px-4 py-3 text-sm">
                    <span class="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                      Nivel {{ commission.networkLevel }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm">\${{ commission.investmentAmount }}</td>
                  <td class="px-4 py-3 text-sm">{{ commission.percentage }}%</td>
                  <td class="px-4 py-3 text-sm font-bold text-green-600">\${{ commission.commission }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-6 flex justify-between items-center">
            <div class="text-sm text-gray-600">
              Mostrando {{ recentCommissions().length }} de {{ recentCommissions().length }}
            </div>
            <button class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm">
              Ver Todas
            </button>
          </div>
        </div>

        <!-- Level Advancement Card -->
        <div *ngIf="canAdvanceToNextLevel()" class="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-xl p-6 mt-8 text-white">
          <h3 class="text-2xl font-bold mb-4">🎉 ¡Puedes Avanzar de Nivel!</h3>
          <p class="mb-4">
            Has alcanzado el monto necesario para avanzar a <strong>{{ nextLevel() }}</strong>
          </p>
          <div class="flex gap-4 items-center">
            <div class="flex-1">
              <div class="text-sm opacity-80">Necesitas</div>
              <div class="text-2xl font-bold">\${{ nextLevelRequirement() }}</div>
            </div>
            <div class="flex-1">
              <div class="text-sm opacity-80">Tienes</div>
              <div class="text-2xl font-bold">\${{ totalInvested() }}</div>
            </div>
            <button class="px-6 py-3 bg-white text-green-600 rounded-lg hover:bg-gray-100 font-semibold">
              Avanzar Ahora
            </button>
          </div>
        </div>

      </div>
    </div>
  `
})
export class UnilevelNetworkComponent implements OnInit {
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
      // Simulate API call
      this.userLevel.set('PLATA');
      this.totalInvested.set(450);
      this.networkCount.set(24);
      this.monthlyEarnings.set(185.50);
    }
  }

  loadLevelRules() {
    this.allLevels.set(this.unilevelService.getAllLevelRules());
  }

  loadNetwork() {
    // Simulate loading network members
    this.level1Members.set([
      { userId: '1', email: 'user1@example.com', firstName: 'Juan', lastName: 'Pérez', sponsorId: 'me', currentLevel: 'BRONCE', networkLevel: 1, totalInvested: 50, joinDate: new Date(), isActive: true },
      { userId: '2', email: 'user2@example.com', firstName: 'María', lastName: 'García', sponsorId: 'me', currentLevel: 'PLATA', networkLevel: 1, totalInvested: 200, joinDate: new Date(), isActive: true },
      { userId: '3', email: 'user3@example.com', firstName: 'Carlos', lastName: 'López', sponsorId: 'me', currentLevel: 'BRONCE', networkLevel: 1, totalInvested: 75, joinDate: new Date(), isActive: true },
    ]);
  }

  loadCommissions() {
    // Simulate loading recent commissions
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
