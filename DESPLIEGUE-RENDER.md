# 🚀 Guía de Despliegue en Render

Esta guía te ayudará a desplegar tu aplicación WhatsApp-IA-Sheets en Render **GRATIS** para que funcione 24/7 sin necesidad de tener tu PC encendida.

---

## ✅ Ventajas de Render

- Gratis para empezar (750 horas/mes)
- Servidor siempre activo (24/7)
- URL pública fija (no cambia)
- No necesitas ngrok
- Reinicia automáticamente si hay errores
- Fácil de actualizar
- SSL/HTTPS automático

---

## 📋 Requisitos Previos

1. Cuenta de GitHub (gratuita): https://github.com
2. Cuenta de Render (gratuita): https://render.com
3. Git instalado en tu PC

---

## 🔧 Paso 1: Inicializar Git en el Proyecto

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
git init
git add .
git commit -m "Initial commit - WhatsApp IA Sheets"
```

**Explicación:**
- `git init` - Inicializa un repositorio Git local
- `git add .` - Agrega todos los archivos al staging
- `git commit -m "..."` - Crea el primer commit

---

## 📦 Paso 2: Crear Repositorio en GitHub

### 2.1. Ir a GitHub
Ve a: https://github.com/new

### 2.2. Configurar el repositorio
- **Repository name:** `whatsapp-ia-sheets`
- **Description:** "Sistema de registro de actividades laborales via WhatsApp con IA"
- **Visibility:** Private (privado, para mantener tus credenciales seguras)
- **NO marques** "Initialize this repository with a README"

### 2.3. Hacer clic en "Create repository"

### 2.4. Conectar tu repositorio local con GitHub

GitHub te mostrará comandos. Cópialos y ejecútalos:

```bash
git remote add origin https://github.com/TU-USUARIO/whatsapp-ia-sheets.git
git branch -M main
git push -u origin main
```

**Reemplaza `TU-USUARIO` con tu nombre de usuario de GitHub**

---

## 🌐 Paso 3: Crear Servicio en Render

### 3.1. Ir a Render
Ve a: https://dashboard.render.com

### 3.2. Hacer clic en "New +"
En el dashboard, haz clic en el botón azul "New +" arriba a la derecha.

### 3.3. Seleccionar "Web Service"
De las opciones que aparecen, elige "Web Service"

### 3.4. Conectar repositorio de GitHub
- Haz clic en "Connect GitHub" o "Connect account"
- Autoriza a Render a acceder a GitHub
- Busca y selecciona tu repositorio: `whatsapp-ia-sheets`

### 3.5. Configurar el servicio

Llena el formulario con estos datos:

**Name:** `whatsapp-ia-sheets` (o el nombre que prefieras)

**Region:** `Oregon (US West)` (o el más cercano a ti)

**Branch:** `main`

**Root Directory:** (dejar vacío)

**Runtime:** `Node`

**Build Command:**
```
npm install
```

**Start Command:**
```
npm start
```

**Instance Type:** `Free` (gratis)

---

## 🔐 Paso 4: Configurar Variables de Entorno

Antes de hacer el deploy, necesitas agregar tus variables de entorno:

### 4.1. En la página de configuración de Render, baja hasta "Environment Variables"

### 4.2. Haz clic en "Add Environment Variable"

### 4.3. Agrega las siguientes variables una por una:

#### Variable 1: GOOGLE_SHEET_ID
```
Key: GOOGLE_SHEET_ID
Value: TU_GOOGLE_SHEET_ID
```

#### Variable 2: TWILIO_ACCOUNT_SID
```
Key: TWILIO_ACCOUNT_SID
Value: TU_TWILIO_ACCOUNT_SID
```

#### Variable 3: TWILIO_AUTH_TOKEN
```
Key: TWILIO_AUTH_TOKEN
Value: (Tu auth token de Twilio - cópialo de credentials/.env)
```

#### Variable 4: TWILIO_WHATSAPP_NUMBER
```
Key: TWILIO_WHATSAPP_NUMBER
Value: whatsapp:+14155238886
```

#### Variable 5: ANTHROPIC_API_KEY
```
Key: ANTHROPIC_API_KEY
Value: (Tu API key de Claude - cópialo de credentials/.env)
```

#### Variable 6: GOOGLE_CREDENTIALS
**IMPORTANTE:** Este es especial. Necesitas el contenido completo del archivo credentials.json

**Paso a paso:**
1. Abre el archivo `credentials/credentials.json` con un editor de texto
2. Copia TODO el contenido (desde `{` hasta `}`)
3. **Minifícalo** (elimina saltos de línea y espacios extras)
   - Puedes usar: https://www.minifier.org/
   - O simplemente asegúrate de que sea todo en una línea
4. Pega ese contenido en Render

```
Key: GOOGLE_CREDENTIALS
Value: {"type":"service_account","project_id":"...","private_key":"..."}
```

#### Variable 7: PORT
```
Key: PORT
Value: 3000
```

---

## 🚀 Paso 5: Hacer el Deploy

### 5.1. Hacer clic en "Create Web Service"

Render comenzará a:
1. Descargar tu código de GitHub
2. Instalar dependencias (`npm install`)
3. Iniciar tu servidor (`npm start`)

**Esto puede tomar 2-5 minutos**

### 5.2. Monitorear el deploy

Verás los logs en tiempo real:
```
==> Cloning from https://github.com/...
==> Running 'npm install'
==> Running 'npm start'
✅ IA Service iniciado con Claude
✅ Sheet Service iniciado
✅ Report Service iniciado
🚀 Servidor WhatsApp IA Sheets
   📡 Puerto: 3000
