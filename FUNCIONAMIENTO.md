# 📱 Funcionamiento del Sistema WhatsApp-IA-Sheets

Sistema completo para registrar actividades laborales mediante WhatsApp, procesarlas con Inteligencia Artificial y guardarlas automáticamente en Google Sheets.

---

## 🔄 Flujo Completo del Sistema

### 1️⃣ **Envías un mensaje por WhatsApp**

Ejemplo:
```
Persona Mario Lopez
Proyecto casa nueva
Trabajo 7 horas
Tarea terminación interior
```

---

### 2️⃣ **Twilio recibe tu mensaje**

- Tu mensaje llega al número de WhatsApp de Twilio: `+14155238886`
- Twilio procesa el mensaje y lo convierte en datos estructurados
- Prepara una petición HTTP POST con la información
- Envía los datos al webhook configurado

**Datos que envía Twilio:**
```javascript
{
  From: 'whatsapp:+5491133990658',
  Body: 'Persona Mario Lopez\nProyecto casa nueva...',
  ProfileName: 'Ber',
  MessageSid: 'SM9d7fd5b...',
  // ... más metadatos
}
```

---

### 3️⃣ **ngrok expone tu servidor local a internet**

**¿Qué es ngrok?**
- Es un túnel que conecta tu computadora (localhost:3000) con internet
- Le da una URL pública temporal: `https://undeprived-prelegislative-carlyn.ngrok-free.dev`
- Twilio puede enviar datos a esta URL pública que apunta a tu PC

**Sin ngrok:**
```
Twilio → ❌ No puede llegar a tu PC (localhost:3000)
         Internet no puede acceder a localhost
```

**Con ngrok:**
```
Twilio → ngrok (URL pública) → Tu PC (localhost:3000) ✅
         https://xyz.ngrok-free.dev/webhook/whatsapp
```

**Comando para iniciar ngrok:**
```bash
./ngrok.exe http 3000
```

---

### 4️⃣ **Tu servidor Node.js recibe la petición**

**Archivo:** `server.js`

El servidor escucha en el puerto 3000 en la ruta `/webhook/whatsapp`:

```javascript
app.post('/webhook/whatsapp', async (req, res) => {
  // 1. Extrae los datos del mensaje de Twilio
  const { From, Body, ProfileName } = req.body;

  // From: whatsapp:+5491133990658
  // Body: "Persona Mario Lopez\nProyecto casa nueva..."
  // ProfileName: "Ber"

  console.log('📱 Nuevo mensaje recibido de WhatsApp');
  console.log(`👤 De: ${ProfileName} (${From})`);
  console.log(`💬 Mensaje: ${Body}`);
```

---

### 5️⃣ **Detecta si es un comando o un registro**

El servidor analiza el contenido del mensaje para decidir qué hacer:

#### **A) Comando "reporte"**
```javascript
if (mensajeLower === 'reporte' ||
    mensajeLower.includes('dame un reporte') ||
    mensajeLower.includes('generar reporte')) {

  // Genera un reporte desde Google Sheets
  console.log('📊 Generando reporte...');
  const reporte = await reportService.generarReporte();
  respuesta = reportService.formatearReporte(reporte);
}
```

#### **B) Comando "ayuda"**
```javascript
else if (mensajeLower === 'ayuda' ||
         mensajeLower === 'help' ||
         mensajeLower === '?') {

  // Muestra comandos disponibles
  respuesta = '📱 *COMANDOS DISPONIBLES*\n\n';
  respuesta += '📊 *reporte* - Genera un reporte de tus actividades\n';
  respuesta += '💬 Para registrar actividades...\n';
}
```

#### **C) Mensaje normal (registro de actividad)**
```javascript
else {
  // Procesa con IA
  console.log('🤖 Procesando con IA...');
  const datosExtraidos = await iaService.procesarMensaje(mensajeOriginal);

  // Guarda en Google Sheets
  await sheetsService.agregarFila(datosFila);
}
```

---

### 6️⃣ **La IA (Claude) analiza tu mensaje**

**Archivo:** `iaService.js`

La IA recibe tu mensaje y extrae información estructurada usando el modelo Claude 3.5 Haiku de Anthropic.

#### **Proceso de análisis:**

```javascript
procesarMensaje(mensaje) {
  // 1. Crea un prompt para Claude
  const prompt = `
Eres un asistente que analiza mensajes sobre trabajo y actividades laborales.

