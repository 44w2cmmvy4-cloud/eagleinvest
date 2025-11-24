# 🧪 Testing Guide - EagleInvest

## Verificación de Compilación

✅ **Angular Frontend**: COMPILADO EXITOSAMENTE
```
Initial chunk: 316.16 kB (82.09 kB comprimido)
Polyfills: 34.59 kB (11.33 kB comprimido)
Total: 350.75 kB (93.42 kB comprimido)
Build time: 4.1 segundos
```

---

## Test Plan

### 1️⃣ TEST: Acceso a Landing Page
**URL**: http://localhost:4200
**Esperado**:
- ✅ Navbar con logo "EAGLEINVEST"
- ✅ Botón "Ingresar" en navbar
- ✅ Sección hero con 2 botones: "Crear Cuenta Gratis" y "Ver Demo"
- ✅ Sección de características (4 items)
- ✅ Estadísticas: 50K+ inversores, $2.5B, 98.9%
- ✅ Planes (Básico, Profesional, Premium)
- ✅ Sección CTA
- ✅ Footer

**Cómo verificar**:
```bash
# En terminal 1:
cd C:\Users\varga\EAGLEINVEST\eagleinvest-api
php artisan serve

# En terminal 2:
cd C:\Users\varga\EAGLEINVEST\eagleinvest-frontend
npm start

# En navegador:
http://localhost:4200
```

---

### 2️⃣ TEST: Registro de Usuario
**Pasos**:
1. Click "Crear Cuenta Gratis"
2. Completar formulario:
   - Nombre: Test User
   - Email: test@example.com
   - Password: password123
   - Confirmar: password123
3. Click "Crear Cuenta"

**Esperado**:
- ✅ Validación de campos (no permitir envío vacío)
- ✅ Validación de email válido
- ✅ Validación de passwords coinciden
- ✅ POST a `/api/auth/register`
- ✅ Recibir token en response
- ✅ Token guardado en localStorage
- ✅ Redirigir a dashboard
- ✅ Navbar actualizado con nombre usuario

**Cómo verificar en DevTools**:
```javascript
// F12 → Console → escribir:
localStorage.getItem('token')
// Debería mostrar: 1|AbCdEfGhIjKlMnOpQrStUvWxYz...
```

---

### 3️⃣ TEST: Login
**Pasos**:
1. Si estás en dashboard, logout primero
2. Click "Ingresar" o "Inicia sesión aquí"
3. Completar:
   - Email: test@example.com
   - Password: password123
4. Click "Iniciar Sesión"

**Esperado**:
- ✅ POST a `/api/auth/login`
- ✅ Recibir token
- ✅ Token en localStorage
- ✅ Redirigir a dashboard

---

### 4️⃣ TEST: Dashboard
**Pasos**: (Automático después de login)

**Esperado - Navbar Dashboard**:
- ✅ Logo EAGLEINVEST clickeable
- ✅ Nombre usuario visible
- ✅ Botón "Salir"

**Esperado - Tarjetas de Estadísticas**:
- ✅ Valor Total: $45,230.50
- ✅ Invertido: $40,000
- ✅ Ganancia: +$5,230.50
- ✅ Rentabilidad: +13.08%

**Esperado - Tabla de Inversiones**:
- ✅ Columnas: Símbolo | Cantidad | Precio | Valor | Cambio %
- ✅ Fila AAPL: 50 acciones @ $234.56 = $11,728 (+8.5%)
- ✅ Fila MSFT: 30 acciones @ $416.78 = $12,503.40 (+12.3%)
- ✅ Fila GOOGL, TSLA, AMZN (5 acciones totales)
- ✅ Cambio % en rojo si es negativo, verde si positivo

**Esperado - Tabla de Transacciones**:
- ✅ Columnas: Tipo | Activo | Cantidad | Total | Fecha
- ✅ BUY badge en color verde
- ✅ SELL badge en color rojo
- ✅ Mínimo 5 transacciones

---

### 5️⃣ TEST: Logout
**Pasos**:
1. En dashboard, click botón "Salir"

