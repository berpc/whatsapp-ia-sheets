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
        range: 'A:G',
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
        empleado: row[2] || '',
        obra: row[3] || '',
        horas: row[4] || '',
        tarea: row[5] || '',
        estado: row[6] || ''
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

      if (filtro.obra) {
        registrosFiltrados = registrosFiltrados.filter(r =>
          r.obra.toLowerCase().includes(filtro.obra.toLowerCase())
        );
      }

      if (filtro.empleado) {
        registrosFiltrados = registrosFiltrados.filter(r =>
          r.empleado.toLowerCase().includes(filtro.empleado.toLowerCase())
        );
      }

      // Generar estadísticas
      const totalRegistros = registrosFiltrados.length;
      const totalHoras = registrosFiltrados.reduce((sum, r) => {
        const horas = parseFloat(r.horas) || 0;
        return sum + horas;
      }, 0);

      // Agrupar por obra
      const obras = {};
      registrosFiltrados.forEach(r => {
        if (r.obra) {
          if (!obras[r.obra]) {
            obras[r.obra] = {
              nombre: r.obra,
              registros: 0,
              horas: 0,
              estado: r.estado || ''
            };
          }
          obras[r.obra].registros++;
          obras[r.obra].horas += parseFloat(r.horas) || 0;
          if (r.estado) obras[r.obra].estado = r.estado;
        }
      });

      // Agrupar por empleado
      const empleados = {};
      registrosFiltrados.forEach(r => {
        if (r.empleado) {
          if (!empleados[r.empleado]) {
            empleados[r.empleado] = {
              nombre: r.empleado,
              registros: 0,
              horas: 0
            };
          }
          empleados[r.empleado].registros++;
          empleados[r.empleado].horas += parseFloat(r.horas) || 0;
        }
      });

      return {
        totalRegistros,
        totalHoras: totalHoras.toFixed(2),
        obras: Object.values(obras),
        empleados: Object.values(empleados),
        ultimosRegistros: registrosFiltrados.slice(-5).reverse()
      };

    } catch (error) {
      console.error('❌ Error generando reporte:', error);
      throw error;
    }
  }

  formatearReporte(reporte) {
    let mensaje = '📊 *REPORTE DE OBRAS*\n\n';

    mensaje += `📝 Total de registros: ${reporte.totalRegistros}\n`;
    mensaje += `⏱️ Total de horas: ${reporte.totalHoras}h\n\n`;

    if (reporte.obras && reporte.obras.length > 0) {
      mensaje += '🏗️ *Por Obra:*\n';
      reporte.obras.forEach(o => {
        const estadoIcon = o.estado === 'completada' ? '✅' : o.estado === 'en_progreso' ? '🔄' : o.estado === 'pausada' ? '⏸️' : '';
        mensaje += `  • ${o.nombre}: ${o.horas.toFixed(1)}h ${estadoIcon}\n`;
      });
      mensaje += '\n';
    }

    if (reporte.empleados && reporte.empleados.length > 0) {
      mensaje += '👷 *Por Empleado:*\n';
      reporte.empleados.forEach(e => {
        mensaje += `  • ${e.nombre}: ${e.horas.toFixed(1)}h (${e.registros} reg)\n`;
      });
      mensaje += '\n';
    }

    if (reporte.ultimosRegistros && reporte.ultimosRegistros.length > 0) {
      mensaje += '📋 *Últimos Registros:*\n';
      reporte.ultimosRegistros.forEach((r, i) => {
        if (i < 5) {
          mensaje += `  ${i + 1}. ${r.fecha} - ${r.empleado || 'Sin nombre'}\n`;
          mensaje += `     🏗️ ${r.obra || 'Sin obra'} - ${r.horas}h\n`;
        }
      });
    }

    return mensaje;
  }
}

module.exports = new ReportService();
