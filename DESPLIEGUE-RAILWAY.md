# 🚀 Desplegar en Railway - Guía Paso a Paso

## 📋 Preparación (5 minutos)

### 1. Crear cuenta en Railway

1. Ve a: https://railway.app/
2. Haz clic en **"Start a New Project"** o **"Login"**
3. **Inicia sesión con GitHub** (recomendado) o email

---

## 🎯 Paso 1: Inicializar Git (SI AÚN NO LO HICISTE)

Abre una terminal en tu proyecto y ejecuta:

```bash
git init
git add .
git commit -m "Initial commit - WhatsApp IA Sheets"
```

---

## 🚂 Paso 2: Desplegar en Railway

### Opción A: Desde la Terminal (Más Rápido)

1. **Instala Railway CLI:**

```bash
npm install -g @railway/cli
```

2. **Inicia sesión:**

```bash
railway login
```

3. **Crea un nuevo proyecto:**

```bash
railway init
```

4. **Despliega:**

```bash
railway up
```

### Opción B: Desde GitHub (Recomendado)

1. **Sube tu código a GitHub:**
   - Crea un repositorio nuevo en GitHub
   - Sigue las instrucciones para subir tu código

2. **En Railway:**
   - Haz clic en **"New Project"**
   - Selecciona **"Deploy from GitHub repo"**
   - Autoriza Railway a acceder a GitHub
   - Selecciona tu repositorio

3. **Railway detectará automáticamente** que es un proyecto Node.js y lo desplegará

---

## ⚙️ Paso 3: Configurar Variables de Entorno

Una vez desplegado, necesitas configurar las variables de entorno:

### En Railway Dashboard:

1. Haz clic en tu proyecto
2. Ve a la pestaña **"Variables"**
3. Agrega las siguientes variables:

```
PORT=3000
GOOGLE_SHEET_ID=TU_GOOGLE_SHEET_ID
TWILIO_ACCOUNT_SID=TU_TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=HXb5b62575e6e4ff6129ad7c8efe1f983e
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
ANTHROPIC_API_KEY=TU_ANTHROPIC_API_KEY
```

### ⚠️ IMPORTANTE: Credenciales de Google

Para `credentials.json`, tienes 2 opciones:

#### Opción 1: Como Variable de Entorno (Recomendado)

1. Abre tu archivo `credentials/credentials.json`
2. Copia TODO el contenido (es un JSON)
3. En Railway, crea una variable llamada: `GOOGLE_CREDENTIALS`
4. Pega el JSON completo como valor

#### Opción 2: Codificado en Base64

```bash
# En tu terminal local:
cat credentials/credentials.json | base64
```

Copia el resultado y créalo como variable `GOOGLE_CREDENTIALS_BASE64` en Railway.

---

## 🔧 Paso 4: Ajustar el Código (SI USAS OPCIÓN 1)

Necesitas modificar `sheetsService.js` para leer desde variable de entorno.

**YA LO HARÉ POR TI** - Solo despliega y yo actualizo el código.

---

## 🌍 Paso 5: Obtener tu URL Pública

1. En Railway, ve a tu proyecto
2. Ve a **"Settings"**
3. Busca **"Domains"** o **"Public Networking"**
4. Haz clic en **"Generate Domain"**
5. Railway te dará una URL como: `https://tu-proyecto.up.railway.app`

---

## 📱 Paso 6: Configurar Twilio

1. Ve a: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn

2. En **"Sandbox Configuration"**, **"WHEN A MESSAGE COMES IN":**
   - **URL:** `https://tu-proyecto.up.railway.app/webhook/whatsapp`
   - **Método:** `POST`

3. Haz clic en **"Save"**

---

## ✅ Paso 7: Probar

Envía un mensaje por WhatsApp:

```
Trabajé 3 horas en el proyecto API desarrollando endpoints
```

Deberías recibir confirmación y el dato se guardará en Google Sheets.

---

## 🐛 Troubleshooting

### Ver Logs en Railway

1. En tu proyecto, ve a **"Deployments"**
2. Haz clic en el último deployment
3. Ve a **"View Logs"**

### El servidor no inicia

- Verifica que todas las variables de entorno estén configuradas
- Verifica los logs para ver el error específico

### Error con Google Sheets

- Asegúrate de que `GOOGLE_CREDENTIALS` tiene el JSON completo
- Verifica que compartiste la hoja con el email de la cuenta de servicio

---

## 💡 Ventajas de Railway

✅ URL permanente (no se cierra como ngrok)
✅ HTTPS automático
✅ Deploys automáticos al hacer push a GitHub
✅ Logs en tiempo real
✅ Gratis para proyectos pequeños ($5/mes de crédito gratis)

---

## 📊 Tu Sistema en Producción

Una vez desplegado:

- **Servidor:** `https://tu-proyecto.up.railway.app`
- **Webhook:** `https://tu-proyecto.up.railway.app/webhook/whatsapp`
- **Health Check:** `https://tu-proyecto.up.railway.app/`

---

**¿Necesitas ayuda? Dime en qué paso estás y te ayudo.**
