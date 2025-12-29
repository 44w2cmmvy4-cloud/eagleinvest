import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent) 
  },
  { 
    path: 'login', 
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent) 
  },
  { 
    path: 'register-invitation', 
    loadComponent: () => import('./components/auth/register-by-invitation/register-by-invitation').then(m => m.RegisterByInvitation) 
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'withdrawals', 
    loadComponent: () => import('./components/withdrawals/withdrawals.component').then(m => m.WithdrawalsComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'transactions', 
    loadComponent: () => import('./components/transactions/transactions.component').then(m => m.TransactionsComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'profile', 
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'referrals', 
    loadComponent: () => import('./components/referrals/referrals.component').then(m => m.ReferralsComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'market', 
    loadComponent: () => import('./components/market-overview/market-overview.component').then(m => m.MarketOverviewComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'payment', 
    loadComponent: () => import('./components/payment/payment.component').then(m => m.PaymentComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];
