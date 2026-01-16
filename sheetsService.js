require('dotenv').config({ path: './credentials/.env' });
const { google } = require('googleapis');

class SheetsService {
  constructor() {
    // Leer configuración desde variables de entorno
    this.spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!this.spreadsheetId) {
      throw new Error('❌ GOOGLE_SHEET_ID no está configurado en credentials/.env');
    }

    // Configurar autenticación
    let auth;

    // Opción 1: Usar credenciales desde variable de entorno (para producción/Railway)
    if (process.env.GOOGLE_CREDENTIALS) {
      try {
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
        auth = new google.auth.GoogleAuth({
          credentials: credentials,
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        console.log('   🔑 Usando credenciales desde variable de entorno');
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
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      console.log('   📁 Usando credenciales desde archivo');
    }

    this.sheets = google.sheets({ version: 'v4', auth });

    console.log('✅ Sheet Service iniciado');
    console.log('   📊 Spreadsheet ID:', this.spreadsheetId);
  }

  async agregarFila(datos) {
    try {
      const {
        fecha, hora, numero, mensajeOriginal,
        tipo, proyecto, persona, horas, tarea
      } = datos;

      const values = [[
        fecha, hora, numero, mensajeOriginal,
        tipo || '', proyecto || '', persona || '',
        horas || '', tarea || ''
      ]];

      console.log('📝 Agregando fila a spreadsheet:', this.spreadsheetId);

      const result = await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: 'A:I',
        valueInputOption: 'USER_ENTERED',
        resource: { values },
      });

      console.log('✅ Fila agregada correctamente');
      return result;
    } catch (error) {
      console.error('❌ Error completo:', error);
      throw error;
    }
  }
}

module.exports = new SheetsService();
