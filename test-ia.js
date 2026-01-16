require('dotenv').config({ path: './credentials/.env' });
const Anthropic = require('@anthropic-ai/sdk');

async function probarClaude() {
  try {
    // Verificar que la API key esté configurada
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.startsWith('sk-ant-xxxx')) {
      console.error('❌ Error: ANTHROPIC_API_KEY no está configurada en credentials/.env');
      console.log('   Ve a: https://console.anthropic.com/ para obtener tu API key');
      process.exit(1);
    }

    console.log('🤖 Probando conexión con Claude...\n');
    console.log('   API Key:', process.env.ANTHROPIC_API_KEY.substring(0, 20) + '...');

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Prueba 1: Conexión básica
    console.log('\n📝 Prueba 1: Conexión básica');
    const response1 = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: 'Di "funciona" si puedes leer esto'
      }]
    });

    console.log('✅ Respuesta:', response1.content[0].text);

    // Prueba 2: Extracción de datos (como en el sistema)
    console.log('\n📝 Prueba 2: Extracción de información estructurada');
    const mensajePrueba = 'Trabajé 3 horas en el proyecto web de la empresa XYZ haciendo el diseño del login';

    const response2 = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `Analiza este mensaje y extrae información en formato JSON:
"${mensajePrueba}"

Extrae:
{
  "tipo": "registro_horas|tarea|reporte|consulta|otro",
  "proyecto": "nombre del proyecto o vacío",
  "persona": "nombre de persona o vacío",
  "horas": "número de horas o vacío",
  "tarea": "descripción breve de la tarea"
}

Responde SOLO con el JSON, sin texto adicional.`
      }]
    });

    console.log('📊 Mensaje analizado:', mensajePrueba);
    console.log('📋 Datos extraídos:', response2.content[0].text);

    console.log('\n🎉 ¡Claude API funcionando correctamente!\n');
    console.log('✅ El servicio de IA está listo para usar en el sistema');

  } catch (error) {
    console.error('\n❌ Error al conectar con Claude:');
    console.error('   Mensaje:', error.message);

    if (error.status === 401) {
      console.error('\n   🔑 Tu API key parece ser inválida');
      console.error('   Ve a https://console.anthropic.com/ y verifica tu API key');
    } else if (error.status === 429) {
      console.error('\n   ⏱️  Has excedido el límite de requests');
      console.error('   Espera un momento e intenta de nuevo');
    }

    process.exit(1);
  }
}

probarClaude();