Extrae la siguiente información del mensaje en formato JSON:
{
  "tipo": "registro_horas | tarea | mensaje | reporte",
  "proyecto": "nombre del proyecto o obra",
  "persona": "nombre de la persona que trabajó",
  "horas": "número de horas trabajadas",
  "tarea": "descripción breve de la tarea realizada"
}

Mensaje a analizar: "${mensaje}"
  `;

  // 2. Envía a Claude AI (Anthropic API)
  const response = await this.anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  // 3. Parsea la respuesta JSON
  const datosExtraidos = JSON.parse(response.content[0].text);

  return datosExtraidos;
}
```

#### **Ejemplo de extracción:**

**Tu mensaje:**
```
Persona Mario Lopez
Proyecto casa nueva
Trabajo 7 horas
Tarea terminación interior
```

**Respuesta de Claude:**
```json
{
  "tipo": "registro_horas",
  "proyecto": "casa nueva",
  "persona": "Mario Lopez",
  "horas": "7",
  "tarea": "terminación interior"
}
```

**Ventaja de usar IA:**
- No necesitas escribir en un formato exacto
- La IA entiende lenguaje natural
- Funciona con diferentes formas de escribir:
  - "Trabajé 7 horas en casa nueva haciendo terminación"
  - "Mario Lopez - 7h - casa nueva - terminación interior"
  - "7 horas de terminación en la casa nueva, Mario Lopez"

#### **Fallback sin IA:**

Si no tienes configurada la API de Claude, el sistema usa expresiones regulares:

```javascript
extraerDatosConRegex(mensaje) {
  const datos = {
    tipo: 'mensaje',
    proyecto: '',
    persona: '',
    horas: '',
    tarea: mensaje.substring(0, 100)
  };

  // Extrae horas: "5 horas", "trabajé 3h", etc.
  const horasMatch = mensaje.match(/(\d+)\s*(horas?|h)/i);
  if (horasMatch) {
    datos.horas = horasMatch[1];
    datos.tipo = 'registro_horas';
  }

  // Extrae proyecto: "proyecto casa nueva"
  const proyectoMatch = mensaje.match(/proyecto[\s:]+([^\n]+)/i);
  if (proyectoMatch) {
    datos.proyecto = proyectoMatch[1].trim();
  }

  // Extrae persona: "persona Mario Lopez"
  const personaMatch = mensaje.match(/persona[\s:]+([^\n]+)/i);
  if (personaMatch) {
    datos.persona = personaMatch[1].trim();
  }

  return datos;
}
```

---

### 7️⃣ **Prepara los datos para Google Sheets**

El servidor organiza toda la información en un objeto estructurado:

```javascript
// Obtener fecha y hora actual
const ahora = new Date();
const fecha = ahora.toLocaleDateString('es-ES');  // "14/1/2026"
const hora = ahora.toLocaleTimeString('es-ES');   // "19:15:30"

// Crear objeto con todos los datos
const datosFila = {
  fecha: fecha,                      // "14/1/2026"
  hora: hora,                        // "19:15:30"
  numero: numeroWhatsApp,            // "whatsapp:+5491133990658"
  mensajeOriginal: mensajeOriginal,  // Mensaje completo que enviaste
  tipo: datosExtraidos.tipo || '',   // "registro_horas" (de la IA)
  proyecto: datosExtraidos.proyecto || '',  // "casa nueva" (de la IA)
  persona: datosExtraidos.persona || nombreUsuario,  // "Mario Lopez" (de la IA)
  horas: datosExtraidos.horas || '', // "7" (de la IA)
  tarea: datosExtraidos.tarea || ''  // "terminación interior" (de la IA)
};
```

**Resultado:**
```javascript
{
  fecha: "14/1/2026",
  hora: "19:15:30",
  numero: "whatsapp:+5491133990658",
  mensajeOriginal: "Persona Mario Lopez\nProyecto casa nueva\nTrabajo 7 horas\nTarea terminación interior",
  tipo: "registro_horas",
  proyecto: "casa nueva",
  persona: "Mario Lopez",
  horas: "7",
  tarea: "terminación interior"
}
```

---

### 8️⃣ **Guarda en Google Sheets**

**Archivo:** `sheetsService.js`

#### **Autenticación con Google:**

