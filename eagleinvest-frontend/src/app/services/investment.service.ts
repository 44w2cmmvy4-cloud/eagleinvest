import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Legacy interfaces
export interface InvestmentPlan {
  id: number;
  user_id: number;
  plan_name: string;
  plan_tier: string;
  amount: number;
  status: string;
  start_date: string;
  withdrawal_interval_days: number;
  minimum_withdrawal_amount: number;
  meets_withdrawal_requirements: boolean;
  created_at: string;
  updated_at: string;
}

export interface InvestmentRequest {
  amount: number;
}

export interface InvestmentResponse {
  message: string;
  investment: InvestmentPlan;
  plan_details: {
    tier: string;
    name: string;
    withdrawal_interval: string;
    minimum_withdrawal: string;
    unilevel_levels: number;
    monthly_cap: string;
  };
}

// New types based on diagrams
export type InvestmentPlanType = 'MICRO_IMPACTO' | 'RAPIDO_SOCIAL' | 'ESTANQUE_SOLIDARIO' | 'PREMIUM_HUMANITARIO';
export type InvestmentLevel = 'BRONZE' | 'PLATA' | 'ORO' | 'PLATINO';
export type RatificationPhase = 'OTROS' | 'RAPIDO' | 'ESTANDAR' | 'PREMIUM';

export interface InvestmentData {
  id?: string;
  amount: number;
  plan: InvestmentPlanType;
  level: InvestmentLevel;
  startDate: Date;
  userId: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED';
  ratificationDays: number;
  monthlyCommission: number;
}

export interface PlanDetails {
  name: InvestmentPlanType;
  minAmount: number;
  maxAmount: number;
  level: InvestmentLevel;
  monthlyRentability: number;
  description: string;
}

export interface LevelBenefits {
  level: InvestmentLevel;
  name: string;
  minAmount: number;
  maxAmount: number;
  levels: number;
  topAmount: number;
  icon: string;
}

export interface RatificationData {
  id?: string;
  investmentId: string;
  phase: RatificationPhase;
  daysRequired: number;
  daysPassed: number;
  expectedDate: Date;
  status: 'PENDING' | 'COMPLETED';
  rentability: number;
}

@Injectable({
  providedIn: 'root'
})
export class InvestmentService {
  private apiUrl = `${environment.apiUrl}/investments`;

  // Plan configurations based on diagram
  private planConfig: Record<InvestmentPlanType, PlanDetails> = {
    MICRO_IMPACTO: {
      name: 'MICRO_IMPACTO',
      minAmount: 10,
      maxAmount: 99,
      level: 'BRONZE',
      monthlyRentability: 5,
      description: 'Plan de bajo monto con ganancias micro'
    },
    RAPIDO_SOCIAL: {
      name: 'RAPIDO_SOCIAL',
      minAmount: 100,
      maxAmount: 999,
      level: 'PLATA',
      monthlyRentability: 8,
      description: 'Plan social con retorno rápido'
    },
    ESTANQUE_SOLIDARIO: {
      name: 'ESTANQUE_SOLIDARIO',
      minAmount: 1000,
      maxAmount: 4999,
      level: 'ORO',
      monthlyRentability: 12,
      description: 'Plan solidario con ganancia equilibrada'
    },
    PREMIUM_HUMANITARIO: {
      name: 'PREMIUM_HUMANITARIO',
      minAmount: 5000,
      maxAmount: Infinity,
      level: 'PLATINO',
      monthlyRentability: 15,
      description: 'Plan premium con máximas ganancias'
    }
  };

  // Level benefits configuration
  private levelBenefits: Record<InvestmentLevel, LevelBenefits> = {
    BRONZE: {
      level: 'BRONZE',
      name: 'Bronce',
      minAmount: 10,
      maxAmount: 99,
      levels: 2,
      topAmount: 50,
      icon: '🥉'
    },
    PLATA: {
      level: 'PLATA',
      name: 'Plata',
      minAmount: 100,
      maxAmount: 999,
      levels: 5,
      topAmount: 750,
      icon: '🥈'
    },
    ORO: {
      level: 'ORO',
      name: 'Oro',
      minAmount: 1000,
      maxAmount: 4999,
      levels: 8,
      topAmount: 2500,
      icon: '🥇'
    },
    PLATINO: {
      level: 'PLATINO',
      name: 'Platino',
      minAmount: 5000,
      maxAmount: Infinity,
      levels: 10,
      topAmount: 5000,
      icon: '💎'
    }
  };

