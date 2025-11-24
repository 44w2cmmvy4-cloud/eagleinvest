# 🏗️ Arquitectura del Sistema - EagleInvest

## Diagrama de Flujo General

```
┌─────────────────────────────────────────────────────────────────┐
│                     NAVEGADOR (Cliente)                         │
│              http://localhost:4200                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │        ANGULAR 20.3 (Single Page Application)           │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │                                                          │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │  app.html (Template)                           │   │   │
│  │  │  ────────────────────────────────────────────  │   │   │
│  │  │  - Landing (currentPage() === 'landing')      │   │   │
│  │  │  - Login   (currentPage() === 'login')        │   │   │
│  │  │  - Register (currentPage() === 'register')    │   │   │
│  │  │  - Dashboard (currentPage() === 'dashboard')  │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                         ↑                              │   │
│  │         navigateTo(page) │ binding                    │   │
│  │                         ↓                              │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │  app.ts (Component)                            │   │   │
│  │  │  ────────────────────────────────────────────  │   │   │
│  │  │  Signals:                                       │   │   │
│  │  │  - currentPage (landing|login|register|dash)   │   │   │
│  │  │  - isAuthenticated (boolean)                   │   │   │
│  │  │  - currentUser (user object)                   │   │   │
│  │  │  - loginForm, registerForm (form state)        │   │   │
│  │  │  - portfolio, transactions, marketAnalysis     │   │   │
│  │  │                                                 │   │   │
│  │  │  Methods:                                       │   │   │
│  │  │  - login() → AuthService.login()               │   │   │
│  │  │  - register() → AuthService.register()         │   │   │
│  │  │  - logout() → AuthService.logout()             │   │   │
│  │  │  - loadPortfolio() → PortfolioService          │   │   │
│  │  │  - navigateTo(page)                            │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                         ↑↓                              │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │  Services (Capa de Lógica)                      │   │   │
│  │  │  ────────────────────────────────────────────  │   │   │
│  │  │                                                 │   │   │
│  │  │  AuthService:                                   │   │   │
│  │  │  - login(email, password)                      │   │   │
│  │  │  - register(name, email, password, confirm)    │   │   │
│  │  │  - logout()                                     │   │   │
│  │  │  - getCurrentUser()                             │   │   │
│  │  │  - getToken()                                   │   │   │
│  │  │                                                 │   │   │
│  │  │  PortfolioService:                              │   │   │
│  │  │  - getPortfolio()                              │   │   │
│  │  │  - getMarketAnalysis()                          │   │   │
│  │  │  - getTransactions()                            │   │   │
│  │  │                                                 │   │   │
│  │  │  AuthInterceptor:                               │   │   │
│  │  │  - Inyecta Bearer token en headers              │   │   │
│  │  │  - Automáticamente en todas las peticiones      │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                         ↓ HTTP                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                    HTTP Requests/Responses
                     (Vía network bridge)
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  LARAVEL API (Backend)                          │
│                 http://localhost:8000/api                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           HTTP Routes (routes/api.php)                  │   │
│  │  ────────────────────────────────────────────────────── │   │
│  │                                                          │   │
│  │  PUBLIC:                                                 │   │
│  │  POST   /auth/register  →  AuthController@register      │   │
│  │  POST   /auth/login     →  AuthController@login         │   │
│  │                                                          │   │
│  │  PROTECTED (Middleware: auth:sanctum):                  │   │
│  │  POST   /auth/logout    →  AuthController@logout        │   │
│  │  GET    /auth/me        →  AuthController@me            │   │
│  │  POST   /auth/verify    →  AuthController@verify        │   │
│  │  GET    /portfolio      →  PortfolioController@index    │   │
│  │  GET    /portfolio/market-analysis  → market()          │   │
│  │  GET    /portfolio/transactions     → transactions()    │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                         ↓                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           Controllers (Lógica de Negocio)               │   │
│  │  ────────────────────────────────────────────────────── │   │
│  │                                                          │   │
│  │  AuthController:                                         │   │
│  │  - register() → Valida datos, crea usuario, token       │   │
│  │  - login() → Verifica credenciales, devuelve token      │   │
│  │  - logout() → Invalida tokens del usuario               │   │
│  │  - me() → Devuelve usuario autenticado                  │   │
│  │  - verify() → Verifica validez del token                │   │
│  │                                                          │   │
│  │  PortfolioController:                                    │   │
│  │  - index() → Datos de portafolio del usuario            │   │
│  │  - marketAnalysis() → Índices y análisis                │   │
│  │  - transactions() → Historial de transacciones          │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                         ↓                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Models (Datos)                              │   │
│  │  ────────────────────────────────────────────────────── │   │
│  │                                                          │   │
│  │  User                                                    │   │
│  │  ├─ id                                                  │   │
│  │  ├─ name                                                │   │
│  │  ├─ email                                               │   │
│  │  ├─ password (bcrypt)                                   │   │
│  │  └─ timestamps                                          │   │
│  │                                                          │   │
│  │  PersonalAccessToken (Sanctum)                           │   │
│  │  ├─ id                                                  │   │
│  │  ├─ tokenable_id                                        │   │
│  │  ├─ name                                                │   │
│  │  ├─ token (hash)                                        │   │
│  │  └─ abilities                                           │   │
│  │                                                          │   │
│  │  (Portfolio, Investment, Transaction - Mock por ahora)  │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                         ↓                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Database (MySQL)                            │   │
│  │  ────────────────────────────────────────────────────── │   │
│  │                                                          │   │
│  │  Tables:                                                 │   │
│  │  - users (registro de usuarios)                          │   │
│  │  - personal_access_tokens (tokens Sanctum)              │   │
│  │  - cache (caché)                                         │   │
│  │  - jobs (colas)                                          │   │
│  │                                                          │   │
│  │  (Portfolio, investments, transactions - a crear)       │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Flujo de Autenticación (Bearer Token)

```
1. REGISTRO
   ┌────────────────────────────────────────────┐
   │ Cliente completa registro en landing page  │
   └────────────────────────────────────────────┘
                        ↓
   ┌────────────────────────────────────────────┐
   │ POST /api/auth/register                    │
   │ {                                          │
   │   name: "Juan",                            │
   │   email: "juan@email.com",                 │
   │   password: "pass123",                     │
   │   password_confirmation: "pass123"         │
   │ }                                          │
   └────────────────────────────────────────────┘
                        ↓
   ┌────────────────────────────────────────────┐
   │ AuthController@register                   │
   │ 1. Valida datos                           │
   │ 2. Hash password con bcrypt               │
   │ 3. Crea registro en tabla users           │
   │ 4. Genera token Sanctum                   │
   └────────────────────────────────────────────┘
                        ↓
   ┌────────────────────────────────────────────┐
   │ Response 200 OK                            │
   │ {                                          │
   │   "user": {...},                           │
   │   "token": "1|AbCdEfGh..."                │
   │ }                                          │
   └────────────────────────────────────────────┘
                        ↓
   ┌────────────────────────────────────────────┐
   │ AuthService guarda token en localStorage  │
   │ localStorage.setItem('token', token)      │
   └────────────────────────────────────────────┘
                        ↓
   ┌────────────────────────────────────────────┐
   │ Navega a Dashboard                         │
   │ currentPage.set('dashboard')               │
   └────────────────────────────────────────────┘


