import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface WalletInfo {
  address: string;
  network: string;
  balance: string;
  connected: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getWalletInfo(userId: number): Observable<WalletInfo> {
    return this.http.get<WalletInfo>(`${this.apiUrl}/wallet/${userId}`);
  }

  saveWallet(userId: number, address: string, network: string, provider: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/wallet/connect`, {
      user_id: userId,
      wallet_address: address,
      network,
      provider
    });
  }

  disconnectWallet(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/wallet/disconnect`, {
      user_id: userId
    });
  }
}
