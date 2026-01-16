# 📱 WhatsApp IA Sheets

Integración de **WhatsApp**, **Inteligencia Artificial (Claude)** y **Google Sheets** para automatizar el registro de mensajes, horas de trabajo, tareas y proyectos.

## 🚀 Características

- ✅ Recibe mensajes de WhatsApp vía Twilio
- 🤖 Procesa mensajes con IA Claude para extraer información estructurada
- 📊 Guarda automáticamente los datos en Google Sheets
- 📲 Responde al usuario confirmando el registro
- 🧪 Endpoints de prueba sin necesidad de WhatsApp

## 📋 Requisitos Previos

- **Node.js** v14 o superior
- Cuenta de **Google Cloud** con Google Sheets API habilitada
- Cuenta de **Twilio** con número de WhatsApp
- API Key de **Anthropic** (Claude)

## 🛠️ Instalación

### 1. Clonar o descargar el proyecto

```bash
cd whatsapp-ia-sheets
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Google Sheets

#### a) Crear proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto
3. Habilita **Google Sheets API**
4. Ve a **Credenciales** > **Crear credenciales** > **Cuenta de servicio**
5. Descarga el archivo JSON de credenciales
6. Guárdalo como `credentials/credentials.json`

#### b) Crear Google Sheet

1. Crea una nueva hoja en [Google Sheets](https://sheets.google.com/)
2. Agrega los siguientes encabezados en la primera fila:

```
Fecha | Hora | Número | Mensaje Original | Tipo | Proyecto | Persona | Horas | Tarea
```

3. Comparte la hoja con el email de la cuenta de servicio (está en `credentials.json`)
4. Copia el ID de la hoja (está en la URL entre `/d/` y `/edit`)

### 4. Configurar Twilio

1. Crea una cuenta en [Twilio](https://www.twilio.com/)
2. Obtén un número de WhatsApp (Sandbox o número propio)
3. Anota tu **Account SID** y **Auth Token**

### 5. Obtener API Key de Claude

1. Ve a [Anthropic Console](https://console.anthropic.com/)
2. Crea una cuenta o inicia sesión
3. Ve a **API Keys** y crea una nueva
4. Copia la API Key

### 6. Configurar variables de entorno

Edita el archivo `credentials/.env`:

```bash
# Google Sheets
GOOGLE_SHEET_ID=tu_sheet_id_aqui
GOOGLE_CREDENTIALS_PATH=./credentials/credentials.json

# Server
PORT=3000

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=tu_auth_token_aqui
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# IA - Claude
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx
```

## 🚦 Uso

### Modo Desarrollo (con auto-reload)

```bash
npm run dev
```

### Modo Producción

```bash
npm start
```

### Probar Google Sheets

```bash
npm run test:sheets
```

### Probar IA Service

```bash
npm run test:ia
```

## 🧪 Testing sin WhatsApp

Puedes probar el sistema sin configurar WhatsApp usando el endpoint de prueba:

```bash
POST http://localhost:3000/test/mensaje
Content-Type: application/json

{
  "mensaje": "Trabajé 3 horas en el proyecto web haciendo el diseño del login"
}
```

Con curl:

```bash
curl -X POST http://localhost:3000/test/mensaje \
  -H "Content-Type: application/json" \
  -d "{\"mensaje\": \"Trabajé 3 horas en el proyecto web haciendo el diseño del login\"}"
```

## 📱 Configurar Webhook de WhatsApp

### Desarrollo local (ngrok)

1. Instala [ngrok](https://ngrok.com/)

```bash
ngrok http 3000
```

2. Copia la URL HTTPS generada (ej: `https://abc123.ngrok.io`)

3. En Twilio Console, configura el webhook:
   - Ve a **Messaging** > **Settings** > **WhatsApp Sandbox Settings**
   - En **When a message comes in**, pega: `https://abc123.ngrok.io/webhook/whatsapp`
   - Método: **POST**
   - Guarda cambios

### Producción

Despliega el servidor en un servicio como:
- Heroku
- Railway
- Render
- DigitalOcean
- AWS/GCP/Azure

