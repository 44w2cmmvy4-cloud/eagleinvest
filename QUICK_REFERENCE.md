# 🚀 QUICK START - EagleInvest

## 📱 Firebase Console
**Proyecto:** pagina-32808
**URL:** https://console.firebase.google.com/project/pagina-32808

### Tareas Pendientes Firebase:
- [ ] Habilitar **Authentication** → **Phone** en Firebase Console
- [ ] Agregar dominios autorizados:
  - `localhost` (desarrollo)
  - Tu dominio de producción
- [ ] (Opcional) Configurar números de prueba para testing sin SMS real

---

## 👤 USUARIOS DE PRUEBA

### 🔑 Administrador
```
Email:     admin@eagleinvest.com
Password:  Admin123456!
Wallet:    0xADMIN1234567890ABCDEF
Código:    ADMIN001
Teléfono:  +5215512345678
Rol:       Admin (acceso total)
```

### 👥 Usuario Test 1 (Patrocinador)
```
Email:     usuario1@test.com
Password:  Test123456!
Wallet:    0xUSER0001234567890ABCDEF
Código:    TEST0001
Sponsor:   ADMIN001
Teléfono:  +5215512345679
Inversión: $1000 (Plan Oro)
Balance:   $150 earnings
```

### 👥 Usuario Test 2 (Referido)
```
Email:     usuario2@test.com
Password:  Test123456!
Wallet:    0xUSER0002234567890ABCDEF
Código:    TEST0002
Sponsor:   TEST0001 (Usuario 1)
Teléfono:  +5215512345680
Inversión: $500 (Plan Plata)
Balance:   $50 earnings
```

---

## 🎯 LINKS DE REGISTRO CON INVITACIÓN

### Con Admin como sponsor:
```
http://localhost:4200/register?ref=ADMIN001
```

### Con Usuario Test 1 como sponsor:
```
http://localhost:4200/register?ref=TEST0001
```

### Con Usuario Test 2 como sponsor:
```
http://localhost:4200/register?ref=TEST0002
```

---

## 🧪 PROBAR SISTEMA

### 1. Backend (Laravel API)
```bash
cd eagleinvest-api
php artisan serve
```
**URL:** http://localhost:8000

### 2. Frontend (Angular)
```bash
cd eagleinvest-frontend
ng serve
```
**URL:** http://localhost:4200

---

## 📋 PLANES DE INVERSIÓN

| Plan     | Rango              | Comisión Referido |
|----------|-------------------|-------------------|
| Bronce   | $10 - $99.99      | 10 niveles        |
| Plata    | $100 - $999.99    | 10 niveles        |
| Oro      | $1,000 - $4,999   | 10 niveles        |
| Platino  | $5,000+           | 10 niveles        |

### Caps Mensuales:
- Bronce: $500/mes
- Plata: $5,000/mes
- Oro: $30,000/mes
- Platino: $100,000/mes

---

## 🔥 TESTING FIREBASE (Sin SMS Real)

### Configurar Números de Prueba:
1. Firebase Console → Authentication → Phone
2. Click **Phone numbers for testing**
3. Agregar:
   ```
   +52 123 456 7890  →  Código: 123456
   +1 234 567 8900   →  Código: 654321
   ```

Estos números NO envían SMS, ideal para testing.

---

## 🌐 ENDPOINTS API PRINCIPALES

### Autenticación
```
POST /api/login                    # Login
POST /api/referrals/register       # Registro con Firebase
GET  /api/referrals/invitation     # Verificar código de invitación
```

### Inversiones
```
GET  /api/investments              # Mis inversiones
POST /api/investments              # Crear inversión
GET  /api/investments/history      # Historial
```

### Retiros
```
POST /api/withdrawals              # Solicitar retiro (mín 18 días)
GET  /api/withdrawals              # Mis retiros
```

### Red Unilevel
```
GET  /api/referrals/network        # Mi red (10 niveles)
GET  /api/referrals/stats          # Estadísticas
```

### Soporte (Cambio Wallet)
```
POST /api/support/wallet-change    # Solicitar cambio de wallet
GET  /api/support/tickets          # Mis tickets
```

### Admin
```
POST /api/admin/withdrawals/{id}/approve   # Aprobar retiro
POST /api/admin/withdrawals/{id}/complete  # Marcar como pagado
POST /api/admin/support/{id}/verify        # Verificar identidad
POST /api/admin/support/{id}/approve       # Aprobar cambio wallet
```

---

## 🔐 SEGURIDAD

### Rate Limiting:
- Login: 5 intentos/minuto
- Registro: 3 intentos/minuto
- Inversiones: 10/hora
- Retiros: 5/hora
- API general: 60/minuto

### Headers Requeridos:
```
Authorization: Bearer {token}
Accept: application/json
Content-Type: application/json
```

---

## 🐛 TROUBLESHOOTING

### Error: "No invitation code"
**Solución:** Usar link con ?ref=CODIGO

### Error: "Firebase token invalid"
**Solución:** 
1. Verificar Phone Auth habilitado en Firebase
2. Verificar dominio autorizado
3. Regenerar firebase_id_token

### Error: "Too many attempts"
**Solución:** Esperar tiempo de rate limit

### Error: "Insufficient balance"
**Solución:** Usuario necesita más earnings para retiro

---

## 📊 WORKFLOW COMPLETO

### Registro:
1. Usuario recibe link: `?ref=ADMIN001`
2. Completa formulario
3. Ingresa teléfono: `+521234567890`
4. Recibe SMS con código
5. Verifica código → Obtiene `firebase_id_token`
6. Backend valida token → Crea usuario
7. Usuario accede al dashboard

### Inversión:
1. Usuario hace inversión de $1000 (Plan Oro)
2. Sistema distribuye comisiones a sponsor (10 niveles)
3. Verifica caps mensuales
4. Registra en `monthly_commission_caps`
5. Actualiza balances

### Retiro:
1. Usuario espera 18 días mínimo
2. Solicita retiro (máx: earnings_balance)
3. Admin recibe notificación
4. Admin aprueba/rechaza
5. Admin marca como pagado
6. Actualiza `total_withdrawn`

---

## 🎉 LISTO PARA LANZAR

### Checklist Final:
- [x] Firebase configurado
- [x] Backend con Firebase Auth
- [x] Frontend con Phone Auth
- [x] Usuarios de prueba creados
- [ ] Phone Auth habilitado en Firebase Console
- [ ] Dominios autorizados configurados
- [ ] Probado flujo completo de registro
- [ ] Probado flujo de inversión
- [ ] Probado flujo de retiro

---

**Última actualización:** 27 de Diciembre 2025  
**Versión:** 1.0.0 - Pre-Producción
