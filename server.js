require('dotenv').config({ path: './credentials/.env' });
const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const iaService = require('./iaService');
const sheetsService = require('./sheetsService');
const reportService = require('./reportService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Cliente de Twilio
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Endpoint de salud
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'WhatsApp IA Sheets Server funcionando',
    timestamp: new Date().toISOString()
  });
});

// Webhook para recibir mensajes de WhatsApp
app.post('/webhook/whatsapp', async (req, res) => {
  try {
    console.log('\n📱 Nuevo mensaje recibido de WhatsApp');
    console.log('Body:', req.body);

    const { From, Body, ProfileName } = req.body;

    if (!Body) {
      console.log('⚠️ Mensaje vacío recibido');
      return res.status(200).send();
    }

    const numeroWhatsApp = From;
    const mensajeOriginal = Body;
    const nombreUsuario = ProfileName || 'Usuario';

    console.log(`👤 De: ${nombreUsuario} (${numeroWhatsApp})`);
    console.log(`💬 Mensaje: ${mensajeOriginal}`);

    let respuesta = '';

    // Detectar comandos
    const mensajeLower = mensajeOriginal.toLowerCase().trim();

    if (mensajeLower === 'reporte' || mensajeLower.includes('dame un reporte') || mensajeLower.includes('generar reporte')) {
      // Generar reporte
      console.log('📊 Generando reporte...');
      const reporte = await reportService.generarReporte();
      respuesta = reportService.formatearReporte(reporte);

    } else if (mensajeLower === 'ayuda' || mensajeLower === 'help' || mensajeLower === '?') {
      // Mostrar ayuda
      respuesta = '📱 *COMANDOS DISPONIBLES*\n\n';
      respuesta += '📊 *reporte* - Genera un reporte de tus actividades\n\n';
      respuesta += '💬 *Para registrar actividades:*\n';
      respuesta += 'Envía un mensaje como:\n';
      respuesta += '"Trabajé 3 horas en el proyecto web haciendo el login"\n\n';
      respuesta += 'La IA extraerá automáticamente:\n';
      respuesta += '• Horas trabajadas\n';
      respuesta += '• Nombre del proyecto\n';
      respuesta += '• Descripción de la tarea';

    } else {
      // Procesar mensaje normal con IA
      console.log('🤖 Procesando con IA...');
      const datosExtraidos = await iaService.procesarMensaje(mensajeOriginal);

      console.log('📊 Datos extraídos:', datosExtraidos);

      // Preparar datos para Google Sheets
      const ahora = new Date();
      const fecha = ahora.toLocaleDateString('es-ES');
      const hora = ahora.toLocaleTimeString('es-ES');

      const datosFila = {
        fecha,
        hora,
        numero: numeroWhatsApp,
        mensajeOriginal,
        tipo: datosExtraidos.tipo || '',
        proyecto: datosExtraidos.proyecto || '',
        persona: datosExtraidos.persona || nombreUsuario,
        horas: datosExtraidos.horas || '',
        tarea: datosExtraidos.tarea || ''
      };

      // Guardar en Google Sheets
      console.log('📝 Guardando en Google Sheets...');
      await sheetsService.agregarFila(datosFila);

      // Preparar respuesta para el usuario
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
    }

    // Enviar respuesta por WhatsApp
    console.log('📤 Enviando respuesta...');
    await twilioClient.messages.create({
      body: respuesta,
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: numeroWhatsApp
    });

    console.log('✅ Proceso completado exitosamente\n');
    res.status(200).send();

  } catch (error) {
    console.error('❌ Error procesando mensaje:', error);

    // Intentar enviar mensaje de error al usuario
    try {
      await twilioClient.messages.create({
        body: '❌ Hubo un error procesando tu mensaje. Por favor intenta nuevamente.',
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: req.body.From
      });
    } catch (twilioError) {
      console.error('❌ Error enviando mensaje de error:', twilioError);
    }

    res.status(500).json({ error: error.message });
  }
});

// Endpoint para probar el sistema sin WhatsApp
app.post('/test/mensaje', async (req, res) => {
  try {
    const { mensaje } = req.body;

    if (!mensaje) {
      return res.status(400).json({ error: 'Se requiere el campo "mensaje"' });
    }

    console.log('\n🧪 Mensaje de prueba:', mensaje);

    // Procesar con IA
    const datosExtraidos = await iaService.procesarMensaje(mensaje);

    // Preparar datos
    const ahora = new Date();
    const datosFila = {
      fecha: ahora.toLocaleDateString('es-ES'),
      hora: ahora.toLocaleTimeString('es-ES'),
      numero: 'TEST',
      mensajeOriginal: mensaje,
      tipo: datosExtraidos.tipo || '',
      proyecto: datosExtraidos.proyecto || '',
      persona: datosExtraidos.persona || 'Usuario Test',
      horas: datosExtraidos.horas || '',
      tarea: datosExtraidos.tarea || ''
    };

    // Guardar en Sheets
    await sheetsService.agregarFila(datosFila);

    res.json({
      success: true,
      mensaje: 'Registro guardado correctamente',
      datosExtraidos,
      datosFila
    });

  } catch (error) {
    console.error('❌ Error en test:', error);
    res.status(500).json({ error: error.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('\n🚀 ========================================');
  console.log(`   Servidor WhatsApp IA Sheets`);
  console.log('   ========================================');
  console.log(`   📡 Puerto: ${PORT}`);
  console.log(`   🌍 URL: http://localhost:${PORT}`);
  console.log(`   📱 Webhook: http://localhost:${PORT}/webhook/whatsapp`);
  console.log(`   🧪 Test: POST http://localhost:${PORT}/test/mensaje`);
  console.log('   ========================================\n');
});

module.exports = app;
