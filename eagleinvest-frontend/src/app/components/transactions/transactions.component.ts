import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { NavbarComponent } from '../shared/navbar/navbar.component';

interface Transaction {
  id: number;
  type: string;
  amount: number;
  date: string;
  status: string;
  description: string;
}

interface TransactionStats {
  total_invested: number;
  total_withdrawn: number;
  total_profit: number;
  total_transactions: number;
}

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  templateUrl: './transactions-responsive.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit {
  transactions = signal<Transaction[]>([]);
  filteredTransactions = signal<Transaction[]>([]);
  stats = signal<TransactionStats>({
    total_invested: 0,
    total_withdrawn: 0,
    total_profit: 0,
    total_transactions: 0
  });

  selectedType = 'all';
  selectedStatus = 'all';
  searchTerm = '';
  
  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadTransactions();
  }

  loadTransactions() {
    const user = this.authService.getCurrentUser();
    if (user?.id) {
      this.dashboardService.getTransactions(user.id).subscribe({
        next: (response) => {
          this.transactions.set(response.data);
          this.filteredTransactions.set(response.data);
          this.calculateStats();
        },
        error: (error) => {
          console.error('Error loading transactions:', error);
        }
      });
    }
  }

  calculateStats() {
    const txs = this.transactions();
    this.stats.set({
      total_invested: txs.filter(t => t.type === 'investment').reduce((sum, t) => sum + t.amount, 0),
      total_withdrawn: txs.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0),
      total_profit: txs.filter(t => t.type === 'profit').reduce((sum, t) => sum + t.amount, 0),
      total_transactions: txs.length
    });
  }

  filterTransactions() {
    let filtered = this.transactions();

    if (this.selectedType !== 'all') {
      filtered = filtered.filter(t => t.type === this.selectedType);
    }

    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(t => t.status === this.selectedStatus);
    }

    if (this.searchTerm) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.id.toString().includes(search) || 
        t.amount.toString().includes(search) ||
        t.description.toLowerCase().includes(search)
      );
    }

    this.filteredTransactions.set(filtered);
  }

  getTypeBadgeColor(type: string): string {
    switch(type) {
      case 'investment':
        return 'linear-gradient(135deg, rgba(86,92,255,0.35), rgba(27,32,76,0.8))';
      case 'withdrawal':
        return 'linear-gradient(135deg, rgba(255,117,15,0.35), rgba(45,16,0,0.7))';
      case 'profit':
        return 'linear-gradient(135deg, rgba(12,235,221,0.35), rgba(6,40,59,0.8))';
      default:
        return 'linear-gradient(135deg, rgba(77,124,255,0.28), rgba(20,6,41,0.7))';
    }
  }

  getStatusBadgeColor(status: string): string {
    switch(status) {
      case 'completed':
        return 'rgba(12,235,221,0.15)';
      case 'pending':
        return 'rgba(255,159,67,0.18)';
      case 'cancelled':
        return 'rgba(255,107,107,0.15)';
      default:
        return 'rgba(117,129,168,0.18)';
    }
  }

  getStatusTextColor(status: string): string {
    switch(status) {
      case 'completed': return '#00F0FF';
      case 'pending': return '#FF9F43';
      case 'cancelled': return '#FF6B6B';
      default: return '#7581A8';
    }
  }

  getTypeLabel(type: string): string {
    switch(type) {
      case 'investment': return 'INVERSIÓN';
      case 'withdrawal': return 'RETIRO';
      case 'profit': return 'GANANCIAS';
      default: return type.toUpperCase();
    }
  }

  getStatusLabel(status: string): string {
    switch(status) {
      case 'completed': return 'terminado';
      case 'pending': return 'pendiente';
      case 'cancelled': return 'rechazado';
      default: return status;
    }
  }

  getStatusIcon(status: string): string {
    switch(status) {
      case 'completed': return '✔';
      case 'pending': return '⏳';
      case 'cancelled': return '⚠';
      default: return '•';
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
