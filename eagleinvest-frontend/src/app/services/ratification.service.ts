import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export type RatificationPlan = 'OTROS' | 'RAPIDO' | 'ESTANDAR' | 'PREMIUM';

export interface RatificationConfig {
  plan: RatificationPlan;
  daysRequired: number;
  toppingPercentage: number;
  phases: RatificationPhase[];
}

export interface RatificationPhase {
  number: number;
  daysFromStart: number;
  monthlyPercentage: number;
  description: string;
}

export interface RatificationRecord {
  id?: string;
  investmentId: string;
  userId: string;
  plan: RatificationPlan;
  startDate: Date;
  expectedDate: Date;
  daysPassed: number;
  daysRequired: number;
  currentPhase: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  totalRentability: number;
  monthlyCommissions: MonthlyCommission[];
  requiresManualApproval: boolean;
  approvalDate?: Date;
  notes?: string;
}

export interface MonthlyCommission {
  month: number;
  percentage: number;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'FAILED';
  paidDate?: Date;
}

export interface RatificationRequest {
  investmentId: string;
  userId: string;
  amount: number;
  plan: RatificationPlan;
  startDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class RatificationService {
  private apiUrl = `${environment.apiUrl}/ratification`;
  private ratificationData$ = new BehaviorSubject<RatificationRecord | null>(null);

  // Ratification configurations based on diagram
  private ratificationConfigs: Record<RatificationPlan, RatificationConfig> = {
    OTROS: {
      plan: 'OTROS',
      daysRequired: 15,
      toppingPercentage: 3,
      phases: [
        {
          number: 1,
          daysFromStart: 0,
          monthlyPercentage: 3,
          description: 'Fase inicial - Activa después de 15 días'
        }
      ]
    },
    RAPIDO: {
      plan: 'RAPIDO',
      daysRequired: 10,
      toppingPercentage: 5,
      phases: [
        {
          number: 1,
          daysFromStart: 0,
          monthlyPercentage: 5,
          description: 'Fase rápida - Retorno acelerado'
        }
      ]
    },
    ESTANDAR: {
      plan: 'ESTANDAR',
      daysRequired: 30,
      toppingPercentage: 4,
      phases: [
        {
          number: 1,
          daysFromStart: 0,
          monthlyPercentage: 2,
          description: 'Fase 1: Más Impacto'
        },
        {
          number: 2,
          daysFromStart: 10,
          monthlyPercentage: 3,
          description: 'Fase 2: Rápido Social'
        },
        {
          number: 3,
          daysFromStart: 20,
          monthlyPercentage: 4,
          description: 'Fase 3: Calendario Gradual'
        }
      ]
    },
    PREMIUM: {
      plan: 'PREMIUM',
      daysRequired: 35,
      toppingPercentage: 6,
      phases: [
        {
          number: 1,
          daysFromStart: 0,
          monthlyPercentage: 1,
          description: 'Fase 1: Más Impacto'
        },
        {
          number: 2,
          daysFromStart: 10,
          monthlyPercentage: 2,
          description: 'Fase 2: Rápido Social'
        },
        {
          number: 3,
          daysFromStart: 20,
          monthlyPercentage: 3,
          description: 'Fase 3: Calendario Gradual'
        },
        {
          number: 4,
          daysFromStart: 30,
          monthlyPercentage: 6,
          description: 'Fase 4: Premium Humanitario'
        }
      ]
    }
  };

  constructor(private http: HttpClient) {}

  /**
   * Initiate ratification process
   * Based on diagram: "Inicio: Fabricación de Ratifit"
   */
  initiate(request: RatificationRequest): Observable<RatificationRecord> {
    return this.http.post<RatificationRecord>(`${this.apiUrl}/initiate`, request);
  }

  /**
   * Check if ratification date is valid
   * Based on diagram: "¿Ratifit Válido?"
   */
  validateRatificationDate(investmentDate: Date, plan: RatificationPlan): { valid: boolean; message?: string } {
    const config = this.ratificationConfigs[plan];
    if (!config) {
      return { valid: false, message: 'Plan no encontrado' };
    }

    // Check if investment is old enough for ratification
    const now = new Date();
    const daysElapsed = Math.floor((now.getTime() - investmentDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysElapsed < config.daysRequired) {
      return {
        valid: false,
        message: `Faltan ${config.daysRequired - daysElapsed} días para la ratificación`
      };
    }

    return { valid: true };
  }

  /**
   * Determine which plan/phase for ratification
   * Based on diagram: "¿Qué Plan es?"
   */
  determinePlan(investmentAmount: number): RatificationPlan {
    // Map investment amount to ratification plan
    if (investmentAmount < 100) {
      return 'OTROS';
    } else if (investmentAmount < 1000) {
      return 'RAPIDO';
    } else if (investmentAmount < 5000) {
      return 'ESTANDAR';
    }
    return 'PREMIUM';
  }

  /**
   * Calculate ratification with monthly phases
   * Based on diagram: "Pasadas 15 días según el tipo de plan"
   */
  calculateRatification(record: RatificationRecord): RatificationRecord {
    const config = this.ratificationConfigs[record.plan];
    const now = new Date();
    const daysElapsed = Math.floor((now.getTime() - record.startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate monthly commissions
    const monthlyCommissions: MonthlyCommission[] = [];
    const monthsElapsed = Math.floor(daysElapsed / 30);

    for (let month = 1; month <= monthsElapsed; month++) {
      const monthStartDate = new Date(record.startDate);
      monthStartDate.setDate(monthStartDate.getDate() + (month - 1) * 30);

      // Find current phase
      const currentPhase = config.phases.reduce((prev, current) => {
        return current.daysFromStart <= daysElapsed ? current : prev;
      }, config.phases[0]);

      monthlyCommissions.push({
        month,
        percentage: currentPhase.monthlyPercentage,
        amount: record.totalRentability * (currentPhase.monthlyPercentage / 100),
        status: month < monthsElapsed ? 'PENDING' : 'PENDING'
      });
    }

    record.monthlyCommissions = monthlyCommissions;
    record.daysPassed = daysElapsed;
    record.status = daysElapsed >= config.daysRequired ? 'COMPLETED' : 'IN_PROGRESS';

    return record;
  }

  /**
   * Check if range covers this level
   * Based on diagram: "¿Su Rango cubre este Nivel?"
   */
  checkRangeCoverage(userLevel: number, targetLevel: number): boolean {
    const config = this.ratificationConfigs['PREMIUM']; // Default to check premium
    return userLevel >= targetLevel;
  }

  /**
   * Calculate and register monthly payment/commission
   * Based on diagram: "Calcular % y Pagar Comisión"
   */
  calculateMonthlyPayment(investmentId: string, monthNumber: number): Observable<MonthlyCommission> {
    return this.http.post<MonthlyCommission>(
      `${this.apiUrl}/${investmentId}/calculate-payment`,
      { month: monthNumber }
    );
  }

  /**
   * Register ratification in database
   * Based on diagram: "Registrar Fecho Inicio"
   */
  registerRatification(record: RatificationRecord): Observable<RatificationRecord> {
    return this.http.post<RatificationRecord>(`${this.apiUrl}/register`, record);
  }

  /**
   * Admin verification and approval
   * Based on diagram: "Admin Verifica y Autoriza Pago (Manual)"
   */
  adminApprove(ratificationId: string, notes?: string): Observable<RatificationRecord> {
    return this.http.post<RatificationRecord>(
      `${this.apiUrl}/${ratificationId}/admin-approve`,
      { notes, approvalDate: new Date() }
    );
  }

  /**
   * Mark ratification as complete
   * Based on diagram: "Estado: Pendiente → Completo"
   */
  completeRatification(ratificationId: string): Observable<RatificationRecord> {
    return this.http.post<RatificationRecord>(
      `${this.apiUrl}/${ratificationId}/complete`,
      {}
    );
  }

  /**
   * Get ratification configuration
   */
  getConfiguration(plan: RatificationPlan): RatificationConfig {
    return this.ratificationConfigs[plan];
  }

  /**
   * Get ratification data observable
   */
  getRatificationData() {
    return this.ratificationData$.asObservable();
  }

  /**
   * Update ratification data
   */
  setRatificationData(data: RatificationRecord | null) {
    this.ratificationData$.next(data);
  }

  /**
   * Get all ratifications for a user
   */
  getUserRatifications(userId: string): Observable<RatificationRecord[]> {
    return this.http.get<RatificationRecord[]>(`${this.apiUrl}/user/${userId}`);
  }

  /**
   * Get ratification details
   */
  getRatification(ratificationId: string): Observable<RatificationRecord> {
    return this.http.get<RatificationRecord>(`${this.apiUrl}/${ratificationId}`);
  }
}
