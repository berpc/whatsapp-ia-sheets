# 🚀 Usar ngrok - Guía Rápida (5 minutos)

## ✅ Ya tienes:
- Cuenta de ngrok
- Authtoken: `38EQmbL4vu8twrXeEipsaQcJpPp_3KCWQywVUQaGrwvsiaB1R`
- Servidor funcionando en puerto 3000

---

## 📥 Paso 1: Descargar ngrok (1 minuto)

1. **Ve a:** https://ngrok.com/download
2. **Descarga** el archivo ZIP para Windows
3. **Descomprime** en una carpeta (ejemplo: `C:\ngrok\` o en tu carpeta de proyecto)

---

## ⚙️ Paso 2: Configurar authtoken (30 segundos)

**Abre CMD o PowerShell** en la carpeta donde descomprimiste `ngrok.exe`

### Opción A: Desde CMD
```cmd
cd C:\ruta\donde\esta\ngrok
ngrok config add-authtoken 38EQmbL4vu8twrXeEipsaQcJpPp_3KCWQywVUQaGrwvsiaB1R
```

### Opción B: Desde PowerShell
```powershell
cd C:\ruta\donde\esta\ngrok
.\ngrok.exe config add-authtoken 38EQmbL4vu8twrXeEipsaQcJpPp_3KCWQywVUQaGrwvsiaB1R
```

**Verás:**
```
Authtoken saved to configuration file: C:\Users\TuUsuario\.ngrok2\ngrok.yml
```

---

## 🌐 Paso 3: Iniciar túnel (10 segundos)

**En la misma terminal:**

### CMD:
```cmd
ngrok http 3000
```

### PowerShell:
```powershell
.\ngrok.exe http 3000
```

**Verás una pantalla como esta:**
```
ngrok

Session Status                online
Account                       tu-email@example.com
Version                       3.x.x
Region                        United States (us)
Latency                       50ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://1a2b-3c4d-5e6f.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

### 🎯 COPIA LA URL DE "Forwarding"
Ejemplo: `https://1a2b-3c4d-5e6f.ngrok-free.app`

---

## 📱 Paso 4: Configurar Twilio (2 minutos)

1. **Ve a:** https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn

2. **Baja hasta "Sandbox Configuration"**

3. **En "WHEN A MESSAGE COMES IN":**
   - **URL:** `https://TU-URL-NGROK.ngrok-free.app/webhook/whatsapp`
   - **Método:** `POST`
   - Ejemplo: `https://1a2b-3c4d-5e6f.ngrok-free.app/webhook/whatsapp`

4. **Haz clic en "Save"**

---

## ✅ Paso 5: Probar (30 segundos)

Desde tu WhatsApp (ya conectado al sandbox), envía:

```
Trabajé 3 horas en el proyecto API desarrollando endpoints REST
```

**Deberías recibir:**
```
✅ Registro guardado correctamente

📋 Tipo: registro_horas
🗂️ Proyecto: API
⏱️ Horas: 3
✏️ Tarea: desarrollando endpoints REST

🕐 Registrado: 14/1/2026 09:30:00
```

---

## 🧪 Comandos disponibles:

### Ver reporte:
```
reporte
```

### Ver ayuda:
```
ayuda
```

---

## 🎯 Panel Web de ngrok

Mientras ngrok está corriendo, puedes ver las peticiones en:
```
http://localhost:4040
```

Ahí verás:
- Todas las peticiones HTTP
- Respuestas del servidor
- Útil para debugging

---

## ⚠️ Importante

### ✅ Mantén estas ventanas abiertas:
1. **Terminal con ngrok** corriendo
2. **Terminal con tu servidor Node.js** (puerto 3000)

### 🔄 Si reinicias ngrok:
- Te dará una **URL diferente**
- Tendrás que **actualizar en Twilio**

### 💡 Tip:
Si pagas ngrok ($8/mes), puedes tener:
- **Dominios fijos** (la URL no cambia)
- **Múltiples túneles** simultáneos
- **IP Whitelisting**

---

## 🆘 Troubleshooting

### Error: "command not found"
- Asegúrate de estar en la carpeta correcta donde está `ngrok.exe`
- En PowerShell usa: `.\ngrok.exe` (con el `.\` al inicio)

### Error: "authtoken not found"
- Ejecuta el comando de authtoken de nuevo
- Verifica que copiaste el token completo

### Error: "failed to start tunnel"
- Verifica que el puerto 3000 esté libre
- Asegúrate de que tu servidor Node esté corriendo

### Twilio no recibe mensajes:
- Verifica que la URL en Twilio termine en `/webhook/whatsapp`
- Verifica que el método sea `POST`
- Revisa los logs en http://localhost:4040

---

## 📊 Tu Sistema

| Componente | URL/Estado |
|------------|------------|
| **Servidor Local** | http://localhost:3000 |
| **Túnel ngrok** | https://TU-URL.ngrok-free.app |
| **Panel ngrok** | http://localhost:4040 |
| **Webhook Twilio** | https://TU-URL.ngrok-free.app/webhook/whatsapp |
| **Google Sheet** | https://docs.google.com/spreadsheets/d/1snE3yaZPRT98DhdskDdFLyawQdeEUo5ZgRCm4TCMA2w |

---

¡Listo! En 5 minutos deberías tener todo funcionando. 🚀
