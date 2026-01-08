import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WithdrawalService, WithdrawalData } from '../../services/withdrawal.service';

@Component({
  selector: 'app-admin-withdrawals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-100 py-8 px-4">
      <div class="max-w-7xl mx-auto">
        
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">🛠️ Panel de Retiros - Admin</h1>
          <p class="text-gray-600">Gestiona las solicitudes de retiro pendientes</p>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow p-6">
            <div class="text-sm text-gray-600 mb-1">Pendientes</div>
            <div class="text-3xl font-bold text-yellow-600">{{ pendingCount() }}</div>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <div class="text-sm text-gray-600 mb-1">Aprobados Hoy</div>
            <div class="text-3xl font-bold text-green-600">{{ approvedToday() }}</div>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <div class="text-sm text-gray-600 mb-1">Rechazados</div>
            <div class="text-3xl font-bold text-red-600">{{ rejectedCount() }}</div>
          </div>
          <div class="bg-white rounded-lg shadow p-6">
            <div class="text-sm text-gray-600 mb-1">Total Procesado</div>
            <div class="text-3xl font-bold text-purple-600">\${{ totalProcessed() }}</div>
          </div>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <div class="flex gap-4">
            <select [(ngModel)]="filterStatus" (change)="applyFilters()" 
                    class="px-4 py-2 border rounded-lg">
              <option value="ALL">Todos</option>
              <option value="PENDING">Pendientes</option>
              <option value="APPROVED">Aprobados</option>
              <option value="REJECTED">Rechazados</option>
            </select>
            
            <input 
              type="text" 
              [(ngModel)]="searchTerm"
              (input)="applyFilters()"
              placeholder="Buscar por usuario..."
              class="flex-1 px-4 py-2 border rounded-lg">
            
            <button (click)="loadWithdrawals()" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              🔄 Actualizar
            </button>
          </div>
        </div>

        <!-- Withdrawals Table -->
        <div class="bg-white rounded-lg shadow overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Final</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr *ngFor="let withdrawal of filteredWithdrawals()" class="hover:bg-gray-50">
                <td class="px-6 py-4 text-sm font-mono">#{{ withdrawal.id?.substring(0, 8) }}</td>
                <td class="px-6 py-4 text-sm">
                  <div class="font-medium">User {{ withdrawal.userId }}</div>
                  <div class="text-xs text-gray-500">{{ withdrawal.walletAddress.substring(0, 10) }}...</div>
                </td>
                <td class="px-6 py-4 text-sm">
                  <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {{ withdrawal.planType }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm font-semibold">\${{ withdrawal.requestedAmount }}</td>
                <td class="px-6 py-4 text-sm text-red-600">-\${{ withdrawal.fee }}</td>
                <td class="px-6 py-4 text-sm font-bold text-green-600">\${{ withdrawal.finalAmount }}</td>
                <td class="px-6 py-4 text-sm text-gray-500">{{ withdrawal.requestDate | date:'short' }}</td>
                <td class="px-6 py-4 text-sm">
                  <span 
                    class="px-2 py-1 rounded text-xs font-semibold"
                    [class.bg-yellow-100]="withdrawal.status === 'PENDING'"
                    [class.text-yellow-800]="withdrawal.status === 'PENDING'"
                    [class.bg-green-100]="withdrawal.status === 'APPROVED'"
                    [class.text-green-800]="withdrawal.status === 'APPROVED'"
                    [class.bg-red-100]="withdrawal.status === 'REJECTED'"
                    [class.text-red-800]="withdrawal.status === 'REJECTED'">
                    {{ withdrawal.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm">
                  <div class="flex gap-2" *ngIf="withdrawal.status === 'PENDING'">
                    <button 
                      (click)="approveWithdrawal(withdrawal)"
                      class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs">
                      ✓ Aprobar
                    </button>
                    <button 
                      (click)="rejectWithdrawal(withdrawal)"
                      class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs">
                      ✗ Rechazar
                    </button>
                  </div>
                  <button 
                    *ngIf="withdrawal.status === 'APPROVED'"
                    (click)="markComplete(withdrawal)"
                    class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs">
                    ✓ Completar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <div *ngIf="filteredWithdrawals().length === 0" class="p-12 text-center text-gray-500">
            <div class="text-6xl mb-4">📭</div>
            <p class="text-lg">No hay retiros que mostrar</p>
          </div>
        </div>

        <!-- Pagination -->
        <div class="mt-6 flex justify-between items-center">
          <div class="text-sm text-gray-600">
            Mostrando {{ filteredWithdrawals().length }} retiros
          </div>
          <div class="flex gap-2">
            <button class="px-4 py-2 border rounded hover:bg-gray-50">Anterior</button>
            <button class="px-4 py-2 bg-purple-600 text-white rounded">1</button>
            <button class="px-4 py-2 border rounded hover:bg-gray-50">2</button>
            <button class="px-4 py-2 border rounded hover:bg-gray-50">Siguiente</button>
          </div>
        </div>

      </div>
    </div>

    <!-- Approval Modal -->
    <div *ngIf="showApprovalModal()" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h3 class="text-xl font-bold mb-4">Aprobar Retiro</h3>
        <p class="text-gray-600 mb-4">¿Confirmas que quieres aprobar este retiro?</p>
        
        <div class="bg-gray-50 rounded p-4 mb-4">
          <div class="flex justify-between mb-2">
            <span>Usuario:</span>
            <strong>{{ selectedWithdrawal()?.userId }}</strong>
          </div>
          <div class="flex justify-between mb-2">
            <span>Monto:</span>
            <strong class="text-green-600">\${{ selectedWithdrawal()?.finalAmount }}</strong>
          </div>
          <div class="flex justify-between">
            <span>Wallet:</span>
            <strong class="text-xs">{{ selectedWithdrawal()?.walletAddress }}</strong>
          </div>
        </div>

        <textarea 
          [(ngModel)]="adminNotes"
          placeholder="Notas (opcional)"
          class="w-full px-4 py-2 border rounded mb-4"
          rows="3"></textarea>

        <div class="flex gap-3">
          <button 
            (click)="closeModal()"
            class="flex-1 px-4 py-2 border rounded hover:bg-gray-50">
            Cancelar
          </button>
          <button 
            (click)="confirmApproval()"
            class="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Confirmar Aprobación
          </button>
        </div>
      </div>
    </div>

    <!-- Rejection Modal -->
    <div *ngIf="showRejectionModal()" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h3 class="text-xl font-bold mb-4">Rechazar Retiro</h3>
        <p class="text-gray-600 mb-4">Indica el motivo del rechazo:</p>
        
        <textarea 
          [(ngModel)]="rejectionReason"
          placeholder="Motivo del rechazo (requerido)"
          class="w-full px-4 py-2 border rounded mb-4"
          rows="4"></textarea>

        <div class="flex gap-3">
          <button 
            (click)="closeModal()"
            class="flex-1 px-4 py-2 border rounded hover:bg-gray-50">
            Cancelar
          </button>
          <button 
            (click)="confirmRejection()"
            [disabled]="!rejectionReason"
            class="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50">
            Confirmar Rechazo
          </button>
        </div>
      </div>
    </div>
  `
})
export class AdminWithdrawalsComponent implements OnInit {
  allWithdrawals = signal<WithdrawalData[]>([]);
  filteredWithdrawals = signal<WithdrawalData[]>([]);
  
  pendingCount = signal(5);
  approvedToday = signal(12);
  rejectedCount = signal(2);
  totalProcessed = signal(15420);

  filterStatus = 'ALL';
  searchTerm = '';

  showApprovalModal = signal(false);
  showRejectionModal = signal(false);
  selectedWithdrawal = signal<WithdrawalData | null>(null);
  adminNotes = '';
  rejectionReason = '';

  constructor(private withdrawalService: WithdrawalService) {}

  ngOnInit() {
    this.loadWithdrawals();
  }

  loadWithdrawals() {
    this.withdrawalService.getPendingWithdrawals().subscribe({
      next: (data) => {
        // Simulate data
        const mockData: WithdrawalData[] = [
          {
            id: '1',
            userId: '101',
            source: 'FIN_BALANCE',
            planType: 'MICRO_IMPACTO',
            requestedAmount: 50,
            fee: 1.5,
            finalAmount: 48.5,
            walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f91f3',
            walletNetwork: 'BSC',
            status: 'PENDING',
            requestDate: new Date()
          },
          {
            id: '2',
            userId: '102',
            source: 'PLAN_BALANCE',
            planType: 'RAPIDO_SOCIAL',
            requestedAmount: 200,
            fee: 6,
            finalAmount: 194,
            walletAddress: '0x8a5d47Cc3421D9623145e4b542Cc9e2395f82c1',
            walletNetwork: 'ETH',
            status: 'PENDING',
            requestDate: new Date()
          }
        ];
        this.allWithdrawals.set(mockData);
        this.applyFilters();
      },
      error: (err) => console.error('Error loading withdrawals:', err)
    });
  }

  applyFilters() {
    let filtered = this.allWithdrawals();

    if (this.filterStatus !== 'ALL') {
      filtered = filtered.filter(w => w.status === this.filterStatus);
    }

    if (this.searchTerm) {
      filtered = filtered.filter(w => 
        w.userId.includes(this.searchTerm) || 
        w.walletAddress.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    this.filteredWithdrawals.set(filtered);
  }

  approveWithdrawal(withdrawal: WithdrawalData) {
    this.selectedWithdrawal.set(withdrawal);
    this.showApprovalModal.set(true);
  }

  rejectWithdrawal(withdrawal: WithdrawalData) {
    this.selectedWithdrawal.set(withdrawal);
    this.showRejectionModal.set(true);
  }

  confirmApproval() {
    const withdrawal = this.selectedWithdrawal();
    if (!withdrawal?.id) return;

    this.withdrawalService.adminApproveWithdrawal(withdrawal.id, this.adminNotes).subscribe({
      next: () => {
        alert('Retiro aprobado exitosamente');
        this.closeModal();
        this.loadWithdrawals();
      },
      error: (err) => {
        console.error('Error approving withdrawal:', err);
        alert('Error al aprobar el retiro');
      }
    });
  }

  confirmRejection() {
    const withdrawal = this.selectedWithdrawal();
    if (!withdrawal?.id || !this.rejectionReason) return;

    this.withdrawalService.adminRejectWithdrawal(withdrawal.id, this.rejectionReason).subscribe({
      next: () => {
        alert('Retiro rechazado');
        this.closeModal();
        this.loadWithdrawals();
      },
      error: (err) => {
        console.error('Error rejecting withdrawal:', err);
        alert('Error al rechazar el retiro');
      }
    });
  }

  markComplete(withdrawal: WithdrawalData) {
    if (!withdrawal.id) return;
    
    const txHash = prompt('Ingresa el hash de la transacción:');
    if (!txHash) return;

    this.withdrawalService.completeWithdrawal(withdrawal.id, txHash).subscribe({
      next: () => {
        alert('Retiro marcado como completado');
        this.loadWithdrawals();
      },
      error: (err) => {
        console.error('Error completing withdrawal:', err);
        alert('Error al completar el retiro');
      }
    });
  }

  closeModal() {
    this.showApprovalModal.set(false);
    this.showRejectionModal.set(false);
    this.selectedWithdrawal.set(null);
    this.adminNotes = '';
    this.rejectionReason = '';
  }
}