  constructor(private http: HttpClient) {}

  /**
   * STEP 1: Validate if amount is valid
   * Based on diagram: "¿El Monto es Válido?" -> Monto Correcto
   */
  validateAmount(amount: number): { valid: boolean; error?: string } {
    if (amount < 10) {
      return {
        valid: false,
        error: 'El monto mínimo es $10'
      };
    }
    return { valid: true };
  }

  /**
   * STEP 2: Show error if amount is less than $10
   * Based on diagram: "Error: El monto mínimo es $10"
   */
  showAmountError(): { error: string; minimumAmount: number } {
    return {
      error: 'El monto mínimo es $10',
      minimumAmount: 10
    };
  }

  /**
   * STEP 3: Classify investment range
   * Based on diagram: "Clasificar Rango de Inversión"
   * $10 - $99: MICRO IMPACTO
   * $100 - $999: RAPIDO SOCIAL
   * $1,000 - $4,999: ESTANQUE SOLIDARIO
   * $5,000+: PREMIUM HUMANITARIO
   */
  classifyInvestmentRange(amount: number): InvestmentPlanType | null {
    if (amount >= 5000) {
      return 'PREMIUM_HUMANITARIO';
    } else if (amount >= 1000 && amount <= 4999) {
      return 'ESTANQUE_SOLIDARIO';
    } else if (amount >= 100 && amount <= 999) {
      return 'RAPIDO_SOCIAL';
    } else if (amount >= 10 && amount <= 99) {
      return 'MICRO_IMPACTO';
    }
    return null;
  }

  /**
   * STEP 4: Assign plan based on range
   * Based on diagram sections for each plan
   */
  assignPlan(amount: number): { plan: InvestmentPlanType; details: PlanDetails } | null {
    const planType = this.classifyInvestmentRange(amount);
    if (!planType) return null;

    return {
      plan: planType,
      details: this.planConfig[planType]
    };
  }

  /**
   * STEP 5: Configure investment candidate
   * Based on diagram: "Configurar Candidato: Retiro cada 10 días / Mín $5" (example for Micro)
   */
  configureInvestmentCandidate(
    amount: number,
    planType: InvestmentPlanType
  ): {
    withdrawalInterval: number;
    minimumWithdrawal: number;
    ratificationPeriod: number;
    monthlyRentability: number;
  } {
    const configurations = {
      MICRO_IMPACTO: {
        withdrawalInterval: 10, // días
        minimumWithdrawal: 5,
        ratificationPeriod: 15,
        monthlyRentability: 5
      },
      RAPIDO_SOCIAL: {
        withdrawalInterval: 10,
        minimumWithdrawal: 10,
        ratificationPeriod: 10,
        monthlyRentability: 8
      },
      ESTANQUE_SOLIDARIO: {
        withdrawalInterval: 30,
        minimumWithdrawal: 200,
        ratificationPeriod: 30,
        monthlyRentability: 12
      },
      PREMIUM_HUMANITARIO: {
        withdrawalInterval: 35,
        minimumWithdrawal: 500,
        ratificationPeriod: 35,
        monthlyRentability: 15
      }
    };

    return configurations[planType];
  }

  /**
   * STEP 6: Register start date (Start Time)
   * Based on diagram: "Registrar Fecha de Inicio (Start Time)"
   */
  registerStartDate(): Date {
    return new Date();
  }

  /**
   * STEP 7: Save in database
   * Based on diagram: "Guardar en Base de Datos"
   */
  saveInvestmentToDatabase(investment: InvestmentData): Observable<InvestmentData> {
    return this.http.post<InvestmentData>(`${this.apiUrl}`, investment);
  }

  /**
   * STEP 8: Finalize (Paquete Activado)
   * Based on diagram: "Fin: Paquete Activado"
   */
  finalizeInvestment(investmentId: string): { message: string; status: string } {
    return {
      message: 'Paquete activado exitosamente',
      status: 'ACTIVE'
    };
  }

