#!/bin/bash
# 🦅 EAGLEINVEST - STARTUP SCRIPT
# Este script inicia el sistema completo

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       🦅 EAGLEINVEST - SISTEMA DE INVERSIONES            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# ================================
# VERIFICACIÓN PREVIA
# ================================
echo -e "${YELLOW}1️⃣  VERIFICANDO REQUISITOS...${NC}"
echo ""

# Verificar PHP
if command -v php &> /dev/null; then
    PHP_VERSION=$(php -v | head -n 1)
    echo -e "${GREEN}✅ PHP instalado:${NC} $PHP_VERSION"
else
    echo -e "${RED}❌ PHP no instalado${NC}"
    exit 1
fi

# Verificar Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js instalado:${NC} $NODE_VERSION"
else
    echo -e "${RED}❌ Node.js no instalado${NC}"
    exit 1
fi

# Verificar npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✅ npm instalado:${NC} $NPM_VERSION"
else
    echo -e "${RED}❌ npm no instalado${NC}"
    exit 1
fi

# Verificar Composer
if command -v composer &> /dev/null; then
    echo -e "${GREEN}✅ Composer instalado${NC}"
else
    echo -e "${YELLOW}⚠️  Composer no encontrado${NC}"
fi

echo ""

# ================================
# CONFIGURACIÓN
# ================================
echo -e "${YELLOW}2️⃣  CONFIGURANDO SISTEMA...${NC}"
echo ""

# Configurar Backend
echo -e "${BLUE}Backend (Laravel):${NC}"
cd eagleinvest-api || exit

if [ ! -f .env ]; then
    echo -e "${YELLOW}  - Creando archivo .env...${NC}"
    cp .env.example .env
    php artisan key:generate
    echo -e "${GREEN}  ✅ .env creado${NC}"
else
    echo -e "${GREEN}  ✅ .env ya existe${NC}"
fi

# Instalar dependencias
if [ ! -d vendor ]; then
    echo -e "${YELLOW}  - Instalando dependencias Composer...${NC}"
    composer install
    echo -e "${GREEN}  ✅ Dependencias instaladas${NC}"
else
    echo -e "${GREEN}  ✅ Dependencias ya instaladas${NC}"
fi

cd .. || exit

# Configurar Frontend
echo -e "${BLUE}Frontend (Angular):${NC}"
cd eagleinvest-frontend || exit

# Instalar dependencias
if [ ! -d node_modules ]; then
    echo -e "${YELLOW}  - Instalando dependencias npm...${NC}"
    npm install
    echo -e "${GREEN}  ✅ Dependencias instaladas${NC}"
else
    echo -e "${GREEN}  ✅ Dependencias ya instaladas${NC}"
fi

cd .. || exit

echo ""

# ================================
# INICIAR SERVICIOS
# ================================
echo -e "${YELLOW}3️⃣  INICIANDO SERVICIOS...${NC}"
echo ""

echo -e "${GREEN}┌─────────────────────────────────────────┐${NC}"
echo -e "${GREEN}│ Abriendo 2 terminales...               │${NC}"
echo -e "${GREEN}└─────────────────────────────────────────┘${NC}"
echo ""

# Terminal 1: Backend
echo -e "${BLUE}TERMINAL 1:${NC} Iniciando Laravel Backend (Puerto 8000)..."
cd eagleinvest-api || exit
php artisan serve &
BACKEND_PID=$!
cd .. || exit
echo -e "${GREEN}✅ Backend iniciado (PID: $BACKEND_PID)${NC}"

# Esperar un poco para que Laravel inicie
sleep 3

# Terminal 2: Frontend
echo -e "${BLUE}TERMINAL 2:${NC} Iniciando Angular Frontend (Puerto 4200)..."
cd eagleinvest-frontend || exit
npm start &
FRONTEND_PID=$!
cd .. || exit
echo -e "${GREEN}✅ Frontend iniciado (PID: $FRONTEND_PID)${NC}"

echo ""

# ================================
# INFORMACIÓN FINAL
# ================================
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         🚀 EAGLEINVEST INICIADO EXITOSAMENTE           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}📊 INFORMACIÓN DE CONEXIÓN:${NC}"
echo -e "  ${BLUE}Backend API:${NC}      http://localhost:8000"
echo -e "  ${BLUE}Frontend App:${NC}     http://localhost:4200"
echo -e "  ${BLUE}Base de Datos:${NC}    MySQL (requiere configuración)"
echo ""

echo -e "${YELLOW}🔐 CREDENCIALES DE PRUEBA:${NC}"
echo -e "  ${BLUE}Email:${NC}    test@example.com"
echo -e "  ${BLUE}Password:${NC} password123"
echo ""

echo -e "${YELLOW}📱 PRUEBA RÁPIDA:${NC}"
echo -e "  1. Abre tu navegador en http://localhost:4200"
echo -e "  2. Click en 'Crear Cuenta Gratis'"
echo -e "  3. Completa el formulario"
echo -e "  4. ¡Bienvenido al Dashboard!"
echo ""

echo -e "${YELLOW}🛑 DETENER SERVICIOS:${NC}"
echo -e "  Presiona CTRL+C para detener ambos servidores"
echo ""

echo -e "${GREEN}✨ Sistema listo! Disfruta tu plataforma de inversión 🦅${NC}"
echo ""

# Esperar a que se cierre alguno de los servicios
wait $BACKEND_PID $FRONTEND_PID
