import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WithdrawalService, WithdrawalData } from '../../services/withdrawal.service';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-withdrawal-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8 flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-white mb-2">Historial de Retiros</h1>
            <p class="text-gray-400">Gestiona y revisa todos tus retiros</p>
          </div>
          <a routerLink="/withdrawal-flow"
             class="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Nuevo Retiro
          </a>
        </div>

        <!-- Estadísticas -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div class="flex items-center justify-between mb-2">
              <span class="text-gray-400 text-sm">Balance Disponible</span>
              <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <div class="text-2xl font-bold text-white">\${{ availableBalance().toFixed(2) }}</div>
          </div>

          <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div class="flex items-center justify-between mb-2">
              <span class="text-gray-400 text-sm">Pendientes</span>
              <svg class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="text-2xl font-bold text-white">{{ pendingCount() }}</div>
          </div>

          <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div class="flex items-center justify-between mb-2">
              <span class="text-gray-400 text-sm">Total Retirado</span>
              <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"></path>
              </svg>
            </div>
            <div class="text-2xl font-bold text-white">\${{ totalWithdrawn().toFixed(2) }}</div>
          </div>

          <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
            <div class="flex items-center justify-between mb-2">
              <span class="text-gray-400 text-sm">Total Retiros</span>
              <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div class="text-2xl font-bold text-white">{{ withdrawals().length }}</div>
          </div>
        </div>

        <!-- Filtros -->
        <div class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-gray-400 text-sm mb-2">Estado</label>
              <select [(ngModel)]="selectedStatus" (ngModelChange)="filterWithdrawals()" 
                      class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="all">Todos</option>
                <option value="pending">Pendientes</option>
                <option value="approved">Aprobados</option>
                <option value="processing">En Proceso</option>
                <option value="completed">Completados</option>
                <option value="rejected">Rechazados</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </div>

            <div>
              <label class="block text-gray-400 text-sm mb-2">Fecha</label>
              <select [(ngModel)]="selectedPeriod" (ngModelChange)="filterWithdrawals()" 
                      class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="all">Todos</option>
                <option value="week">Última semana</option>
                <option value="month">Último mes</option>
                <option value="quarter">Último trimestre</option>
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

        <!-- Tabla de Retiros -->
        <div class="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-white/5 border-b border-white/10">
                <tr>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">ID</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Fecha</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Monto</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Comisión</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Total</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Método</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Estado</th>
                  <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/10">
                @for (withdrawal of filteredWithdrawals(); track withdrawal.id) {
                  <tr class="hover:bg-white/5 transition-colors">
                    <td class="px-6 py-4 text-sm text-gray-300">
                      #{{ withdrawal.id }}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-300">
                      {{ formatDate(withdrawal.requestDate) }}
                    </td>
                    <td class="px-6 py-4 text-sm font-semibold text-white">
                      \${{ withdrawal.requestedAmount.toFixed(2) }}
                    </td>
                    <td class="px-6 py-4 text-sm text-red-400">
                      -\${{ withdrawal.fee.toFixed(2) }}
                    </td>
                    <td class="px-6 py-4 text-sm font-bold text-green-400">
                      \${{ (withdrawal.requestedAmount - withdrawal.fee).toFixed(2) }}
                    </td>
                    <td class="px-6 py-4 text-sm text-gray-300">
                      {{ withdrawal.walletNetwork }}
                    </td>
                    <td class="px-6 py-4">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            [ngClass]="getStatusClass(withdrawal.status)">
                        {{ getStatusLabel(withdrawal.status) }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <button (click)="viewDetails(withdrawal)" 
                              class="text-blue-400 hover:text-blue-300 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="8" class="px-6 py-12 text-center text-gray-500">
                      <svg class="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      <p class="text-lg font-medium">No hay retiros</p>
                      <p class="text-sm mt-2">Aún no has realizado ningún retiro</p>
                      <a routerLink="/withdrawal-flow" 
                         class="inline-block mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                        Solicitar Retiro
                      </a>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Modal de Detalles -->
        @if (showDetailsModal()) {
          <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" (click)="closeDetailsModal()">
            <div class="bg-gray-800 rounded-2xl max-w-2xl w-full p-8 border border-white/20" (click)="$event.stopPropagation()">
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-white">Detalles del Retiro</h2>
                <button (click)="closeDetailsModal()" class="text-gray-400 hover:text-white transition-colors">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              @if (selectedWithdrawal()) {
                <div class="space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="text-gray-400 text-sm">ID de Retiro</label>
                      <p class="text-white font-medium">#{{ selectedWithdrawal()!.id }}</p>
                    </div>
                    <div>
                      <label class="text-gray-400 text-sm">Fecha de Solicitud</label>
                      <p class="text-white font-medium">{{ formatDate(selectedWithdrawal()!.requestDate) }}</p>
                    </div>
                  </div>

                  <div class="border-t border-white/10 pt-4">
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="text-gray-400 text-sm">Monto Solicitado</label>
                        <p class="text-white font-bold text-xl">\${{ selectedWithdrawal()!.requestedAmount.toFixed(2) }}</p>
                      </div>
                      <div>
                        <label class="text-gray-400 text-sm">Comisión</label>
                        <p class="text-red-400 font-semibold">\${{ selectedWithdrawal()!.fee.toFixed(2) }}</p>
                      </div>
                    </div>
                    <div class="mt-4 bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                      <label class="text-green-400 text-sm">Total a Recibir</label>
                      <p class="text-green-400 font-bold text-2xl">\${{ (selectedWithdrawal()!.requestedAmount - selectedWithdrawal()!.fee).toFixed(2) }}</p>
                    </div>
                  </div>

                  <div class="border-t border-white/10 pt-4">
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="text-gray-400 text-sm">Método de Retiro</label>
                        <p class="text-white font-medium">{{ selectedWithdrawal()!.walletNetwork }}</p>
                      </div>
                      <div>
                        <label class="text-gray-400 text-sm">Estado</label>
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1"
                              [ngClass]="getStatusClass(selectedWithdrawal()!.status)">
                          {{ getStatusLabel(selectedWithdrawal()!.status) }}
                        </span>
                      </div>
                    </div>
                  </div>

                  @if (selectedWithdrawal()!.walletAddress) {
                    <div class="border-t border-white/10 pt-4">
                      <label class="text-gray-400 text-sm">Dirección de Wallet</label>
                      <p class="text-white font-mono text-sm bg-white/5 p-3 rounded-lg break-all">
                        {{ selectedWithdrawal()!.walletAddress }}
                      </p>
                    </div>
                  }

                  @if (selectedWithdrawal()!.adminNotes) {
                    <div class="border-t border-white/10 pt-4">
                      <label class="text-gray-400 text-sm">Notas del Administrador</label>
                      <p class="text-white bg-blue-900/20 border border-blue-500/30 p-3 rounded-lg">
                        {{ selectedWithdrawal()!.adminNotes }}
                      </p>
                    </div>
                  }
                </div>
              }

              <div class="mt-6 flex justify-end">
                <button (click)="closeDetailsModal()" 
                        class="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class WithdrawalHistoryComponent implements OnInit {
  private withdrawalService = inject(WithdrawalService);
  private authService = inject(AuthService);

  withdrawals = signal<WithdrawalData[]>([]);
  filteredWithdrawals = signal<WithdrawalData[]>([]);
  
  availableBalance = signal(0);
  pendingCount = signal(0);
  totalWithdrawn = signal(0);

  selectedStatus = 'all';
  selectedPeriod = 'all';

  showDetailsModal = signal(false);
  selectedWithdrawal = signal<WithdrawalData | null>(null);

  ngOnInit() {
    this.loadWithdrawals();
    this.loadBalance();
  }

  loadWithdrawals() {
    const userId = String(this.authService.getCurrentUser()?.id || '');
    
    this.withdrawalService.getUserWithdrawals(userId).subscribe({
      next: (data: any) => {
        this.withdrawals.set(data);
        this.filteredWithdrawals.set(data);
        this.calculateStats();
      },
      error: (err: any) => {
        console.error('Error cargando retiros:', err);
      }
    });
  }

  loadBalance() {
    const userId = String(this.authService.getCurrentUser()?.id || '');
    
    this.withdrawalService.getAvailableBalances(userId).subscribe({
      next: (balance: any) => {
        this.availableBalance.set(balance.finBalance || 0);
      },
      error: (err: any) => {
        console.error('Error cargando balance:', err);
      }
    });
  }

  calculateStats() {
    const withdrawals = this.withdrawals();
    
    const pending = withdrawals.filter(w => w.status === 'PENDING').length;
    this.pendingCount.set(pending);

    const total = withdrawals
      .filter(w => w.status === 'COMPLETED')
      .reduce((sum: number, w: any) => sum + w.requestedAmount - w.fee, 0);
    this.totalWithdrawn.set(total);
  }

  filterWithdrawals() {
    let filtered = [...this.withdrawals()];

    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(w => w.status === this.selectedStatus);
    }

    if (this.selectedPeriod !== 'all') {
      const now = new Date();
      filtered = filtered.filter(w => {
        const date = new Date(w.requestDate);
        switch (this.selectedPeriod) {
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return date >= weekAgo;
          case 'month':
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
          case 'quarter':
            const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
            return date >= threeMonthsAgo;
          default:
            return true;
        }
      });
    }

    this.filteredWithdrawals.set(filtered);
  }

  resetFilters() {
    this.selectedStatus = 'all';
    this.selectedPeriod = 'all';
    this.filteredWithdrawals.set(this.withdrawals());
  }

  viewDetails(withdrawal: WithdrawalData) {
    this.selectedWithdrawal.set(withdrawal);
    this.showDetailsModal.set(true);
  }

  closeDetailsModal() {
    this.showDetailsModal.set(false);
    this.selectedWithdrawal.set(null);
  }

  formatDate(dateStr: string | Date): string {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'pending': 'bg-yellow-900/50 text-yellow-200',
      'approved': 'bg-blue-900/50 text-blue-200',
      'processing': 'bg-purple-900/50 text-purple-200',
      'completed': 'bg-green-900/50 text-green-200',
      'rejected': 'bg-red-900/50 text-red-200',
      'cancelled': 'bg-gray-900/50 text-gray-300'
    };
    return classes[status] || 'bg-gray-900/50 text-gray-300';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'pending': 'Pendiente',
      'approved': 'Aprobado',
      'processing': 'Procesando',
      'completed': 'Completado',
      'rejected': 'Rechazado',
      'cancelled': 'Cancelado'
    };
    return labels[status] || status;
  }
}
