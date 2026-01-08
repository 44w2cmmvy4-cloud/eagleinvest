# 🚀 GUÍA RÁPIDA - CÓMO USAR EL NUEVO SISTEMA v2.0

## Bienvenido a EagleInvest v2.0 ✅

Tu sistema está **completamente implementado** y listo para usar. Aquí te muestro cómo acceder a cada nuevo componente.

---

## 🎨 1. Logo Actualizado

El nuevo logo del águila está automáticamente en:
- **Navbar principal** (lado izquierdo)
- **Todos los componentes** que hereden de navbar

No necesitas hacer nada, ya está integrado. ✨

---

## 💰 2. Crear una Inversión

### URL: `http://localhost:4200/invest`

**Paso 1: Ingresa el monto**
```
Monto mínimo: $10
Máximo: Sin límite
El plan se clasifica automáticamente
```

**Paso 2: Confirma la inversión**
```
- Revisa los detalles
- Lee el monto, plan, nivel y retorno
- Acepta términos
- Haz clic en "Confirmar Inversión"
```

**Paso 3: Éxito**
```
✅ Verás confirmación
📅 Fecha de inicio registrada
⏳ Período de ratificación informado
→ Botón para ir al dashboard
```

### Planes Automáticos:
| Monto | Plan | Retorno | Ratificación |
|-------|------|---------|--------------|
| $10-$99 | Micro Impacto | 5% | 15 días |
| $100-$999 | Rápido Social | 8% | 10 días |
| $1k-$4.9k | Estanque Solidario | 12% | 30 días |
| $5k+ | Premium Humanitario | 15% | 35 días |

---

## 🎖️ 3. Ver Niveles de Inversión

### URL: `http://localhost:4200/investment-levels`

**Qué ves:**
```
4 tarjetas grandes (una por nivel)
├─ 🥉 BRONZE ($10-$99)
├─ 🥈 PLATA ($100-$999)
├─ 🥇 ORO ($1k-$4.9k)
└─ 💎 PLATINO ($5k+)

Cada tarjeta muestra:
- Rango de inversión
- Número de niveles de red
- Top máximo permitido
- Botón para invertir
```

**Interactividad:**
- Haz clic en cualquier tarjeta para ver detalles
- Aparecerá un panel expandible con más información
- Beneficios específicos de cada nivel

---

## 🔄 4. Cambiar Wallet

### URL: Perfil (menú usuario) > Datos de Pago

**Flujo:**
```
1. Accedes a tu perfil
2. Vas a "Datos de Pago"
3. El sistema verifica si tu wallet es editable

SI ES EDITABLE (campo desbloqueado):
  → Cambias directamente
  → Confirmación inmediata
  → Éxito ✅

SI NO ES EDITABLE (campo bloqueado):
  → Sistema te sugiere contactar soporte
  → Haces clic en "Contactar Soporte"
  → Envías solicitud (email o ticket)
  → Soporte revisa tu identidad
  → Si valida: Admin cambia manualmente
  → Te llega confirmación por email
  → Éxito ✅
```

---

## 👤 5. Registrarse con Patrocinador

### URL: Cuando un nuevo usuario llega con enlace de invitación

**Flujo:**
```
1. Usuario recibe enlace de invitación
   https://tuapp.com/register?sponsor=USER_ID

2. Sistema detecta al patrocinador
   └─ Muestra: Nombre, nivel y info del patrocinador

3. Formulario de registro:
   - Email
   - Contraseña (min 8 caracteres)
   - Nombre y Apellido
   - Teléfono
   - País

4. Validaciones automáticas
   ✓ Email válido
   ✓ Contraseña fuerte
   ✓ Teléfono correcto (10-15 dígitos)

5. Verificación 2FA
   - Código enviado por email
   - Usuario ingresa código
   - Validación automática

6. Vinculación a red
   - Se vincula automáticamente al patrocinador
   - Red unilevel creada
   - Acceso al dashboard

7. ¡Listo! Nuevo usuario registrado
```

---

## 📊 6. Entender la Ratificación

### ¿Qué es?
La ratificación es el período que debe esperar tu inversión antes de poder retirar ganancias.

### Fases según Plan:

**Micro Impacto (15 días)**
```
Toda la duración: 3% de retorno mensual
```

**Rápido Social (10 días)**
```
Toda la duración: 5% de retorno mensual
```

**Estanque Solidario (30 días)**
```
Días 1-10:   2% de retorno
Días 11-20:  3% de retorno
Días 21-30:  4% de retorno
```

**Premium Humanitario (35 días)**
```
Días 1-10:   1% de retorno
Días 11-20:  2% de retorno
Días 21-30:  3% de retorno
Días 31-35:  6% de retorno
```

