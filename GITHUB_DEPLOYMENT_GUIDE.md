# 📤 Guía para Subir EagleInvest a GitHub

## ✅ Repositorio Git Inicializado

Tu proyecto ya está listo con:
- ✅ Repositorio Git inicializado
- ✅ `.gitignore` configurado (excluye node_modules, vendor, .env, etc.)
- ✅ Commit inicial creado con todos los archivos
- ✅ README.md profesional

---

## 🚀 Pasos para Subir a GitHub

### Opción 1: Desde la Interfaz Web de GitHub (Recomendado)

#### 1. Crear Repositorio en GitHub

1. Ve a [github.com](https://github.com)
2. Haz clic en el botón **"New"** o el ícono **"+"** → **"New repository"**
3. Completa los datos:
   - **Repository name**: `eagleinvest` (o el nombre que prefieras)
   - **Description**: "🦅 Plataforma de inversiones con Angular 18 + Laravel 11, autenticación 2FA y wallets cripto"
   - **Visibility**: 
     - ✅ **Public** (si quieres que sea visible para todos)
     - ✅ **Private** (si quieres mantenerlo privado)
   - ❌ **NO** marques "Add a README file" (ya tenemos uno)
   - ❌ **NO** marques "Add .gitignore" (ya tenemos uno)
   - ❌ **NO** marques "Choose a license" (por ahora)
4. Haz clic en **"Create repository"**

#### 2. Conectar tu Repositorio Local con GitHub

Después de crear el repositorio, GitHub te mostrará las instrucciones. Usa estos comandos:

```bash
# Navega a tu proyecto (si no estás ahí)
cd c:\Users\varga\EAGLEINVEST

# Conectar con GitHub (reemplaza TU_USUARIO con tu nombre de usuario)
git remote add origin https://github.com/TU_USUARIO/eagleinvest.git

# Renombrar la rama principal a 'main' (estándar de GitHub)
git branch -M main

# Subir tu código a GitHub
git push -u origin main
```

**Ejemplo con usuario real:**
```bash
git remote add origin https://github.com/yovanirubio/eagleinvest.git
git branch -M main
git push -u origin main
```

#### 3. Autenticación

Cuando hagas `git push`, GitHub te pedirá autenticarte:

**Opción A: Con Personal Access Token (Recomendado)**

1. Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click en "Generate new token (classic)"
3. Dale un nombre: "EagleInvest Deploy"
4. Selecciona permisos: 
   - ✅ **repo** (todos los permisos de repositorio)
5. Click en "Generate token"
6. **COPIA EL TOKEN** (solo se muestra una vez)
7. Usa el token como contraseña cuando Git te lo pida

**Opción B: Con GitHub Desktop**

1. Descarga [GitHub Desktop](https://desktop.github.com/)
2. Inicia sesión con tu cuenta
3. File → Add Local Repository → Selecciona `c:\Users\varga\EAGLEINVEST`
4. Publish repository

---

### Opción 2: Desde GitHub CLI (Avanzado)

```bash
# Instalar GitHub CLI
winget install GitHub.cli

# Autenticar
gh auth login

# Crear y subir repositorio
gh repo create eagleinvest --public --source=. --remote=origin --push
```

---

## 📝 Comandos Git Comunes

### Ver el Estado del Repositorio
```bash
git status
```

### Agregar Cambios Futuros
```bash
# Agregar todos los archivos modificados
git add .

# Agregar un archivo específico
git add archivo.txt
```

### Hacer Commits
```bash
git commit -m "feat: Descripción del cambio"
```

### Subir Cambios a GitHub
```bash
git push
```

### Ver el Historial
```bash
git log --oneline
```

### Crear una Nueva Rama
```bash
git checkout -b feature/nueva-funcionalidad
```

### Cambiar de Rama
```bash
git checkout main
```

---

## 🎯 Workflow Recomendado

### Desarrollo Diario

```bash
# 1. Hacer cambios en el código
# ... editar archivos ...

# 2. Ver qué cambió
git status

# 3. Agregar cambios
git add .

# 4. Hacer commit
git commit -m "feat: Agregar nueva funcionalidad"

# 5. Subir a GitHub
git push
```

### Convenciones de Commits

```bash
feat:     # Nueva funcionalidad
fix:      # Corrección de bug
docs:     # Cambios en documentación
style:    # Formateo de código
refactor: # Refactorización
test:     # Agregar tests
chore:    # Tareas de mantenimiento
```

**Ejemplos:**
```bash
git commit -m "feat: Agregar filtros en transacciones"
git commit -m "fix: Corregir cálculo de ROI"
git commit -m "docs: Actualizar README con nuevas instrucciones"
```

---

## 🔒 Seguridad - Archivos que NO Deben Subirse

El archivo `.gitignore` ya excluye automáticamente:

- ❌ `node_modules/` - Dependencias de Node.js
- ❌ `vendor/` - Dependencias de Composer
- ❌ `.env` - Variables de entorno (contraseñas, API keys)
- ❌ `storage/logs/` - Logs de Laravel
- ❌ `.vscode/` - Configuración personal de VS Code
- ❌ `*.log` - Archivos de log

**NUNCA subas:**
- Contraseñas
- API Keys
- Tokens de autenticación
- Datos sensibles de usuarios

---

## 📊 Configurar GitHub Pages (Opcional)

Si quieres hospedar la documentación:

1. Ve a tu repositorio en GitHub
2. Settings → Pages
3. Source: Deploy from a branch
4. Branch: `main` → `/docs` o `/`
5. Save

---

## 🏷️ Crear Releases

Para versiones estables:

1. Ve a tu repositorio en GitHub
2. Click en "Releases" → "Create a new release"
3. Tag version: `v1.0.0`
4. Title: "🦅 EagleInvest v1.0.0 - Initial Release"
5. Describe los cambios
6. Publish release

---

## 🤝 Colaboración

### Invitar Colaboradores

1. Repositorio → Settings → Collaborators
2. Add people
3. Ingresa el username de GitHub

### Pull Requests

```bash
# Crear rama para nueva funcionalidad
git checkout -b feature/mi-funcionalidad

# Hacer cambios y commits
git add .
git commit -m "feat: Mi nueva funcionalidad"

# Subir la rama
git push -u origin feature/mi-funcionalidad
```

Luego en GitHub:
- Click en "Compare & pull request"
- Describe los cambios
- Create pull request

---

## 🆘 Solución de Problemas

### Error: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/TU_USUARIO/eagleinvest.git
```

### Error: "failed to push some refs"
```bash
# Traer cambios del servidor
git pull origin main --rebase

# Volver a intentar
git push -u origin main
```

### Olvidé agregar algo al último commit
```bash
# Agregar los archivos olvidados
git add archivo-olvidado.txt

# Modificar el último commit
git commit --amend --no-edit

# Forzar push (solo si no han hecho pull otros)
git push --force
```

### Deshacer cambios no guardados
```bash
# Deshacer cambios en un archivo
git checkout -- archivo.txt

# Deshacer todos los cambios
git reset --hard
```

---

## 📚 Recursos Adicionales

- [Documentación de Git](https://git-scm.com/doc)
- [GitHub Docs](https://docs.github.com/)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## ✅ Checklist Final

Antes de hacer público tu repositorio:

- [ ] Revisar que `.env` esté en `.gitignore`
- [ ] Verificar que no haya contraseñas en el código
- [ ] Actualizar README.md con tu información
- [ ] Agregar LICENSE (MIT, Apache, etc.)
- [ ] Probar que el proyecto funcione desde cero (siguiendo tu README)
- [ ] Agregar badges al README (build status, version, etc.)
- [ ] Configurar GitHub Actions (CI/CD) si es necesario

---

## 🎉 ¡Listo!

Tu proyecto EagleInvest ya está listo para ser compartido con el mundo.

**URL de tu repositorio será:**
```
https://github.com/TU_USUARIO/eagleinvest
```

**Para clonarlo en otra máquina:**
```bash
git clone https://github.com/TU_USUARIO/eagleinvest.git
cd eagleinvest
```

---

<div align="center">

**¡Buena suerte con tu proyecto! 🦅**

Si tienes dudas, consulta la [documentación de GitHub](https://docs.github.com/) o abre un issue.

</div>
