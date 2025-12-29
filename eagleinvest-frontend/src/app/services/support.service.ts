import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SupportTicket {
  id: number;
  user_id: number;
  type: 'wallet_change' | 'general' | 'technical' | 'financial';
  subject: string;
  description: string;
  old_wallet?: string;
  new_wallet?: string;
  status: 'open' | 'in_review' | 'pending_verification' | 'approved' | 'rejected' | 'closed';
  identity_verified: boolean;
  admin_notes?: string;
  rejection_reason?: string;
  assigned_to?: number;
  resolved_by?: number;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WalletChangeRequest {
  new_wallet: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupportService {
  private apiUrl = `${environment.apiUrl}/support`;

  constructor(private http: HttpClient) {}

  requestWalletChange(data: WalletChangeRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/wallet-change`, data);
  }

  getUserTickets(): Observable<SupportTicket[]> {
    return this.http.get<SupportTicket[]>(`${this.apiUrl}/tickets`);
  }

  getTicket(id: number): Observable<SupportTicket> {
    return this.http.get<SupportTicket>(`${this.apiUrl}/tickets/${id}`);
  }

  // Admin methods
  getPendingTickets(): Observable<SupportTicket[]> {
    return this.http.get<SupportTicket[]>(`${this.apiUrl}/tickets/pending/all`);
  }

  reviewTicket(id: number, notes?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/tickets/${id}/review`, { admin_notes: notes });
  }

  verifyIdentity(id: number, verified: boolean, notes?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/tickets/${id}/verify-identity`, { verified, notes });
  }

  approveWalletChange(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/tickets/${id}/approve`, {});
  }

  rejectWalletChange(id: number, reason: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/tickets/${id}/reject`, { reason });
  }
}
