# Análisis Detallado del Diseño de Landing Page - EagleInvest

## Información General del Documento
- **Producto**: EagleInvest (Plataforma de inversión)
- **Total de páginas**: 12
- **Dimensiones de página**: 612x792 pts (carta estándar)
- **Tipografías principales**: Aptos (12pt), Calibri (12pt), Calibri-Bold (16pt aprox)

---

## ESTRUCTURA DEL DOCUMENTO

El PDF contiene documentación de diseño dividida en **4 secciones principales**:

### I. INTERFAZ DE INVITACIÓN
### II. LOGIN
### III. PANEL DE USUARIO
### IV. MENÚ LATERAL

---

# ANÁLISIS DETALLADO POR SECCIÓN

## SECCIÓN I: INTERFAZ DE INVITACIÓN

### 1. Opción de Primera Inversión
**Ubicación**: Página de inicio/primer acceso  
**Propósito**: Primera impresión para usuarios nuevos

**Contenido**:
- Mensaje de invitación a invertir
- Promoción de bono de bienvenida al registrarse
- Introducción breve sobre la empresa

**Elementos de diseño**:
- CTA (Call-To-Action) principal: Botón de "Registrarse" o "Comenzar"
- Sección hero con propuesta de valor
- Visual de bono/oferta promocional

---

### 2. Información de la Empresa
**Ubicación**: Sección central de la landing page (scrolleable)

**Subsecciones incluidas**:

#### a) Métricas de la Plataforma
- Usuarios activos (contador)
- Porcentaje de crecimiento
- Cantidad de países representados
- Premios obtenidos

#### b) Beneficios de Ser Socio
- Listado de 3-5 beneficios principales
- Descripción breve de cada uno

#### c) Tecnología Utilizada
- Stack tecnológico (no especificado en el PDF)
- Características de seguridad

#### d) Propuesta de Valor ("Qué hace esta empresa")
- Descripción de servicios
- Diferenciadores de mercado

#### e) Plan de Negocios
- Información sobre modelo de negocio
- Explicación de rentabilidad

#### f) Sistema de Niveles por Inversión
- Clasificación de planes/paquetes
- Beneficios por cada nivel
- Montos mínimos de inversión

#### g) Reglas de la Plataforma
- Términos y condiciones resumidos
- Políticas principales

#### h) CTA Secundario de Registro
- Invitación repetida a registrarse

**Nota del analista**: Esta sección es muy extensa y podría consolidarse para mejorar UX

---

### 3. Opciones Adicionales (Barra Superior/Header)
**Ubicación**: Barra de navegación superior (sticky)

**Elementos del Header**:

#### a) Enlaces de Redes Sociales
- WhatsApp (icono + enlace)
- Telegram (icono + enlace)

#### b) Selector de Idioma
- Dropdown/menú desplegable
- **Problema identificado**: Fondo translúcido que dificulta lectura de opciones
- Idiomas soportados: Múltiples (no especificados en detalle)

#### c) Inicio de Sesión
- Botón "Login" o similar
- Enlace a formulario de acceso

**Elementos visuales del header**:
- Logo de EagleInvest (posición: top-left probablemente)
- Menú de navegación principal
- Color de fondo: No especificado, probablemente blanco o neutral

**Problemas de diseño identificados**:
- Menú de idioma con fondo translúcido tiene problemas de legibilidad
- Posible falta de feedback visual en interacciones

---

## SECCIÓN II: LOGIN

### 1. Ingreso de Datos de Usuario Registrado
**Ubicación**: Página `/login` o similar  
**Tipo**: Formulario de autenticación

**Campos del formulario**:
- Email o nombre de usuario
- Contraseña
- Botón "Iniciar Sesión"
- Checkbox "Recuérdame" (opcional)

**Elementos adicionales**:
- Link "¿Olvidaste tu contraseña?"
- Link a "Registrarse" para nuevos usuarios
- Posible información de soporte

**Funcionalidades**:
- Validación de credenciales en tiempo real
- Manejo de errores (credenciales incorrectas)
- Redirección al panel tras login exitoso

---

### 2. Recuperación de Contraseña
**Estado**: No implementado aún en la beta  
**Ubicación**: Se accede desde el login o mediante email

