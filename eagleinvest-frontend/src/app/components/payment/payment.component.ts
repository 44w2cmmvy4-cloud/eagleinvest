import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { InvestmentService } from '../../services/investment.service';
import { Router } from '@angular/router';
import { InvestmentPlan } from '../../models/api-models';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  fee: number;
  processingTime: string;
  enabled: boolean;
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent {
  // Payment Methods
  paymentMethods = signal<PaymentMethod[]>([
    {
      id: 'card',
      name: 'Tarjeta de Crédito/Débito',
      icon: 'bi-credit-card',
      description: 'Visa, Mastercard, American Express',
      fee: 2.9,
      processingTime: 'Instantáneo',
      enabled: true
    },
    {
      id: 'crypto',
      name: 'Criptomonedas',
      icon: 'bi-currency-bitcoin',
      description: 'Bitcoin, Ethereum, USDT',
      fee: 0.5,
      processingTime: '10-30 minutos',
      enabled: true
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: 'bi-paypal',
      description: 'Pago rápido y seguro',
      fee: 3.5,
      processingTime: 'Instantáneo',
      enabled: true
    },
    {
      id: 'bank',
      name: 'Transferencia Bancaria',
      icon: 'bi-bank',
      description: 'Transferencia directa',
      fee: 0,
      processingTime: '1-3 minutos (Sim)',
      enabled: true
    },
    {
      id: 'zelle',
      name: 'Zelle',
      icon: 'bi-lightning-charge',
      description: 'Pago instantáneo',
      fee: 0,
      processingTime: 'Instantáneo',
      enabled: true
    }
  ]);

  // Investment Plans
  investmentPlans = signal<InvestmentPlan[]>([
    {
      id: 1,
      name: 'Plan Básico',
      min_amount: 100,
      max_amount: 1000,
      daily_return_rate: 1.2,
      duration_days: 30,
      withdrawal_interval_days: 10,
      minimum_withdrawal_amount: 10,
      is_active: true,
      features: ['Retorno diario garantizado', 'Capital protegido', 'Soporte 24/7', 'Retiro instantáneo'],
      recommended: false,
      accent: '#00F0FF',
      tagline: 'Perfecto para principiantes. Inversión segura.',
      risk_level: 'Bajo',
      liquidity: '24h',
      roi_display: '36% Total'
    },
    {
      id: 2,
      name: 'Plan Intermedio',
      min_amount: 1000,
      max_amount: 5000,
      daily_return_rate: 1.8,
      duration_days: 45,
      withdrawal_interval_days: 10,
      minimum_withdrawal_amount: 50,
      is_active: true,
      features: ['Retorno diario del 1.8%', 'Bonus de bienvenida', 'Asesor personal', 'Análisis de mercado'],
      recommended: true,
      accent: '#D4AF37',
      tagline: 'Mayor rentabilidad para inversores con experiencia.',
      risk_level: 'Medio',
      liquidity: '48h',
      roi_display: '81% Total'
    },
    {
      id: 3,
      name: 'Plan Premium',
      min_amount: 5000,
      max_amount: 25000,
      daily_return_rate: 2.5,
      duration_days: 60,
      withdrawal_interval_days: 15,
      minimum_withdrawal_amount: 100,
      is_active: true,
      features: ['Retorno diario del 2.5%', 'Acceso VIP', 'Estrategias exclusivas', 'Retiros prioritarios'],
      recommended: false,
      accent: '#9D00FF',
      tagline: 'Para inversores que buscan máxima rentabilidad.',
      risk_level: 'Alto',
      liquidity: '72h',
      roi_display: '150% Total'
    },
    {
      id: 4,
      name: 'Plan Elite',
      min_amount: 25000,
      max_amount: 100000,
      daily_return_rate: 3.2,
      duration_days: 90,
      withdrawal_interval_days: 30,
      minimum_withdrawal_amount: 500,
      is_active: true,
      features: ['Retorno diario del 3.2%', 'Cuenta gerenciada', 'Acceso a mercados exclusivos', 'Gestor dedicado'],
      recommended: false,
      accent: '#FF0000',
      tagline: 'El plan más exclusivo para grandes inversores.',
      risk_level: 'Muy Alto',
      liquidity: 'Instantánea',
      roi_display: '288% Total'
    }
  ]);

  // Selected States
  selectedPaymentMethod = signal<string>('');
  selectedPlan = signal<InvestmentPlan | null>(null);
  amount = signal<number>(0);
  
  // Forms
  cardForm: FormGroup;
  cryptoForm: FormGroup;
  bankForm: FormGroup;
  
  // UI States
  showPaymentModal = signal<boolean>(false);
  isProcessing = signal<boolean>(false);
  paymentSuccess = signal<boolean>(false);
  
  constructor(
    private fb: FormBuilder,
    private investmentService: InvestmentService,
    private router: Router
  ) {
    // Card Form
    this.cardForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      cardName: ['', Validators.required],
      expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]]
    });

    // Crypto Form
    this.cryptoForm = this.fb.group({
      cryptoCurrency: ['BTC', Validators.required],
      walletAddress: ['', Validators.required]
    });

    // Bank Form
    this.bankForm = this.fb.group({
      accountName: ['', Validators.required],
      accountNumber: ['', Validators.required],
      bankName: ['', Validators.required],
      routingNumber: ['', Validators.required]
    });
  }

  // Computed values
  selectedMethodDetails = computed(() => {
    const methodId = this.selectedPaymentMethod();
    return this.paymentMethods().find(m => m.id === methodId);
  });

  processingFee = computed(() => {
    const method = this.selectedMethodDetails();
    const amt = this.amount();
    if (!method || !amt) return 0;
    return (amt * method.fee) / 100;
  });

  totalAmount = computed(() => {
    return this.amount() + this.processingFee();
  });

  estimatedReturn = computed(() => {
    const plan = this.selectedPlan();
    const amt = this.amount();
    if (!plan || !amt) return 0;
    return amt * (plan.daily_return_rate / 100) * plan.duration_days;
  });

  totalReturn = computed(() => {
    return this.amount() + this.estimatedReturn();
  });

  // Methods
  selectPaymentMethod(methodId: string) {
    this.selectedPaymentMethod.set(methodId);
  }

  selectPlan(plan: InvestmentPlan) {
    this.selectedPlan.set(plan);
    if (this.amount() < plan.min_amount) {
      this.amount.set(plan.min_amount);
    }
  }

  validateAmount(): boolean {
    const plan = this.selectedPlan();
    const amt = this.amount();
    if (!plan) return false;
    return amt >= plan.min_amount && amt <= plan.max_amount;
  }

  proceedToPayment() {
    if (!this.selectedPlan() || !this.validateAmount() || !this.selectedPaymentMethod()) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }
    this.showPaymentModal.set(true);
  }

  processPayment() {
    const method = this.selectedPaymentMethod();
    let isValid = false;

    switch(method) {
      case 'card':
        isValid = this.cardForm.valid;
        break;
      case 'crypto':
        isValid = this.cryptoForm.valid;
        break;
      case 'bank':
        isValid = this.bankForm.valid;
        break;
      case 'paypal':
      case 'zelle':
        isValid = true; // These are redirected
        break;
    }

    if (!isValid) {
      alert('Por favor completa todos los campos del formulario');
      return;
    }

    this.isProcessing.set(true);

    // Call Backend API
    this.investmentService.createInvestment({
      amount: this.amount()
    }).subscribe({
      next: (response) => {
        this.isProcessing.set(false);
        this.paymentSuccess.set(true);
        
        // Reset after 3 seconds
        setTimeout(() => {
          this.showPaymentModal.set(false);
          this.paymentSuccess.set(false);
          // Redirect to dashboard
          this.router.navigate(['/dashboard']);
        }, 3000);
      },
      error: (error) => {
        this.isProcessing.set(false);
        console.error('Investment error:', error);
        alert(error.error?.error || 'Error al procesar la inversión. Inténtalo de nuevo.');
      }
    });
  }

  closeModal() {
    this.showPaymentModal.set(false);
    this.paymentSuccess.set(false);
  }

  formatCardNumber(event: any) {
    let value = event.target.value.replace(/\s/g, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    this.cardForm.patchValue({ cardNumber: formattedValue.replace(/\s/g, '') });
    event.target.value = formattedValue;
  }
}
