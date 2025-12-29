import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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

@Injectable({
  providedIn: 'root'
})
export class InvestmentService {
  private apiUrl = `${environment.apiUrl}/investments`;

  constructor(private http: HttpClient) {}

  createInvestment(data: InvestmentRequest): Observable<InvestmentResponse> {
    return this.http.post<InvestmentResponse>(this.apiUrl, data);
  }

  getUserInvestments(): Observable<InvestmentPlan[]> {
    return this.http.get<InvestmentPlan[]>(this.apiUrl);
  }

  getInvestment(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }
}
