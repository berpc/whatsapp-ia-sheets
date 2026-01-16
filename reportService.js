require('dotenv').config({ path: './credentials/.env' });
const { google } = require('googleapis');

class ReportService {
  constructor() {
    this.spreadsheetId = process.env.GOOGLE_SHEET_ID;

    let auth;

    // Opción 1: Usar credenciales desde variable de entorno (para producción/Render)
    if (process.env.GOOGLE_CREDENTIALS) {
      try {
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
        auth = new google.auth.GoogleAuth({
          credentials: credentials,
          scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });
        console.log('   🔑 Report Service usando credenciales desde variable de entorno');
      } catch (error) {
        console.error('❌ Error parseando GOOGLE_CREDENTIALS:', error.message);
        throw error;
      }
    }
    // Opción 2: Usar archivo de credenciales (para desarrollo local)
    else {
      const credentialsPath = process.env.GOOGLE_CREDENTIALS_PATH || './credentials/credentials.json';
      auth = new google.auth.GoogleAuth({
        keyFile: credentialsPath,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });
      console.log('   📁 Report Service usando credenciales desde archivo');
    }

    this.sheets = google.sheets({ version: 'v4', auth });
    console.log('✅ Report Service iniciado');
  }

  async generarReporte(filtro = {}) {
    try {
      console.log('📊 Generando reporte...');

      // Leer todas las filas de la hoja
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: 'A:I',
      });

      const rows = response.data.values;

      if (!rows || rows.length === 0) {
        return {
          mensaje: 'No hay datos registrados',
          registros: []
        };
      }

      // La primera fila son los encabezados
      const headers = rows[0];
      const data = rows.slice(1);

      // Convertir a objetos
      const registros = data.map(row => ({
        fecha: row[0] || '',
        hora: row[1] || '',
        numero: row[2] || '',
        mensaje: row[3] || '',
        tipo: row[4] || '',
        proyecto: row[5] || '',
        persona: row[6] || '',
        horas: row[7] || '',
        tarea: row[8] || ''
      }));

      // Aplicar filtros si existen
      let registrosFiltrados = registros;

      if (filtro.dias) {
        const diasAtras = parseInt(filtro.dias);
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - diasAtras);

        registrosFiltrados = registrosFiltrados.filter(r => {
          if (!r.fecha) return false;
          const [dia, mes, anio] = r.fecha.split('/');
          const fechaRegistro = new Date(`${anio}-${mes}-${dia}`);
          return fechaRegistro >= fechaLimite;
        });
      }

      if (filtro.proyecto) {
        registrosFiltrados = registrosFiltrados.filter(r =>
          r.proyecto.toLowerCase().includes(filtro.proyecto.toLowerCase())
        );
      }

      // Generar estadísticas
      const totalRegistros = registrosFiltrados.length;
      const totalHoras = registrosFiltrados.reduce((sum, r) => {
        const horas = parseFloat(r.horas) || 0;
        return sum + horas;
      }, 0);

      const proyectos = {};
      registrosFiltrados.forEach(r => {
        if (r.proyecto) {
          if (!proyectos[r.proyecto]) {
            proyectos[r.proyecto] = {
              nombre: r.proyecto,
              registros: 0,
              horas: 0
            };
          }
          proyectos[r.proyecto].registros++;
          proyectos[r.proyecto].horas += parseFloat(r.horas) || 0;
        }
      });

      return {
        totalRegistros,
        totalHoras: totalHoras.toFixed(2),
        proyectos: Object.values(proyectos),
        ultimosRegistros: registrosFiltrados.slice(-5).reverse()
      };

    } catch (error) {
      console.error('❌ Error generando reporte:', error);
      throw error;
    }
  }

  formatearReporte(reporte) {
    let mensaje = '📊 *REPORTE DE ACTIVIDADES*\n\n';

    mensaje += `📝 Total de registros: ${reporte.totalRegistros}\n`;
    mensaje += `⏱️ Total de horas: ${reporte.totalHoras}h\n\n`;

    if (reporte.proyectos && reporte.proyectos.length > 0) {
      mensaje += '🗂️ *Por Proyecto:*\n';
      reporte.proyectos.forEach(p => {
        mensaje += `  • ${p.nombre}: ${p.horas.toFixed(1)}h (${p.registros} registros)\n`;
      });
      mensaje += '\n';
    }

    if (reporte.ultimosRegistros && reporte.ultimosRegistros.length > 0) {
      mensaje += '📋 *Últimos Registros:*\n';
      reporte.ultimosRegistros.forEach((r, i) => {
        if (i < 5) {
          mensaje += `  ${i + 1}. ${r.fecha} - ${r.horas}h - ${r.proyecto || 'Sin proyecto'}\n`;
          mensaje += `     ${r.tarea.substring(0, 60)}${r.tarea.length > 60 ? '...' : ''}\n`;
        }
      });
    }

    return mensaje;
  }
}

module.exports = new ReportService();
