import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { NavbarComponent } from '../shared/navbar/navbar.component';

interface Investment {
  id: number;
  plan_name: string;
  amount: number;
  current_value: number;
  roi: number;
  status: string;
  end_date: string;
  progress: number;
}

@Component({
  selector: 'app-withdrawals',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './withdrawals-responsive.component.html',
  styleUrl: './withdrawals.component.css'
})
export class WithdrawalsComponent implements OnInit {
  withdrawalForm: FormGroup;
  balance = 12450.75;
  investments = signal<Investment[]>([]);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private dashboardService: DashboardService
  ) {
    this.withdrawalForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(50), Validators.max(this.balance)]],
      payment_method: ['', Validators.required],
      wallet_address: ['', Validators.required]
    });
  }

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadInvestments();
  }

  loadInvestments() {
    const user = this.authService.getCurrentUser();
    if (user?.id) {
      this.dashboardService.getDashboardData(user.id).subscribe({
        next: (data: any) => {
          this.investments.set(data.recent_transactions || []);
        },
        error: (error: any) => {
          console.error('Error loading investments:', error);
        }
      });
    }
  }

  setAmount(amount: number) {
    this.withdrawalForm.patchValue({ amount: amount });
  }

  calculateNetAmount(): string {
    const amount = this.withdrawalForm.get('amount')?.value || 0;
    const fee = amount * 0.025;
    return (amount - fee).toFixed(2);
  }

  submitWithdrawal() {
    if (this.withdrawalForm.valid) {
      const withdrawalData = this.withdrawalForm.value;
      console.log('Withdrawal requested:', withdrawalData);
      alert('Solicitud de retiro enviada exitosamente. Procesamiento en 24-48 horas.');
      this.withdrawalForm.reset();
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