```javascript
// Opción 1: Archivo de credenciales (desarrollo local)
const auth = new google.auth.GoogleAuth({
  keyFile: './credentials/credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Opción 2: Variable de entorno (producción)
const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
const auth = new google.auth.GoogleAuth({
  credentials: credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
```

#### **Agregar fila a la hoja:**

```javascript
async agregarFila(datos) {
  // 1. Convierte el objeto en un array de valores
  const values = [[
    datos.fecha,           // Columna A
    datos.hora,            // Columna B
    datos.numero,          // Columna C
    datos.mensajeOriginal, // Columna D
    datos.tipo || '',      // Columna E
    datos.proyecto || '',  // Columna F
    datos.persona || '',   // Columna G
    datos.horas || '',     // Columna H
    datos.tarea || ''      // Columna I
  ]];

  // 2. Usa la API de Google Sheets para agregar la fila
  const result = await this.sheets.spreadsheets.values.append({
    spreadsheetId: this.spreadsheetId,  // ID de tu hoja
    range: 'A:I',                        // Columnas A hasta I
    valueInputOption: 'USER_ENTERED',    // Interpreta fórmulas y formatos
    resource: { values }                 // Los datos a insertar
  });

  console.log('✅ Fila agregada correctamente');
  return result;
}
```

#### **Resultado en Google Sheets:**

| Fecha | Hora | Número | Mensaje Original | Tipo | Proyecto | Persona | Horas | Tarea |
|-------|------|--------|------------------|------|----------|---------|-------|-------|
| 14/1/2026 | 19:15:30 | whatsapp:+549... | Persona Mario... | registro_horas | casa nueva | Mario Lopez | 7 | terminación interior |

**Características:**
- La primera fila tiene encabezados formateados (azul, negrita, congelada)
- Cada mensaje se agrega como una nueva fila automáticamente
- Los datos se guardan en tiempo real (menos de 3 segundos)

---

### 9️⃣ **Genera la respuesta para WhatsApp**

El servidor prepara un mensaje de confirmación personalizado:

```javascript
// Construye la respuesta
respuesta = '✅ Registro guardado correctamente\n\n';

if (datosExtraidos.tipo) {
  respuesta += `📋 Tipo: ${datosExtraidos.tipo}\n`;
}
if (datosExtraidos.proyecto) {
  respuesta += `🗂️ Proyecto: ${datosExtraidos.proyecto}\n`;
}
if (datosExtraidos.horas) {
  respuesta += `⏱️ Horas: ${datosExtraidos.horas}\n`;
}
if (datosExtraidos.tarea) {
  respuesta += `✏️ Tarea: ${datosExtraidos.tarea}\n`;
}

respuesta += `\n🕐 Registrado: ${fecha} ${hora}`;
```

**Ejemplo de respuesta:**
```
✅ Registro guardado correctamente

📋 Tipo: registro_horas
🗂️ Proyecto: casa nueva
⏱️ Horas: 7
✏️ Tarea: terminación interior

🕐 Registrado: 14/1/2026 19:15:30
```

---

### 🔟 **Envía la confirmación por WhatsApp**

Usa la API de Twilio para enviar la respuesta de vuelta:

```javascript
await twilioClient.messages.create({
  body: respuesta,                           // El mensaje de confirmación
  from: 'whatsapp:+14155238886',            // Número de Twilio
  to: numeroWhatsApp                         // Tu número de WhatsApp
});

console.log('✅ Proceso completado exitosamente');
res.status(200).send();  // Confirma a Twilio que recibimos el mensaje
```

**Recibes en WhatsApp (2-3 segundos después):**
```
✅ Registro guardado correctamente

📋 Tipo: registro_horas
🗂️ Proyecto: casa nueva
⏱️ Horas: 7
✏️ Tarea: terminación interior

🕐 Registrado: 14/1/2026 19:15:30
```

---

## 📊 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                         TU CELULAR                              │
│                  WhatsApp: +5491133990658                       │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        │ Envías: "Persona Mario Lopez
                        │          Proyecto casa nueva
                        │          Trabajo 7 horas..."
                        ▼
┌───────────────────────────────────────────────────────────────┐
│                      TWILIO WhatsApp                           │
│                   Número: +14155238886                         │
│  • Recibe mensaje de WhatsApp                                 │
│  • Convierte a HTTP POST                                      │
│  • Envía a webhook configurado                                │
└───────────────────────┬───────────────────────────────────────┘
                        │
                        │ POST https://xyz.ngrok-free.dev/webhook/whatsapp
                        │ Body: { From, Body, ProfileName, ... }
                        ▼
