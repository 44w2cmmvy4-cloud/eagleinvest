export interface InvestmentPlan {
    id?: number;
    name: string;
    description?: string;
    min_amount: number;
    max_amount: number;
    daily_return_rate: number; // Percentage
    duration_days: number;
    total_return_rate?: number;
    is_active: boolean;
    risk_level?: string;
    features: string[]; // JSON array in DB
    withdrawal_interval_days: number;
    minimum_withdrawal_amount: number;
    
    // Frontend specific properties (optional or mapped)
    accent?: string;
    tagline?: string;
    recommended?: boolean;
    liquidity?: string;
    roi_display?: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    phone_number?: string;
    country?: string;
    
    // Financials
    wallet: number;
    total_invested: number;
    total_earnings: number;
    earnings_balance: number;
    referral_balance: number;
    blocked_balance: number;
    total_withdrawn: number;
    
    // Status
    wallet_editable: boolean;
    two_factor_enabled: boolean;
    notifications_enabled: boolean;
    is_admin?: boolean;
    
    // Relations
    sponsor_id?: number;
    referral_code?: string;
}
