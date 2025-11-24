import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { WalletService } from '../../services/wallet.service';
import { NotificationService } from '../../services/notification.service';
import { NavbarComponent } from '../shared/navbar/navbar.component';

interface WalletInfo {
  address: string;
  network: string;
  balance: string;
  connected: boolean;
}

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent],
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class WalletComponent implements OnInit {
  walletInfo = signal<WalletInfo | null>(null);
  isConnecting = signal(false);
  supportedWallets = signal([
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      description: 'Conecta con MetaMask',
      color: 'linear-gradient(135deg, rgba(241,90,34,0.3), rgba(251,176,59,0.3))',
      installed: false
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: '🔗',
      description: 'Conecta con cualquier wallet móvil',
      color: 'linear-gradient(135deg, rgba(59,153,252,0.3), rgba(59,130,246,0.3))',
      installed: true
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: '💎',
      description: 'Conecta con Coinbase',
      color: 'linear-gradient(135deg, rgba(0,82,255,0.3), rgba(0,116,255,0.3))',
      installed: false
    },
    {
      id: 'trustwallet',
      name: 'Trust Wallet',
      icon: '⚡',
      description: 'Conecta con Trust Wallet',
      color: 'linear-gradient(135deg, rgba(51,126,255,0.3), rgba(48,141,255,0.3))',
      installed: false
    }
  ]);

  private authService = inject(AuthService);
  private walletService = inject(WalletService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadWalletInfo();
    this.checkWalletProviders();
  }

  checkWalletProviders() {
    const ethereum = (window as any).ethereum;
    if (ethereum) {
      const wallets = this.supportedWallets();
      const metamaskIndex = wallets.findIndex(w => w.id === 'metamask');
      if (metamaskIndex !== -1) {
        wallets[metamaskIndex].installed = true;
        this.supportedWallets.set([...wallets]);
      }
    }
  }

  loadWalletInfo() {
    const user = this.authService.getCurrentUser();
    if (user?.id) {
      this.walletService.getWalletInfo(user.id).subscribe({
        next: (info) => {
          this.walletInfo.set(info);
        },
        error: (error) => {
          console.error('Error loading wallet info:', error);
        }
      });
    }
  }

  async connectWallet(walletId: string) {
    this.isConnecting.set(true);

    try {
      let address = '';
      let network = '';

      if (walletId === 'metamask') {
        const result = await this.connectMetaMask();
        address = result.address;
        network = result.network;
      } else if (walletId === 'walletconnect') {
        const result = await this.connectWalletConnect();
        address = result.address;
        network = result.network;
      } else {
        this.notificationService.show('Wallet no disponible aún', 'warning');
        this.isConnecting.set(false);
        return;
      }

      // Save wallet to backend
      const user = this.authService.getCurrentUser();
      if (user?.id) {
        this.walletService.saveWallet(user.id, address, network, walletId).subscribe({
          next: () => {
            this.walletInfo.set({
              address,
              network,
              balance: '0.00',
              connected: true
            });
            this.notificationService.show('Wallet conectada exitosamente', 'success');
          },
          error: (error) => {
            console.error('Error saving wallet:', error);
            this.notificationService.show('Error al guardar wallet', 'error');
          }
        });
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      this.notificationService.show(error.message || 'Error al conectar wallet', 'error');
    } finally {
      this.isConnecting.set(false);
    }
  }

  async connectMetaMask(): Promise<{ address: string; network: string }> {
    const ethereum = (window as any).ethereum;
    
    if (!ethereum || !ethereum.isMetaMask) {
      throw new Error('MetaMask no está instalado');
    }

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const chainId = await ethereum.request({ method: 'eth_chainId' });
      
      return {
        address: accounts[0],
        network: this.getNetworkName(chainId)
      };
    } catch (error: any) {
      throw new Error('Usuario rechazó la conexión con MetaMask');
    }
  }

  async connectWalletConnect(): Promise<{ address: string; network: string }> {
    // Placeholder - requires WalletConnect SDK
    throw new Error('WalletConnect requiere configuración adicional');
  }

  getNetworkName(chainId: string): string {
    const networks: Record<string, string> = {
      '0x1': 'Ethereum Mainnet',
      '0x89': 'Polygon',
      '0x38': 'BSC',
      '0xa86a': 'Avalanche'
    };
    return networks[chainId] || 'Unknown Network';
  }

  disconnectWallet() {
    const user = this.authService.getCurrentUser();
    if (user?.id) {
      this.walletService.disconnectWallet(user.id).subscribe({
        next: () => {
          this.walletInfo.set(null);
          this.notificationService.show('Wallet desconectada', 'success');
        },
        error: (error) => {
          console.error('Error disconnecting wallet:', error);
          this.notificationService.show('Error al desconectar wallet', 'error');
        }
      });
    }
  }

  copyAddress() {
    const address = this.walletInfo()?.address;
    if (address) {
      navigator.clipboard.writeText(address).then(() => {
        this.notificationService.show('Dirección copiada', 'success');
      });
    }
  }

  formatAddress(address: string): string {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }
}
