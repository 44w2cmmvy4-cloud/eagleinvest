import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'investment' | 'trading' | 'referral' | 'milestone';
  requirement: number;
  progress: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  reward?: {
    type: 'bonus' | 'badge' | 'feature';
    value: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AchievementService {
  private achievements = new BehaviorSubject<Achievement[]>(this.getInitialAchievements());
  public achievements$ = this.achievements.asObservable();

  constructor() {
    this.loadProgress();
  }

  /**
   * Logros iniciales del sistema
   */
  private getInitialAchievements(): Achievement[] {
    return [
      {
        id: 'first-investment',
        title: '🎯 Primera Inversión',
        description: 'Realiza tu primera inversión en EagleInvest',
        icon: '🎯',
        category: 'investment',
        requirement: 1,
        progress: 0,
        isUnlocked: false,
        reward: { type: 'bonus', value: '$5 de bonificación' }
      },
      {
        id: 'investor-bronze',
        title: '🥉 Inversor Bronce',
        description: 'Alcanza $1,000 en inversiones totales',
        icon: '🥉',
        category: 'investment',
        requirement: 1000,
        progress: 0,
        isUnlocked: false,
        reward: { type: 'badge', value: 'Insignia Bronce' }
      },
      {
        id: 'investor-silver',
        title: '🥈 Inversor Plata',
        description: 'Alcanza $5,000 en inversiones totales',
        icon: '🥈',
        category: 'investment',
        requirement: 5000,
        progress: 0,
        isUnlocked: false,
        reward: { type: 'bonus', value: '1% de cashback' }
      },
      {
        id: 'investor-gold',
        title: '🥇 Inversor Oro',
        description: 'Alcanza $10,000 en inversiones totales',
        icon: '🥇',
        category: 'investment',
        requirement: 10000,
        progress: 0,
        isUnlocked: false,
        reward: { type: 'bonus', value: '2% de cashback' }
      },
      {
        id: 'trader-novice',
        title: '📊 Trader Novato',
        description: 'Completa 10 transacciones exitosas',
        icon: '📊',
        category: 'trading',
        requirement: 10,
        progress: 0,
        isUnlocked: false,
        reward: { type: 'feature', value: 'Acceso a gráficos avanzados' }
      },
      {
        id: 'trader-pro',
        title: '💎 Trader Profesional',
        description: 'Completa 50 transacciones exitosas',
        icon: '💎',
        category: 'trading',
        requirement: 50,
        progress: 0,
        isUnlocked: false,
        reward: { type: 'feature', value: 'API de trading automatizado' }
      },
      {
        id: 'referral-starter',
        title: '🤝 Networker Inicial',
        description: 'Refiere a 3 nuevos usuarios',
        icon: '🤝',
        category: 'referral',
        requirement: 3,
        progress: 0,
        isUnlocked: false,
        reward: { type: 'bonus', value: '$15 de bonificación' }
      },
      {
        id: 'referral-master',
        title: '👑 Maestro de Referencias',
        description: 'Refiere a 10 nuevos usuarios',
        icon: '👑',
        category: 'referral',
        requirement: 10,
        progress: 0,
        isUnlocked: false,
        reward: { type: 'bonus', value: '$100 de bonificación' }
      },
      {
        id: 'profit-maker',
        title: '💰 Generador de Ganancias',
        description: 'Genera $500 en ganancias acumuladas',
        icon: '💰',
        category: 'milestone',
        requirement: 500,
        progress: 0,
        isUnlocked: false,
        reward: { type: 'badge', value: 'Insignia Profit Maker' }
      },
      {
        id: 'eagle-elite',
        title: '🦅 Elite Eagle',
        description: 'Alcanza $50,000 en inversiones totales',
        icon: '🦅',
        category: 'milestone',
        requirement: 50000,
        progress: 0,
        isUnlocked: false,
        reward: { type: 'feature', value: 'Acceso VIP y asesor personal' }
      }
    ];
  }

  /**
   * Actualizar progreso de un logro
   */
  updateProgress(achievementId: string, newProgress: number): void {
    const currentAchievements = this.achievements.value;
    const updatedAchievements = currentAchievements.map(achievement => {
      if (achievement.id === achievementId) {
        const isNowUnlocked = !achievement.isUnlocked && newProgress >= achievement.requirement;
        
        if (isNowUnlocked) {
          // Notificar logro desbloqueado
          this.notifyAchievementUnlocked(achievement);
        }

        return {
          ...achievement,
          progress: newProgress,
          isUnlocked: isNowUnlocked || achievement.isUnlocked,
          unlockedAt: isNowUnlocked ? new Date() : achievement.unlockedAt
        };
      }
      return achievement;
    });

    this.achievements.next(updatedAchievements);
    this.saveProgress();
  }

  /**
   * Actualizar múltiples progresos basados en datos del usuario
   */
  syncWithUserData(userData: any): void {
    this.updateProgress('first-investment', userData.active_investments > 0 ? 1 : 0);
    this.updateProgress('investor-bronze', userData.total_invested || 0);
    this.updateProgress('investor-silver', userData.total_invested || 0);
    this.updateProgress('investor-gold', userData.total_invested || 0);
    this.updateProgress('referral-starter', userData.total_referrals || 0);
    this.updateProgress('referral-master', userData.total_referrals || 0);
    this.updateProgress('profit-maker', userData.total_earnings || 0);
    this.updateProgress('eagle-elite', userData.total_invested || 0);
  }

  /**
   * Obtener logros desbloqueados
   */
  getUnlockedAchievements(): Achievement[] {
    return this.achievements.value.filter(a => a.isUnlocked);
  }

  /**
   * Obtener logros pendientes
   */
  getPendingAchievements(): Achievement[] {
    return this.achievements.value.filter(a => !a.isUnlocked);
  }

  /**
   * Calcular porcentaje de progreso global
   */
  getOverallProgress(): number {
    const total = this.achievements.value.length;
    const unlocked = this.getUnlockedAchievements().length;
    return total > 0 ? (unlocked / total) * 100 : 0;
  }

  /**
   * Notificar logro desbloqueado
   */
  private notifyAchievementUnlocked(achievement: Achievement): void {
    // Aquí puedes integrar con el NotificationService
    console.log(`🎉 ¡Logro desbloqueado! ${achievement.title}`);
    
    // Mostrar notificación visual
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🎉 ¡Nuevo Logro!', {
        body: `${achievement.title}: ${achievement.description}`,
        icon: '/assets/logo.png'
      });
    }
  }

  /**
   * Guardar progreso en localStorage
   */
  private saveProgress(): void {
    const data = this.achievements.value.map(a => ({
      id: a.id,
      progress: a.progress,
      isUnlocked: a.isUnlocked,
      unlockedAt: a.unlockedAt
    }));
    localStorage.setItem('achievements', JSON.stringify(data));
  }

  /**
   * Cargar progreso desde localStorage
   */
  private loadProgress(): void {
    const stored = localStorage.getItem('achievements');
    if (stored) {
      try {
        const savedProgress = JSON.parse(stored);
        const currentAchievements = this.achievements.value;
        
        const updated = currentAchievements.map(achievement => {
          const saved = savedProgress.find((s: any) => s.id === achievement.id);
          if (saved) {
            return {
              ...achievement,
              progress: saved.progress,
              isUnlocked: saved.isUnlocked,
              unlockedAt: saved.unlockedAt ? new Date(saved.unlockedAt) : undefined
            };
          }
          return achievement;
        });

        this.achievements.next(updated);
      } catch (e) {
        console.error('Error loading achievements:', e);
      }
    }
  }

  /**
   * Resetear todos los logros (para testing)
   */
  resetAllAchievements(): void {
    const reset = this.achievements.value.map(a => ({
      ...a,
      progress: 0,
      isUnlocked: false,
      unlockedAt: undefined
    }));
    this.achievements.next(reset);
    this.saveProgress();
  }
}
