# Configuración de Firebase para EagleInvest

## Backend (Laravel)

### 1. Crear Proyecto Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita **Authentication** → **Phone** en el panel de Firebase

### 2. Obtener Credenciales del Servicio

1. Ve a **Project Settings** (⚙️) → **Service Accounts**
2. Haz clic en **Generate new private key**
3. Descarga el archivo JSON
4. Guárdalo como `firebase-credentials.json` en `storage/`

### 3. Configurar Variables de Entorno

Edita tu archivo `.env`:

```env
FIREBASE_CREDENTIALS=/ruta/completa/a/storage/firebase-credentials.json
FIREBASE_DATABASE_URL=https://tu-proyecto-id.firebaseio.com
FIREBASE_STORAGE_BUCKET=tu-proyecto-id.appspot.com
FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_API_KEY=tu-firebase-api-key
FIREBASE_AUTH_DOMAIN=tu-proyecto-id.firebaseapp.com
```

### 4. Verificar Instalación

Ejecuta:
```bash
php artisan tinker
```

Luego:
```php
$firebase = app(\App\Services\FirebaseService::class);
echo "Firebase configurado correctamente";
```

---

## Frontend (Angular)

### 1. Obtener Configuración Web

1. Ve a **Project Settings** → **General**
2. En **Your apps**, selecciona la app web (o créala si no existe)
3. Copia la configuración de `firebaseConfig`

### 2. Configurar Firebase en Angular

Edita `src/environments/firebase.config.ts`:

```typescript
export const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:...",
  measurementId: "G-..."
};
```

### 3. Habilitar Dominios Autorizados

En Firebase Console:

1. **Authentication** → **Settings** → **Authorized domains**
2. Agrega:
   - `localhost` (para desarrollo)
   - Tu dominio de producción (ej: `eagleinvest.com`)

---

## Uso en Registro

### Flujo de Autenticación

1. **Usuario ingresa número de teléfono**
   - Formato internacional: `+521234567890` (México)
   - `+11234567890` (USA)

2. **Frontend envía código SMS**
   ```typescript
   firebaseAuth.sendVerificationCode(phoneNumber).subscribe();
   ```

3. **Usuario ingresa código de 6 dígitos**

4. **Frontend verifica código**
   ```typescript
   firebaseAuth.verifyCode(code).subscribe(idToken => {
     // Usar idToken para registro en backend
   });
   ```

5. **Backend valida token**
   ```php
   $firebaseUser = $firebase->verifyIdToken($request->firebase_id_token);
   ```

6. **Se crea el usuario** con teléfono verificado

---

## Límites Gratuitos

Firebase Authentication (Plan Spark - Gratuito):

- **10,000 verificaciones/mes** por SMS
- **50,000 verificaciones/mes** por email
- Sin límite en autenticaciones con tokens existentes

Si necesitas más, actualiza al plan Blaze (pago por uso):
- **$0.01 USD por verificación SMS** después de 10k
- Email sigue siendo ilimitado

---

## Seguridad

### Reglas de Firebase Authentication

En Firebase Console → **Authentication** → **Settings**:

1. **Authorized domains**: Solo dominios de producción
2. **Phone sign-in**: Habilitar
3. **reCAPTCHA verification**: Habilitar (previene bots)

### Backend

El `FirebaseService` ya incluye:
- ✅ Validación de tokens
- ✅ Verificación de números de teléfono
- ✅ Logs de errores
- ✅ Manejo de excepciones

### Frontend

El `FirebaseAuthService` incluye:
- ✅ reCAPTCHA automático
- ✅ Validación de formato de teléfono
- ✅ Manejo de errores
- ✅ Timeout de verificación

---

## Solución de Problemas

### Error: "TOO_MANY_ATTEMPTS_TRY_LATER"

**Causa**: Demasiados intentos de verificación desde la misma IP

**Solución**:
1. Espera 1-2 horas
2. Configura reCAPTCHA v3 en Firebase Console
3. Limita intentos en el frontend

### Error: "INVALID_PHONE_NUMBER"

**Causa**: Formato de número incorrecto

**Solución**:
- Usa formato E.164: `+[código país][número]`
- Ejemplo: `+521234567890` (México con código +52)
- Valida con librería `libphonenumber-js`

### Error: "auth/code-expired"

**Causa**: El código SMS expiró (5 minutos)

**Solución**:
- Reenvía el código
- Llama a `firebaseAuth.sendVerificationCode()` nuevamente

### Error: "INVALID_SESSION_INFO"

**Causa**: La sesión de verificación expiró

**Solución**:
- Reinicia el proceso
- Llama a `firebaseAuth.reset()`
- Solicita nuevo código

---

## Testing

### Números de Prueba

En Firebase Console → **Authentication** → **Phone**:

1. Habilita **Test phone numbers**
2. Agrega números de prueba:
   - `+52 123 456 7890` → Código: `123456`
   - `+1 234 567 8900` → Código: `654321`

Estos números **NO** envían SMS reales, útil para testing sin gastar cuota.

---

## Monitoreo

### Firebase Console

1. **Authentication** → **Users**: Ver usuarios registrados
2. **Authentication** → **Usage**: Verificaciones SMS consumidas
3. **Logs**: Errores de autenticación

### Laravel Logs

Los errores se registran en `storage/logs/laravel.log`:
```
Firebase verification error: Invalid token
Firebase token verification failed: Token expired
```

---

## Migración de Usuarios Existentes

Si ya tienes usuarios sin Firebase:

```php
// Script de migración (artisan command)
$users = User::whereNull('firebase_uid')->get();

foreach ($users as $user) {
    if ($user->phone_number) {
        try {
            $firebaseUser = $firebase->getUserByPhoneNumber($user->phone_number);
            $user->firebase_uid = $firebaseUser['uid'];
            $user->phone_verified = true;
            $user->save();
        } catch (\Exception $e) {
            // Usuario debe re-verificar su teléfono
        }
    }
}
```

---

## Documentación Oficial

- [Firebase Phone Authentication](https://firebase.google.com/docs/auth/web/phone-auth)
- [AngularFire Phone Auth](https://github.com/angular/angularfire/blob/master/docs/auth/getting-started.md)
- [Kreait Firebase PHP](https://firebase-php.readthedocs.io/)
