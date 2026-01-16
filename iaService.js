require('dotenv').config({ path: './credentials/.env' });
const Anthropic = require('@anthropic-ai/sdk');

class IAService {
  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY;
    this.model = 'claude-3-5-haiku-20241022';

    if (!this.apiKey || this.apiKey.startsWith('sk-ant-xxxx')) {
      console.warn('⚠️ ADVERTENCIA: API key de Anthropic no configurada. El servicio de IA no funcionará.');
      console.warn('   Configura ANTHROPIC_API_KEY en credentials/.env');
      this.configurado = false;
    } else {
      this.anthropic = new Anthropic({
        apiKey: this.apiKey,
      });
      console.log('✅ IA Service iniciado con Claude');
      this.configurado = true;
    }
  }

  async procesarMensaje(mensaje) {
    // Si no está configurada la API, devolver datos básicos sin procesar
    if (!this.configurado) {
      console.log('⚠️ IA no configurada, devolviendo datos sin procesar');
      return {
        tipo: 'mensaje',
        proyecto: '',
        persona: '',
        horas: this.extraerHorasSimple(mensaje),
        tarea: mensaje
      };
    }

    try {
      console.log('🤖 Enviando mensaje a Claude...');

      const prompt = `Analiza el siguiente mensaje y extrae la información estructurada. El mensaje puede ser sobre:
- Registro de horas trabajadas en un proyecto
- Asignación de tareas
- Reportes de trabajo
- Cualquier otro tipo de comunicación laboral

Mensaje del usuario:
"${mensaje}"

Extrae y devuelve la siguiente información en formato JSON:
{
  "tipo": "registro_horas|tarea|reporte|consulta|otro",
  "proyecto": "nombre del proyecto mencionado o vacío",
  "persona": "nombre de la persona mencionada o vacío",
  "horas": "número de horas trabajadas (solo el número) o vacío",
  "tarea": "descripción breve de la tarea o actividad realizada"
}

Reglas importantes:
- Si no se menciona algún campo, déjalo vacío ""
- Para "horas", devuelve solo el número sin texto (ej: "3" no "3 horas")
- Para "tarea", resume en máximo 100 caracteres
- Detecta el tipo más apropiado según el contexto
- Si el mensaje menciona "trabajé X horas en Y", tipo debe ser "registro_horas"

Responde ÚNICAMENTE con el JSON, sin texto adicional.`;

      const response = await this.anthropic.messages.create({
        model: this.model,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const respuestaIA = response.content[0].text;
      console.log('🤖 Respuesta de Claude:', respuestaIA);

      // Intentar extraer JSON de la respuesta
      let datosExtraidos;
      try {
        // Buscar el JSON en la respuesta (puede venir con texto adicional)
        const jsonMatch = respuestaIA.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          datosExtraidos = JSON.parse(jsonMatch[0]);
        } else {
          datosExtraidos = JSON.parse(respuestaIA);
        }
      } catch (parseError) {
        console.error('⚠️ Error parseando JSON de IA, usando fallback');
        datosExtraidos = {
          tipo: 'mensaje',
          proyecto: '',
          persona: '',
          horas: '',
          tarea: mensaje
        };
      }

      // Validar y limpiar datos
      return {
        tipo: datosExtraidos.tipo || 'mensaje',
        proyecto: datosExtraidos.proyecto || '',
        persona: datosExtraidos.persona || '',
        horas: datosExtraidos.horas || '',
        tarea: datosExtraidos.tarea || mensaje.substring(0, 100)
      };

    } catch (error) {
      console.error('❌ Error llamando a la API de IA:', error.message);

      // Mostrar información específica del error
      if (error.status === 401) {
        console.error('   🔑 API key inválida');
      } else if (error.status === 429) {
        console.error('   ⏱️  Límite de requests excedido');
      } else if (error.status === 400 && error.message.includes('credit balance')) {
        console.error('   💳 Sin créditos. Ve a: https://console.anthropic.com/settings/billing');
      }

      // Fallback: devolver datos básicos con extracción simple
      console.log('   ⚙️  Usando extracción simple sin IA');
      return {
        tipo: 'mensaje',
        proyecto: '',
        persona: '',
        horas: this.extraerHorasSimple(mensaje),
        tarea: mensaje
      };
    }
  }

  // Método simple de fallback para extraer horas sin IA
  extraerHorasSimple(mensaje) {
    const patrones = [
      /(\d+(?:\.\d+)?)\s*horas?/i,
      /(\d+(?:\.\d+)?)\s*h\b/i,
      /trabajé\s*(\d+(?:\.\d+)?)/i,
      /dediqué\s*(\d+(?:\.\d+)?)/i
    ];

    for (const patron of patrones) {
      const match = mensaje.match(patron);
      if (match && match[1]) {
        return match[1];
      }
    }

    return '';
  }

  // Método para probar el servicio
  async probar() {
    console.log('\n🧪 Probando IA Service...\n');

    const mensajesPrueba = [
      'Trabajé 3 horas en el proyecto web de la empresa XYZ haciendo el diseño del login',
      'Tarea: revisar el código del módulo de pagos',
      'Reporte: completé la integración con la API de envíos'
    ];

    for (const mensaje of mensajesPrueba) {
      console.log(`📝 Mensaje: "${mensaje}"`);
      const resultado = await this.procesarMensaje(mensaje);
      console.log('📊 Resultado:', resultado);
      console.log('---\n');
    }
  }
}

module.exports = new IAService();

// Si se ejecuta directamente, hacer pruebas
if (require.main === module) {
  const service = new IAService();
  service.probar().catch(console.error);
}