┌───────────────────────────────────────────────────────────────┐
│                        NGROK TUNNEL                            │
│        URL: https://undeprived-prelegislative...              │
│  • Túnel público → localhost:3000                             │
│  • Permite que Twilio llegue a tu PC                          │
│  • Panel web: http://localhost:4040                           │
└───────────────────────┬───────────────────────────────────────┘
                        │
                        │ Redirige a localhost:3000/webhook/whatsapp
                        ▼
┌───────────────────────────────────────────────────────────────┐
│                   SERVER.JS (Node.js)                          │
│                   Puerto: 3000                                 │
│                                                                │
│  1. Recibe petición POST                                      │
│  2. Extrae: From, Body, ProfileName                           │
│  3. Detecta tipo: comando o registro                          │
│  4. Coordina servicios                                        │
│  5. Envía respuesta a Twilio                                  │
└─────────┬───────────────────┬─────────────┬───────────────────┘
          │                   │             │
          │                   │             │
          ▼                   ▼             ▼
┌──────────────────┐  ┌─────────────┐  ┌────────────────┐
│  IASERVICE.JS    │  │ SHEETS      │  │ REPORT         │
│  (Claude AI)     │  │ SERVICE.JS  │  │ SERVICE.JS     │
│                  │  │             │  │                │
│ • Claude API     │  │ • Google    │  │ • Lee datos    │
│ • Modelo: Haiku  │  │   Sheets    │  │ • Calcula      │
│ • Extrae datos:  │  │   API       │  │   totales      │
│   - tipo         │  │ • Agrega    │  │ • Agrupa por   │
│   - proyecto     │  │   filas     │  │   proyecto     │
│   - persona      │  │ • Lee datos │  │ • Formatea     │
│   - horas        │  │             │  │   reporte      │
│   - tarea        │  │             │  │                │
└──────────────────┘  └──────┬──────┘  └────────────────┘
                             │
                             │ API calls
                             ▼
              ┌──────────────────────────────┐
              │     GOOGLE SHEETS API        │
              │  Spreadsheet ID: 1snE3...    │
              │                              │
              │  • Autenticación con         │
              │    Service Account           │
              │  • Operaciones:              │
              │    - values.append()         │
              │    - values.get()            │
              │    - batchUpdate()           │
              └──────────────┬───────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │    TU HOJA DE GOOGLE         │
              │    SHEETS                    │
              │                              │
              │  [Fecha][Hora][Número]...    │
              │  14/1/26 19:15 +549...       │
              │  14/1/26 19:20 +549...       │
              │  ...                         │
              └──────────────────────────────┘
```

---

## 🔑 Componentes Principales

### **1. server.js** - Cerebro del sistema
**Responsabilidades:**
- Recibe mensajes de WhatsApp vía webhook
- Decide qué hacer: ¿es un comando o un registro?
- Coordina todos los servicios (IA, Sheets, Reports)
- Envía respuestas de vuelta a WhatsApp
- Maneja errores y logging

**Endpoints:**
- `POST /webhook/whatsapp` - Webhook de Twilio
- `POST /test/mensaje` - Endpoint de prueba
- `GET /` - Health check

---

### **2. iaService.js** - Inteligencia Artificial
**Responsabilidades:**
- Se conecta a Claude AI (Anthropic API)
- Analiza mensajes en lenguaje natural
- Extrae información estructurada (tipo, proyecto, persona, horas, tarea)
- Tiene fallback con regex si falla la IA

**Modelo usado:**
- `claude-3-5-haiku-20241022` (rápido y económico)
- Max tokens: 1024
- Respuesta en formato JSON

**Ventajas:**
- Entiende lenguaje natural
- No requiere formato específico
- Aprende del contexto del mensaje

---

### **3. sheetsService.js** - Conexión a Google Sheets
**Responsabilidades:**
- Autenticación con Google (service account)
- Agrega filas a la hoja de cálculo
- Lee datos para reportes
- Maneja errores de conexión

**Autenticación:**
- Service Account (credentials.json)
- Scopes: spreadsheets (lectura/escritura)
- Soporta variables de entorno para producción

**Operaciones:**
- `agregarFila(datos)` - Agrega nueva fila
- Formato: A:I (9 columnas)
- valueInputOption: USER_ENTERED

---

### **4. reportService.js** - Generador de Reportes
**Responsabilidades:**
- Lee todos los datos de Google Sheets
- Calcula totales de horas trabajadas
- Agrupa registros por proyecto
- Muestra últimos 5 registros
- Formatea reporte para WhatsApp

**Formato del reporte:**
```
📊 REPORTE DE ACTIVIDADES