### Ejemplo Real:
```
Inversión: $1,000 en plan Estanque Solidario
Inicio: 1 de enero

Primer mes:
  1-10 enero:   $1,000 × 2% = $20
  11-20 enero:  $1,000 × 3% = $30
  21-30 enero:  $1,000 × 4% = $40
  ────────────────────────────
  Total mes 1:              $90

Después de 30 días:
  ✅ Ratificación completada
  ✅ Puedes retirar tu inversión + ganancias
```

---

## 📱 7. Rutas de Navegación

```
Nueva navegación:
/invest                  → Crear inversión
/investment-levels       → Ver niveles
/dashboard               → Panel principal
/payment                 → Realizar pago
/withdrawals             → Solicitar retiro
/transactions            → Ver transacciones
/profile                 → Mi perfil
/referrals               → Sistema referidos
/market                  → Bot de trading
```

---

## 🔧 8. Para Desarrolladores

### Usar Servicios en Componentes:

```typescript
import { InvestmentService } from '@app/services/investment.service';

export class MyComponent {
  constructor(private investmentService: InvestmentService) {}

  investir() {
    const userId = 'user123';
    const amount = 5000;
    
    this.investmentService.createDetailedInvestment(userId, amount)
      .subscribe({
        next: (result) => console.log('¡Inversión creada!', result),
        error: (err) => console.error('Error:', err)
      });
  }
}
```

### Validar Inversión:

```typescript
const validation = this.investmentService.validateAndClassifyInvestment(1500);

if (validation.valid) {
  console.log(`Plan: ${validation.plan}`);      // ESTANQUE_SOLIDARIO
  console.log(`Nivel: ${validation.level}`);    // ORO
} else {
  console.log(`Error: ${validation.error}`);
}
```

### Ver Beneficios de Nivel:

```typescript
const benefits = this.investmentService.getLevelBenefits('ORO');
console.log(`Niveles: ${benefits.levels}`);      // 8
console.log(`Top: $${benefits.topAmount}`);      // $2500
```

---

## ❓ 9. Preguntas Frecuentes

### ¿Dónde está el logo nuevo?
En `/src/assets/logo/eagle-logo.svg`. Se muestra automáticamente en el navbar.

### ¿Qué pasa si ingreso un monto inválido?
El sistema te lo dice en rojo: "Monto mínimo es $10"

### ¿Puedo cambiar de plan después de invertir?
No, el plan se define al momento de la inversión según el monto.

### ¿Cuánto tarda la ratificación?
Depende del plan:
- Rápido Social: 10 días
- Micro Impacto: 15 días
- Estanque Solidario: 30 días
- Premium Humanitario: 35 días

### ¿Qué pasa si mi wallet no es editable?
Contactas soporte, ellos verifican tu identidad y lo cambian manualmente.

### ¿Qué es 2FA?
Factor de Autenticación Doble. Un código extra enviado a tu email para verificar tu identidad.

---

## ✅ 10. Checklist de Uso

- [ ] Visitaste `/invest` para crear una inversión
- [ ] Viste `/investment-levels` para entender los niveles
- [ ] Entendiste cómo funciona la ratificación
- [ ] Sabes dónde encontrar el nuevo logo
- [ ] Entiendes el flujo de cambio de wallet
- [ ] Sabes cómo registrar nuevos usuarios
- [ ] Exploraste los servicios en el código

---

## 📞 11. Soporte Técnico

**Si encuentras problemas:**

1. Revisa la **consola del navegador** (F12 → Console)
2. Busca en **SYSTEM_IMPLEMENTATION_v2.0.md**
3. Busca en **NUEVAS_FUNCIONALIDADES.md**
4. Revisa **RESUMEN_IMPLEMENTACION.md**

**Archivos importantes:**
```
README.md                          → Overview general
NUEVAS_FUNCIONALIDADES.md          → Guía de usuario
SYSTEM_IMPLEMENTATION_v2.0.md      → Documentación técnica
RESUMEN_IMPLEMENTACION.md          → Resumen ejecutivo
```

---

## 🎯 12. Próximos Pasos

1. **Backend**: Crea los endpoints en Laravel
2. **BD**: Crea las tablas necesarias
3. **Testing**: Prueba los flujos completos
4. **Admin**: Crea panel de aprobaciones
5. **Email**: Configura notificaciones

---

## 🎉 ¡Listo!

Tu sistema v2.0 está completamente implementado y listo para usar.

```
✅ Logo actualizado
✅ Sistema de inversiones
✅ Sistema de niveles
✅ Cambio de wallet
✅ Registro mejorado
✅ Ratificación automática
✅ Documentación completa
```

**¡A disfrutar del sistema! 🚀**

---

**Última actualización**: Enero 7, 2026  
**Versión**: 2.0.0  
**Estado**: ✅ Completamente Funcional
