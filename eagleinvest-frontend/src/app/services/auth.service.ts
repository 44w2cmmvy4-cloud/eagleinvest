import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

/**
 * Interfaz para la respuesta de autenticación del servidor
 * @interface AuthResponse
 * @description Define la estructura de la respuesta del backend al realizar operaciones de autenticación
 */
export interface AuthResponse {
  /** Indica si la operación fue exitosa */
  success?: boolean;
  /** Mensaje descriptivo de la respuesta */
  message: string;
  /** Datos del usuario autenticado */
  user: any;
  /** Token JWT para autenticación de sesión */
  token: string;
  /** Indica si se requiere verificación de dos factores */
  requires_2fa?: boolean;
  /** Token temporal para completar el flujo 2FA */
  temp_token?: string;
}

/**
 * Interfaz para el modelo de usuario
 * @interface User
 * @description Representa la estructura básica de un usuario en el sistema
 */
export interface User {
  /** ID único del usuario */
  id: number;
  /** Nombre completo del usuario */
  name: string;
  /** Correo electrónico del usuario */
  email: string;
}

/**
 * Servicio de autenticación
 * @class AuthService
 * @description Gestiona todas las operaciones de autenticación incluyendo:
 * - Registro de nuevos usuarios
 * - Inicio de sesión con soporte para 2FA
 * - Verificación de códigos 2FA
 * - Gestión de sesión y tokens
 * - Estado de autenticación reactivo
 * 
 * @example
 * ```typescript
 * constructor(private authService: AuthService) {}
 * 
 * login() {
 *   this.authService.login(email, password).subscribe({
 *     next: (response) => {
 *       if (response.requires_2fa) {
 *         // Mostrar formulario 2FA
 *       } else {
 *         // Usuario autenticado
 *       }
 *     },
 *     error: (err) => console.error('Error de autenticación', err)
 *   });
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /** URL base de la API del backend */
  private apiUrl = 'http://127.0.0.1:8000/api';
  
  /** Subject que mantiene el estado del usuario actual */
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  
  /** Observable público del usuario actual para suscripciones */
  public currentUser$ = this.currentUserSubject.asObservable();
  
  /** Subject que mantiene el estado de autenticación */
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(!!localStorage.getItem('token'));
  
  /** Observable público del estado de autenticación */
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  /**
   * Constructor del servicio de autenticación
   * @param {HttpClient} http - Cliente HTTP de Angular para realizar peticiones al backend
   * @description Inicializa el servicio y verifica el estado de autenticación actual
   */
  constructor(private http: HttpClient) {
    this.checkAuthStatus();
  }

  /**
   * Registra un nuevo usuario en el sistema
   * @param {string} name - Nombre completo del usuario
   * @param {string} email - Correo electrónico del usuario
   * @param {string} password - Contraseña del usuario
   * @param {string} password_confirmation - Confirmación de la contraseña
   * @returns {Observable<AuthResponse>} Observable con la respuesta de autenticación
   * @description Crea una nueva cuenta de usuario y automáticamente inicia sesión si el registro es exitoso.
   * Guarda el token y los datos del usuario en localStorage.
   * 
   * @example
   * ```typescript
   * this.authService.register(name, email, password, passwordConfirm).subscribe({
   *   next: (response) => console.log('Usuario registrado:', response.user),
   *   error: (err) => console.error('Error en registro:', err)
   * });
   * ```
   */
  register(name: string, email: string, password: string, password_confirmation: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, {
      name,
      email,
      password,
      password_confirmation
    }).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('userId', response.user.id.toString());
          localStorage.setItem('userData', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  /**
   * Inicia sesión en el sistema con soporte para autenticación de dos factores (2FA)
   * @param {string} email - Correo electrónico del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Observable<AuthResponse>} Observable con la respuesta de autenticación
   * @description Autentica al usuario en el sistema. Si el usuario tiene 2FA habilitado,
   * retorna `requires_2fa: true` y un `temp_token` para completar la verificación.
   * Solo guarda el token de sesión si 2FA no es requerido.
   * 
   * @example
   * ```typescript
   * this.authService.login(email, password).subscribe({
   *   next: (response) => {
   *     if (response.requires_2fa) {
   *       // Guardar temp_token y mostrar formulario 2FA
   *       this.tempToken = response.temp_token;
   *     } else {
   *       // Usuario autenticado completamente
   *       this.router.navigate(['/dashboard']);
   *     }
   *   }
   * });
   * ```
   */
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, {
      email,
      password
    }).pipe(
      tap(response => {
        if (response && response.success && !response.requires_2fa) {
          localStorage.setItem('token', response.token || 'auth-token');
          localStorage.setItem('userId', response.user.id.toString());
          localStorage.setItem('userData', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
          this.isAuthenticatedSubject.next(true);
        }
        // If requires_2fa is true, don't save anything yet
      })
    );
  }

  /**
   * Verifica el código de autenticación de dos factores
   * @param {string} tempToken - Token temporal obtenido del login inicial
   * @param {string} code - Código de 6 dígitos enviado al usuario por email
   * @returns {Observable<AuthResponse>} Observable con la respuesta de autenticación completada
   * @description Completa el flujo de autenticación 2FA verificando el código ingresado.
   * Si la verificación es exitosa, guarda el token de sesión permanente.
   * 
   * @example
   * ```typescript
   * this.authService.verify2FA(this.tempToken, this.code).subscribe({
   *   next: (response) => {
   *     console.log('2FA verificado exitosamente');
   *     this.router.navigate(['/dashboard']);
   *   },
   *   error: (err) => console.error('Código inválido')
   * });
   * ```
   */
  verify2FA(tempToken: string, code: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/verify-2fa`, {
      temp_token: tempToken,
      code
    }).pipe(
      tap(response => {
        if (response && response.success) {
          localStorage.setItem('token', response.token || 'auth-token');
          localStorage.setItem('userId', response.user.id.toString());
          localStorage.setItem('userData', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  /**
   * Reenvía el código de verificación 2FA al email del usuario
   * @param {string} tempToken - Token temporal de la sesión 2FA
   * @returns {Observable<any>} Observable con la confirmación del reenvío
   * @description Genera un nuevo código 2FA y lo envía por email.
   * Útil cuando el usuario no recibió el código original o expiró.
   * 
   * @example
   * ```typescript
   * this.authService.resend2FA(this.tempToken).subscribe({
   *   next: () => console.log('Código reenviado'),
   *   error: (err) => console.error('Error al reenviar código')
   * });
   * ```
   */
  resend2FA(tempToken: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/resend-2fa`, {
      temp_token: tempToken
    });
  }

  /**
   * Cierra la sesión del usuario actual
   * @returns {void}
   * @description Limpia todos los datos de sesión del localStorage,
   * resetea los subjects de usuario y autenticación.
   * No realiza petición al backend.
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userData');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  logoutWithConfirmation(): Observable<boolean> {
    // Retornar un observable que se puede usar con confirmación
    return new Observable(observer => {
      const confirmed = window.confirm('¿Estás seguro de que deseas cerrar sesión?');
      if (confirmed) {
        this.logout();
        observer.next(true);
      } else {
        observer.next(false);
      }
      observer.complete();
    });
  }

  getCurrentUser(): User | null {
    const user = this.currentUserSubject.value;
    console.log('getCurrentUser called, returning:', user);
    return user;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): Observable<boolean> {
    return this.isAuthenticated$;
  }

  /**
   * Verifica y restaura el estado de autenticación desde localStorage
   * @returns {void}
   * @description Llamado al inicializar el servicio. Recupera el token y
   * los datos del usuario guardados en sesiones anteriores para mantener
   * la sesión activa al recargar la página.
   * 
   * Si encuentra datos válidos, actualiza los subjects correspondientes.
   */
  checkAuthStatus(): void {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (token && userId) {
      // Recuperar datos del usuario desde localStorage o hacer una llamada al API
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
        } catch (e) {
          // Si no se puede parsear, usar datos mínimos
          const demoUser = { id: parseInt(userId), name: 'Carlos Eduardo Vargas', email: 'demo@eagleinvest.com' };
          this.currentUserSubject.next(demoUser);
          this.isAuthenticatedSubject.next(true);
        }
      } else {
        // Datos mínimos basados en el userId
        const demoUser = { id: parseInt(userId), name: 'Carlos Eduardo Vargas', email: 'demo@eagleinvest.com' };
        this.currentUserSubject.next(demoUser);
        this.isAuthenticatedSubject.next(true);
      }
    }
  }
}