2. PETICIÓN PROTEGIDA (Con Token)
   ┌────────────────────────────────────────────┐
   │ Dashboard: loadPortfolio()                 │
   │ GET /portfolio                             │
   └────────────────────────────────────────────┘
                        ↓
   ┌────────────────────────────────────────────┐
   │ AuthInterceptor INTERCEPTA la petición    │
   │ 1. Obtiene token de localStorage          │
   │ 2. Agrega a header:                       │
   │    Authorization: Bearer 1|AbCdEfGh...    │
   │ 3. Envía petición modificada              │
   └────────────────────────────────────────────┘
                        ↓
   ┌────────────────────────────────────────────┐
   │ GET /api/portfolio                         │
   │ Headers:                                   │
   │   Authorization: Bearer 1|AbCdEfGh...     │
   └────────────────────────────────────────────┘
                        ↓
   ┌────────────────────────────────────────────┐
   │ Laravel Middleware: auth:sanctum           │
   │ 1. Extrae token del header                │
   │ 2. Busca en personal_access_tokens         │
   │ 3. Verifica que no esté expirado          │
   │ 4. Si válido: continúa                    │
   │ 5. Si inválido: retorna 401 Unauthorized  │
   └────────────────────────────────────────────┘
                        ↓
   ┌────────────────────────────────────────────┐
   │ PortfolioController@index                 │
   │ Obtiene datos del usuario autenticado     │
   │ $user = auth()->user() // ← Automático   │
   └────────────────────────────────────────────┘
                        ↓
   ┌────────────────────────────────────────────┐
   │ Response 200 OK con datos de portafolio   │
   │ {                                          │
   │   "user_id": 1,                           │
   │   "total_value": 45230.50,               │
   │   "investments": [...]                    │
   │ }                                          │
   └────────────────────────────────────────────┘
                        ↓
   ┌────────────────────────────────────────────┐
   │ Frontend actualiza signals:                │
   │ portfolio.set(data)                        │
   │ portfolioLoading.set(false)                │
   │ Template re-renderiza con datos           │
   └────────────────────────────────────────────┘