  /**
   * Unified method: Validate and classify investment
   * Combines all steps from the diagram
   */
  validateAndClassifyInvestment(amount: number): { 
    valid: boolean; 
    plan?: InvestmentPlanType; 
    level?: InvestmentLevel; 
    error?: string;
    configuration?: any;
  } {
    // STEP 1: Validate amount
    const validation = this.validateAmount(amount);
    if (!validation.valid) {
      return { 
        valid: false, 
        error: validation.error 
      };
    }

    // STEP 3: Classify range
    const planType = this.classifyInvestmentRange(amount);
    if (!planType) {
      return {
        valid: false,
        error: 'No se pudo clasificar el monto'
      };
    }

    // STEP 4: Get plan details
    const plan = this.planConfig[planType];
    
    // STEP 5: Get configuration
    const configuration = this.configureInvestmentCandidate(amount, planType);

    return {
      valid: true,
      plan: planType,
      level: plan.level,
      configuration
    };
  }

  /**
   * Create a new investment
   */
  createInvestment(data: InvestmentRequest): Observable<InvestmentResponse> {
    return this.http.post<InvestmentResponse>(this.apiUrl, data);
  }

  /**
   * Create investment with full details
   */
  createDetailedInvestment(userId: string, amount: number): Observable<InvestmentData> {
    const classification = this.validateAndClassifyInvestment(amount);
    
    if (!classification.valid) {
      throw new Error(classification.error);
    }

    const investment: InvestmentData = {
      amount,
      plan: classification.plan!,
      level: classification.level!,
      startDate: new Date(),
      userId,
      status: 'PENDING',
      ratificationDays: this.calculateRatificationDays(classification.plan!),
      monthlyCommission: this.planConfig[classification.plan!].monthlyRentability
    };

    return this.http.post<InvestmentData>(`${this.apiUrl}/detailed`, investment);
  }

  /**
   * Calculate ratification days based on plan type
   */
  private calculateRatificationDays(plan: InvestmentPlanType): number {
    const ratificationMap: Record<InvestmentPlanType, number> = {
      MICRO_IMPACTO: 15,
      RAPIDO_SOCIAL: 10,
      ESTANQUE_SOLIDARIO: 30,
      PREMIUM_HUMANITARIO: 35
    };
    return ratificationMap[plan];
  }

  /**
   * Get level benefits
   */
  getLevelBenefits(level: InvestmentLevel): LevelBenefits {
    return this.levelBenefits[level];
  }

  /**
   * Get plan details
   */
  getPlanDetails(plan: InvestmentPlanType): PlanDetails {
    return this.planConfig[plan];
  }

  /**
   * Legacy: Get user investments
   */
  getUserInvestments(): Observable<InvestmentPlan[]> {
    return this.http.get<InvestmentPlan[]>(this.apiUrl);
  }

  /**
   * Legacy: Get investment
   */
  getInvestment(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  /**
   * Calculate ratification data
   */
  calculateRatificationData(investment: InvestmentData): RatificationData {
    const now = new Date();
    const daysElapsed = Math.floor((now.getTime() - investment.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const expectedDate = new Date(investment.startDate);
    expectedDate.setDate(expectedDate.getDate() + investment.ratificationDays);

    const phase = this.getRatificationPhase(investment.plan);
    const rentability = this.calculateRentability(investment, daysElapsed);

    return {
      investmentId: investment.id!,
      phase,
      daysRequired: investment.ratificationDays,
      daysPassed: daysElapsed,
      expectedDate,
      status: daysElapsed >= investment.ratificationDays ? 'COMPLETED' : 'PENDING',
      rentability
    };
  }

  /**
   * Get ratification phase from plan
   */
  private getRatificationPhase(plan: InvestmentPlanType): RatificationPhase {
    const phaseMap: Record<InvestmentPlanType, RatificationPhase> = {
      MICRO_IMPACTO: 'OTROS',
      RAPIDO_SOCIAL: 'RAPIDO',
      ESTANQUE_SOLIDARIO: 'ESTANDAR',
      PREMIUM_HUMANITARIO: 'PREMIUM'
    };
    return phaseMap[plan];
  }

  /**
   * Calculate rentability based on phase and days passed
   */
  private calculateRentability(investment: InvestmentData, daysElapsed: number): number {
    const monthsElapsed = daysElapsed / 30;
    const monthlyRate = this.planConfig[investment.plan].monthlyRentability / 100;
    return investment.amount * monthlyRate * monthsElapsed;
  }

  /**
   * Complete ratification
   */
  completeRatification(investmentId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${investmentId}/ratify`, {});
  }
}
