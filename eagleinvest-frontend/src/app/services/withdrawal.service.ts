import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * WITHDRAWAL SERVICE - Based on "Sistema de Retiro/Fin" diagram
 * 
 * Este servicio maneja todo el flujo de retiros según el diagrama:
 * 1. Validar si el usuario tiene wallet configurada
 * 2. Seleccionar saldo de fin o plan específico
 * 3. Validaciones por tipo de plan (Micro, Rápido, Estándar, Premium)
 * 4. Rechazos automáticos basados en montos mínimos y tiempo
 * 5. Cálculo de fees y estados pendientes
 */

// Legacy interface
export interface Withdrawal {
  id: number;
  user_id: number;
  investment_plan_id: number;
  amount: number;
  fee_percentage: number;
  net_amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  days_elapsed: number;
  meets_minimum: boolean;
  rejection_reason?: string;
  requested_at: string;
  approved_at?: string;
  approved_by?: number;
}

export interface WithdrawalRequest {
  investment_plan_id: number;
}

export interface WithdrawalResponse {
  message: string;
  withdrawal: Withdrawal;
  estimated_time: string;
  details: {
    gross_amount: number;
    fee_percentage: number;
    fee_amount: number;
    net_amount: number;
    days_elapsed: number;
  };
}

// New types based on diagram
export type WithdrawalPlanType = 'MICRO_IMPACTO' | 'RAPIDO_SOCIAL' | 'ESTANQUE_SOLIDARIO' | 'PREMIUM_HUMANITARIO';
export type WithdrawalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
export type WithdrawalSource = 'FIN_BALANCE' | 'PLAN_BALANCE';

export interface WithdrawalRequestData {
  userId: string;
  source: WithdrawalSource;
  planType?: WithdrawalPlanType;
  amount: number;
  walletAddress: string;
  walletNetwork: string;
}

export interface WithdrawalValidation {
  isValid: boolean;
  reason?: string;
  meetsMinimum: boolean;
  hasEnoughTime: boolean;
  hasEnoughBalance: boolean;
}

export interface WithdrawalData {
  id?: string;
  userId: string;
  source: WithdrawalSource;
  planType?: WithdrawalPlanType;
  requestedAmount: number;
  fee: number;
  finalAmount: number;
  walletAddress: string;
  walletNetwork: string;
  status: WithdrawalStatus;
  requestDate: Date;
  approvalDate?: Date;
  rejectionReason?: string;
  adminNotes?: string;
}

