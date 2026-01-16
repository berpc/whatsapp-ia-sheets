require('dotenv').config({ path: './credentials/.env' });
const { google } = require('googleapis');

class ReportService {
  constructor() {
    this.spreadsheetId = process.env.GOOGLE_SHEET_ID;

    let auth;

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
    } else {
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

  // Obtener todos los registros
  async obtenerRegistros() {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: 'A:G',
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) return [];

    return rows.slice(1).map(row => ({
      fecha: row[0] || '',
      hora: row[1] || '',
      empleado: row[2] || '',
      obra: row[3] || '',
      horas: parseFloat(row[4]) || 0,
      tarea: row[5] || '',
      estado: row[6] || ''
    }));
  }

  // Parsear fecha en formato dd/mm/yyyy
  parsearFecha(fechaStr) {
    if (!fechaStr) return null;
    const partes = fechaStr.split('/');
    if (partes.length !== 3) return null;
    const [dia, mes, anio] = partes;
    return new Date(anio, mes - 1, dia);
  }

  // Filtrar por rango de fechas
  filtrarPorFechas(registros, fechaInicio, fechaFin) {
    return registros.filter(r => {
      const fecha = this.parsearFecha(r.fecha);
      if (!fecha) return false;
      return fecha >= fechaInicio && fecha <= fechaFin;
    });
  }

  // Obtener inicio de quincena
  obtenerInicioQuincena(fecha) {
    const dia = fecha.getDate();
    if (dia <= 15) {
      return new Date(fecha.getFullYear(), fecha.getMonth(), 1);
    } else {
      return new Date(fecha.getFullYear(), fecha.getMonth(), 16);
    }
  }

  // Obtener fin de quincena
  obtenerFinQuincena(fecha) {
    const dia = fecha.getDate();
    if (dia <= 15) {
      return new Date(fecha.getFullYear(), fecha.getMonth(), 15);
    } else {
      return new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
    }
  }

  // REPORTE GENERAL
  async generarReporte() {
    try {
      const registros = await this.obtenerRegistros();

      if (registros.length === 0) {
        return { totalRegistros: 0, totalHoras: '0', obras: [], empleados: [], ultimosRegistros: [] };
      }

      const totalHoras = registros.reduce((sum, r) => sum + r.horas, 0);

      // Por obra
      const obras = {};
      registros.forEach(r => {
        if (r.obra) {
          if (!obras[r.obra]) {
            obras[r.obra] = { nombre: r.obra, horas: 0, registros: 0, estado: '' };
          }
          obras[r.obra].horas += r.horas;
          obras[r.obra].registros++;
          if (r.estado) obras[r.obra].estado = r.estado;
        }
      });

      // Por empleado
      const empleados = {};
      registros.forEach(r => {
        if (r.empleado) {
          if (!empleados[r.empleado]) {
            empleados[r.empleado] = { nombre: r.empleado, horas: 0, registros: 0 };
          }
          empleados[r.empleado].horas += r.horas;
          empleados[r.empleado].registros++;
        }
      });

      return {
        totalRegistros: registros.length,
        totalHoras: totalHoras.toFixed(1),
        obras: Object.values(obras),
        empleados: Object.values(empleados),
        ultimosRegistros: registros.slice(-5).reverse()
      };
    } catch (error) {
      console.error('❌ Error generando reporte:', error);
      throw error;
    }
  }

  // REPORTE DE HOY
  async generarReporteHoy() {
    const registros = await this.obtenerRegistros();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const registrosHoy = registros.filter(r => {
      const fecha = this.parsearFecha(r.fecha);
      if (!fecha) return false;
      fecha.setHours(0, 0, 0, 0);
      return fecha.getTime() === hoy.getTime();
    });

    const totalHoras = registrosHoy.reduce((sum, r) => sum + r.horas, 0);

    // Horas por empleado hoy
    const porEmpleado = {};
    registrosHoy.forEach(r => {
      if (r.empleado) {
        if (!porEmpleado[r.empleado]) {
          porEmpleado[r.empleado] = { nombre: r.empleado, horas: 0, tareas: [] };
        }
        porEmpleado[r.empleado].horas += r.horas;
        if (r.tarea) porEmpleado[r.empleado].tareas.push(r.tarea);
      }
    });

    return {
      fecha: hoy.toLocaleDateString('es-ES'),
      totalRegistros: registrosHoy.length,
      totalHoras: totalHoras.toFixed(1),
      empleados: Object.values(porEmpleado),
      registros: registrosHoy
    };
  }

