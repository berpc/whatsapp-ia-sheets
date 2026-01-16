# 🚀 Quick Start - WhatsApp IA Sheets

Guía rápida para poner en marcha el proyecto en 5 minutos.

## ✅ Checklist de Configuración

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar Google Sheets

- [ ] Crear proyecto en [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Habilitar Google Sheets API
- [ ] Crear cuenta de servicio
- [ ] Descargar `credentials.json` → guardar en `credentials/`
- [ ] Crear Google Sheet con encabezados: `Fecha | Hora | Número | Mensaje Original | Tipo | Proyecto | Persona | Horas | Tarea`
- [ ] Compartir la hoja con el email de la cuenta de servicio
- [ ] Copiar el Sheet ID (de la URL)

### 3. Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example credentials/.env
```

Editar `credentials/.env` y completar:
- ✅ `GOOGLE_SHEET_ID` - ID de tu hoja
- ✅ `GOOGLE_CREDENTIALS_PATH` - Ya está configurado
- ⏳ `TWILIO_ACCOUNT_SID` - De Twilio Console
- ⏳ `TWILIO_AUTH_TOKEN` - De Twilio Console
- ⏳ `TWILIO_WHATSAPP_NUMBER` - Tu número de WhatsApp
- ⏳ `ANTHROPIC_API_KEY` - De Anthropic Console

### 4. Probar Google Sheets (Obligatorio)

```bash
npm run test:sheets
```

✅ Si ves "Conexión exitosa", continúa.
❌ Si hay error, revisa credenciales y permisos.

### 5. Obtener API Key de Claude (Opcional al inicio)

- Ve a [Anthropic Console](https://console.anthropic.com/)
- Crea una API key
- Agrégala a `credentials/.env`

**Nota:** El sistema funciona sin IA, pero no extraerá información estructurada.

### 6. Configurar Twilio WhatsApp (Opcional al inicio)

- Crea cuenta en [Twilio](https://www.twilio.com/)
- Obtén Account SID y Auth Token
- Para pruebas usa el Sandbox de WhatsApp

**Nota:** Puedes probar sin WhatsApp usando el endpoint de test.

## 🎯 Modos de Prueba

### Modo 1: Prueba sin WhatsApp ni IA (Más rápido)

```bash
# Iniciar servidor
npm run dev

# En otra terminal, probar con curl:
curl -X POST http://localhost:3000/test/mensaje \
  -H "Content-Type: application/json" \
  -d "{\"mensaje\": \"Trabajé 3 horas en el proyecto web\"}"
```

### Modo 2: Prueba con IA pero sin WhatsApp

Configura `ANTHROPIC_API_KEY` y luego:

```bash
npm run dev

# Probar
curl -X POST http://localhost:3000/test/mensaje \
  -H "Content-Type: application/json" \
  -d "{\"mensaje\": \"Trabajé 3 horas en el proyecto web haciendo login\"}"
```

### Modo 3: Sistema completo con WhatsApp

1. Configura todas las variables de entorno
2. Instala [ngrok](https://ngrok.com/):

```bash
ngrok http 3000
```

3. Copia la URL HTTPS (ej: `https://abc123.ngrok.io`)
4. En Twilio Console → WhatsApp Sandbox Settings:
   - Webhook URL: `https://abc123.ngrok.io/webhook/whatsapp`
   - Método: POST
5. Envía "join [código]" al sandbox de Twilio
6. Envía un mensaje de prueba

## 🐛 Solución Rápida de Problemas

| Problema | Solución |
|----------|----------|
| Error de Google Sheets | Verifica que compartiste la hoja con el email de la cuenta de servicio |
| IA no configurada | Normal al inicio, el sistema funciona sin IA |
| Port 3000 en uso | Cambia `PORT` en `.env` |
| Twilio 401 | Verifica Account SID y Auth Token |

## 📝 Comandos Útiles

```bash
npm run dev          # Modo desarrollo con auto-reload
npm start            # Modo producción
npm run test:sheets  # Probar Google Sheets
npm run test:ia      # Probar servicio de IA
```

## 📚 Siguiente Paso

Lee el [README.md](README.md) completo para más detalles sobre arquitectura, configuración y troubleshooting.

---

**Tiempo estimado de configuración básica:** 5-10 minutos
**Tiempo para sistema completo con WhatsApp:** 20-30 minutos