export interface PlanWithdrawalRules {
  planType: WithdrawalPlanType;
  minimumAmount: number;
  minimumDays: number;
  feePercentage: number;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class WithdrawalService {
  private apiUrl = `${environment.apiUrl}/withdrawals`;
  private pendingWithdrawals$ = new BehaviorSubject<WithdrawalData[]>([]);

  // Withdrawal rules based on diagram
  private withdrawalRules: Record<WithdrawalPlanType, PlanWithdrawalRules> = {
    MICRO_IMPACTO: {
      planType: 'MICRO_IMPACTO',
      minimumAmount: 10,
      minimumDays: 0,
      feePercentage: 3,
      description: 'Retiro inmediato con fee 3%'
    },
    RAPIDO_SOCIAL: {
      planType: 'RAPIDO_SOCIAL',
      minimumAmount: 100,
      minimumDays: 0,
      feePercentage: 3,
      description: 'Retiro inmediato con fee 3%'
    },
    ESTANQUE_SOLIDARIO: {
      planType: 'ESTANQUE_SOLIDARIO',
      minimumAmount: 200,
      minimumDays: 10,
      feePercentage: 5,
      description: 'Retiro después de 10 días con fee 5%'
    },
    PREMIUM_HUMANITARIO: {
      planType: 'PREMIUM_HUMANITARIO',
      minimumAmount: 500,
      minimumDays: 15,
      feePercentage: 5,
      description: 'Retiro después de 15 días con fee 5%'
    }
  };

  constructor(private http: HttpClient) {}

  // Legacy method
  requestWithdrawal(data: WithdrawalRequest): Observable<WithdrawalResponse | any> {
    return this.http.post<WithdrawalResponse | any>(this.apiUrl, data);
  }

  /**
   * STEP 1: Check if user has wallet configured
   * Based on diagram: "¿Tiene Wallet Configurada?"
   */
  hasWalletConfigured(userId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/user/${userId}/has-wallet`);
  }

  /**
   * Show error if no wallet
   * Based on diagram: "Error: Configurar Soporte"
   */
  showWalletError(): { error: string; action: string } {
    return {
      error: 'No tienes una wallet configurada',
      action: 'Por favor, configura tu wallet en Perfil > Datos de Pago antes de realizar retiros'
    };
  }

  /**
   * STEP 2: Select balance source
   * Based on diagram: "Seleccionar Saldo de Fin"
   */
  getAvailableBalances(userId: string): Observable<{ finBalance: number; planBalances: any[] }> {
    return this.http.get<{ finBalance: number; planBalances: any[] }>(`${this.apiUrl}/user/${userId}/balances`);
  }

  /**
   * STEP 3: Determine plan type
   * Based on diagram: "¿Qué Plan es?"
   */
  determinePlanType(amount: number): WithdrawalPlanType | null {
    if (amount >= 10 && amount < 100) {
      return 'MICRO_IMPACTO';
    } else if (amount >= 100 && amount < 1000) {
      return 'RAPIDO_SOCIAL';
    } else if (amount >= 1000 && amount < 5000) {
      return 'ESTANQUE_SOLIDARIO';
    } else if (amount >= 5000) {
      return 'PREMIUM_HUMANITARIO';
    }
    return null;
  }

  /**
   * Get withdrawal rules for specific plan
   */
  getWithdrawalRules(planType: WithdrawalPlanType): PlanWithdrawalRules {
    return this.withdrawalRules[planType];
  }

  /**
   * STEP 4: Validate withdrawal for MICRO_IMPACTO
   * Based on diagram: "¿Pasaron 10 días?" NO -> "¿Monto >= $5?" 
   */
  validateMicroImpacto(amount: number, daysPassed: number): WithdrawalValidation {
    if (daysPassed < 10 && amount < 5) {
      return {
        isValid: false,
        reason: 'Para Micro Impacto con menos de 10 días, el monto mínimo es $5',
        meetsMinimum: false,
        hasEnoughTime: false,
        hasEnoughBalance: false
      };
    }

    if (amount >= 5) {
      return {
        isValid: true,
        meetsMinimum: true,
        hasEnoughTime: daysPassed >= 10,
        hasEnoughBalance: true
      };
    }

    return {
      isValid: false,
      reason: 'Monto insuficiente',
      meetsMinimum: false,
      hasEnoughTime: daysPassed >= 10,
      hasEnoughBalance: false
    };
  }

  /**
   * STEP 4: Validate withdrawal for RAPIDO_SOCIAL
   * Based on diagram: "¿Pasaron 10 días?" NO -> "¿Monto >= $10?"
   */
  validateRapidoSocial(amount: number, daysPassed: number): WithdrawalValidation {
    if (daysPassed < 10 && amount < 10) {
      return {
        isValid: false,
        reason: 'Para Rápido Social con menos de 10 días, el monto mínimo es $10',
        meetsMinimum: false,
        hasEnoughTime: false,
        hasEnoughBalance: false
      };
    }

    if (amount >= 10) {
      return {
        isValid: true,
        meetsMinimum: true,
        hasEnoughTime: daysPassed >= 10,
        hasEnoughBalance: true
      };
    }

    return {
      isValid: false,
      reason: 'Monto insuficiente',
      meetsMinimum: false,
      hasEnoughTime: daysPassed >= 10,
      hasEnoughBalance: false
    };
  }

  /**
   * STEP 4: Validate withdrawal for ESTANQUE_SOLIDARIO
   * Based on diagram: "¿Pasaron 10 días?" NO -> "¿Monto >= $200?"
   */
  validateEstanqueSolidario(amount: number, daysPassed: number): WithdrawalValidation {
    if (daysPassed < 10) {
      return {
        isValid: false,
        reason: 'Para Estándar Solidario debes esperar 10 días',
        meetsMinimum: amount >= 200,
        hasEnoughTime: false,
        hasEnoughBalance: amount >= 200
      };
    }

    if (amount >= 200) {
      return {
        isValid: true,
        meetsMinimum: true,
        hasEnoughTime: true,
        hasEnoughBalance: true
      };
    }

    return {
      isValid: false,
      reason: 'Monto mínimo de $200',
      meetsMinimum: false,
      hasEnoughTime: true,
      hasEnoughBalance: false
    };
  }

  /**
   * STEP 4: Validate withdrawal for PREMIUM_HUMANITARIO
   * Based on diagram: "¿Pasaron 10 días?" NO -> "¿Monto >= $500?"
   */
  validatePremiumHumanitario(amount: number, daysPassed: number): WithdrawalValidation {
    if (daysPassed < 10) {
      return {
        isValid: false,
        reason: 'Para Premium Humanitario debes esperar 10 días',
        meetsMinimum: amount >= 500,
        hasEnoughTime: false,
        hasEnoughBalance: amount >= 500
      };
    }

    if (amount >= 500) {
      return {
        isValid: true,
        meetsMinimum: true,
        hasEnoughTime: true,
        hasEnoughBalance: true
      };
    }

    return {
      isValid: false,
      reason: 'Monto mínimo de $500',
      meetsMinimum: false,
      hasEnoughTime: true,
      hasEnoughBalance: false
    };
  }

  /**
   * Unified validation based on plan type
   */
  validateWithdrawal(planType: WithdrawalPlanType, amount: number, daysPassed: number): WithdrawalValidation {
    switch (planType) {
      case 'MICRO_IMPACTO':
        return this.validateMicroImpacto(amount, daysPassed);
      case 'RAPIDO_SOCIAL':
        return this.validateRapidoSocial(amount, daysPassed);
      case 'ESTANQUE_SOLIDARIO':
        return this.validateEstanqueSolidario(amount, daysPassed);
      case 'PREMIUM_HUMANITARIO':
        return this.validatePremiumHumanitario(amount, daysPassed);
      default:
        return {
          isValid: false,
          reason: 'Plan no válido',
          meetsMinimum: false,
          hasEnoughTime: false,
          hasEnoughBalance: false
        };
    }
  }

  /**
   * STEP 5: Calculate fee and generate final balance
   * Based on diagram: "Rechazar Bloqueo Temporal/Activo" or "Rechazar Monto Insuficiente" or "Aplicar Fee"
   */
  calculateFinalBalance(
    amount: number,
    planType: WithdrawalPlanType,
    daysPassed: number
  ): { fee: number; finalAmount: number; description: string } {
    const rules = this.withdrawalRules[planType];
    
    // For Micro and Rápido: Fee 0% if >= 10 days, 3% if < 10 days
    if ((planType === 'MICRO_IMPACTO' || planType === 'RAPIDO_SOCIAL') && daysPassed >= 10) {
      return {
        fee: 0,
        finalAmount: amount,
        description: 'Sin fee por cumplir 10 días'
      };
    }

    const fee = (amount * rules.feePercentage) / 100;
    return {
      fee,
      finalAmount: amount - fee,
      description: `Fee ${rules.feePercentage}% aplicado`
    };
  }

  /**
   * Create withdrawal request
   * Based on diagram: Complete flow ends in "Estado: Pendiente (+48h)"
   */
  createWithdrawal(request: WithdrawalRequestData): Observable<WithdrawalData> {
    return this.http.post<WithdrawalData>(`${this.apiUrl}`, request);
  }

  /**
   * Get user withdrawals
   */
  getUserWithdrawals(userId: string): Observable<WithdrawalData[]> {
    return this.http.get<WithdrawalData[]>(`${this.apiUrl}/user/${userId}`);
  }

  /**
   * Get withdrawal by ID
   */
  getWithdrawalById(id: string): Observable<WithdrawalData> {
    return this.http.get<WithdrawalData>(`${this.apiUrl}/${id}`);
  }

  /**
   * ADMIN: Verify and authorize payment
   * Based on diagram: "Admin Verifica y Autoriza Pago Realizado"
   */
  adminApproveWithdrawal(withdrawalId: string, notes?: string): Observable<WithdrawalData> {
    return this.http.post<WithdrawalData>(`${this.apiUrl}/${withdrawalId}/approve`, { notes });
  }

  /**
   * ADMIN: Reject withdrawal
   */
  adminRejectWithdrawal(withdrawalId: string, reason: string): Observable<WithdrawalData> {
    return this.http.post<WithdrawalData>(`${this.apiUrl}/${withdrawalId}/reject`, { reason });
  }

  /**
   * Get pending withdrawals (for admin)
   */
  getPendingWithdrawals(): Observable<WithdrawalData[]> {
    return this.http.get<WithdrawalData[]>(`${this.apiUrl}/pending`);
  }

  /**
   * Calculate days since investment start
   */
  calculateDaysPassed(startDate: Date): number {
    const now = new Date();
    const diff = now.getTime() - new Date(startDate).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * STEP 6: Finalize withdrawal
   * Based on diagram: "Fin: Dinero Enviado"
   */
  completeWithdrawal(withdrawalId: string, transactionHash: string): Observable<WithdrawalData> {
    return this.http.post<WithdrawalData>(`${this.apiUrl}/${withdrawalId}/complete`, { transactionHash });
  }

  /**
   * Get withdrawal history with filters
   */
  getWithdrawalHistory(userId: string, status?: WithdrawalStatus): Observable<WithdrawalData[]> {
    let url = `${this.apiUrl}/user/${userId}/history`;
    if (status) {
      url += `?status=${status}`;
    }
    return this.http.get<WithdrawalData[]>(url);
  }
}
