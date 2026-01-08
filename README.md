# 🦅 EagleInvest - Plataforma de Inversiones v2.0

Sistema completo de gestión de inversiones con red de referidos multinivel (Unilevel), ratificación automática y cambio seguro de wallet.

## 🎯 Características Principales

### 🆕 v2.0 - Nuevas Características

#### Sistema de Inversiones Mejorado
- ✅ **Flujo de 3 pasos** para crear inversiones
- ✅ **Validación en tiempo real** del monto
- ✅ **Clasificación automática** de plan
- ✅ **Confirmación visual** antes de registrar
- ✅ **Período de ratificación** por plan
- ✅ Ruta: `/invest`

#### Sistema de Niveles Interactivo
- ✅ **Visualización completa** de los 4 niveles
- ✅ **Beneficios detallados** de cada nivel
- ✅ **Información de red unilevel** por nivel
- ✅ **Top máximo** por nivel
- ✅ **Interfaz responsive** y moderna
- ✅ Ruta: `/investment-levels`

#### Sistema de Ratificación
- ✅ **Cálculo automático** de ganancias mensuales
- ✅ **Fases progresivas** según plan
- ✅ **Validación de períodos** (10-35 días)
- ✅ **Estado en tiempo real** de ratificación
- ✅ **Comisiones mensuales** calculadas
- ✅ **Aprobación manual** cuando se completa

#### Registro Mejorado
- ✅ **Enlace de invitación** para patrocinador
- ✅ **Detección automática** del ID del patrocinador
- ✅ **Validación de 2FA** en registro
- ✅ **Vinculación a red unilevel** automática
- ✅ **Acceso inmediato** al dashboard

#### Cambio de Wallet Seguro
- ✅ **Validación de campo** (editable/bloqueado)
- ✅ **Proceso manual de soporte** si está bloqueado
- ✅ **Verificación de identidad** 2FA
- ✅ **Email de confirmación** automático
- ✅ **Admin puede editar manualmente** si valida identidad

#### Logo Actualizado
- ✅ **Nuevo logo del águila** sin fondo
- ✅ **Gráficos de crecimiento** integrados
- ✅ **Aplicado en navbar** y componentes
- ✅ **Efectos hover** mejorados

### Sistema Base (v1.0)

#### Sistema de Inversiones
- ✅ 4 planes automáticos (Bronce, Plata, Oro, Platino)
- ✅ Clasificación automática según monto invertido
- ✅ Retiros programados cada 18 días
- ✅ Validaciones de montos mínimos y máximos
- ✅ Historial completo de transacciones

#### Red Unilevel
- ✅ Hasta 10 niveles de profundidad
- ✅ Comisiones automáticas por nivel
- ✅ Topes mensuales por plan
- ✅ Distribución recursiva inteligente
- ✅ Visualización de red completa

#### Sistema de Retiros
- ✅ Validación de días transcurridos
- ✅ Cálculo automático de comisiones
- ✅ Aprobación admin obligatoria
- ✅ Estados: Pendiente → Aprobado → Completado

#### Soporte y Seguridad
- ✅ Sistema de tickets para cambios de wallet
- ✅ Verificación de identidad
- ✅ Wallet bloqueada (solo cambio por soporte)
- ✅ Registro con invitación obligatoria
- ✅ 2FA en registro

## 🚀 Instalación Rápida

### Backend (Laravel)
```bash
cd eagleinvest-api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed --class=PlanLevelSeeder
php artisan serve
```

### Frontend (Angular)
```bash
cd eagleinvest-frontend
npm install
ng serve
```

## 🔐 Seguridad Implementada

- Rate limiting en todas las rutas
- Sanitización automática de inputs
- CORS configurado correctamente
- Encriptación bcrypt (12 rounds)
- Sesiones seguras
- HTTPS obligatorio en producción

## 📚 Documentación Completa

- [📖 DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Guía de despliegue
- [🔒 SECURITY.md](SECURITY.md) - Detalles de seguridad
- [🎨 NUEVAS_FUNCIONALIDADES.md](NUEVAS_FUNCIONALIDADES.md) - **Características v2.0**
- [📋 SYSTEM_IMPLEMENTATION_v2.0.md](SYSTEM_IMPLEMENTATION_v2.0.md) - **Documentación técnica completa**

## 📊 Planes de Inversión

| Plan | Monto | Niveles | Tope Mensual | Retorno | Ratificación |
|------|-------|---------|--------------|---------|--------------|
| Bronce | $10-99 | 2 | $250 | 5% | 15 días |
| Plata | $100-999 | 5 | $750 | 8% | 10 días |
| Oro | $1k-4.9k | 8 | $2,500 | 12% | 30 días |
| Platino | $5k+ | 10 | $5,000 | 15% | 35 días |

## 🎨 Nuevas Rutas

```
GET  /invest                  → Flujo de inversión (3 pasos)
GET  /investment-levels       → Visualización de niveles
```

## 🔧 Servicios Nuevos

```typescript
// Sistema de Inversiones
InvestmentService
├── validateAndClassifyInvestment()
├── createDetailedInvestment()
├── getLevelBenefits()
└── calculateRatificationData()

// Cambio de Wallet
WalletService
├── initiateWalletChange()
├── isWalletEditable()
├── updateWalletDirect()
├── requestWalletChangeViaSupport()
└── verify2FA()

// Registro Mejorado
RegistrationService
├── detectReferrerId()
├── getSponsorDetails()
├── validateRegistrationData()
├── registerUser()
├── verify2FA()
└── linkToNetwork()

// Ratificación
RatificationService
├── initiate()
├── calculateRatification()
├── calculateMonthlyPayment()
├── adminApprove()
└── completeRatification()
```

---

**Versión**: 2.0.0 | **Estado**: ✅ Implementado y Funcionando