**Flujo esperado**:
1. Usuario ingresa email registrado
2. Se envía enlace de recuperación
3. Usuario hace clic en enlace
4. Interfaz para ingresar nueva contraseña
5. Confirmación de cambio exitoso

**Elementos visuales** (especificación teórica):
- Formulario de recuperación
- Confirmación de envío de email
- Validación de enlace

---

### 3. Registro de Usuario Nuevo
**Ubicación**: Página `/register` o similar  
**Tipo**: Formulario multi-paso (4 secciones)

**Paso 1: Selección de País**
- Dropdown de países
- Selector con búsqueda
- Información de zonas horarias (posible)

**Paso 2: Datos Personales**
- Nombre completo
- Apellido
- Fecha de nacimiento
- Número de teléfono
- Email
- Género (opcional)
- Dirección

**Paso 3: Datos de Wallet** (No desarrollado en beta)
- Dirección de wallet de criptomoneda
- Red blockchain preferida
- Validación de dirección

**Paso 4: Detalles de la Cuenta** (No desarrollado en beta)
- Nombre de usuario
- Contraseña (con requisitos de seguridad)
- Confirmación de contraseña
- Código de referencia (si aplica)

**Elementos visuales**:
- Indicador de progreso (4/4 pasos)
- Botones "Siguiente" y "Atrás"
- Validación en tiempo real de campos
- Mensajes de error específicos

**Flujo**:
- Validación por cada paso
- Opción de guardar y continuar después
- Resumen antes de confirmación final

---

### 4. Políticas de Privacidad y Términos de Uso
**Ubicación**: Links en footer del login y durante registro  
**Tipo**: Páginas informationales (no modificables por usuario)

**Contenido** (estructura sugerida):
- Política de Privacidad
  - Recopilación de datos
  - Uso de información
  - Seguridad
  - Derechos del usuario

- Términos de Uso
  - Aceptación de términos
  - Responsabilidades del usuario
  - Limitaciones de plataforma
  - Resolución de disputas

**Nota**: Requieren interfaz de lectura y aceptación formal

---

## SECCIÓN III: PANEL DE USUARIO

### 1. Datos de Inversión Actual (Dashboard Principal)
**Ubicación**: Primera pantalla tras login  
**Ruta**: `/dashboard` o `/panel`

**Características de sesión**:
- **Timeout de inactividad**: 15 minutos
- **Cierre automático de sesión**: Cuando se cumple timeout
- **Contador regresivo**: Visible para usuario (problema: se cierra sin esperar confirmación en beta)

**Widgets/Tarjetas del Dashboard**:

#### a) Saldo de Ganancias
- Cantidad total acumulada
- Porcentaje de ganancia (%)
- Variación diaria/semanal
- Visualización: Número destacado + Gráfico de tendencia

#### b) Saldo de Referidos
- Comisiones recibidas por equipo referido
- Contador de referidos activos
- Historial de comisiones
- Visualización: Tarjeta con total + lista comprimida

#### c) Saldo Bloqueado
- Fondos que no se pueden retirar aún
- Razones de bloqueo
- Fecha de desbloqueo (si aplica)
- Visualización: Alerta o tarjeta informativa

#### d) CTA "Invitar Usuarios Nuevos"
- Botón destacado
- Genera link de referencia
- Opción de copiar/compartir
- Integración con WhatsApp/Telegram

#### e) CTA "Comenzar a Invertir con IA"
- Botón principal
- Dirige a sección de nuevas inversiones
- Tooltip con información adicional

#### f) Estadísticas de la Red
- Inversiones totales realizadas en la red (resumen del día)
- Número de inversiones activas en la red
- Crecimiento en tiempo real
- Visualización: Gráfico o contador grande

#### g) Estadísticas Personales
- **Total invertido**: Suma de todas inversiones realizadas
- **Total retirado**: Suma de retiros procesados
- **Rentabilidad acumulada**: Porcentaje o cantidad
- **Inversiones activas**: Número de paquetes activos
- Visualización: Tabla resumida o 4 tarjetas

**Layout del Dashboard**:
- Grid responsivo (probablemente 2-3 columnas en desktop)
- Menú lateral fijo a la izquierda
- Menú superior redundante (problema identificado)
- Espacio para gráficos y widgets

