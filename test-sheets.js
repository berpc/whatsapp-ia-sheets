require('dotenv').config({ path: './credentials/.env' });
const { google } = require('googleapis');

async function probarConexion() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_CREDENTIALS_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'A:I',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [['PRUEBA', 'Funcionó!', new Date().toLocaleString()]]
      },
    });
    
    console.log('✅ ¡Conexión exitosa! Se agregó una fila de prueba.');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

probarConexion();