  // REPORTE DE QUINCENA
  async generarReporteQuincena() {
    const registros = await this.obtenerRegistros();
    const hoy = new Date();
    const inicioQuincena = this.obtenerInicioQuincena(hoy);
    const finQuincena = this.obtenerFinQuincena(hoy);

    const registrosQuincena = this.filtrarPorFechas(registros, inicioQuincena, finQuincena);
    const totalHoras = registrosQuincena.reduce((sum, r) => sum + r.horas, 0);

    // Horas por empleado en quincena
    const porEmpleado = {};
    registrosQuincena.forEach(r => {
      if (r.empleado) {
        if (!porEmpleado[r.empleado]) {
          porEmpleado[r.empleado] = { nombre: r.empleado, horas: 0, dias: new Set(), obras: new Set() };
        }
        porEmpleado[r.empleado].horas += r.horas;
        porEmpleado[r.empleado].dias.add(r.fecha);
        if (r.obra) porEmpleado[r.empleado].obras.add(r.obra);
      }
    });

    // Convertir Sets a arrays
    Object.values(porEmpleado).forEach(e => {
      e.diasTrabajados = e.dias.size;
      e.obras = Array.from(e.obras);
      delete e.dias;
    });

    // Por obra en quincena
    const porObra = {};
    registrosQuincena.forEach(r => {
      if (r.obra) {
        if (!porObra[r.obra]) {
          porObra[r.obra] = { nombre: r.obra, horas: 0, estado: '' };
        }
        porObra[r.obra].horas += r.horas;
        if (r.estado) porObra[r.obra].estado = r.estado;
      }
    });

    return {
      periodo: `${inicioQuincena.toLocaleDateString('es-ES')} - ${finQuincena.toLocaleDateString('es-ES')}`,
      totalRegistros: registrosQuincena.length,
      totalHoras: totalHoras.toFixed(1),
      empleados: Object.values(porEmpleado),
      obras: Object.values(porObra)
    };
  }

  // REPORTE POR EMPLEADO
  async generarReporteEmpleado(nombreEmpleado) {
    const registros = await this.obtenerRegistros();
    const registrosEmpleado = registros.filter(r =>
      r.empleado.toLowerCase().includes(nombreEmpleado.toLowerCase())
    );

    if (registrosEmpleado.length === 0) {
      return { encontrado: false, nombre: nombreEmpleado };
    }

    const totalHoras = registrosEmpleado.reduce((sum, r) => sum + r.horas, 0);

    // Horas por día
    const porDia = {};
    registrosEmpleado.forEach(r => {
      if (!porDia[r.fecha]) {
        porDia[r.fecha] = { fecha: r.fecha, horas: 0, obras: [] };
      }
      porDia[r.fecha].horas += r.horas;
      if (r.obra && !porDia[r.fecha].obras.includes(r.obra)) {
        porDia[r.fecha].obras.push(r.obra);
      }
    });

    // Horas por obra
    const porObra = {};
    registrosEmpleado.forEach(r => {
      if (r.obra) {
        if (!porObra[r.obra]) {
          porObra[r.obra] = { nombre: r.obra, horas: 0 };
        }
        porObra[r.obra].horas += r.horas;
      }
    });

    // Quincena actual
    const hoy = new Date();
    const inicioQuincena = this.obtenerInicioQuincena(hoy);
    const finQuincena = this.obtenerFinQuincena(hoy);
    const registrosQuincena = this.filtrarPorFechas(registrosEmpleado, inicioQuincena, finQuincena);
    const horasQuincena = registrosQuincena.reduce((sum, r) => sum + r.horas, 0);

    return {
      encontrado: true,
      nombre: registrosEmpleado[0].empleado,
      totalRegistros: registrosEmpleado.length,
      totalHoras: totalHoras.toFixed(1),
      horasQuincena: horasQuincena.toFixed(1),
      diasTrabajados: Object.keys(porDia).length,
      porDia: Object.values(porDia).slice(-7),
      porObra: Object.values(porObra),
      ultimosRegistros: registrosEmpleado.slice(-5).reverse()
    };
  }

  // REPORTE POR OBRA
  async generarReporteObra(nombreObra) {
    const registros = await this.obtenerRegistros();
    const registrosObra = registros.filter(r =>
      r.obra.toLowerCase().includes(nombreObra.toLowerCase())
    );

    if (registrosObra.length === 0) {
      return { encontrado: false, nombre: nombreObra };
    }

    const totalHoras = registrosObra.reduce((sum, r) => sum + r.horas, 0);
    const ultimoEstado = registrosObra.filter(r => r.estado).pop()?.estado || '';

    // Horas por empleado
    const porEmpleado = {};
    registrosObra.forEach(r => {
      if (r.empleado) {
        if (!porEmpleado[r.empleado]) {
          porEmpleado[r.empleado] = { nombre: r.empleado, horas: 0, registros: 0 };
        }
        porEmpleado[r.empleado].horas += r.horas;
        porEmpleado[r.empleado].registros++;
      }
    });

    // Horas por día
    const porDia = {};
    registrosObra.forEach(r => {
      if (!porDia[r.fecha]) {
        porDia[r.fecha] = { fecha: r.fecha, horas: 0 };
      }
      porDia[r.fecha].horas += r.horas;
    });

    return {
      encontrado: true,
      nombre: registrosObra[0].obra,
      estado: ultimoEstado,
      totalRegistros: registrosObra.length,
      totalHoras: totalHoras.toFixed(1),
      empleados: Object.values(porEmpleado),
      porDia: Object.values(porDia).slice(-7),
      ultimosRegistros: registrosObra.slice(-5).reverse()
    };
  }

  // FORMATEADORES DE REPORTE