**Colores observados**:
- Gris oscuro para texto: Aproximadamente #A0A0A0 (0.627 en escala 0-1 = ~160/255)
- Gris claro para fondos: Aproximadamente #E2E2E2 (0.89 en escala 0-1 = ~227/255)

---

### 2. Menú Lateral (Sidebar)
**Ubicación**: Lado izquierdo, permanente  
**Comportamiento**: Sticky (fijo al desplazarse)

**Opciones del menú** (en orden):
1. Nueva Inversión
2. Inversiones
3. Equipo
4. Retiro
5. Extracto
6. Configuración
7. Extras

**Elementos visuales**:
- Logo de empresa en top
- Ícono + Texto para cada opción
- Indicador de página activa (highlight/color)
- Posible contador de notificaciones
- Usuario logged in (avatar + nombre en bottom?)

**Problema identificado**: Coexiste con menú superior teniendo las mismas opciones

---

### 3. Menú Superior (Navbar)
**Ubicación**: Top de la página, sticky  
**Contenido**: Íconos/enlaces a las mismas opciones del menú lateral

**Elementos adicionales**:
- Logo (posiblemente clickeable para volver a dashboard)
- Búsqueda/filtros
- Notificaciones (campana con contador)
- Avatar de usuario (dropdown para perfil y logout)

**Problema identificado**: Redundancia con menú lateral

---

## SECCIÓN IV: MENÚ LATERAL - OPCIONES DETALLADAS

### 1. Nueva Inversión
**Ubicación**: Accesible desde menú lateral o dashboard  
**Ruta**: `/investments/new` o similar

**Flujo de inversión** (pasos secuenciales):

#### Paso 1: Selección de Paquete
**Visualización**: Grid de tarjetas con paquetes

**Información por paquete**:
- Nombre del paquete (ej: "Starter", "Professional", "Enterprise")
- Descripción breve
- Cantidad mínima de inversión
- Porcentaje de retorno esperado
- Duración del plan
- Beneficios especiales (si aplica)

**Elementos interactivos**:
- Botón "Seleccionar" en cada tarjeta
- Información adicional al hover
- Posible expandir/collapse para detalles

#### Paso 2: Ingreso de Monto
**Formulario simple**:
- Campo de entrada numérica
- Validación de monto mínimo
- Validación de monto máximo (si aplica)
- Recomendación de cantidad sugerida
- Visualización de ganancia estimada en tiempo real
- Cálculo de ROI

**Elementos visuales**:
- Icono de moneda
- Formato de miles separador
- Indicador de rango válido
- Botones: "Continuar" y "Atrás"

#### Paso 3: Confirmación
**Resumen de transacción**:
- Paquete seleccionado
- Monto a invertir
- Ganancia estimada
- Duración
- Fecha de finalización estimada
- Términos a aceptar (checkbox)

**Botones**:
- "Confirmar inversión"
- "Editar"
- "Cancelar"

#### Paso 4: Selección de Método de Pago
**Opciones disponibles**:
- Criptomoneda (única opción mencionada)
- Posibles opciones futuras

**Si criptomoneda**:
- Seleccionar blockchain (Ethereum, Bitcoin, Binance Smart Chain, etc.)
- Seleccionar moneda específica (USDT, USDC, ETH, BTC, etc.)
- Mostrar dirección de wallet a enviar fondos
- Código QR del wallet
- Monto exacto a transferir

#### Paso 5: Generación de Factura/Recibo
**Información incluida**:
- Número de transacción
- Detalles de inversión
- Dirección de pago
- Monto
- Código QR
- Instrucciones de pago

**Flujo posterior**:
- Redirección a portal de pagos externo
- Usuario completa pago fuera de la plataforma
- Confirmación automática o manual al completar

**Estados**:
- Pendiente de pago
- Pagado y procesando
- Inversión activa
- Completada

---

### 2. Inversiones (Portafolio/Historial)
**Ubicación**: Menú lateral  
**Ruta**: `/investments`

**Vista principal: Lista de inversiones activas**