3. LOGOUT
   ┌────────────────────────────────────────────┐
   │ Usuario hace click "Salir"                │
   └────────────────────────────────────────────┘
                        ↓
   ┌────────────────────────────────────────────┐
   │ POST /api/auth/logout                     │
   │ (Con token en Authorization header)       │
   └────────────────────────────────────────────┘
                        ↓
   ┌────────────────────────────────────────────┐
   │ AuthController@logout                     │
   │ auth()->user()->tokens()->delete()         │
   │ (Invalida todos los tokens del usuario)   │
   └────────────────────────────────────────────┘
                        ↓
   ┌────────────────────────────────────────────┐
   │ Response 200 OK                            │
   │ { "message": "Logged out successfully" }  │
   └────────────────────────────────────────────┘
                        ↓
   ┌────────────────────────────────────────────┐
   │ Frontend:                                  │
   │ 1. localStorage.removeItem('token')       │
   │ 2. currentUser.set(null)                  │
   │ 3. isAuthenticated.set(false)             │
   │ 4. Navega a landing                       │
   └────────────────────────────────────────────┘
```

---

## Estado Global (Signals - Angular)

```typescript
// app.ts - Estado Reactivo con Signals

// Autenticación
const isAuthenticated = signal<boolean>(false);
const currentUser = signal<User | null>(null);

// Navegación
const currentPage = signal<'landing' | 'login' | 'register' | 'dashboard'>('landing');

// Formularios
const loginForm = signal({
  email: '',
  password: '',
  loading: false,
  error: ''
});

const registerForm = signal({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  loading: false,
  error: ''
});

// Datos del dashboard
const portfolio = signal<Portfolio | null>(null);
const portfolioLoading = signal<boolean>(false);
const marketAnalysis = signal<MarketData | null>(null);
const transactions = signal<Transaction[]>([]);

// UI
const isNavbarCollapsed = signal<boolean>(true);

// Datos estáticos
const features = signal<Feature[]>([...]);
const plans = signal<Plan[]>([...]);
```

---

## Flujo de Navegación Multi-Página

```
Landing Page (Default)
├─ Click "Ingresar" → navigateTo('login')
│  └─ if !isAuthenticated() show Login Form
├─ Click "Crear Cuenta Gratis" → navigateTo('register')
│  └─ if !isAuthenticated() show Register Form
└─ Footer link a features/plans

Login Page
├─ Submit form → login()
│  ├─ AuthService.login(email, password)
│  ├─ Recibe token
│  ├─ Guarda en localStorage
│  └─ navigateTo('dashboard')
└─ "¿No tienes cuenta?" → navigateTo('register')

Register Page
├─ Submit form → register()
│  ├─ AuthService.register(name, email, pwd, confirm)
│  ├─ Valida passwords coinciden
│  ├─ Recibe token
│  ├─ Guarda en localStorage
│  └─ navigateTo('dashboard')
└─ "Inicia sesión aquí" → navigateTo('login')

Dashboard (Solo si isAuthenticated() === true)
├─ Navbar: nombre usuario + botón Salir
├─ Estadísticas (Tarjetas)
├─ Tabla Inversiones
├─ Tabla Transacciones
├─ Click "Salir"
│  ├─ logout()
│  ├─ Elimina token
│  └─ navigateTo('landing')
└─ Click logo → navigateTo('landing')
```

---

## Estructura de Carpetas

```
eagleinvest-frontend/
├── src/
│   ├── app/
│   │   ├── app.ts                 ← Componente principal
│   │   ├── app.html               ← Template multi-página
│   │   ├── app.css                ← Estilos
│   │   ├── app.config.ts          ← Configuración HTTP
│   │   │
│   │   ├── services/
│   │   │   ├── auth.service.ts    ← Lógica autenticación
│   │   │   └── portfolio.service.ts ← Datos portafolio
│   │   │
│   │   └── interceptors/
│   │       └── auth.interceptor.ts ← Inyecta tokens
│   │
│   ├── index.html                 ← HTML principal
│   ├── main.ts                    ← Punto entrada
│   └── styles.css                 ← Estilos globales
│
├── package.json                   ← Dependencias npm
├── angular.json                   ← Configuración Angular
└── tsconfig.json                  ← Configuración TypeScript

