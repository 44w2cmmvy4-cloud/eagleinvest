import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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

@Injectable({
  providedIn: 'root'
})
export class WithdrawalService {
  private apiUrl = `${environment.apiUrl}/withdrawals`;

  constructor(private http: HttpClient) {}

  requestWithdrawal(data: WithdrawalRequest): Observable<WithdrawalResponse | any> {
    return this.http.post<WithdrawalResponse | any>(this.apiUrl, data);
  }

  getUserWithdrawals(): Observable<Withdrawal[]> {
    return this.http.get<Withdrawal[]>(this.apiUrl);
  }

  // Admin methods
  getPendingWithdrawals(): Observable<Withdrawal[]> {
    return this.http.get<Withdrawal[]>(`${this.apiUrl}/pending/all`);
  }

  approveWithdrawal(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/approve`, {});
  }

  completeWithdrawal(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/complete`, {});
  }
}