**Información por inversión** (columnas/tarjeta):
- **Nombre del paquete**: "Starter", "Professional", etc.
- **Monto invertido**: Cantidad en criptomoneda/fiat
- **Porcentaje de ganancia**: % actual
- **Ganancia en moneda**: Cantidad exacta
- **Fecha de inicio**: Cuándo se realizó inversión
- **Fecha de vencimiento**: Cuándo finaliza
- **Tiempo restante**: Countdown visual
- **Estado**: Activa, Completada, En espera, etc.
- **Progreso**: Barra de progreso visual

**Análisis Diario** (sección separada):
- Gráfico de línea o área mostrando crecimiento diario
- Promedio de ganancia diaria
- Volatilidad (si aplica)
- Comparativa con día anterior
- Periodo seleccionable (7 días, 30 días, etc.)

**Elementos interactivos**:
- CTA "Nuevo Pocket Plan" (botón destacado)
- Posible expandir cada inversión para más detalles
- Filtros por estado
- Ordenamiento: por fecha, por ganancia, etc.

**Problema identificado**: Button "nuevo pocket plan" redirige a "Nueva inversión" (posible inconsistencia de nomenclatura)

---

### 3. Equipo (Referidos/Network)
**Ubicación**: Menú lateral  
**Ruta**: `/team` o `/network`

**Funcionalidades principales**:

#### a) Invitar Nuevos Inversionistas
- Botón "Invitar" destacado
- Genera link único de referencia
- Opciones para compartir:
  - Copiar link
  - Compartir por WhatsApp
  - Compartir por Telegram
  - Email
- Historial de invitaciones enviadas

#### b) Gestión de Grupo
- Listar todos los referidos directos
- Por cada referido mostrar:
  - Nombre
  - Email/Usuario
  - Fecha de registro
  - Estado (activo/inactivo)
  - Inversión total realizada
  - Comisiones generadas

#### c) Progreso de Ganancias por Equipo
- Estructura de árbol de referidos (si multi-nivel)
- Ganancias acumuladas por cada rama
- Seguimiento de progreso
- Proyecciones futuras

**Visualización**:
- Tabla expandible
- Gráficos de árbol (tree chart)
- Tarjetas de resumen

**Normativas del Sistema** (sección):
- Requisitos para ser equipo
- Comisiones por referido
- Bonificaciones por volumen
- Limitaciones y restricciones
- **Nota**: Se sugiere cambiar ubicación de esta información

---

### 4. Retiro
**Ubicación**: Menú lateral  
**Ruta**: `/withdrawal`

**Flujo de retiro** (pasos):

#### Paso 1: Seleccionar Origen de Fondos
**Opciones**:
- Saldo de ganancias
- Saldo de referidos
- Ambos (si permite combinación)

**Información visible**:
- Saldo disponible en cada apartado
- Monto máximo permitido retirar

#### Paso 2: Seleccionar Monto
**Validaciones**:
- Monto mínimo permitido
- Monto máximo (depende del plan de inversión)
- Limitaciones según plan:
  - Plan Starter: Max retirar X%
  - Plan Professional: Max retirar Y%
  - etc.

**Visualización**:
- Campo numérico
- Deslizador (slider) para seleccionar cantidad
- Botones de: 25%, 50%, 75%, 100%
- Cálculo de comisiones/fees

#### Paso 3: Aprobación de Bot
**Sistema automático**:
- Bot evalúa solicitud según criterios:
  - Historial de usuario
  - Frecuencia de retiros
  - Montos
  - Comportamiento sospechoso
- Estados:
  - Aprobado
  - Rechazado
  - En revisión (manual)

**Mensaje visual**: Resultado de aprobación

#### Paso 4: Información de Pago
Si APROBADO:

**Recibo generado** (documento):
- Número de solicitud
- Monto a retirar
- Fecha de solicitud
- Información de cuenta de destino:
  - Número de cuenta/Wallet
  - Banco/Red
  - Titulares
- Fecha estimada de recepción
- Términos de procesamiento

**Opciones**:
- Descargar recibo (PDF)
- Compartir recibo
- Imprimir

Si RECHAZADO:
- Motivo del rechazo
- Opciones para apelar
- Información de soporte

**Limitantes mencionadas**:
- Usuario reporta no poder completar proceso por insuficiencia de saldo mínimo

---

### 5. Extracto (Historial de Transacciones)
**Ubicación**: Menú lateral  
**Ruta**: `/statement` o `/history`

**Vista principal**: Tabla/lista de movimientos cronológica