  formatearReporte(reporte) {
    let msg = '📊 *REPORTE GENERAL*\n\n';
    msg += `📝 Total registros: ${reporte.totalRegistros}\n`;
    msg += `⏱️ Total horas: ${reporte.totalHoras}h\n\n`;

    if (reporte.obras?.length > 0) {
      msg += '🏗️ *Por Obra:*\n';
      reporte.obras.forEach(o => {
        const icon = o.estado === 'completada' ? '✅' : o.estado === 'en_progreso' ? '🔄' : '';
        msg += `  • ${o.nombre}: ${o.horas.toFixed(1)}h ${icon}\n`;
      });
      msg += '\n';
    }

    if (reporte.empleados?.length > 0) {
      msg += '👷 *Por Empleado:*\n';
      reporte.empleados.forEach(e => {
        msg += `  • ${e.nombre}: ${e.horas.toFixed(1)}h\n`;
      });
    }

    return msg;
  }

  formatearReporteHoy(reporte) {
    let msg = `📊 *REPORTE DE HOY*\n`;
    msg += `📅 ${reporte.fecha}\n\n`;
    msg += `📝 Registros: ${reporte.totalRegistros}\n`;
    msg += `⏱️ Horas: ${reporte.totalHoras}h\n\n`;

    if (reporte.empleados?.length > 0) {
      msg += '👷 *Empleados hoy:*\n';
      reporte.empleados.forEach(e => {
        msg += `  • ${e.nombre}: ${e.horas.toFixed(1)}h\n`;
      });
    } else {
      msg += '⚠️ No hay registros para hoy';
    }

    return msg;
  }

  formatearReporteQuincena(reporte) {
    let msg = `📊 *REPORTE QUINCENA*\n`;
    msg += `📅 ${reporte.periodo}\n\n`;
    msg += `📝 Registros: ${reporte.totalRegistros}\n`;
    msg += `⏱️ Total horas: ${reporte.totalHoras}h\n\n`;

    if (reporte.empleados?.length > 0) {
      msg += '👷 *Por Empleado:*\n';
      reporte.empleados.forEach(e => {
        msg += `  • ${e.nombre}: ${e.horas.toFixed(1)}h (${e.diasTrabajados} días)\n`;
      });
      msg += '\n';
    }

    if (reporte.obras?.length > 0) {
      msg += '🏗️ *Por Obra:*\n';
      reporte.obras.forEach(o => {
        const icon = o.estado === 'completada' ? '✅' : o.estado === 'en_progreso' ? '🔄' : '';
        msg += `  • ${o.nombre}: ${o.horas.toFixed(1)}h ${icon}\n`;
      });
    }

    return msg;
  }

  formatearReporteEmpleado(reporte) {
    if (!reporte.encontrado) {
      return `⚠️ No se encontraron registros para "${reporte.nombre}"`;
    }

    let msg = `👷 *REPORTE: ${reporte.nombre.toUpperCase()}*\n\n`;
    msg += `📝 Total registros: ${reporte.totalRegistros}\n`;
    msg += `⏱️ Horas totales: ${reporte.totalHoras}h\n`;
    msg += `📅 Horas quincena: ${reporte.horasQuincena}h\n`;
    msg += `📆 Días trabajados: ${reporte.diasTrabajados}\n\n`;

    if (reporte.porObra?.length > 0) {
      msg += '🏗️ *Horas por obra:*\n';
      reporte.porObra.forEach(o => {
        msg += `  • ${o.nombre}: ${o.horas.toFixed(1)}h\n`;
      });
      msg += '\n';
    }

    if (reporte.porDia?.length > 0) {
      msg += '📅 *Últimos días:*\n';
      reporte.porDia.forEach(d => {
        msg += `  • ${d.fecha}: ${d.horas.toFixed(1)}h\n`;
      });
    }

    return msg;
  }

  formatearReporteObra(reporte) {
    if (!reporte.encontrado) {
      return `⚠️ No se encontraron registros para obra "${reporte.nombre}"`;
    }

    const estadoIcon = reporte.estado === 'completada' ? '✅' :
                       reporte.estado === 'en_progreso' ? '🔄' :
                       reporte.estado === 'pausada' ? '⏸️' : '';

    let msg = `🏗️ *OBRA: ${reporte.nombre.toUpperCase()}* ${estadoIcon}\n\n`;
    if (reporte.estado) msg += `📊 Estado: ${reporte.estado}\n`;
    msg += `📝 Total registros: ${reporte.totalRegistros}\n`;
    msg += `⏱️ Horas totales: ${reporte.totalHoras}h\n\n`;

    if (reporte.empleados?.length > 0) {
      msg += '👷 *Horas por empleado:*\n';
      reporte.empleados.forEach(e => {
        msg += `  • ${e.nombre}: ${e.horas.toFixed(1)}h\n`;
      });
      msg += '\n';
    }

    if (reporte.porDia?.length > 0) {
      msg += '📅 *Últimos días:*\n';
      reporte.porDia.forEach(d => {
        msg += `  • ${d.fecha}: ${d.horas.toFixed(1)}h\n`;
      });
    }

    return msg;
  }
}

module.exports = new ReportService();
