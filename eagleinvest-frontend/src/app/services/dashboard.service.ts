import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InvestmentPlansService, InvestmentPlan } from './investment-plans.service';

export interface DashboardData {
  user: any;
  stats: {
    total_invested: number;
    total_earnings: number;
    earnings_balance: number;
    referral_balance: number;
    active_investments: number;
    total_referrals: number;
    weekly_earnings: number;
  };
  active_investments: any[];
  recent_transactions: any[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://127.0.0.1:8000/api/demo';

  constructor(
    private http: HttpClient,
    private investmentPlansService: InvestmentPlansService
  ) { }

  getDashboardData(userId: number): Observable<DashboardData> {
    const url = `${this.apiUrl}/dashboard/${userId}`;
    console.log('Making API call to:', url);
    return this.http.get<DashboardData>(url);
  }

  getInvestmentPlans(): Observable<InvestmentPlan[]> {
    // Delegado al servicio especializado de investment plans
    // Este servicio está preparado para cambiar a API externa
    return this.investmentPlansService.getInvestmentPlans();
  }

  getTransactions(userId: number, params?: any): Observable<any> {
    let url = `${this.apiUrl}/transactions/${userId}`;
    if (params) {
      const queryParams = new URLSearchParams(params).toString();
      url += `?${queryParams}`;
    }
    return this.http.get<any>(url);
  }

  getWithdrawals(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/withdrawals/${userId}`);
  }

  createWithdrawal(withdrawalData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/withdrawals`, withdrawalData);
  }

  getProfile(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/profile/${userId}`);
  }

  updateProfile(userId: number, profileData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/profile/${userId}`, profileData);
  }
}