**Información por transacción**:
- Fecha y hora
- Tipo de movimiento
- Descripción
- Monto
- Saldo resultante
- Estado

**Categorías de movimientos** (filtros):

#### a) "Todas las categorías"
- Muestra todos los movimientos sin filtrar

#### b) "Retiro"
- Solicitudes de retiro procesadas
- Estado de cada retiro
- Detalles de destinatario

#### c) "Tasa"
- Transacciones mostradas como tasas cobradas
- Comisiones de plataforma
- Fees de procesamiento

#### d) "Ganancia de Inversión"
- Ganancias generadas por inversiones
- Detalles de qué inversión las generó
- Monto diario/período

#### e) "Retorno de Capital"
- Devoluciones de inversiones completadas
- Monto original retornado
- Fecha de completación

#### f) "Inversión con Saldo"
- Nuevas inversiones realizadas
- Monto invertido
- Plan seleccionado
- Fecha de activación

#### g) "Reembolso"
- Devoluciones por cancelación de inversión
- Reembolsos por error
- Motivo del reembolso

#### h) "Bono de Referido"
- Comisiones recibidas por referidos
- Nombre de referido (si visible)
- Porcentaje de comisión
- Acumulativo por período

**Funcionalidades**:
- Buscar por fecha
- Buscar por monto
- Exportar a CSV/Excel
- Imprimir extracto
- Filtros múltiples simultáneos
- Ordenamiento personalizable

**Períodos predefinidos**:
- Hoy
- Esta semana
- Este mes
- Este año
- Personalizado (date range)

---

### 6. Configuración (Cuenta)
**Ubicación**: Menú lateral  
**Ruta**: `/settings`

**Opciones de configuración**:

#### a) Visualizar Datos de Usuario
- Nombre completo
- Email
- Teléfono
- País
- Dirección
- Documento de identidad (si está verificado)
- Wallet de criptomoneda (si registrada)
- Fecha de registro
- Estado de cuenta

**Elemento interactivo**:
- Botón "Editar Perfil" (puede que no esté permitido editar todos los campos)

#### b) Cambio de Contraseña
**Proceso**:
1. Ingresar contraseña actual (validación)
2. Ingresar nueva contraseña
3. Confirmar nueva contraseña
4. Validar requisitos de seguridad (mayúsc, minúsc, números, caracteres especiales)

**Verificación en dos pasos** (2FA):
- Se solicita código de verificación (enviado a email o SMS)
- Usuario ingresa código
- Solo entonces se cambia contraseña
- Confirmación final

**Opciones de verificación**:
- Email registrado
- Número telefónico registrado
- Código de autenticación (si está activo)

#### c) Factores de Autenticación (probablemente):
- Activar/desactivar 2FA
- Seleccionar método (Email, SMS, Google Authenticator)
- Códigos de recuperación de emergencia

---

### 7. Extras
**Ubicación**: Menú lateral  
**Ruta**: `/extras` o `/more-settings`

**Opciones principales**:

#### a) Notificaciones
**Estado actual (problema identificado)**:
- Separado en 2 botones distintos (debería ser uno solo con toggle)

**Opciones**:
- Toggle global de notificaciones
- Por tipo:
  - Nuevas ganancias (ON/OFF)
  - Retiros completados (ON/OFF)
  - Nuevos referidos (ON/OFF)
  - Mantenimiento/alertas (ON/OFF)
  - Promociones (ON/OFF)
- Canales:
  - Email
  - SMS/Push
  - En-app

#### b) Cambio de Idioma
**Funcionalidad**:
- Dropdown/selector de idiomas
- Aplicación inmediata del cambio
- Persistencia en sesión y almacenamiento
- Problema: Esta opción también está en header (redundancia)

#### c) Tema de Color (Funcionalidad Sugerida - NO EXISTE AÚN)
**Sugerencias de implementación**:
- Selector: Claro / Oscuro / Automático
- "Automático" se basa en preferencia del sistema operativo
- Persistencia de selección en storage local

---

## PROBLEMAS Y MEJORAS IDENTIFICADAS

### Problemas Actuales:

1. **Menú redundante**: Coexisten menú lateral y navbar superior con las mismas opciones
   - *Sugerencia*: Mantener solo uno e implementar toggle responsive

