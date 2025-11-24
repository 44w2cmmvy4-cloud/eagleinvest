import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="theme-toggle">
      <button 
        class="btn btn-sm btn-theme"
        (click)="toggleTheme()"
        [title]="themeService.isDark() ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'">
        @if (themeService.isDark()) {
          <i class="bi bi-sun-fill"></i>
        } @else {
          <i class="bi bi-moon-fill"></i>
        }
      </button>
    </div>
  `,
  styles: [`
    .theme-toggle {
      display: inline-block;
    }

    .btn-theme {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      color: var(--accent-gold);
      width: 40px;
      height: 40px;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-base);
      box-shadow: var(--shadow-sm);
    }

    .btn-theme:hover {
      background: var(--bg-tertiary);
      border-color: var(--accent-gold);
      box-shadow: var(--shadow-glow);
      transform: scale(1.1) rotate(15deg);
    }

    .btn-theme:active {
      transform: scale(0.95);
    }

    .btn-theme i {
      font-size: 1.25rem;
    }
  `]
})
export class ThemeToggleComponent {
  themeService = inject(ThemeService);

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
