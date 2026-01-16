# 📱 Configurar Webhook en Twilio - Guía Paso a Paso

## ⚠️ Problema

Recibes un mensaje de WhatsApp que dice: "Configura URL sandbox" o similar.

Esto significa que el webhook **NO está configurado** o está mal configurado.

---

## ✅ Solución - Configurar Correctamente

### Paso 1: Obtén tu URL de ngrok

En la ventana donde corre ngrok, busca esta línea:

```
Forwarding    https://abc-1234-xyz.ngrok-free.app -> http://localhost:3000
```

**Copia la URL completa** (ejemplo: `https://abc-1234-xyz.ngrok-free.app`)

---

### Paso 2: Ve a la Configuración del Sandbox

**Abre este link:**
```
https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
```

O manualmente:
1. Ve a: https://console.twilio.com/
2. En el menú lateral: **Messaging** → **Try it out** → **Send a WhatsApp message**

---

### Paso 3: Encuentra la Sección Correcta

**Baja en la página** hasta que veas:

```
┌─────────────────────────────────────┐
│ Sandbox Configuration               │
│                                     │
│ WHEN A MESSAGE COMES IN             │
│ ┌─────────────────────────────────┐ │
│ │ [URL aquí]                      │ │
│ └─────────────────────────────────┘ │
│ [POST ▼]                           │
└─────────────────────────────────────┘
```

---

### Paso 4: Configurar la URL

**En el campo "WHEN A MESSAGE COMES IN":**

1. **Borra** cualquier URL que esté ahí
2. **Pega** tu URL de ngrok + `/webhook/whatsapp`

**Formato correcto:**
```
https://TU-URL-NGROK.ngrok-free.app/webhook/whatsapp
```

**Ejemplo real:**
```
https://abc-1234-xyz.ngrok-free.app/webhook/whatsapp
```

⚠️ **MUY IMPORTANTE:**
- Debe empezar con `https://`
- Debe terminar con `/webhook/whatsapp`
- NO debe tener espacios
- NO debe tener saltos de línea

---

### Paso 5: Seleccionar Método

En el dropdown al lado de la URL:
- Selecciona **HTTP POST** (no GET)

---

### Paso 6: Guardar

**Baja hasta el final de la página** y haz clic en el botón:
```
[Save Configuration]
```

⚠️ **IMPORTANTE:** El botón está al FINAL de la página, puede que tengas que hacer scroll.

---

### Paso 7: Verificar

Deberías ver un mensaje:
```
✓ Configuration saved successfully
```

---

## 🧪 Probar de Nuevo

Ahora envía un mensaje por WhatsApp:

```
Trabajé 2 horas en el proyecto web desarrollando login
```

**Deberías recibir:**
```
✅ Registro guardado correctamente

📋 Tipo: registro_horas
🗂️ Proyecto: web
⏱️ Horas: 2
✏️ Tarea: desarrollando login

🕐 Registrado: 14/1/2026 10:00:00
```

---

## 🔍 Verificar Conexión

### Ver si llegan peticiones a ngrok:

Abre en tu navegador:
```
http://localhost:4040
```

Ahí verás en tiempo real:
- ✅ Si Twilio está enviando peticiones
- ✅ Las respuestas de tu servidor
- ❌ Cualquier error

---

## 🆘 Si Sigue sin Funcionar

### Verificación 1: ¿Tu servidor está corriendo?

Abre otra terminal y ejecuta:
```cmd
curl http://localhost:3000/
```

Deberías ver:
```json
{"status":"ok","message":"WhatsApp IA Sheets Server funcionando"...}
```

### Verificación 2: ¿ngrok está corriendo?

En la ventana de ngrok deberías ver:
```
Session Status    online
```

Si dice "offline" o está cerrada, reinicia:
```cmd
ngrok http 3000
```

### Verificación 3: ¿La URL está correcta?

La URL en Twilio debe ser **EXACTAMENTE**:
```
https://TU-URL-NGROK/webhook/whatsapp
```

---

## 📸 Captura de Pantalla (referencia)

Deberías ver algo así en Twilio:

```
┌────────────────────────────────────────────┐
│ Sandbox Configuration                      │
│                                            │
│ WHEN A MESSAGE COMES IN                    │
│ ┌────────────────────────────────────────┐ │
│ │ https://abc-1234.ngrok-free.app/       │ │
│ │ webhook/whatsapp                       │ │
│ └────────────────────────────────────────┘ │
│ [POST ▼]                                   │
│                                            │
│ [Save Configuration]                       │
└────────────────────────────────────────────┘
```

---

## ✅ Checklist

- [ ] ngrok está corriendo (`ngrok http 3000`)
- [ ] Servidor Node está corriendo (`node server.js`)
- [ ] Copiaste la URL completa de ngrok
- [ ] Agregaste `/webhook/whatsapp` al final
- [ ] Seleccionaste POST en el dropdown
- [ ] Hiciste clic en "Save Configuration"
- [ ] Viste el mensaje de confirmación

---

**Dame tu URL de ngrok y te ayudo a verificar que esté todo correcto.**
