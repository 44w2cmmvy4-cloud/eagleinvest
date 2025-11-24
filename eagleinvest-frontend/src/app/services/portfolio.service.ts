import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Interfaz que representa una inversión individual en el portafolio
 * @interface Investment
 * @description Define los datos de una inversión específica del usuario
 */
export interface Investment {
  /** ID único de la inversión */
  id: number;
  /** Símbolo del activo (ej: BTC, ETH, AAPL) */
  symbol: string;
  /** Nombre completo del activo */
  name: string;
  /** Cantidad de unidades del activo */
  quantity: number;
  /** Precio de compra por unidad */
  purchase_price: number;
  /** Precio actual del mercado por unidad */
  current_price: number;
  /** Valor total actual de la inversión (quantity * current_price) */
  value: number;
  /** Ganancia/pérdida en valor absoluto */
  change: number;
  /** Ganancia/pérdida en porcentaje */
  change_percentage: number;
}

/**
 * Interfaz que representa el portafolio completo del usuario
 * @interface Portfolio
 * @description Contiene el resumen del portafolio y todas las inversiones activas
 */
export interface Portfolio {
  /** ID único del portafolio */
  id: number;
  /** Valor total actual del portafolio */
  total_value: number;
  /** Monto total invertido inicialmente */
  invested_amount: number;
  /** Retorno total en valor absoluto */
  total_return: number;
  /** Retorno total en porcentaje */
  return_percentage: number;
  /** Cambio en las últimas 24 horas (valor absoluto) */
  daily_change: number;
  /** Cambio en las últimas 24 horas (porcentaje) */
  daily_change_percentage: number;
  /** Fecha y hora de la última actualización */
  last_updated: string;
  /** Array de inversiones activas */
  investments: Investment[];
}

/**
 * Interfaz que representa una transacción del usuario
 * @interface Transaction
 * @description Historial de operaciones realizadas
 */
export interface Transaction {
  /** ID único de la transacción */
  id: number;
  /** Tipo de transacción (compra, venta, retiro, depósito) */
  type: string;
  /** Símbolo del activo involucrado */
  symbol: string;
  /** Cantidad de unidades */
  quantity: number;
  /** Precio por unidad al momento de la transacción */
  price: number;
  /** Monto total de la transacción */
  total: number;
  /** Fecha de la transacción */
  date: string;
  /** Estado de la transacción (completed, pending, failed) */
  status: string;
}

/**
 * Servicio de gestión del portafolio de inversiones
 * @class PortfolioService
 * @description Gestiona todas las operaciones relacionadas con el portafolio del usuario:
 * - Consulta del estado del portafolio
 * - Análisis de mercado
 * - Historial de transacciones
 * 
 * @example
 * ```typescript
 * constructor(private portfolioService: PortfolioService) {}
 * 
 * loadPortfolio() {
 *   this.portfolioService.getPortfolio().subscribe({
 *     next: (portfolio) => {
 *       console.log('Valor total:', portfolio.total_value);
 *       console.log('Inversiones:', portfolio.investments);
 *     }
 *   });
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  /** URL base de la API del backend */
  private apiUrl = 'http://localhost:8000/api';

  /**
   * Constructor del servicio de portafolio
   * @param {HttpClient} http - Cliente HTTP de Angular para peticiones al backend
   */
  constructor(private http: HttpClient) {}

  /**
   * Obtiene el portafolio completo del usuario autenticado
   * @returns {Observable<Portfolio>} Observable con los datos del portafolio
   * @description Recupera el estado actual del portafolio incluyendo todas las inversiones activas,
   * valor total, retornos y cambios diarios.
   * 
   * @example
   * ```typescript
   * this.portfolioService.getPortfolio().subscribe({
   *   next: (data) => this.portfolio = data,
   *   error: (err) => console.error('Error cargando portafolio', err)
   * });
   * ```
   */
  getPortfolio(): Observable<Portfolio> {
    return this.http.get<Portfolio>(`${this.apiUrl}/portfolio`);
  }

  /**
   * Obtiene el análisis de mercado actualizado
   * @returns {Observable<any>} Observable con datos de análisis de mercado
   * @description Proporciona tendencias del mercado, recomendaciones y datos analíticos
   * para ayudar en la toma de decisiones de inversión.
   * 
   * @example
   * ```typescript
   * this.portfolioService.getMarketAnalysis().subscribe({
   *   next: (analysis) => console.log('Tendencias:', analysis.trends)
   * });
   * ```
   */
  getMarketAnalysis(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/portfolio/market-analysis`);
  }

  /**
   * Obtiene el historial de transacciones del usuario
   * @returns {Observable<Transaction[]>} Observable con el array de transacciones
   * @description Recupera todas las transacciones realizadas por el usuario,
   * ordenadas por fecha (más recientes primero).
   * 
   * @example
   * ```typescript
   * this.portfolioService.getTransactions().subscribe({
   *   next: (transactions) => this.history = transactions,
   *   error: (err) => console.error('Error cargando transacciones', err)
   * });
   * ```
   */
  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/portfolio/transactions`);
  }
}