2. **Timeout de inactividad defectuoso**: Se cierra sesión aleatoriamente, no respeta 15 minutos
   - *Urgencia*: ALTA

3. **Menú de idiomas translúcido**: Fondo traslucido dificulta lectura de opciones
   - *Sugerencia*: Cambiar a fondo opaco

4. **Notificaciones duplicadas**: Separadas en 2 botones distintos
   - *Sugerencia*: Un solo botón toggle

5. **Secciones repetidas**: 
   - Historial de movimientos (en extracto y en dashboard?)
   - Cambio de idioma (header, extras, dashboard?)
   - Información de usuario (perfil, settings, etc.)

6. **Recuperación de contraseña**: No implementada en beta actual

### Mejoras Sugeridas (De Implementación):

1. **Dark Mode**: Opción para cambiar tema automáticamente según sistema

2. **Confirmación de logout**: Pedir confirmación antes de cerrar sesión

3. **Reorganización estructural**: Consolidar menús y eliminar redundancias

---

## ESPECIFICACIONES TÉCNICAS Y DE DISEÑO

### Dimensiones y Resoluciones
- **Documento base**: 612x792 pt (standard letter)
- **Responsive**: Se asume diseño mobile-first (no especificado)
- **Breakpoints probables**: 
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

### Tipografía
- **Fuente primaria**: Aptos / Calibri
- **Peso normal**: Regular (400)
- **Peso destacado**: Bold (700)
- **Tamaño base**: 12pt (para cuerpo)
- **Tamaño títulos**: 16pt aprox (15.96pt)
- **Escalas sugeridas**: 
  - H1: 28-32px
  - H2: 24-28px
  - H3: 20-24px
  - Body: 14-16px
  - Small: 12px

### Paleta de Colores

#### Colores Identificados (del análisis):
- **Gris oscuro**: #A0A0A0 (escala decimal 0.627 = RGB ~160,160,160)
- **Gris claro**: #E2E2E2 (escala decimal 0.89 = RGB ~227,227,227)