📈 Total de registros: 4
⏱️ Total de horas: 18.0

📁 Por proyecto:
  • casa nueva: 12.0 horas (2 registros)
  • casa maryinez: 8.0 horas (2 registros)

📝 Últimos 5 registros:
1. 14/1/2026 19:20 - Mario Lopez - casa nueva - 7h
   terminación interior
2. 14/1/2026 19:15 - Mario Lopez - casa nueva - 5h
   pintura
...
```

---

### **5. credentials/.env** - Configuración
**Variables necesarias:**
```env
# Google Sheets
GOOGLE_SHEET_ID=TU_GOOGLE_SHEET_ID
GOOGLE_CREDENTIALS_PATH=./credentials/credentials.json

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=TU_TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN=HXb5b62575e6e4ff6129ad7c8efe1f983e
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Claude AI (Anthropic)
ANTHROPIC_API_KEY=sk-ant-api03-...

# ngrok (opcional)
NGROK_AUTHTOKEN=38EQmbL4vu8twrXeEipsaQcJpPp_3KCWQywVUQaGrwvsiaB1R
```

**Seguridad:**
- Nunca compartir este archivo
- Está en .gitignore
- Usar variables de entorno en producción

---

## ⚡ Tipos de Mensajes que Detecta

La IA es inteligente y puede detectar diferentes tipos de registros:

### **1. Registro de horas trabajadas**
**Mensaje:**
```
Persona Juan Pérez
Proyecto casa Martinez
Trabajo 8 horas
Tarea albañilería
```

**Extracción:**
```json
{
  "tipo": "registro_horas",
  "proyecto": "casa Martinez",
  "persona": "Juan Pérez",
  "horas": "8",
  "tarea": "albañilería"
}
```

---

### **2. Tarea pendiente**
**Mensaje:**
```
Casa nueva pendiente Tarea pintura falta
```

**Extracción:**
```json
{
  "tipo": "tarea",
  "proyecto": "Casa nueva",
  "persona": "",
  "horas": "",
  "tarea": "Pendiente pintura, falta completar"
}
```

---

### **3. Solicitud de reporte**
**Mensaje:**
```
Reporte proyecto casa nueva
```

**Extracción:**
```json
{
  "tipo": "reporte",
  "proyecto": "casa nueva",
  "persona": "",
  "horas": "",
  "tarea": "Reporte de avance del proyecto"
}
```

**Nota:** Cuando detecta "reporte" en el mensaje, el servidor puede:
1. Generar reporte general (si solo dice "reporte")
2. Generar reporte filtrado (si dice "reporte proyecto casa nueva")

---

### **4. Mensaje general/nota**
**Mensaje:**
```
Revisar materiales mañana
```

**Extracción:**
```json
{
  "tipo": "mensaje",
  "proyecto": "",
  "persona": "",
  "horas": "",
  "tarea": "Revisar materiales mañana"
}
```

---

## 🎯 Flujo del Comando "Reporte"

Cuando envías "reporte" por WhatsApp:

### **1. Detección del comando**
```javascript
const mensajeLower = mensajeOriginal.toLowerCase().trim();

if (mensajeLower === 'reporte' ||
    mensajeLower.includes('dame un reporte') ||
    mensajeLower.includes('generar reporte')) {

  console.log('📊 Generando reporte...');
  // ...
}
```

### **2. Lectura de datos de Google Sheets**
```javascript
// Lee todas las filas (desde fila 2, saltando encabezados)
const response = await this.sheets.spreadsheets.values.get({
  spreadsheetId: this.spreadsheetId,
  range: 'A:I',
});

const rows = response.data.values || [];
const registros = rows.slice(1);  // Salta la primera fila (encabezados)
```

### **3. Procesamiento de datos**
```javascript
let totalRegistros = 0;
let totalHoras = 0;
const proyectos = {};

