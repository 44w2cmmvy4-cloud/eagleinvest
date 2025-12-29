# 🚀 GUÍA DE DEPLOYMENT - EAGLEINVEST

## ✅ CHECKLIST PRE-DEPLOYMENT

### Backend (Laravel)

- [ ] **Variables de Entorno**
  - [ ] Copiar `.env.example` a `.env`
  - [ ] Configurar `APP_ENV=production`
  - [ ] Configurar `APP_DEBUG=false`
  - [ ] Generar `APP_KEY` con `php artisan key:generate`
  - [ ] Configurar `APP_URL` con dominio real
  - [ ] Configurar `FRONTEND_URL` con dominio del frontend

- [ ] **Base de Datos**
  - [ ] Cambiar a MySQL/PostgreSQL (no SQLite)
  - [ ] Configurar credenciales de BD
  - [ ] Ejecutar `php artisan migrate --force`
  - [ ] Ejecutar `php artisan db:seed --class=PlanLevelSeeder --force`
  - [ ] Crear usuario administrador

- [ ] **Caché y Sesiones**
  - [ ] Configurar Redis para caché
  - [ ] Configurar Redis para sesiones
  - [ ] Ejecutar `php artisan config:cache`
  - [ ] Ejecutar `php artisan route:cache`
  - [ ] Ejecutar `php artisan view:cache`

- [ ] **Seguridad**
  - [ ] Configurar CORS correctamente
  - [ ] Verificar `SANCTUM_STATEFUL_DOMAINS`
  - [ ] Configurar `TRUSTED_PROXIES` y `TRUSTED_HOSTS`
  - [ ] Habilitar HTTPS
  - [ ] Configurar certificado SSL

- [ ] **Email y Notificaciones**
  - [ ] Configurar servicio SMTP
  - [ ] Verificar emails de confirmación
  - [ ] Configurar Twilio para 2FA (opcional)

- [ ] **Permisos de Archivos**
  ```bash
  chmod -R 775 storage bootstrap/cache
  chown -R www-data:www-data storage bootstrap/cache
  ```

### Frontend (Angular)

- [ ] **Variables de Entorno**
  - [ ] Actualizar `environment.ts` con URL de API real
  - [ ] Verificar `apiUrl` apunta a backend
  - [ ] Configurar `production: true`

- [ ] **Build de Producción**
  ```bash
  ng build --configuration production
  ```

- [ ] **Despliegue**
  - [ ] Subir archivos de `dist/` al servidor
  - [ ] Configurar servidor web (Nginx/Apache)
  - [ ] Configurar redirects para SPA
  - [ ] Habilitar compresión gzip
  - [ ] Configurar caché de assets

## 🔒 CONFIGURACIÓN DE SEGURIDAD

### 1. Nginx Configuration (Recomendado)

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Certificates
    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend
    root /var/www/eagleinvest/frontend/dist/browser;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
        
        # Caché de assets
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
}
```

### 2. Laravel Backend Config

```bash
# Optimizar para producción
php artisan optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Verificar configuración
php artisan config:show
```

### 3. Rate Limiting

Ya está configurado en las rutas:
- Login: 5 intentos / 15 minutos
- Registro: 3 intentos / 10 minutos
- 2FA: 5 intentos / 10 minutos
- API General: 60 requests / minuto
- Inversiones: 10 requests / hora
- Retiros: 5 requests / hora

### 4. Firewall

```bash
# UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Bloquear acceso directo a puertos de BD
sudo ufw deny 3306
sudo ufw deny 5432
```

## 📊 MONITORING Y LOGS

### Laravel Logs

```bash
# Ver logs en tiempo real
tail -f storage/logs/laravel.log

# Limpiar logs antiguos
php artisan log:clear
```

### Nginx Logs

```bash
# Access log
tail -f /var/log/nginx/access.log

# Error log
tail -f /var/log/nginx/error.log
```

## 🔐 CREAR USUARIO ADMINISTRADOR

```bash
php artisan tinker

use App\Models\User;
use Illuminate\Support\Facades\Hash;

User::create([
    'name' => 'Administrador',
    'email' => 'admin@eagleinvest.com',
    'password' => Hash::make('ChangeThisPassword123!'),
    'is_admin' => true,
    'value_cortyycado' => true,
    'referral_code' => 'ADMIN001',
    'wallet' => 'admin-wallet-address'
]);
```

## 🗄️ BACKUP

### Backup de Base de Datos

```bash
# MySQL
mysqldump -u username -p database_name > backup_$(date +%Y%m%d).sql

# PostgreSQL
pg_dump database_name > backup_$(date +%Y%m%d).sql
```

### Backup Automático (Cron)

```bash
# Editar crontab
crontab -e

# Agregar backup diario a las 3 AM
0 3 * * * /usr/bin/mysqldump -u user -ppassword eagleinvest_prod > /backups/db_$(date +\%Y\%m\%d).sql
```

## 🚨 TROUBLESHOOTING

### Error 500

```bash
# Ver logs
tail -f storage/logs/laravel.log

# Limpiar caché
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

### CORS Errors

1. Verificar `FRONTEND_URL` en `.env`
2. Verificar `config/cors.php`
3. Verificar `SANCTUM_STATEFUL_DOMAINS`

### Session Errors

1. Verificar Redis está funcionando
2. Verificar permisos en `storage/framework/sessions`
3. Limpiar sesiones: `php artisan session:clear`

## 📞 CONTACTO POST-DEPLOYMENT

- [ ] Verificar todos los endpoints funcionan
- [ ] Probar flujo completo de registro
- [ ] Probar flujo de inversión
- [ ] Probar flujo de retiro
- [ ] Verificar emails se envían
- [ ] Verificar 2FA funciona
- [ ] Verificar panel admin accesible

## 🎯 URLS IMPORTANTES

- **Frontend**: https://yourdomain.com
- **API**: https://yourdomain.com/api
- **Admin**: https://yourdomain.com/admin

## ⚠️ NOTAS IMPORTANTES

1. **NUNCA** subir `.env` a repositorio
2. **SIEMPRE** usar HTTPS en producción
3. **CAMBIAR** todas las contraseñas por defecto
4. **CONFIGURAR** backup automático
5. **MONITOREAR** logs regularmente
6. **ACTUALIZAR** dependencias periódicamente

---

**Última actualización**: 26 de Diciembre, 2025
