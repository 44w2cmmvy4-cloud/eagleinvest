import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

// Legacy interface
export interface WalletInfo {
  address: string;
  network: string;
  balance: string;
  connected: boolean;
}

// New interfaces based on diagrams
export interface WalletData {
  id?: string;
  userId: string;
  walletAddress: string;
  walletNetwork: string;
  isEditable: boolean;
  lastUpdated: Date;
  requiresSupport: boolean;
  supportTicketId?: string;
  status: 'ACTIVE' | 'PENDING_SUPPORT' | 'LOCKED';
}

export interface WalletChangeRequest {
  profileData: {
    newWallet: string;
    network: string;
  };
  paymentData: {
    methodId: string;
    lastFourDigits: string;
  };
}

export interface SupportTicket {
  id: string;
  userId: string;
  ticketType: 'WALLET_CHANGE';
  status: 'OPEN' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';
  description: string;
  createdAt: Date;
  updatedAt: Date;
  supportNotes?: string;
  approvalDate?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private apiUrl = 'http://localhost:8000/api';
  private walletData$ = new BehaviorSubject<WalletData | null>(null);

  constructor(private http: HttpClient) {}

  // Legacy methods
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

  /**
   * Initiate wallet change process
   * Based on diagram: "Ingresar a Perfil > Datos de Pago"
   */
  initiateWalletChange(userId: string): Observable<WalletData> {
    return this.http.get<WalletData>(`${this.apiUrl}/wallet/user/${userId}`);
  }

  /**
   * Check if wallet field is editable
   * Based on diagram: "¿El campo Wallet es editable?"
   */
  isWalletEditable(wallet: WalletData): boolean {
    return wallet.isEditable === true || !wallet.walletAddress;
  }

  /**
   * Update wallet directly if editable
   */
  updateWalletDirect(walletData: WalletData, newAddress: string, network: string): Observable<WalletData> {
    const updated = { ...walletData, walletAddress: newAddress, walletNetwork: network, lastUpdated: new Date() };
    return this.http.put<WalletData>(`${this.apiUrl}/wallet/${walletData.id}`, updated);
  }

  /**
   * Request wallet change via support
   * Based on diagram: "Proceso Manual de Soporte"
   */
  requestWalletChangeViaSupport(userId: string, newWallet: string, network: string, paymentMethodId: string): Observable<SupportTicket> {
    const request: WalletChangeRequest = {
      profileData: {
        newWallet,
        network
      },
      paymentData: {
        methodId: paymentMethodId,
        lastFourDigits: paymentMethodId.slice(-4)
      }
    };

    return this.http.post<SupportTicket>(`${this.apiUrl}/wallet/change-request`, request);
  }

  /**
   * Get support ticket details
   */
  getSupportTicket(ticketId: string): Observable<SupportTicket> {
    return this.http.get<SupportTicket>(`${this.apiUrl}/wallet/support/${ticketId}`);
  }

  /**
   * Complete manual support process
   */
  completeSupportProcess(ticketId: string, newWallet: string, network: string, requiresVerification: boolean): Observable<SupportTicket> {
    const payload = {
      newWallet,
      network,
      require2FA: requiresVerification
    };
    return this.http.post<SupportTicket>(`${this.apiUrl}/wallet/support/${ticketId}/approve`, payload);
  }

  /**
   * Verify 2FA for wallet change
   */
  verify2FA(ticketId: string, code: string): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/wallet/support/${ticketId}/verify-2fa`, { code });
  }

  /**
   * Get wallet data observable
   */
  getWalletData() {
    return this.walletData$.asObservable();
  }

  /**
   * Update wallet data in memory
   */
  setWalletData(data: WalletData) {
    this.walletData$.next(data);
  }

  /**
   * Send confirmation email after wallet change
   */
  sendConfirmationEmail(userId: string, newWallet: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${this.apiUrl}/wallet/send-confirmation`, { userId, newWallet });
  }
}