**Esperado**:
- ✅ POST a `/api/auth/logout`
- ✅ Token eliminado de localStorage
- ✅ Redirigir a landing
- ✅ Navbar vuelve a mostrar "Ingresar"

---

### 6️⃣ TEST: Responsividad
**Desktop (1920px)**:
- ✅ Navbar horizontal
- ✅ 2-3 columnas en características
- ✅ Tablas visibles completas

**Tablet (768px)**:
- ✅ Navbar colapsa
- ✅ 1-2 columnas en características
- ✅ Tablas con scroll horizontal

**Mobile (375px)**:
- ✅ Menu hamburguesa funcional
- ✅ 1 columna todo
- ✅ Botones apilados

---

## Pruebas de API (con curl o Postman)

### 1. Registrar Usuario
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan García",
    "email": "juan@eagleinvest.com",
    "password": "SecurePass123!",
    "password_confirmation": "SecurePass123!"
  }'
```

**Response esperado**:
```json
{
  "user": {
    "id": 1,
    "name": "Juan García",
    "email": "juan@eagleinvest.com",
    "created_at": "2024-11-17T02:30:00.000000Z"
  },
  "token": "1|AbCdEfGhIjKlMnOpQrStUvWxYz..."
}
```

### 2. Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@eagleinvest.com",
    "password": "SecurePass123!"
  }'
```

### 3. Obtener Portafolio (Protegido)
```bash
TOKEN="1|AbCdEfGhIjKlMnOpQrStUvWxYz..."

curl -X GET http://localhost:8000/api/portfolio \
  -H "Authorization: Bearer $TOKEN"
```

**Response esperado**:
```json
{
  "user_id": 1,
  "total_value": 45230.50,
  "invested_amount": 40000.00,
  "total_return": 5230.50,
  "return_percentage": 13.08,
  "investments": [
    {
      "id": 1,
      "symbol": "AAPL",
      "quantity": 50,
      "current_price": 234.56,
      "value": 11728.00,
      "change_percentage": 8.50
    }
  ]
}
```

### 4. Obtener Análisis de Mercado
```bash
curl -X GET http://localhost:8000/api/portfolio/market-analysis \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Obtener Transacciones
```bash
curl -X GET http://localhost:8000/api/portfolio/transactions \
  -H "Authorization: Bearer $TOKEN"
```

---

## Checklist de Verificación

- [ ] Landing page carga correctamente
- [ ] Formulario de registro valida campos
- [ ] Registro crea usuario y devuelve token
- [ ] Token se guarda en localStorage
- [ ] Dashboard carga después del registro
- [ ] Tarjetas de estadísticas muestran números correctos
- [ ] Tabla de inversiones tiene 5 acciones
- [ ] Tabla de transacciones muestra datos
- [ ] Colores de cambio % funcionan (rojo/verde)
- [ ] Logout elimina token y vuelve a landing
- [ ] Login es posible después de logout
- [ ] Navbar responsiva en mobile
- [ ] Todas las transiciones de página son suaves

---

## Posibles Problemas y Soluciones

| Problema | Solución |
|----------|----------|
| CORS error | Configurar CORS en Laravel |
| Token invalid | Verificar que .env tenga APP_KEY |
| DB connection refused | Iniciar MySQL server |
| Page doesn't load | Verificar npm start está corriendo |
| API 404 | Verificar rutas en routes/api.php |
| localStorage vacío | Verificar que login devuelve token |

---

## Performance Targets

- ✅ Landing page load: < 2s
- ✅ Login submit: < 1s
- ✅ Dashboard load: < 1.5s
- ✅ Bundle size: < 100kB (actualmente 93.42 kB)

---

## Notas de Desarrollo

**Variables de Entorno Necesarias** (Laravel `.env`):
```
APP_NAME=EagleInvest
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=eagleinvest
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:4200,127.0.0.1:4200

FRONTEND_URL=http://localhost:4200
```

---

## Status: READY FOR TESTING ✅
