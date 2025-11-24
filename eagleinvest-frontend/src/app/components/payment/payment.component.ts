import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavbarComponent } from '../shared/navbar/navbar.component';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  fee: number;
  processingTime: string;
  enabled: boolean;
}

interface InvestmentPlan {
  id: number;
  name: string;
  min_amount: number;
  max_amount: number;
  daily_return: number;
  duration_days: number;
  description: string;
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
      processingTime: '1-3 días hábiles',
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
      max_amount: 999,
      daily_return: 1.2,
      duration_days: 30,
      description: 'Ideal para comenzar'
    },
    {
      id: 2,
      name: 'Plan Estándar',
      min_amount: 1000,
      max_amount: 4999,
      daily_return: 1.8,
      duration_days: 60,
      description: 'Mejor rendimiento'
    },
    {
      id: 3,
      name: 'Plan Premium',
      min_amount: 5000,
      max_amount: 19999,
      daily_return: 2.5,
      duration_days: 90,
      description: 'Máximo retorno'
    },
    {
      id: 4,
      name: 'Plan VIP',
      min_amount: 20000,
      max_amount: 1000000,
      daily_return: 3.2,
      duration_days: 120,
      description: 'Exclusivo y premium'
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
  
  constructor(private fb: FormBuilder) {
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
    return amt * (plan.daily_return / 100) * plan.duration_days;
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

    // Simulate payment processing
    setTimeout(() => {
      this.isProcessing.set(false);
      this.paymentSuccess.set(true);
      
      // Reset after 3 seconds
      setTimeout(() => {
        this.showPaymentModal.set(false);
        this.paymentSuccess.set(false);
        // Redirect to dashboard
        window.location.href = '/dashboard';
      }, 3000);
    }, 2000);
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
