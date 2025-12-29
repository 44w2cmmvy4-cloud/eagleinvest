import { Injectable, inject } from '@angular/core';
import { Auth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, PhoneAuthProvider, signInWithCredential } from '@angular/fire/auth';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirebaseAuthService {
  private auth: Auth = inject(Auth);
  private recaptchaVerifier: RecaptchaVerifier | null = null;
  private confirmationResult: ConfirmationResult | null = null;

  constructor() {}

  /**
   * Inicializar reCAPTCHA para verificación de teléfono
   * Debe llamarse antes de sendVerificationCode
   * 
   * @param containerId ID del elemento HTML donde se mostrará el reCAPTCHA
   */
  initRecaptcha(containerId: string): void {
    if (!this.recaptchaVerifier) {
      this.recaptchaVerifier = new RecaptchaVerifier(this.auth, containerId, {
        size: 'normal',
        callback: (response: any) => {
          console.log('reCAPTCHA resuelto');
        },
        'expired-callback': () => {
          console.warn('reCAPTCHA expirado');
        }
      });
    }
  }

  /**
   * Enviar código de verificación al número de teléfono
   * Formato internacional: +1234567890
   * 
   * @param phoneNumber Número de teléfono con código de país
   * @returns Observable<void>
   */
  sendVerificationCode(phoneNumber: string): Observable<void> {
    if (!this.recaptchaVerifier) {
      return throwError(() => new Error('reCAPTCHA no inicializado. Llame a initRecaptcha() primero.'));
    }

    return from(
      signInWithPhoneNumber(this.auth, phoneNumber, this.recaptchaVerifier)
    ).pipe(
      map((confirmationResult: ConfirmationResult) => {
        this.confirmationResult = confirmationResult;
        console.log('Código de verificación enviado a:', phoneNumber);
      }),
      catchError((error) => {
        console.error('Error al enviar código:', error);
        // Resetear reCAPTCHA en caso de error
        this.recaptchaVerifier = null;
        return throwError(() => error);
      })
    );
  }

  /**
   * Verificar el código SMS ingresado por el usuario
   * 
   * @param code Código de 6 dígitos recibido por SMS
   * @returns Observable con el ID token de Firebase
   */
  verifyCode(code: string): Observable<string> {
    if (!this.confirmationResult) {
      return throwError(() => new Error('No hay confirmación pendiente. Envíe el código primero.'));
    }

    return from(this.confirmationResult.confirm(code)).pipe(
      map(async (userCredential) => {
        // Obtener el ID token de Firebase
        const idToken = await userCredential.user.getIdToken();
        console.log('Verificación exitosa');
        return idToken;
      }),
      // Aplanar la promesa interna
      map((promise) => from(promise)),
      // Convertir Observable<Observable<string>> a Observable<string>
      map((obs) => obs),
      catchError((error) => {
        console.error('Error al verificar código:', error);
        return throwError(() => error);
      })
    ) as any; // Type assertion necesaria debido a la complejidad del pipe
  }

  /**
   * Obtener el ID token del usuario autenticado actual
   * 
   * @returns Observable<string | null>
   */
  getCurrentUserIdToken(): Observable<string | null> {
    const currentUser = this.auth.currentUser;
    
    if (!currentUser) {
      return from(Promise.resolve(null));
    }

    return from(currentUser.getIdToken());
  }

  /**
   * Cerrar sesión del usuario actual
   */
  signOut(): Observable<void> {
    return from(this.auth.signOut());
  }

  /**
   * Resetear el estado del servicio
   * Útil para reintentar verificación
   */
  reset(): void {
    this.confirmationResult = null;
    this.recaptchaVerifier = null;
  }

  /**
   * Obtener el número de teléfono del usuario autenticado
   */
  getPhoneNumber(): string | null {
    return this.auth.currentUser?.phoneNumber || null;
  }

  /**
   * Obtener el UID del usuario autenticado
   */
  getUserUid(): string | null {
    return this.auth.currentUser?.uid || null;
  }
}
