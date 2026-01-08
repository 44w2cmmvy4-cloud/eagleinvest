# ⚙️ CONFIGURACIÓN LOCAL - DESARROLLO

## 🚀 INSTRUCCIONES RÁPIDAS (5 minutos)

### 1️⃣ BACKEND SETUP (Terminal 1)

```bash
cd eagleinvest-api

# Instalar dependencias (si no las tienes)
composer install

# Generar APP_KEY (solo si .env está vacío)
php artisan key:generate

# Ejecutar servidor
php artisan serve
```

**Servidor estará en:** `http://localhost:8000`

---

### 2️⃣ FRONTEND SETUP (Terminal 2)

```bash
cd eagleinvest-frontend

# Instalar dependencias (si no las tienes)
npm install

# Ejecutar servidor
ng serve
# O con npm:
npm start
```

**Aplicación estará en:** `http://localhost:4200`

---

## ✅ VERIFICACIÓN

### Backend OK si:
- ✅ Terminal muestra: "Server running at [http://127.0.0.1:8000]"
- ✅ Puedes acceder a `http://localhost:8000/api/health` (si tienes endpoint)
- ✅ No hay errores de database connection

### Frontend OK si:
- ✅ Terminal muestra: "Application bundle generation complete"
- ✅ Puedes abrir `http://localhost:4200` sin errores
- ✅ Ves la aplicación Angular cargada

---

## 📋 CONFIGURACIÓN ACTUAL

### ✅ `.env` - ACTUALIZADO
```
APP_NAME="EagleInvest"
APP_ENV=local
APP_KEY=base64:K8FH3K9/j/kL5mP2nR4sT6vW8xY9zB1cD3eF4gH5iJ=
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:4200

SESSION_DRIVER=cookie
SANCTUM_STATEFUL_DOMAINS=localhost:4200,localhost:3000,127.0.0.1:4200

DB_DATABASE=eagleinvest
DB_USERNAME=root
DB_PASSWORD=(empty)

MAIL: Gmail SMTP configurado
Firebase: Credenciales en lugar
```

### ✅ `config/cors.php` - OK
```php
'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:4200')],
'supports_credentials' => true,
```

### ✅ `environment.ts` - ACTUALIZADO
```typescript
apiUrl: 'http://localhost:8000/api',
production: false,
enableDebug: true,
```

---

## 🔗 ENDPOINTS DISPONIBLES

### Autenticación
- `POST /api/register` - Registro
- `POST /api/login` - Login
- `POST /api/logout` - Logout
- `GET /api/me` - Usuario actual

### Inversiones
- `GET /api/investments` - Listar
- `POST /api/investments` - Crear
- `GET /api/investments/{id}` - Detalle
- `PUT /api/investments/{id}` - Actualizar

### Retiros
- `GET /api/withdrawals` - Listar
- `POST /api/withdrawals` - Crear
- `GET /api/withdrawals/{id}` - Detalle
- `POST /api/withdrawals/{id}/cancel` - Cancelar

### Red Unilevel
- `GET /api/network/level` - Mi nivel
- `GET /api/network/tree` - Árbol
- `GET /api/network/referrals` - Mis referidos
- `GET /api/network/stats` - Estadísticas

### Comisiones
- `GET /api/commissions` - Historial
- `GET /api/commissions/monthly` - Mensual
- `POST /api/commissions/distribute` - Distribuir
- `POST /api/commissions/{id}/mark-paid` - Marcar pagada

### Admin (Retiros)
- `GET /api/admin/withdrawals/pending` - Pendientes
- `GET /api/admin/withdrawals` - Todas
- `POST /api/admin/withdrawals/{id}/approve` - Aprobar
- `POST /api/admin/withdrawals/{id}/reject` - Rechazar

---

## 🐛 TROUBLESHOOTING

### "CORS error" en consola
- ✅ Verifica que backend está corriendo en `localhost:8000`
- ✅ Verifica que frontend está corriendo en `localhost:4200`
- ✅ Verifica `.env`: `FRONTEND_URL=http://localhost:4200`
- ✅ Reinicia ambos servidores

### "Database connection refused"
- ✅ MySQL debe estar corriendo
- ✅ Verifica `.env`: `DB_HOST=127.0.0.1`, `DB_DATABASE=eagleinvest`
- ✅ Crea base de datos: `mysql -u root -e "CREATE DATABASE IF NOT EXISTS eagleinvest;"`
- ✅ Ejecuta migraciones: `php artisan migrate`

### "Module not found" en Angular
```bash
# Limpia y reinstala
rm -rf node_modules package-lock.json
npm install
ng serve
```

### "PHP error" en Laravel
```bash
# Limpia cache
php artisan cache:clear
php artisan config:clear
php artisan view:clear
php artisan serve
```

---

## 📱 DESARROLLO

### Angular Dev Server Features:
- Hot reload automático
- Debug en DevTools
- Genera bundle optimizado

### Laravel Dev Server Features:
- Hot reload automático
- Query logging disponible
- API responses visibles en Postman

---

## 🚢 DEPLOYMENT (Próximos pasos)

Ver [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) para:
- Configuración en servidor Linux
- Nginx setup
- SSL/HTTPS
- Domain configuration
- Firebase production setup

---

**¿Listo?** Abre 2 terminales y ejecuta:
```bash
# Terminal 1 (Backend)
cd eagleinvest-api && php artisan serve

# Terminal 2 (Frontend)
cd eagleinvest-frontend && ng serve
```

**Luego abre:** `http://localhost:4200` 🚀