```

### 5.3. Obtener la URL

Una vez que el deploy esté completo, verás:
```
Your service is live 🎉
https://whatsapp-ia-sheets.onrender.com
```

**¡Copia esta URL! La necesitarás para el siguiente paso.**

---

## 📱 Paso 6: Configurar Webhook en Twilio

Ahora que tu servidor está en la nube, debes actualizar el webhook de Twilio:

### 6.1. Ir a la consola de Twilio
https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn

### 6.2. Scroll hasta "Sandbox Configuration"

### 6.3. En "WHEN A MESSAGE COMES IN":
```
URL: https://whatsapp-ia-sheets.onrender.com/webhook/whatsapp
```
**Reemplaza con TU URL de Render**

### 6.4. Seleccionar método: **POST**

### 6.5. Hacer clic en "Save Configuration"

---

## ✅ Paso 7: Probar el Sistema

### 7.1. Enviar mensaje de prueba

Desde WhatsApp, envía:
```
Persona Test User
Proyecto Prueba Deploy
Trabajo 2 horas
Tarea Prueba en Render
```

### 7.2. Verificar respuesta

Deberías recibir:
```
✅ Registro guardado correctamente

📋 Tipo: registro_horas
🗂️ Proyecto: Prueba Deploy
⏱️ Horas: 2
✏️ Tarea: Prueba en Render

🕐 Registrado: 14/1/2026 ...
```

### 7.3. Verificar Google Sheets

Abre tu hoja de Google Sheets:
https://docs.google.com/spreadsheets/d/TU_GOOGLE_SHEET_ID

Deberías ver el nuevo registro agregado.

---

## 📊 Monitorear tu Aplicación

### Ver logs en tiempo real:
1. Ve a tu dashboard de Render
2. Haz clic en tu servicio "whatsapp-ia-sheets"
3. Haz clic en la pestaña "Logs"

Verás todos los mensajes que llegan:
```
📱 Nuevo mensaje recibido de WhatsApp
👤 De: Ber (whatsapp:+5491133990658)
💬 Mensaje: Persona Test User...
🤖 Procesando con IA...
✅ Fila agregada correctamente
✅ Proceso completado exitosamente
```

---

## 🔄 Actualizar tu Aplicación

Cuando hagas cambios en el código:

### 1. Hacer commit en Git
```bash
git add .
git commit -m "Descripción de los cambios"
git push origin main
```

### 2. Render detectará los cambios automáticamente
- Hará deploy automático
- En 2-3 minutos tu código estará actualizado

---

## ⚠️ Importante: Plan Gratuito de Render

### Limitaciones:
- **750 horas/mes** de tiempo activo (suficiente para uso normal)
- El servidor **se apaga después de 15 minutos de inactividad**
- Al recibir una petición, **tarda 30-60 segundos en despertar**

### ¿Qué significa esto?
- Si no usas WhatsApp por 15+ minutos, el servidor se apaga
- El primer mensaje después de ese tiempo tardará ~60 segundos
- Los mensajes siguientes serán instantáneos

### Cómo evitar que se apague:
Puedes usar un servicio de "ping" gratuito que haga peticiones cada 10 minutos:
- UptimeRobot (https://uptimerobot.com)
- Cron-job.org (https://cron-job.org)

**Configurar ping:**
1. Crear cuenta en UptimeRobot
2. Agregar monitor HTTP(S)
3. URL: `https://whatsapp-ia-sheets.onrender.com`
4. Intervalo: 10 minutos

---

## 🔧 Solución de Problemas

### Error: "Your service failed to respond"
**Solución:** Verificar que todas las variables de entorno estén configuradas correctamente.

### Error: "Google Sheets API error"
**Solución:**
1. Verificar que `GOOGLE_CREDENTIALS` tenga el JSON completo
2. Verificar que el Service Account tenga permisos en la hoja

### Error: "Anthropic API error"
**Solución:** Verificar que `ANTHROPIC_API_KEY` esté correcta y tenga créditos.

### Error: "Twilio Authentication failed"
**Solución:** Verificar `TWILIO_AUTH_TOKEN` en las variables de entorno.

### Ver logs detallados:
En Render Dashboard → Tu servicio → Logs

---

## 💰 Costos Estimados

### Render (Gratis)
- **$0 USD/mes** con plan Free
- 750 horas/mes incluidas

### Claude AI (Anthropic)
- **~$0.001 USD por mensaje**
- $5 USD gratis al registrarte
- Suficiente para ~5,000 mensajes

### Twilio WhatsApp
- **Gratis en Sandbox** (solo para pruebas)
- Producción: ~$0.005 USD por mensaje

### Google Sheets
- **Gratis** (60 requests/minuto)

**Costo total mensual estimado: $0 USD** (con uso moderado)

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Render Dashboard
2. Verifica las variables de entorno
3. Prueba localmente primero (`npm start`)
4. Revisa la documentación de Render: https://render.com/docs

---

## 🎉 ¡Listo!

Tu sistema ahora está funcionando 24/7 en la nube sin necesidad de tener tu PC encendida.

**URL de tu aplicación:** https://whatsapp-ia-sheets.onrender.com

**Webhook de Twilio:** https://whatsapp-ia-sheets.onrender.com/webhook/whatsapp

**Google Sheets:** https://docs.google.com/spreadsheets/d/TU_GOOGLE_SHEET_ID

---

**¡Disfruta de tu sistema automatizado! 🚀**
