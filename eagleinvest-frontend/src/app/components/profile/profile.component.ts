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
  isEditing = false;
  
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
      address: ['']
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
        phone_number: '',
        address: '',
        member_since: new Date().toISOString()
      });
      this.profileForm.patchValue({
        name: user.name || '',
        email: user.email || '',
        phone_number: '',
        address: ''
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

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
