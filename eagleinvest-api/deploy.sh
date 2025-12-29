#!/bin/bash

# EagleInvest - Production Setup Script
# Este script automatiza la configuración inicial del servidor

echo "🚀 EagleInvest - Configuración de Producción"
echo "============================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Verificar si estamos en el directorio correcto
if [ ! -f "artisan" ]; then
    print_error "Este script debe ejecutarse desde el directorio raíz de Laravel"
    exit 1
fi

echo ""
echo "📦 Instalando dependencias..."
composer install --no-dev --optimize-autoloader
print_success "Dependencias de Composer instaladas"

echo ""
echo "🔑 Configurando variables de entorno..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    php artisan key:generate
    print_success "Archivo .env creado y key generada"
else
    print_warning ".env ya existe, saltando..."
fi

echo ""
echo "🗄️ Configurando base de datos..."
read -p "¿Ejecutar migraciones? (s/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    php artisan migrate --force
    print_success "Migraciones ejecutadas"
    
    read -p "¿Ejecutar seeder de planes? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        php artisan db:seed --class=PlanLevelSeeder --force
        print_success "Planes de inversión creados"
    fi
fi

echo ""
echo "⚡ Optimizando aplicación..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
print_success "Optimizaciones aplicadas"

echo ""
echo "📁 Configurando permisos..."
chmod -R 775 storage bootstrap/cache
print_success "Permisos configurados"

echo ""
echo "🔐 Configuración de seguridad..."
print_warning "Recuerda configurar:"
echo "  - APP_DEBUG=false en .env"
echo "  - APP_ENV=production en .env"
echo "  - FRONTEND_URL con tu dominio"
echo "  - Certificado SSL"
echo "  - Credenciales de base de datos"
echo "  - Credenciales SMTP"
echo "  - Redis para caché"

echo ""
echo "✅ Configuración completada!"
echo ""
echo "📝 Próximos pasos:"
echo "  1. Editar .env con tus configuraciones"
echo "  2. Crear usuario administrador (php artisan tinker)"
echo "  3. Configurar servidor web (Nginx/Apache)"
echo "  4. Habilitar HTTPS"
echo "  5. Configurar backups automáticos"
echo ""
echo "📖 Ver DEPLOYMENT_GUIDE.md para más información"
