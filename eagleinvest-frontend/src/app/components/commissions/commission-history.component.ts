import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UnilevelService } from '../../services/unilevel.service';
import { AuthService } from '../../services/auth.service';

interface Commission {
  id: number;
  date: string;
  fromUserId: number;
  fromUserName: string;
  level: number;
  amount: number;
  percentage: number;
  investmentAmount: number;
  status: 'pending' | 'paid' | 'cancelled';
}

interface MonthlyTotal {
  month: string;
  total: number;
  count: number;
}

@Component({
  selector: 'app-commission-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-white mb-2">Historial de Comisiones</h1>
          <p class="text-gray-400">Todas tus comisiones y ganancias de red</p>
        </div>

        <!-- Estadísticas Resumen -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div class="flex items-center justify-between mb-2">
              <span class="text-gray-400 text-sm">Total Ganado</span>
              <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="text-2xl font-bold text-white">\${{ totalEarned().toFixed(2) }}</div>
          </div>

          <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div class="flex items-center justify-between mb-2">
              <span class="text-gray-400 text-sm">Este Mes</span>
              <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <div class="text-2xl font-bold text-white">\${{ monthlyEarned().toFixed(2) }}</div>
          </div>

          <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div class="flex items-center justify-between mb-2">
              <span class="text-gray-400 text-sm">Pendientes</span>
              <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="text-2xl font-bold text-white">\${{ pendingAmount().toFixed(2) }}</div>
          </div>

          <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div class="flex items-center justify-between mb-2">
              <span class="text-gray-400 text-sm">Total Comisiones</span>
              <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div class="text-2xl font-bold text-white">{{ commissions().length }}</div>
          </div>
        </div>

        <!-- Filtros -->
        <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-gray-400 text-sm mb-2">Período</label>
              <select [(ngModel)]="selectedPeriod" (ngModelChange)="filterCommissions()" 
                      class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">Todos</option>
                <option value="month">Este mes</option>
                <option value="quarter">Último trimestre</option>
                <option value="year">Este año</option>
              </select>
            </div>

            <div>
              <label class="block text-gray-400 text-sm mb-2">Estado</label>
              <select [(ngModel)]="selectedStatus" (ngModelChange)="filterCommissions()" 
                      class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">Todos</option>
                <option value="paid">Pagadas</option>
                <option value="pending">Pendientes</option>
                <option value="cancelled">Canceladas</option>
              </select>
            </div>

            <div>
              <label class="block text-gray-400 text-sm mb-2">Nivel</label>
              <select [(ngModel)]="selectedLevel" (ngModelChange)="filterCommissions()" 
                      class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">Todos</option>
                <option value="1">Nivel 1</option>
                <option value="2">Nivel 2</option>
                <option value="3">Nivel 3</option>
                <option value="4">Nivel 4</option>
                <option value="5">Nivel 5</option>
              </select>
            </div>

            <div class="flex items-end">
              <button (click)="resetFilters()" 
                      class="w-full px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg text-white transition-all duration-300">
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        <!-- Vista Mensual -->
        <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8">
          <h2 class="text-xl font-semibold text-white mb-4">Resumen Mensual</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            @for (monthData of monthlyTotals(); track monthData.month) {
              <div class="bg-white/5 rounded-lg p-4 border border-white/10">
                <div class="text-gray-400 text-sm mb-1">{{ monthData.month }}</div>
                <div class="text-xl font-bold text-white mb-1">\${{ monthData.total.toFixed(2) }}</div>
                <div class="text-gray-500 text-xs">{{ monthData.count }} comisiones</div>
              </div>
            }
          </div>
        </div>

        <!-- Tabla de Comisiones -->
        <div class="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-white/5 border-b border-white/10">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Fecha</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Usuario</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Nivel</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Inversión</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">%</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Comisión</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/10">
                @for (commission of filteredCommissions(); track commission.id) {
                  <tr class="hover:bg-white/5 transition-colors">
                    <td class="px-6 py-4 text-sm text-gray-300">
                      {{ formatDate(commission.date) }}
                    </td>
                    <td class="px-6 py-4 text-sm text-white">
                      {{ commission.fromUserName }}
                    </td>
                    <td class="px-6 py-4">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            [ngClass]="{
                              'bg-purple-900/50 text-purple-200': commission.level === 1,
                              'bg-blue-900/50 text-blue-200': commission.level === 2,
                              'bg-green-900/50 text-green-200': commission.level === 3,
                              'bg-yellow-900/50 text-yellow-200': commission.level === 4,
                              'bg-red-900/50 text-red-200': commission.level === 5
                            }">
                        Nivel {{ commission.level }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-300">
                      \${{ commission.investmentAmount.toFixed(2) }}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-300">
                      {{ commission.percentage }}%
                    </td>
                    <td class="px-6 py-4 text-sm font-semibold text-green-400">
                      \${{ commission.amount.toFixed(2) }}
                    </td>
                    <td class="px-6 py-4">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            [ngClass]="{
                              'bg-green-900/50 text-green-200': commission.status === 'paid',
                              'bg-yellow-900/50 text-yellow-200': commission.status === 'pending',
                              'bg-red-900/50 text-red-200': commission.status === 'cancelled'
                            }">
                        {{ getStatusLabel(commission.status) }}
                      </span>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                      <svg class="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                      </svg>
                      <p class="text-lg font-medium">No hay comisiones</p>
                      <p class="text-sm mt-2">Aún no has generado comisiones en tu red</p>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Botón Exportar -->
        <div class="mt-8 flex justify-end">
          <button (click)="exportToCSV()" 
                  class="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Exportar CSV
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class CommissionHistoryComponent implements OnInit {
  private unilevelService = inject(UnilevelService);
  private authService = inject(AuthService);

  commissions = signal<Commission[]>([]);
  filteredCommissions = signal<Commission[]>([]);
  
  selectedPeriod = 'all';
  selectedStatus = 'all';
  selectedLevel = 'all';

  totalEarned = signal(0);
  monthlyEarned = signal(0);
  pendingAmount = signal(0);
  monthlyTotals = signal<MonthlyTotal[]>([]);

  ngOnInit() {
    this.loadCommissions();
  }

  loadCommissions() {
    const userId = this.authService.getCurrentUser()?.id || '';
    
    this.unilevelService.getCommissionHistory(userId).subscribe({
      next: (data: any) => {
        this.commissions.set(data);
        this.filteredCommissions.set(data);
        this.calculateStats();
        this.calculateMonthlyTotals();
      },
      error: (err: any) => {
        console.error('Error cargando comisiones:', err);
      }
    });
  }

  calculateStats() {
    const comms = this.commissions();
    
    const total = comms
      .filter(c => c.status === 'paid')
      .reduce((sum, c) => sum + c.amount, 0);
    this.totalEarned.set(total);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthly = comms
      .filter(c => {
        const date = new Date(c.date);
        return date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear &&
               c.status === 'paid';
      })
      .reduce((sum, c) => sum + c.amount, 0);
    this.monthlyEarned.set(monthly);

    const pending = comms
      .filter(c => c.status === 'pending')
      .reduce((sum, c) => sum + c.amount, 0);
    this.pendingAmount.set(pending);
  }

  calculateMonthlyTotals() {
    const comms = this.commissions();
    const monthMap = new Map<string, { total: number; count: number }>();

    comms.forEach(c => {
      const date = new Date(c.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, { total: 0, count: 0 });
      }
      
      const data = monthMap.get(monthKey)!;
      data.total += c.amount;
      data.count += 1;
    });

    const totals: MonthlyTotal[] = Array.from(monthMap.entries())
      .map(([month, data]) => ({
        month: this.formatMonth(month),
        total: data.total,
        count: data.count
      }))
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 6); // Últimos 6 meses

    this.monthlyTotals.set(totals);
  }

  filterCommissions() {
    let filtered = [...this.commissions()];

    // Filtro por período
    if (this.selectedPeriod !== 'all') {
      const now = new Date();
      filtered = filtered.filter(c => {
        const date = new Date(c.date);
        switch (this.selectedPeriod) {
          case 'month':
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
          case 'quarter':
            const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
            return date >= threeMonthsAgo;
          case 'year':
            return date.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    // Filtro por estado
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(c => c.status === this.selectedStatus);
    }

    // Filtro por nivel
    if (this.selectedLevel !== 'all') {
      filtered = filtered.filter(c => c.level === parseInt(this.selectedLevel));
    }

    this.filteredCommissions.set(filtered);
  }

  resetFilters() {
    this.selectedPeriod = 'all';
    this.selectedStatus = 'all';
    this.selectedLevel = 'all';
    this.filteredCommissions.set(this.commissions());
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  formatMonth(monthKey: string): string {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long'
    }).format(date);
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'paid': 'Pagada',
      'pending': 'Pendiente',
      'cancelled': 'Cancelada'
    };
    return labels[status] || status;
  }

  exportToCSV() {
    const comms = this.filteredCommissions();
    
    if (comms.length === 0) {
      alert('No hay comisiones para exportar');
      return;
    }

    const headers = ['Fecha', 'Usuario', 'Nivel', 'Inversión', 'Porcentaje', 'Comisión', 'Estado'];
    const rows = comms.map(c => [
      this.formatDate(c.date),
      c.fromUserName,
      `Nivel ${c.level}`,
      c.investmentAmount.toFixed(2),
      `${c.percentage}%`,
      c.amount.toFixed(2),
      this.getStatusLabel(c.status)
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comisiones-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
