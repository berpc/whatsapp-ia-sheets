require('dotenv').config({ path: './credentials/.env' });
const { google } = require('googleapis');

async function setupHeaders() {
  try {
    console.log('📊 Configurando encabezados de Google Sheets...\n');

    // Configurar autenticación
    const credentialsPath = process.env.GOOGLE_CREDENTIALS_PATH || './credentials/credentials.json';
    const auth = new google.auth.GoogleAuth({
      keyFile: credentialsPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // 1. Leer la primera fila para ver si ya tiene encabezados
    console.log('1️⃣ Verificando encabezados existentes...');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'A1:I1',
    });

    const firstRow = response.data.values ? response.data.values[0] : [];
    console.log('   Primera fila actual:', firstRow);

    // 2. Definir encabezados
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

    // 3. Si la primera fila no tiene "Fecha", agregar encabezados
    if (!firstRow || firstRow[0] !== 'Fecha') {
      console.log('\n2️⃣ Insertando encabezados...');

      // Insertar fila en la posición 1
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [{
            insertDimension: {
              range: {
                sheetId: 0,
                dimension: 'ROWS',
                startIndex: 0,
                endIndex: 1
              }
            }
          }]
        }
      });

      // Agregar los encabezados
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'A1:I1',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [headers]
        }
      });

      console.log('   ✅ Encabezados insertados');
    } else {
      console.log('   ✅ Los encabezados ya existen');
    }

    // 4. Formatear la hoja
    console.log('\n3️⃣ Aplicando formato...');
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [
          // Hacer la primera fila en negrita
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
          },
          // Congelar la primera fila
          {
            updateSheetProperties: {
              properties: {
                sheetId: 0,
                gridProperties: {
                  frozenRowCount: 1
                }
              },
              fields: 'gridProperties.frozenRowCount'
            }
          },
          // Ajustar ancho de columnas
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: 0,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 9
              }
            }
          }
        ]
      }
    });

    console.log('   ✅ Formato aplicado');

    console.log('\n✅ ¡Configuración completada exitosamente!');
    console.log('\n📊 Abre tu hoja aquí:');
    console.log(`   https://docs.google.com/spreadsheets/d/${spreadsheetId}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Detalles:', error.response.data);
    }
  }
}

setupHeaders();
