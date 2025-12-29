import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { NavbarComponent } from '../shared/navbar/navbar.component';

interface UserProfile {
  name: string;
  email: string;
  phone_number: string;
  address: string;
  member_since: string;
  wallet_address?: string;
  wallet_network?: 'TRC20' | 'BEP20' | null;
  two_factor_enabled?: boolean;
}

interface InvestmentOverview {
  active_investments: number;
  total_portfolio_value: number;
  average_return: number;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './profile-responsive.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  walletForm: FormGroup;
  isEditing = false;
  showWalletSection = signal<boolean>(false);
  walletChangeRequested = signal<boolean>(false);
  currentWallet = signal<{ address: string, network: string } | null>(null);
  
  userProfile = signal<UserProfile | null>(null);
  investmentOverview = signal<InvestmentOverview | null>(null);
  private initialFormValue: any;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private profileService = inject(ProfileService);

  constructor() {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone_number: [''],
      address: [''],
      two_factor_enabled: [false]
    });

    this.walletForm = this.fb.group({
      wallet_address: ['', [Validators.required, Validators.minLength(34)]],
      wallet_network: ['TRC20', [Validators.required]]
    });
  }

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadProfileData();
    this.loadUserFromAuth();
  }

  loadUserFromAuth() {
    // Cargar datos básicos del usuario autenticado
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userProfile.set({
        name: user.name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        address: '',
        member_since: new Date().toISOString(),
        two_factor_enabled: user.two_factor_enabled || false
      });
      this.profileForm.patchValue({
        name: user.name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        address: '',
        two_factor_enabled: user.two_factor_enabled || false
      });
      this.initialFormValue = this.profileForm.value;
    }
  }

  loadProfileData() {
    const user = this.authService.getCurrentUser();
    if (user?.id) {
      this.profileService.getProfileData().subscribe({
        next: (data) => {
          if (data && data.user) {
            this.userProfile.set(data.user);
            this.profileForm.patchValue(data.user);
            this.initialFormValue = this.profileForm.value;
            
            if (data.investment_overview) {
              this.investmentOverview.set(data.investment_overview);
            }
          }
        },
        error: (error) => {
          console.error('Error loading profile:', error);
          // Si falla la carga desde el API, usar datos del auth
          this.loadUserFromAuth();
        }
      });
    } else {
      // Si no hay ID, usar datos básicos del auth
      this.loadUserFromAuth();
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.profileForm.patchValue(this.initialFormValue);
    }
  }

  cancelEdit() {
    this.isEditing = false;
    this.profileForm.patchValue(this.initialFormValue);
  }

  updateProfile() {
    if (this.profileForm.valid) {
      const updatedData = this.profileForm.value;
      const user = this.authService.getCurrentUser();
      if (user?.id) {
        this.profileService.updateProfile(user.id, updatedData).subscribe({
          next: (response) => {
            console.log('Profile updated successfully:', response);
            this.initialFormValue = this.profileForm.value;
            this.isEditing = false;
            this.loadProfileData();
          },
          error: (error) => {
            console.error('Error updating profile:', error);
          }
        });
      }
    }
  }

  updateTwoFactor() {
    const user = this.authService.getCurrentUser();
    const enabled = this.profileForm.get('two_factor_enabled')?.value ?? false;
    
    console.log('Intentando actualizar 2FA:', enabled);

    if (user?.id) {
      this.profileService.updateProfile(user.id, { two_factor_enabled: enabled }).subscribe({
        next: (response) => {
          console.log('2FA actualizado exitosamente:', response);
          // Actualizar el usuario en el AuthService también
          const currentUser = this.authService.getCurrentUser();
          if (currentUser) {
             currentUser.two_factor_enabled = enabled;
             // Hack: update local storage manually since AuthService doesn't expose a setter for just one field
             localStorage.setItem('userData', JSON.stringify(currentUser));
          }
        },
        error: (error) => {
          console.error('Error al actualizar 2FA:', error);
          // Revertir cambio en UI si falla
          this.profileForm.patchValue({ two_factor_enabled: !enabled }, { emitEvent: false });
        }
      });
    } else {
      console.error('No se encontró ID de usuario para actualizar 2FA');
    }
  }

  onTwoFactorChange(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    console.log('Toggle cambiado:', checked);
    this.profileForm.patchValue({ two_factor_enabled: checked });
    this.updateTwoFactor();
  }

  toggleWalletSection() {
    this.showWalletSection.set(!this.showWalletSection());
  }

  requestWalletChange() {
    if (this.walletForm.valid) {
      // En producción, esto enviaría una solicitud de soporte
      console.log('Solicitud de cambio de wallet:', this.walletForm.value);
      this.walletChangeRequested.set(true);
      
      // Simular envío de email de verificación
      setTimeout(() => {
        alert('Se ha enviado una solicitud al equipo de soporte. Recibirás un email de confirmación.');
        this.walletChangeRequested.set(false);
      }, 1500);
    } else {
      Object.keys(this.walletForm.controls).forEach(key => {
        const control = this.walletForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  selectNetwork(network: 'TRC20' | 'BEP20') {
    this.walletForm.patchValue({ wallet_network: network });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
