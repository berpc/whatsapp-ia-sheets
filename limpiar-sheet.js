require('dotenv').config({ path: './credentials/.env' });
const { google } = require('googleapis');

async function limpiarSheet() {
  try {
    console.log('🧹 Limpiando Google Sheets...\n');

    // Configurar autenticación
    const credentialsPath = process.env.GOOGLE_CREDENTIALS_PATH || './credentials/credentials.json';
    const auth = new google.auth.GoogleAuth({
      keyFile: credentialsPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    console.log('1️⃣ Verificando datos actuales...');

    // Leer todos los datos
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'A:I',
    });

    const rows = response.data.values || [];
    console.log(`   Total de filas: ${rows.length}`);

    if (rows.length <= 1) {
      console.log('   ℹ️  La hoja solo tiene encabezados o está vacía');
      return;
    }

    // Confirmar limpieza
    console.log(`\n2️⃣ Limpiando ${rows.length - 1} filas de datos...`);

    // Limpiar todo excepto la primera fila (encabezados)
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'A2:I',
    });

    console.log('   ✅ Datos eliminados');

    // Mantener los encabezados formateados
    console.log('\n3️⃣ Restaurando encabezados...');

    const headers = [
      'Fecha',
      'Hora',
      'Número WhatsApp',
      'Mensaje Original',
      'Tipo',
      'Proyecto',
      'Persona',
      'Horas',
      'Tarea'
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'A1:I1',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [headers]
      }
    });

    // Aplicar formato
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.2, green: 0.5, blue: 0.8 },
                  textFormat: {
                    bold: true,
                    foregroundColor: { red: 1, green: 1, blue: 1 }
                  }
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)'
            }
          }
        ]
      }
    });

    console.log('   ✅ Encabezados restaurados y formateados');

    console.log('\n✅ ¡Hoja limpiada exitosamente!');
    console.log('   La hoja está lista para recibir nuevos registros desde WhatsApp\n');
    console.log('📊 Abre tu hoja aquí:');
    console.log(`   https://docs.google.com/spreadsheets/d/${spreadsheetId}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Detalles:', error.response.data);
    }
  }
}

limpiarSheet();
