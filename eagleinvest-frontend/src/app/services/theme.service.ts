import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'eagleinvest-theme';
  
  // Signal para el tema actual
  currentTheme = signal<Theme>(this.getInitialTheme());
  
  // Signal para saber si estamos en modo oscuro
  isDark = signal<boolean>(this.calculateIsDark(this.getInitialTheme()));

  constructor() {
    // Aplicar tema inicial
    this.applyTheme(this.currentTheme());
    
    // Escuchar cambios en las preferencias del sistema
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (this.currentTheme() === 'auto') {
          this.isDark.set(e.matches);
          this.applyTheme('auto');
        }
      });
    }

    // Effect para aplicar el tema cuando cambie
    effect(() => {
      const theme = this.currentTheme();
      this.applyTheme(theme);
      this.isDark.set(this.calculateIsDark(theme));
    });
  }

  /**
   * Obtiene el tema inicial desde localStorage o preferencias del sistema
   */
  private getInitialTheme(): Theme {
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
    if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
      return savedTheme;
    }
    return 'auto';
  }

  /**
   * Calcula si debemos estar en modo oscuro
   */
  private calculateIsDark(theme: Theme): boolean {
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    
    // auto: usar preferencias del sistema
    if (window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true; // Por defecto oscuro
  }

  /**
   * Aplica el tema al documento
   */
  private applyTheme(theme: Theme): void {
    const isDark = this.calculateIsDark(theme);
    const themeValue = isDark ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', themeValue);
    
    // Guardar preferencia
    localStorage.setItem(this.THEME_KEY, theme);
  }

  /**
   * Cambia al tema especificado
   */
  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
  }

  /**
   * Alterna entre claro y oscuro
   */
  toggleTheme(): void {
    const current = this.isDark();
    this.setTheme(current ? 'light' : 'dark');
  }

  /**
   * Obtiene el tema actual
   */
  getTheme(): Theme {
    return this.currentTheme();
  }

  /**
   * Verifica si estamos en modo oscuro
   */
  isCurrentlyDark(): boolean {
    return this.isDark();
  }
}