registros.forEach(row => {
  const [fecha, hora, numero, mensaje, tipo, proyecto, persona, horas, tarea] = row;

  // Contar registros
  totalRegistros++;

  // Sumar horas
  if (horas && !isNaN(parseFloat(horas))) {
    totalHoras += parseFloat(horas);
  }

  // Agrupar por proyecto
  if (proyecto) {
    if (!proyectos[proyecto]) {
      proyectos[proyecto] = { horas: 0, registros: 0 };
    }
    proyectos[proyecto].horas += parseFloat(horas) || 0;
    proyectos[proyecto].registros++;
  }
});
```

### **4. Formateo del reporte**
```javascript
let reporte = '📊 *REPORTE DE ACTIVIDADES*\n\n';
reporte += `📈 Total de registros: ${totalRegistros}\n`;
reporte += `⏱️ Total de horas: ${totalHoras.toFixed(1)}\n\n`;

reporte += '📁 *Por proyecto:*\n';
Object.keys(proyectos).forEach(proyecto => {
  const datos = proyectos[proyecto];
  reporte += `  • ${proyecto}: ${datos.horas.toFixed(1)} horas (${datos.registros} registros)\n`;
});

reporte += '\n📝 *Últimos 5 registros:*\n';
registros.slice(-5).reverse().forEach((row, i) => {
  const [fecha, hora, numero, mensaje, tipo, proyecto, persona, horas, tarea] = row;
  reporte += `${i+1}. ${fecha} ${hora} - ${persona} - ${proyecto} - ${horas}h\n`;
  reporte += `   ${tarea}\n`;
});
```

### **5. Envío por WhatsApp**
```javascript
await twilioClient.messages.create({
  body: reporte,
  from: 'whatsapp:+14155238886',
  to: numeroWhatsApp
});
```

---

## 🚀 Inicio del Sistema

### **Requisitos previos:**
1. Node.js instalado
2. Credenciales de Google Sheets configuradas
3. Cuenta de Twilio con WhatsApp
4. API Key de Anthropic (Claude)
5. ngrok descargado

### **Paso 1: Iniciar el servidor**
```bash
cd d:\Proyectos\whatsapp-ia-sheets
node server.js
```

**Salida esperada:**
```
✅ IA Service iniciado con Claude
✅ Sheet Service iniciado
   📊 Spreadsheet ID: TU_GOOGLE_SHEET_ID
✅ Report Service iniciado

🚀 ========================================
   Servidor WhatsApp IA Sheets
   ========================================
   📡 Puerto: 3000
   🌍 URL: http://localhost:3000
   📱 Webhook: http://localhost:3000/webhook/whatsapp
   🧪 Test: POST http://localhost:3000/test/mensaje
   ========================================
```

### **Paso 2: Iniciar ngrok (en otra terminal)**
```bash
cd d:\Proyectos\whatsapp-ia-sheets
./ngrok.exe http 3000
```

**Salida esperada:**
```
Session Status                online
Account                       Your Account
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://xyz.ngrok-free.dev -> http://localhost:3000
```

### **Paso 3: Configurar webhook en Twilio**
1. Copia la URL de ngrok: `https://xyz.ngrok-free.dev`
2. Ve a: https://console.twilio.com/
3. Navega a: Messaging → Try it out → Send a WhatsApp message
4. En "Sandbox Configuration":
   - WHEN A MESSAGE COMES IN: `https://xyz.ngrok-free.dev/webhook/whatsapp`
   - Método: POST
5. Haz clic en "Save"

### **Paso 4: Enviar mensaje de prueba**
```
join [código-sandbox]
```

Luego:
```
Persona Test User
Proyecto Prueba
Trabajo 1 hora
Tarea Configuración inicial
```

---

## 🔍 Monitoreo y Debugging

### **1. Logs del servidor**
El servidor muestra logs detallados en la consola:

```
📱 Nuevo mensaje recibido de WhatsApp
👤 De: Ber (whatsapp:+5491133990658)
💬 Mensaje: Persona Mario Lopez...
🤖 Procesando con IA...
🤖 Enviando mensaje a Claude...
🤖 Respuesta de Claude: { "tipo": "registro_horas", ... }
📊 Datos extraídos: { tipo: 'registro_horas', ... }
📝 Guardando en Google Sheets...
📝 Agregando fila a spreadsheet: 1snE3yaZ...
✅ Fila agregada correctamente
📤 Enviando respuesta...
✅ Proceso completado exitosamente
```

### **2. Panel web de ngrok**
Abre en tu navegador: http://localhost:4040

