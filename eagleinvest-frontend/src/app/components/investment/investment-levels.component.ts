import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvestmentService, InvestmentLevel, LevelBenefits } from '../../services/investment.service';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from '../shared/navbar/navbar.component';

@Component({
  selector: 'app-investment-levels',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    
    <div style="background: linear-gradient(135deg, #0A0E27 0%, #13172E 50%, #0A0E27 100%); min-height: 100vh; padding: 40px 20px;">
      <div class="container-fluid" style="max-width: 1200px; margin: 0 auto;">
        <h1 style="color: white; text-align: center; margin-bottom: 15px; font-weight: 800; font-size: 2.5rem;">
          📊 Niveles de Inversión
        </h1>
        <p style="color: #A1A9C9; text-align: center; margin-bottom: 50px; font-size: 1.1rem;">
          Descubre los beneficios de cada nivel según tu rango de inversión
        </p>

        <!-- Niveles Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px; margin-bottom: 50px;">
          @for (level of levels(); track level.level) {
            <div 
              [style.background]="getLevelGradient(level.level)"
              style="border: 2px solid; border-radius: 20px; padding: 30px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 10px 30px rgba(0,0,0,0.3);"
              [style.border-color]="getLevelColor(level.level)"
              (mouseenter)="selectedLevel.set(level.level)"
              (click)="selectedLevel.set(level.level)"
            >
              <!-- Icon/Emoji -->
              <div style="font-size: 3rem; text-align: center; margin-bottom: 15px;">{{ level.icon }}</div>
              
              <!-- Level Name -->
              <h3 style="color: white; text-align: center; margin: 0 0 20px 0; font-weight: 800; font-size: 1.8rem;">
                {{ level.name }}
              </h3>

              <!-- Investment Range -->
              <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 12px; margin-bottom: 20px;">
                <p style="color: #7581A8; font-size: 0.85rem; margin: 0 0 8px 0;">Rango de Inversión</p>
                <p style="color: white; font-weight: 700; font-size: 1.2rem; margin: 0;">
                  $ {{ level.minAmount | number:'1.0-0' }} - 
                  @if (level.maxAmount === Infinity) {
                    Ilimitado
                  } @else {
                    $ {{ level.maxAmount | number:'1.0-0' }}
                  }
                </p>
              </div>

              <!-- Benefits -->
              <div style="margin-bottom: 20px;">
                <p style="color: #7581A8; font-size: 0.85rem; margin: 0 0 12px 0; font-weight: 600;">Beneficios</p>
                <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px;">
                  <li style="display: flex; align-items: center; gap: 8px; color: white; font-size: 0.95rem;">
                    <span style="color: {{ getLevelColor(level.level) }}; font-weight: 700;">✓</span>
                    {{ level.levels }} Niveles de Red
                  </li>
                  <li style="display: flex; align-items: center; gap: 8px; color: white; font-size: 0.95rem;">
                    <span style="color: {{ getLevelColor(level.level) }}; font-weight: 700;">✓</span>
                    Top: ${{ level.topAmount?.toFixed?.(0) || level.topAmount }}
                  </li>
                  <li style="display: flex; align-items: center; gap: 8px; color: white; font-size: 0.95rem;">
                    <span style="color: {{ getLevelColor(level.level) }}; font-weight: 700;">✓</span>
                    Comisión Mensual
                  </li>
                  <li style="display: flex; align-items: center; gap: 8px; color: white; font-size: 0.95rem;">
                    <span style="color: {{ getLevelColor(level.level) }}; font-weight: 700;">✓</span>
                    Soporte Premium
                  </li>
                </ul>
              </div>

              <!-- Action Button -->
              <button 
                style="width: 100%; padding: 12px; background: {{ getLevelColor(level.level) }}; color: #0A0E27; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 0.95rem; transition: all 0.3s ease;"
                (mouseenter)="$event.currentTarget.style.transform = 'scale(1.05)'"
                (mouseleave)="$event.currentTarget.style.transform = 'scale(1)'"
              >
                Invertir en {{ level.name }}
              </button>
            </div>
          }
        </div>

        <!-- Detalles Expandidos -->
        @if (selectedLevel() && getLevelDetails(selectedLevel()!)) {
          <div style="background: rgba(26,31,77,0.5); border: 1px solid rgba(0,240,255,0.2); border-radius: 15px; padding: 40px; backdrop-filter: blur(10px);">
            <h2 style="color: white; margin-bottom: 30px; font-weight: 800;">
              {{ getLevelDetails(selectedLevel()!)!.name }} - Detalles Completos
            </h2>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
              <!-- Columna Izquierda -->
              <div>
                <h4 style="color: {{ getLevelColor(selectedLevel()!) }}; margin-bottom: 20px; font-weight: 700; font-size: 1.2rem;">
                  📋 Información
                </h4>
                <div style="display: flex; flex-direction: column; gap: 15px;">
                  <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px;">
                    <p style="color: #7581A8; margin: 0 0 5px 0; font-size: 0.9rem;">Nivel de Red</p>
                    <p style="color: white; margin: 0; font-weight: 700; font-size: 1.3rem;">{{ getLevelDetails(selectedLevel()!)!.levels }} Niveles</p>
                  </div>
                  <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px;">
                    <p style="color: #7581A8; margin: 0 0 5px 0; font-size: 0.9rem;">Top Máximo</p>
                    <p style="color: white; margin: 0; font-weight: 700; font-size: 1.3rem;">\${{ getLevelDetails(selectedLevel()!)!.topAmount | number:'1.0-0' }}</p>
                  </div>
                  <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 10px;">
                    <p style="color: #7581A8; margin: 0 0 5px 0; font-size: 0.9rem;">Monto Mínimo</p>
                    <p style="color: white; margin: 0; font-weight: 700; font-size: 1.3rem;">\${{ getLevelDetails(selectedLevel()!)!.minAmount | number:'1.0-0' }}</p>
                  </div>
                </div>
              </div>

              <!-- Columna Derecha -->
              <div>
                <h4 style="color: {{ getLevelColor(selectedLevel()!) }}; margin-bottom: 20px; font-weight: 700; font-size: 1.2rem;">
                  ✨ Características
                </h4>
                <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px;">
                  <li style="display: flex; align-items: center; gap: 10px; color: white; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 8px;">
                    <span style="color: {{ getLevelColor(selectedLevel()!) }}; font-size: 1.3rem;">🎯</span>
                    <span>Acceso a todas las oportunidades de inversión</span>
                  </li>
                  <li style="display: flex; align-items: center; gap: 10px; color: white; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 8px;">
                    <span style="color: {{ getLevelColor(selectedLevel()!) }}; font-size: 1.3rem;">💰</span>
                    <span>Comisiones mensuales garantizadas</span>
                  </li>
                  <li style="display: flex; align-items: center; gap: 10px; color: white; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 8px;">
                    <span style="color: {{ getLevelColor(selectedLevel()!) }}; font-size: 1.3rem;">🔗</span>
                    <span>Red unilevel automática</span>
                  </li>
                  <li style="display: flex; align-items: center; gap: 10px; color: white; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 8px;">
                    <span style="color: {{ getLevelColor(selectedLevel()!) }}; font-size: 1.3rem;">📞</span>
                    <span>Soporte dedicado 24/7</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
  `]
})
export class InvestmentLevelsComponent implements OnInit {
  private investmentService = inject(InvestmentService);

  selectedLevel = signal<InvestmentLevel | null>(null);
  levels = signal<LevelBenefits[]>([]);

  ngOnInit() {
    // Load all levels
    const allLevels: InvestmentLevel[] = ['BRONZE', 'PLATA', 'ORO', 'PLATINO'];
    const levelsList = allLevels.map(level => this.investmentService.getLevelBenefits(level));
    this.levels.set(levelsList);
    
    // Select first level by default
    this.selectedLevel.set('BRONZE');
  }

  getLevelDetails(level: InvestmentLevel): LevelBenefits | null {
    return this.investmentService.getLevelBenefits(level);
  }

  getLevelColor(level: InvestmentLevel): string {
    const colors: Record<InvestmentLevel, string> = {
      BRONZE: '#CD7F32',
      PLATA: '#C0C0C0',
      ORO: '#FFD700',
      PLATINO: '#4D7CFF'
    };
    return colors[level];
  }

  getLevelGradient(level: InvestmentLevel): string {
    const gradients: Record<InvestmentLevel, string> = {
      BRONZE: 'linear-gradient(135deg, rgba(205,127,50,0.15), rgba(205,127,50,0.05))',
      PLATA: 'linear-gradient(135deg, rgba(192,192,192,0.15), rgba(192,192,192,0.05))',
      ORO: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,215,0,0.05))',
      PLATINO: 'linear-gradient(135deg, rgba(77,124,255,0.15), rgba(77,124,255,0.05))'
    };
    return gradients[level];
  }

  readonly Infinity = Infinity;
}