Y configura la URL pública en Twilio.

## 📊 Estructura de Datos

La IA extrae la siguiente información de los mensajes:

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| **tipo** | Tipo de mensaje | `registro_horas`, `tarea`, `reporte`, `consulta`, `otro` |
| **proyecto** | Nombre del proyecto | `"Web Empresa XYZ"` |
| **persona** | Persona mencionada | `"Juan Pérez"` |
| **horas** | Horas trabajadas | `"3"`, `"2.5"` |
| **tarea** | Descripción de la tarea | `"Diseño del módulo de login"` |

## 💬 Ejemplos de Mensajes

```
"Trabajé 3 horas en el proyecto web de la empresa XYZ haciendo el diseño del login"
```

Resultado:
- Tipo: `registro_horas`
- Proyecto: `Web Empresa XYZ`
- Horas: `3`
- Tarea: `Diseño del módulo de login`

---

```
"Tarea para mañana: revisar el código del módulo de pagos en el proyecto App Mobile"
```

Resultado:
- Tipo: `tarea`
- Proyecto: `App Mobile`
- Tarea: `Revisar el código del módulo de pagos`

## 🏗️ Arquitectura

```
WhatsApp Message
      ↓
  Twilio API
      ↓
server.js (Express)
      ↓
iaService.js (Claude AI) → Extrae información estructurada
      ↓
sheetsService.js → Guarda en Google Sheets
      ↓
server.js → Responde al usuario por WhatsApp
```

## 📁 Estructura del Proyecto

```
whatsapp-ia-sheets/
├── credentials/
│   ├── .env                    # Variables de entorno
│   └── credentials.json        # Credenciales de Google Cloud
├── node_modules/
├── iaService.js               # Servicio de IA con Claude
├── server.js                  # Servidor Express principal
├── sheetsService.js           # Servicio de Google Sheets
├── test-sheets.js            # Test de conexión a Sheets
├── package.json
├── package-lock.json
└── README.md
```

## 🔒 Seguridad

- ✅ Nunca subas el archivo `credentials/.env` a Git
- ✅ Nunca subas `credentials/credentials.json` a Git
- ✅ Usa `.gitignore` para excluir archivos sensibles
- ✅ Valida las peticiones de Twilio en producción
- ✅ Usa HTTPS en producción

## 🐛 Troubleshooting

### Error: "GOOGLE_SHEET_ID no configurado"

Asegúrate de configurar el ID en `credentials/.env` y que coincida con tu hoja de Google Sheets.

### Error: "API key de Anthropic no configurada"

Verifica que `ANTHROPIC_API_KEY` esté configurada en `credentials/.env` y sea válida.

### Error: "Twilio authentication failed"

Verifica que `TWILIO_ACCOUNT_SID` y `TWILIO_AUTH_TOKEN` sean correctos.

### Los mensajes no llegan al webhook

1. Verifica que ngrok esté corriendo
2. Verifica que la URL en Twilio sea correcta
3. Revisa los logs del servidor

### La IA no extrae bien los datos

Puedes ajustar el prompt en [iaService.js:32](iaService.js#L32) para mejorar la extracción.

## 📝 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia el servidor en modo producción |
| `npm run dev` | Inicia el servidor con nodemon (auto-reload) |
| `npm run test:sheets` | Prueba la conexión con Google Sheets |
| `npm run test:ia` | Prueba el servicio de IA con mensajes de ejemplo |

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

ISC

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la sección de Troubleshooting
2. Verifica los logs del servidor
3. Prueba los endpoints de test primero
4. Verifica que todas las APIs estén configuradas correctamente

## 🎯 Roadmap

- [ ] Agregar autenticación para endpoints
- [ ] Implementar validación de webhooks de Twilio
- [ ] Agregar soporte para múltiples hojas de Google Sheets
- [ ] Implementar comandos especiales por WhatsApp
- [ ] Agregar dashboard web para visualizar datos
- [ ] Soporte para adjuntos e imágenes
- [ ] Exportar reportes automáticos

---

Hecho con ❤️ usando Node.js, Express, Twilio, Claude AI y Google Sheets