**Funciones:**
- Ver todas las peticiones HTTP en tiempo real
- Inspeccionar headers, body, respuestas
- Replay de peticiones (reenviar)
- Ver timing y errores

### **3. Logs de Google Sheets**
```javascript
console.log('📝 Agregando fila a spreadsheet:', this.spreadsheetId);
console.log('✅ Fila agregada correctamente');
```

### **4. Script de verificación de ngrok**
```bash
node ver-logs-ngrok.js
```

**Salida:**
```
📊 Total de peticiones recibidas: 10

📱 Últimos 5 mensajes de WhatsApp:

1. Hora: 2026-01-14T15:50:58-03:00
   Mensaje: Reporte
   Status del servidor: 200
   Duración: 2635ms

2. Hora: 2026-01-14T15:48:53-03:00
   Mensaje: Persona carlos Rodriguez...
   Status del servidor: 200
   Duración: 3242ms
```

---

## 🛠️ Scripts Útiles

### **test-sheets.js** - Probar conexión a Google Sheets
```bash
node test-sheets.js
```

### **test-ia.js** - Probar extracción con IA
```bash
node test-ia.js
```

### **test-twilio.js** - Verificar credenciales de Twilio
```bash
node test-twilio.js
```

### **setup-headers.js** - Configurar encabezados en Sheets
```bash
node setup-headers.js
```

### **limpiar-sheet.js** - Limpiar datos (mantiene encabezados)
```bash
node limpiar-sheet.js
```

### **ver-logs-ngrok.js** - Ver logs de ngrok
```bash
node ver-logs-ngrok.js
```

---

## 📋 Estructura de Google Sheets

### **Columnas:**
| Col | Nombre | Descripción | Ejemplo |
|-----|--------|-------------|---------|
| A | Fecha | Fecha del registro | 14/1/2026 |
| B | Hora | Hora del registro | 19:15:30 |
| C | Número WhatsApp | Número que envió el mensaje | whatsapp:+5491133990658 |
| D | Mensaje Original | Mensaje completo | Persona Mario Lopez\n... |
| E | Tipo | Tipo de registro | registro_horas |
| F | Proyecto | Nombre del proyecto | casa nueva |
| G | Persona | Quién trabajó | Mario Lopez |
| H | Horas | Cantidad de horas | 7 |
| I | Tarea | Descripción de la tarea | terminación interior |

### **Formato:**
- Primera fila: Encabezados (fondo azul, texto blanco, negrita)
- Primera fila congelada (siempre visible al hacer scroll)
- Columnas auto-ajustadas al contenido
- Datos agregados automáticamente al final

---

## 🔒 Seguridad

### **Archivos sensibles (NUNCA compartir):**
- `credentials/.env` - Variables de entorno
- `credentials/credentials.json` - Service Account de Google
- `ngrok.exe` - Ejecutable de ngrok

### **.gitignore**
```
node_modules/
credentials/
.env
ngrok.exe
*.log
```

### **Buenas prácticas:**
- Rotar API keys regularmente
- Usar variables de entorno en producción
- No hacer commit de credenciales
- Limitar permisos del Service Account de Google
- Usar HTTPS siempre (ngrok lo hace automáticamente)

---

## 📞 Soporte y Contacto

### **Recursos:**
- Documentación de Twilio: https://www.twilio.com/docs/whatsapp
- Documentación de Google Sheets API: https://developers.google.com/sheets/api
- Documentación de Claude AI: https://docs.anthropic.com/
- Documentación de ngrok: https://ngrok.com/docs

### **Errores comunes:**
1. **Error 401 en Twilio**: Auth Token incorrecto
2. **Error 404 en Google Sheets**: Sheet ID incorrecto o no compartido
3. **Error 502 en webhook**: Servidor no está corriendo
4. **Error de IA**: API Key de Anthropic incorrecta o sin créditos

---

## 📝 Notas Finales

- El sistema procesa mensajes en **2-4 segundos** en promedio
- Cada mensaje a Claude cuesta aproximadamente **$0.001 USD**
- Twilio Sandbox es gratuito para desarrollo
- Google Sheets API es gratuita (límite: 60 requests/minuto)
- ngrok es gratuito con URL que cambia cada reinicio (versión paga mantiene URL fija)

---

**Creado:** Enero 2026
**Versión:** 1.0
**Última actualización:** 14/1/2026
