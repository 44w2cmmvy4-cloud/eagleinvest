import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InvestmentPlan {
  id: number;
  name: string;
  description: string;
  min_amount: number;
  max_amount: number;
  daily_return_rate: number;
  duration_days: number;
  total_return_rate: number;
  risk_level: string;
  features: string[];
}

/**
 * Servicio para gestionar los planes de inversión.
 * 
 * IMPORTANTE: Este servicio está preparado para conectarse a una API externa en el futuro.
 * 
 * Para cambiar a una API externa:
 * 1. Actualizar la variable `externalApiUrl` con la URL de la API externa
 * 2. Cambiar `useExternalApi` a `true`
 * 3. Ajustar la interfaz `InvestmentPlan` si el formato de datos difiere
 * 4. Implementar transformaciones de datos si es necesario en el método `getInvestmentPlans`
 */
@Injectable({
  providedIn: 'root'
})
export class InvestmentPlansService {
  // Configuración para API
  private useExternalApi = false; // Cambiar a true cuando se use API externa
  private internalApiUrl = 'http://127.0.0.1:8000/api/demo/plans';
  private externalApiUrl = 'https://api.example.com/investment-plans'; // URL de API externa (actualizar cuando esté disponible)

  constructor(private http: HttpClient) { }

  /**
   * Obtiene los planes de inversión disponibles.
   * Actualmente usa la BD local, pero está preparado para cambiar a API externa.
   */
  getInvestmentPlans(): Observable<InvestmentPlan[]> {
    const apiUrl = this.useExternalApi ? this.externalApiUrl : this.internalApiUrl;
    
    return this.http.get<InvestmentPlan[]>(apiUrl);
    
    // Si la API externa usa un formato diferente, descomenta y ajusta esto:
    // return this.http.get<any>(apiUrl).pipe(
    //   map(response => this.transformExternalData(response))
    // );
  }

  /**
   * Método para transformar datos de API externa al formato interno.
   * Implementar según el formato de la API externa.
   */
  // private transformExternalData(externalData: any): InvestmentPlan[] {
  //   // Ejemplo de transformación:
  //   return externalData.plans.map((plan: any) => ({
  //     id: plan.planId,
  //     name: plan.planName,
  //     description: plan.desc,
  //     min_amount: plan.minInvestment,
  //     max_amount: plan.maxInvestment,
  //     daily_return_rate: plan.dailyRate,
  //     duration_days: plan.duration,
  //     total_return_rate: plan.totalRate,
  //     risk_level: plan.risk,
  //     features: plan.features || []
  //   }));
  // }

  /**
   * Cambia entre API interna y externa.
   * Útil para testing o para hacer el cambio gradualmente.
   */
  setApiSource(useExternal: boolean): void {
    this.useExternalApi = useExternal;
  }

  /**
   * Actualiza la URL de la API externa.
   */
  setExternalApiUrl(url: string): void {
    this.externalApiUrl = url;
  }
}
