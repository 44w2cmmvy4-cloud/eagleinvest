import { Injectable, signal } from '@angular/core';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface BotTrade {
  id: string;
  time: string;
  pair: string;
  type: 'BUY' | 'SELL';
  amount: number;
  price: number;
  profit: number;
}

export interface BotStats {
  tradesToday: number;
  successRate: number;
  profitToday: number;
  balance: number;
  totalTrades: number;
}

export interface BotConfig {
  maxTradeAmount: number;
  stopLoss: number;
  takeProfit: number;
  tradingPairs: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

@Injectable({
  providedIn: 'root'
})
export class TradingBotService {
  private destroy$ = new Subject<void>();
  
  botActive = signal(false);
  botStats = signal<BotStats>({
    tradesToday: 0,
    successRate: 0,
    profitToday: 0,
    balance: 5000,
    totalTrades: 0
  });
  
  botTrades = signal<BotTrade[]>([]);
  
  botConfig = signal<BotConfig>({
    maxTradeAmount: 500,
    stopLoss: 2,
    takeProfit: 5,
    tradingPairs: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT'],
    riskLevel: 'medium'
  });

  constructor() {
    this.loadBotData();
  }

  startBot() {
    if (this.botActive()) return;
    
    this.botActive.set(true);
    
    // Simular trades cada 30-60 segundos
    interval(Math.random() * 30000 + 30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.botActive()) {
          this.executeTrade();
        }
      });
  }

  stopBot() {
    this.botActive.set(false);
    this.destroy$.next();
  }

  private executeTrade() {
    const pairs = this.botConfig().tradingPairs;
    const pair = pairs[Math.floor(Math.random() * pairs.length)];
    const type: 'BUY' | 'SELL' = Math.random() > 0.5 ? 'BUY' : 'SELL';
    const amount = Math.random() * this.botConfig().maxTradeAmount;
    const price = this.getRandomPrice(pair);
    
    // 75% de probabilidad de ganancia (bot optimizado)
    const isProfit = Math.random() > 0.25;
    const profitPercent = isProfit 
      ? Math.random() * this.botConfig().takeProfit
      : -Math.random() * this.botConfig().stopLoss;
    
    const profit = (amount * profitPercent) / 100;

    const trade: BotTrade = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString(),
      pair,
      type,
      amount,
      price,
      profit
    };

    const currentTrades = this.botTrades();
    this.botTrades.set([trade, ...currentTrades].slice(0, 20));

    // Actualizar estadísticas
    const stats = this.botStats();
    this.botStats.set({
      tradesToday: stats.tradesToday + 1,
      successRate: Math.round(((stats.successRate * stats.tradesToday + (isProfit ? 100 : 0)) / (stats.tradesToday + 1))),
      profitToday: stats.profitToday + profit,
      balance: stats.balance + profit,
      totalTrades: stats.totalTrades + 1
    });

    this.saveBotData();
  }

  private getRandomPrice(pair: string): number {
    const basePrices: {[key: string]: number} = {
      'BTC/USDT': 45000,
      'ETH/USDT': 2500,
      'BNB/USDT': 350,
      'SOL/USDT': 100,
      'ADA/USDT': 0.5
    };
    
    const basePrice = basePrices[pair] || 100;
    return basePrice * (1 + (Math.random() * 0.02 - 0.01));
  }

  updateConfig(config: BotConfig) {
    this.botConfig.set(config);
    this.saveBotData();
  }

  private saveBotData() {
    localStorage.setItem('bot_stats', JSON.stringify(this.botStats()));
    localStorage.setItem('bot_trades', JSON.stringify(this.botTrades()));
    localStorage.setItem('bot_config', JSON.stringify(this.botConfig()));
    localStorage.setItem('bot_active', JSON.stringify(this.botActive()));
  }

  private loadBotData() {
    const stats = localStorage.getItem('bot_stats');
    const trades = localStorage.getItem('bot_trades');
    const config = localStorage.getItem('bot_config');
    const active = localStorage.getItem('bot_active');

    if (stats) this.botStats.set(JSON.parse(stats));
    if (trades) this.botTrades.set(JSON.parse(trades));
    if (config) this.botConfig.set(JSON.parse(config));
    if (active && JSON.parse(active)) this.startBot();
  }

  resetBot() {
    this.stopBot();
    this.botStats.set({
      tradesToday: 0,
      successRate: 0,
      profitToday: 0,
      balance: 5000,
      totalTrades: 0
    });
    this.botTrades.set([]);
    this.saveBotData();
  }
}