#### Colores Sugeridos (basado en branding típico fintech):
- **Color primario**: Probablemente azul o dorado (EagleInvest = eagle)
- **Color secundario**: Complementario
- **Color de éxito**: Verde (#27AE60 o similar)
- **Color de alerta**: Naranja/Rojo (#E74C3C o similar)
- **Fondo**: Blanco (#FFFFFF) o muy claro (#F8F9FA)
- **Texto**: Gris oscuro (#2C3E50) o negro (#1A1A1A)

### Elementos Interactivos
- **Botones primarios**: Color primario, hover más oscuro
- **Botones secundarios**: Borde + texto primario
- **Inputs**: Borde gris, focus con color primario
- **Dropdowns**: Estilo clean, icono chevron
- **Toggles**: Switch visual (ON/OFF)
- **Sliders**: Rango visual con handle draggable

### Espaciado
- **Margen de contenedor**: 16px - 24px
- **Espaciado entre secciones**: 32px - 48px
- **Espaciado vertical items**: 8px - 16px
- **Espaciado horizontal items**: 12px - 20px

### Efectos y Transiciones
- **Hover effects**: Cambio de color, aumento de sombra
- **Transiciones**: 200-300ms ease-in-out
- **Animaciones**: Fade in, slide, pulse en métricas

---

## ESTRUCTURA DE NAVEGACIÓN

```
Landing Page (/)
├── Header
│   ├── Logo
│   ├── Redes Sociales (WhatsApp, Telegram)
│   ├── Selector Idioma
│   └── Login / Registro CTA
│
├── Hero Section
│   ├── Bono de Bienvenida
│   └── Registro CTA
│
├── Información Empresa
│   ├── Métricas (Usuarios, Crecimiento, Países, Premios)
│   ├── Beneficios
│   ├── Tecnología
│   ├── Propuesta de Valor
│   ├── Plan de Negocios
│   ├── Niveles de Inversión
│   └── Reglas
│
└── Footer
    ├── Políticas de Privacidad
    └── Términos de Uso

Login (/login)
├── Formulario de Login
├── Link Recuperar Contraseña (no funcional)
├── Link Registro
└── Links T&C y Privacy

Registro (/register)
├── Paso 1: Seleccionar País
├── Paso 2: Datos Personales
├── Paso 3: Datos Wallet (no funcional)
├── Paso 4: Detalles Cuenta (no funcional)
└── Confirmación

Panel (/dashboard)
├── [Navbar Superior]
├── [Sidebar]
├── Main Content
│   ├── Saldo Ganancias
│   ├── Saldo Referidos
│   ├── Saldo Bloqueado
│   ├── CTAs (Invitar, Invertir IA)
│   ├── Estadísticas Red
│   └── Estadísticas Personales
│
├── [Sidebar Items]
│   ├── Nueva Inversión (/investments/new)
│   ├── Inversiones (/investments)
│   ├── Equipo (/team)
│   ├── Retiro (/withdrawal)
│   ├── Extracto (/statement)
│   ├── Configuración (/settings)
│   └── Extras (/extras)

Nueva Inversión (/investments/new)
├── Paso 1: Seleccionar Paquete
├── Paso 2: Ingresar Monto
├── Paso 3: Confirmación
├── Paso 4: Método de Pago
└── Paso 5: Recibo/Factura

Inversiones (/investments)
├── Lista de Inversiones Activas
└── Análisis Diario

Equipo (/team)
├── Botón Invitar
├── Lista de Referidos
├── Progreso por Equipo
└── Normativas

Retiro (/withdrawal)
├── Seleccionar Origen
├── Seleccionar Monto
├── Aprobación (Bot)
└── Recibo

Extracto (/statement)
├── Filtros de Categoría
├── Lista de Movimientos
├── Búsqueda y Ordenamiento
└── Exportar

Configuración (/settings)
├── Datos de Usuario
└── Cambio de Contraseña

Extras (/extras)
├── Notificaciones
├── Idioma
└── Tema (sugerido)
```

---

## REQUISITOS FUNCIONALES RESUMIDOS

### Autenticación
- ✅ Login
- ❌ Recuperar contraseña (no implementado)
- ✅ Registro (pasos 1-2 implementados, 3-4 no)
- ⚠️ Timeout 15min (defectuoso)
- ⚠️ 2FA en cambio de contraseña

### Inversiones
- ✅ Ver paquetes disponibles
- ✅ Realizar nueva inversión
- ✅ Ver inversiones activas
- ✅ Análisis de ganancias
- ⚠️ Proceso de pago (redirige a terceros)

### Referidos
- ✅ Generar link de referencia
- ✅ Compartir en redes sociales
- ✅ Ver lista de referidos
- ✅ Calcular comisiones

### Retiros
- ✅ Solicitar retiro
- ✅ Validación de montos (con limitantes)
- ⚠️ Aprobación de bot (automático)
- ✅ Generar recibo

### Administrativo
- ✅ Historial de transacciones
- ✅ Múltiples idiomas
- ✅ Cambio de contraseña con 2FA
- ⚠️ Notificaciones (botones duplicados)
- ❌ Dark mode (sugerido)

---

## CONCLUSIONES Y RECOMENDACIONES

### Estado General
El diseño propuesto es **funcional pero requiere refinamientos**. La estructura es lógica y cubre casos de uso principales de una plataforma de inversión.

### Prioridades de Desarrollo

**CRÍTICO**:
1. Corregir timeout de inactividad (15 min no funciona)
2. Implementar recuperación de contraseña
3. Mejorar visibilidad menú de idiomas

**ALTO**:
1. Consolidar menús (eliminar redundancia sidebar/navbar)
2. Reparar notificaciones (un solo toggle)
3. Terminar formulario de registro (pasos 3-4)

**MEDIO**:
1. Agregar dark mode automático
2. Agregar confirmación antes de logout
3. Reorganizar información redundante
4. Mejorar UX de cambio de contraseña

**BAJO**:
1. Optimizaciones visuales menores
2. Animaciones de transición
3. Mejoras de accesibilidad

### Recomendaciones Específicas
- Mantener interfaz **limpia y directa**, sin sobreinformación
- Enfatizar **seguridad** en formularios sensibles (2FA, passwords)
- Hacer **mobile-first** - inversores usan apps móviles frecuentemente
- Implementar **real-time notifications** para eventos importantes
- **Validar todas las transacciones** con confirmación del usuario
