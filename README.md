# 🦅 EagleInvest - Plataforma de Inversiones

Sistema completo de gestión de inversiones con red de referidos multinivel (Unilevel).

## 🎯 Características Principales

### Sistema de Inversiones
- ✅ 4 planes automáticos (Bronce, Plata, Oro, Platino)
- ✅ Clasificación automática según monto invertido
- ✅ Retiros programados cada 18 días
- ✅ Validaciones de montos mínimos y máximos
- ✅ Historial completo de transacciones

### Red Unilevel
- ✅ Hasta 10 niveles de profundidad
- ✅ Comisiones automáticas por nivel
- ✅ Topes mensuales por plan
- ✅ Distribución recursiva inteligente
- ✅ Visualización de red completa

### Sistema de Retiros
- ✅ Validación de días transcurridos
- ✅ Cálculo automático de comisiones
- ✅ Aprobación admin obligatoria
- ✅ Estados: Pendiente → Aprobado → Completado

### Soporte y Seguridad
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

## 📊 Planes de Inversión

| Plan | Monto | Niveles | Tope Mensual |
|------|-------|---------|--------------|
| Bronce | $10-99 | 2 | $250 |
| Plata | $100-999 | 5 | $750 |
| Oro | $1k-4.9k | 8 | $2,500 |
| Platino | $5k+ | 10 | $5,000 |

---

**Versión**: 1.0.0 | **Estado**: ✅ Listo para Producción
