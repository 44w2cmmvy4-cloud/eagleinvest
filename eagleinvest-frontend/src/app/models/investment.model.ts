export type InvestmentPlan = 'MICRO_IMPACTO' | 'RAPIDO_SOCIAL' | 'ESTANQUE_SOLIDARIO' | 'PREMIUM_HUMANITARIO';
export type InvestmentLevel = 'BRONZE' | 'PLATA' | 'ORO' | 'PLATINO';
export type RatificationPhase = 'OTROS' | 'RAPIDO' | 'ESTANDAR' | 'PREMIUM';

export interface InvestmentData {
  id?: string;
  amount: number;
  plan: InvestmentPlan;
  level: InvestmentLevel;
  startDate: Date;
  userId: string;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED';
  ratificationDays: number;
  monthlyCommission: number;
}

export interface PlanDetails {
  name: InvestmentPlan;
  minAmount: number;
  maxAmount: number;
  level: InvestmentLevel;
  monthlyRentability: number;
  description: string;
  requirements?: string[];
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