eagleinvest-api/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       ├── AuthController.php ← Autenticación
│   │       └── PortfolioController.php ← Portafolio
│   │
│   └── Models/
│       ├── User.php               ← Modelo Usuario
│       └── ... (Portfolio, Investment, Transaction)
│
├── routes/
│   └── api.php                    ← Rutas del API
│
├── database/
│   ├── migrations/                ← Esquema BD
│   └── seeders/                   ← Datos iniciales
│
├── config/
│   ├── auth.php                   ← Config autenticación
│   └── sanctum.php                ← Config tokens
│
└── composer.json                  ← Dependencias PHP
```

---

## Tecnologías Utilizadas

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Frontend** | Angular | 20.3.0 |
| **State** | Signals | Angular built-in |
| **HTTP** | HttpClient + RxJS | Angular built-in |
| **Autenticación Frontend** | Token (localStorage) | Nativo |
| **Autenticación Backend** | Sanctum | Laravel built-in |
| **Backend** | Laravel | 11.0 |
| **API Protocol** | REST + JSON | HTTP/1.1 |
| **Base de Datos** | MySQL | 8.0+ |
| **CSS** | Bootstrap 5 + Custom | 5.3.0 |

---

## Flujo de Datos End-to-End

```
Usuario en navegador (localhost:4200)
    ↓
[Angular Component - app.ts]
    ↓
[Services - auth.service.ts / portfolio.service.ts]
    ↓
[AuthInterceptor - Inyecta token]
    ↓
[HttpClient - Envía petición HTTP]
    ↓
INTERNET (HTTP Request)
    ↓
[Laravel API - localhost:8000]
    ↓
[Auth Middleware - Valida token Sanctum]
    ↓
[Controllers - AuthController / PortfolioController]
    ↓
[Models & Database - Query builders]
    ↓
[MySQL Database]
    ↓
[Response JSON]
    ↓
INTERNET (HTTP Response)
    ↓
[HttpClient - Recibe datos]
    ↓
[Services - Procesa respuesta]
    ↓
[Signals - Actualiza estado]
    ↓
[Template - Re-renderiza con *ngIf / @for]
    ↓
Usuario ve cambios en navegador
```

---

## Tabla de Estados Permitidos

| currentPage | Requerimiento | Navbar Visible | Descripción |
|------------|-------------|---|---|
| landing | No auth | SÍ (Login) | Landing page inicial |
| login | No auth | SÍ (Login) | Formulario login |
| register | No auth | SÍ (Login) | Formulario registro |
| dashboard | ✅ auth | SÍ (Logout) | Panel de control |

```typescript
// Protección de rutas
if (page === 'dashboard' && !isAuthenticated()) {
  navigateTo('login');
  return;
}
```

---

## Seguridad

✅ **Frontend**:
- Tokens guardados en localStorage (protegido por HTTPS en producción)
- Interceptor automático para inyectar tokens
- Protección de rutas basada en isAuthenticated

✅ **Backend**:
- Middleware auth:sanctum en rutas protegidas
- Tokens con hash en base de datos
- CORS configurado para localhost:4200
- Password hasheado con bcrypt
- Validación de entrada en todos los endpoints

---

## Escalabilidad

**Para agregar más funcionalidades**:

1. **Nueva Página**: Agregar ng-container en app.html + caso en currentPage
2. **Nuevo Endpoint**: AuthController/PortfolioController + Route en api.php
3. **Nuevo Modelo**: Crear Model + Migration + Service en frontend
4. **Nuevos Datos**: Agregar signal en app.ts + binding en template

---

## Próximas Integraciones

```
Phase 1: Base (✅ COMPLETADA)
├─ Autenticación
├─ Formularios
└─ Dashboard básico

Phase 2: Base de Datos (⏳ Pendiente)
├─ Models: Portfolio, Investment, Transaction
├─ Migrations: Crear tablas
└─ Seeders: Datos iniciales

Phase 3: Características (✅ Diseño listo, lógica lista)
├─ Compra/Venta acciones
├─ Alertas de precios
├─ Gráficos financieros
└─ Reportes exportables

Phase 4: Producción (⏳ Pendiente)
├─ Deployment Laravel (Heroku/DigitalOcean)
├─ Deployment Angular (Netlify/Vercel)
├─ HTTPS + Certificado SSL
├─ CDN para assets estáticos
└─ Monitoreo y logs
```

---

**Estado Actual**: ✅ Sistema completamente funcional y compilado correctamente.
**Siguiente paso**: Ejecutar `php artisan serve` en terminal 1 y `npm start` en terminal 2.
