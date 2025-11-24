# 🦅 EagleInvest - Plataforma de Inversiones Inteligentes

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Angular](https://img.shields.io/badge/Angular-18-red.svg)
![Laravel](https://img.shields.io/badge/Laravel-11-orange.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

> **Plataforma moderna de inversiones con IA, gestión de portafolio, wallets de criptomonedas y autenticación 2FA**

---

## 📋 Índice

1. [Características](#-características)
2. [Tecnologías](#️-tecnologías)
3. [Requisitos Previos](#-requisitos-previos)
4. [Instalación](#-instalación)
5. [Configuración](#️-configuración)
6. [Uso](#-uso)
7. [Estructura del Proyecto](#-estructura-del-proyecto)
8. [API Documentation](#-api-documentation)
9. [Seguridad](#-seguridad)
10. [Testing](#-testing)
11. [Deployment](#-deployment)
12. [Contribuir](#-contribuir)
13. [Licencia](#-licencia)

---

## ✨ Características

### 🔐 Autenticación Avanzada
- ✅ Login/Registro con validación
- ✅ **Autenticación de Dos Factores (2FA)** vía email
- ✅ Tokens JWT con Laravel Sanctum
- ✅ Sesiones persistentes
- ✅ Notificaciones de login por email

### 💼 Gestión de Inversiones
- ✅ Dashboard completo con estadísticas en tiempo real
- ✅ Múltiples planes de inversión (Starter, Growth, Premium, Elite)
- ✅ Cálculo automático de ROI y ganancias
- ✅ Seguimiento de inversiones activas
- ✅ Historial de transacciones detallado

### 💰 Gestión de Wallets Crypto
- ✅ **Conexión con MetaMask**
- ✅ Soporte para múltiples redes (Ethereum, BSC, Polygon)
- ✅ Visualización de balance
- ✅ Notificaciones de seguridad por email

### 📊 Análisis de Mercado
- ✅ Precios de criptomonedas en tiempo real
- ✅ Índices de mercado (S&P 500, NASDAQ, Dow Jones)
- ✅ Noticias financieras actualizadas
- ✅ **Bot de Trading con IA** (modo demo)
- ✅ Alertas de precio configurables

### 🎨 Interfaz de Usuario
- ✅ Diseño moderno con **gradientes cyan/purple**
- ✅ **Responsive design** optimizado para móviles
- ✅ Tablas premium con efectos glassmorphism
- ✅ Animaciones suaves y transiciones
- ✅ Dark theme nativo

### 📱 Sistema de Referidos
- ✅ Programa de referidos con comisiones
- ✅ Dashboard de referidos
- ✅ Estadísticas de ganancias por referidos
- ✅ Enlaces de invitación únicos

### 💸 Retiros y Transacciones
- ✅ Solicitud de retiros con múltiples métodos
- ✅ Cálculo automático de comisiones
- ✅ Historial completo de transacciones
- ✅ Estados de transacciones (pending, completed, failed)

---

## 🛠️ Tecnologías

### Frontend
```json
{
  "framework": "Angular 18",
  "language": "TypeScript 5.4+",
  "state-management": "Angular Signals",
  "http": "HttpClient + Interceptors",
  "routing": "Angular Router",
  "styling": "CSS3 + Custom Properties",
  "icons": "Bootstrap Icons"
}
```

### Backend
```json
{
  "framework": "Laravel 11",
  "language": "PHP 8.2+",
  "auth": "Laravel Sanctum",
  "database": "MySQL 8.0 / MariaDB",
  "orm": "Eloquent",
  "cache": "Redis / File",
  "email": "Laravel Mail + Blade"
}
```

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

### Software Requerido

| Software | Versión Mínima | Verificar |
|----------|----------------|-----------|
| Node.js | v20.x | `node --version` |
| npm | v10.x | `npm --version` |
| PHP | 8.2+ | `php --version` |
| Composer | 2.x | `composer --version` |
| MySQL/MariaDB | 8.0 / 10.6+ | `mysql --version` |

### Herramientas Opcionales
- **Git**: Para clonar el repositorio
- **Redis**: Para cache (opcional, puede usar file cache)
- **Mailtrap**: Para testing de emails en desarrollo

---

## 🚀 Instalación

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/eagleinvest.git
cd eagleinvest
```

### 2️⃣ Backend (Laravel)

```bash
# Navegar a la carpeta del backend
cd eagleinvest-api

# Instalar dependencias de Composer
composer install

# Copiar archivo de configuración
cp .env.example .env

# Generar app key
php artisan key:generate

# Configurar base de datos en .env
# Editar DB_DATABASE, DB_USERNAME, DB_PASSWORD

# Ejecutar migraciones
php artisan migrate

# (Opcional) Seeders para datos de prueba
php artisan db:seed

# Iniciar servidor
php artisan serve
# → Backend corriendo en http://127.0.0.1:8000
```

### 3️⃣ Frontend (Angular)

```bash
# Abrir nueva terminal y navegar al frontend
cd eagleinvest-frontend

# Instalar dependencias npm
npm install

# Iniciar servidor de desarrollo
ng serve
# → Frontend corriendo en http://localhost:4200

# O usar npm
npm start
```

---

## ⚙️ Configuración

### 📧 Configuración de Email

Editar `eagleinvest-api/.env`:

```env
# Para desarrollo con Mailtrap
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=tu_username_mailtrap
MAIL_PASSWORD=tu_password_mailtrap
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@eagleinvest.com
MAIL_FROM_NAME="EagleInvest"

# Para producción con Gmail (ejemplo)
# MAIL_MAILER=smtp
# MAIL_HOST=smtp.gmail.com
# MAIL_PORT=587
# MAIL_USERNAME=tu_email@gmail.com
# MAIL_PASSWORD=tu_app_password
# MAIL_ENCRYPTION=tls
```

### 🗄️ Configuración de Base de Datos

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=eagleinvest
DB_USERNAME=root
DB_PASSWORD=tu_password
```

### 🔐 Configuración CORS

Archivo `eagleinvest-api/config/cors.php`:

```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_origins' => ['http://localhost:4200'],
    'allowed_methods' => ['*'],
    'allowed_headers' => ['*'],
    'supports_credentials' => true,
];
```

### 💾 Configuración de Cache

```env
# File cache (por defecto)
CACHE_DRIVER=file

# O usar Redis (recomendado para producción)
CACHE_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

---

## 🎯 Uso

### Crear una Cuenta

1. Ir a http://localhost:4200
2. Click en **"Comenzar"** o **"Registrarse"**
3. Llenar formulario de registro
4. Verificar email (en desarrollo, revisar Mailtrap)
5. Iniciar sesión

### Login con 2FA

1. Ingresar email y contraseña
2. Recibirás un código de 6 dígitos por email
3. Ingresar el código en el formulario 2FA
4. Acceso al dashboard

### Conectar Wallet

1. Navegar a Dashboard
2. Click en **"Conectar Wallet"**
3. Seleccionar **MetaMask**
4. Aprobar conexión en MetaMask popup
5. Wallet conectada ✅

### Realizar una Inversión

1. Ir a **"Planes de Inversión"**
2. Seleccionar un plan (Starter, Growth, Premium, Elite)
3. Ingresar monto a invertir
4. Revisar resumen
5. Confirmar inversión
6. Ver inversión activa en Dashboard

### Solicitar Retiro

1. Navegar a **"Retiros"**
2. Ingresar monto a retirar
3. Seleccionar método de pago
4. Ingresar dirección/cuenta destino
5. Confirmar retiro
6. Esperar procesamiento (24-48h)

---

## 📂 Estructura del Proyecto

```
EAGLEINVEST/
│
├── 📁 eagleinvest-frontend/           # Aplicación Angular
│   ├── 📁 src/
│   │   ├── 📁 app/
│   │   │   ├── 📁 components/         # Componentes UI
│   │   │   │   ├── 📄 dashboard/
│   │   │   │   ├── 📄 wallet/
│   │   │   │   ├── 📄 transactions/
│   │   │   │   ├── 📄 profile/
│   │   │   │   └── 📄 market-overview/
│   │   │   │
│   │   │   ├── 📁 services/           # Servicios
│   │   │   │   ├── 📄 auth.service.ts
│   │   │   │   ├── 📄 portfolio.service.ts
│   │   │   │   ├── 📄 wallet.service.ts
│   │   │   │   └── 📄 market-data.service.ts
│   │   │   │
│   │   │   ├── 📁 guards/
│   │   │   ├── 📁 interceptors/
│   │   │   ├── 📄 app.ts              # Componente raíz
│   │   │   └── 📄 app.routes.ts       # Rutas
│   │   │
│   │   └── 📁 styles/                 # Estilos globales
│   │
│   └── 📄 package.json
│
├── 📁 eagleinvest-api/                # Backend Laravel
│   ├── 📁 app/
│   │   ├── 📁 Http/
│   │   │   └── 📁 Controllers/
│   │   │       ├── 📁 Api/
│   │   │       │   ├── 📄 AuthController.php
│   │   │       │   ├── 📄 DashboardController.php
│   │   │       │   └── 📄 MarketDataController.php
│   │   │       │
│   │   │       ├── 📄 WalletController.php
│   │   │       └── 📄 TwoFactorController.php
│   │   │
│   │   └── 📁 Models/
│   │       ├── 📄 User.php
│   │       ├── 📄 InvestmentPlan.php
│   │       ├── 📄 UserInvestment.php
│   │       └── 📄 Transaction.php
│   │
│   ├── 📁 database/
│   │   ├── 📁 migrations/
│   │   └── 📁 seeders/
│   │
│   ├── 📁 resources/
│   │   └── 📁 views/
│   │       └── 📁 emails/             # Templates email
│   │
│   ├── 📁 routes/
│   │   ├── 📄 api.php                 # Rutas API
│   │   └── 📄 web.php
│   │
│   └── 📄 .env
│
├── 📄 DOCUMENTACION_TECNICA.md        # Documentación técnica
└── 📄 README_COMPLETO.md              # Este archivo
```

---

## 📡 API Documentation

### Endpoints Principales

#### Autenticación

```http
# Login con 2FA
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}

# Response
{
  "success": true,
  "requires_2fa": true,
  "temp_token": "abc123xyz...",
  "message": "Código enviado a tu correo"
}
```

```http
# Verificar código 2FA
POST /api/auth/verify-2fa
Content-Type: application/json

{
  "temp_token": "abc123xyz...",
  "code": "123456"
}

# Response
{
  "success": true,
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "name": "Usuario",
    "email": "usuario@ejemplo.com"
  }
}
```

#### Dashboard

```http
# Obtener datos del dashboard
GET /api/dashboard/{userId}
Authorization: Bearer {token}

# Response
{
  "user": {...},
  "stats": {
    "total_invested": 5000,
    "total_earnings": 650,
    "earnings_balance": 450,
    "active_investments": 3
  },
  "active_investments": [...],
  "recent_transactions": [...]
}
```

#### Wallet

```http
# Conectar wallet
POST /api/wallet/connect
Authorization: Bearer {token}
Content-Type: application/json

{
  "user_id": 1,
  "wallet_address": "0x742d35Cc6634C...",
  "network": "Ethereum Mainnet",
  "provider": "MetaMask"
}
```

Ver documentación completa en `DOCUMENTACION_TECNICA.md`

---

## 🔒 Seguridad

### Medidas Implementadas

✅ **Autenticación 2FA**: Códigos de 6 dígitos con expiración de 10 minutos  
✅ **JWT Tokens**: Laravel Sanctum para autenticación stateless  
✅ **Password Hashing**: bcrypt (Laravel default)  
✅ **CSRF Protection**: Laravel CSRF tokens  
✅ **XSS Protection**: Sanitización de inputs  
✅ **SQL Injection**: Prevención vía Eloquent ORM  
✅ **Rate Limiting**: Throttle en rutas sensibles  
✅ **CORS**: Configuración restrictiva  
✅ **HTTPS**: Requerido en producción  
✅ **Email Notifications**: Alertas de login y cambios de wallet

### Recomendaciones de Producción

```env
# .env producción
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tudominio.com

# Generar nueva app key
php artisan key:generate

# Configurar SSL
SANCTUM_STATEFUL_DOMAINS=tudominio.com
SESSION_SECURE_COOKIE=true
```

---

## 🧪 Testing

### Frontend (Angular)

```bash
# Tests unitarios
cd eagleinvest-frontend
ng test

# Tests e2e
ng e2e

# Coverage report
ng test --code-coverage
# Report en: coverage/index.html
```

### Backend (Laravel)

```bash
# Tests completos
cd eagleinvest-api
php artisan test

# Test específico
php artisan test --filter=AuthControllerTest

# Con coverage
php artisan test --coverage
```

### Escribir Tests

```typescript
// Frontend: spec.ts
describe('AuthService', () => {
  it('should login user successfully', () => {
    // Test implementation
  });
});
```

```php
// Backend: Test.php
public function test_user_can_login_with_valid_credentials()
{
    // Test implementation
}
```

---

## 🚢 Deployment

### Frontend (Producción)

```bash
# Build optimizado
cd eagleinvest-frontend
ng build --configuration production

# Archivos en dist/eagleinvest-frontend/
# Subir a servidor web (Apache/Nginx)

# Apache .htaccess para SPA
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

### Backend (Producción)

```bash
# Optimizar Laravel
cd eagleinvest-api
composer install --optimize-autoloader --no-dev

php artisan config:cache
php artisan route:cache
php artisan view:cache

# Permisos
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# Configurar cron para scheduler
* * * * * php /path/to/artisan schedule:run >> /dev/null 2>&1
```

### Docker (Opcional)

```dockerfile
# Dockerfile ejemplo para Laravel
FROM php:8.2-fpm
# ... configuración ...
```

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor sigue estos pasos:

1. **Fork** el repositorio
2. Crea una **branch** para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'feat: Add AmazingFeature'`)
4. **Push** a la branch (`git push origin feature/AmazingFeature`)
5. Abre un **Pull Request**

### Convenciones de Commits

```
feat: Nueva característica
fix: Corrección de bug
docs: Cambios en documentación
style: Cambios de formato
refactor: Refactorización de código
test: Agregar tests
chore: Tareas de mantenimiento
```

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

```
MIT License

Copyright (c) 2025 EagleInvest

Permission is hereby granted, free of charge, to any person obtaining a copy...
```

---

## 👥 Equipo

- **Lead Developer**: Carlos Eduardo Vargas
- **Backend Developer**: Laravel Team
- **Frontend Developer**: Angular Team
- **UI/UX Designer**: Design Team

---

## 📞 Soporte

¿Necesitas ayuda?

- 📧 **Email**: support@eagleinvest.com
- 💬 **Discord**: [Discord Server](#)
- 📚 **Docs**: [Documentation](#)
- 🐛 **Issues**: [GitHub Issues](#)

---

## 🙏 Agradecimientos

- [Angular](https://angular.io/)
- [Laravel](https://laravel.com/)
- [Bootstrap Icons](https://icons.getbootstrap.com/)
- [CoinGecko API](https://www.coingecko.com/api)
- [MetaMask](https://metamask.io/)

---

## 📊 Estadísticas del Proyecto

![GitHub stars](https://img.shields.io/github/stars/usuario/eagleinvest?style=social)
![GitHub forks](https://img.shields.io/github/forks/usuario/eagleinvest?style=social)
![GitHub issues](https://img.shields.io/github/issues/usuario/eagleinvest)

---

**Hecho con ❤️ por el equipo de EagleInvest**

*Última actualización: Noviembre 24, 2025*
