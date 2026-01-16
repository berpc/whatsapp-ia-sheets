require('dotenv').config({ path: './credentials/.env' });
const twilio = require('twilio');

console.log('🔐 Verificando credenciales de Twilio...\n');
console.log('Account SID:', process.env.TWILIO_ACCOUNT_SID);
console.log('Auth Token:', process.env.TWILIO_AUTH_TOKEN ? '***' + process.env.TWILIO_AUTH_TOKEN.slice(-4) : 'NO CONFIGURADO');
console.log('WhatsApp Number:', process.env.TWILIO_WHATSAPP_NUMBER);
console.log('');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Intentar verificar las credenciales
client.api.accounts(process.env.TWILIO_ACCOUNT_SID)
  .fetch()
  .then(account => {
    console.log('✅ ¡Credenciales de Twilio CORRECTAS!');
    console.log('📱 Cuenta:', account.friendlyName);
    console.log('📊 Estado:', account.status);
  })
  .catch(error => {
    console.error('❌ Error de autenticación de Twilio:');
    console.error('   Código:', error.code);
    console.error('   Mensaje:', error.message);
    console.error('   Más info:', error.moreInfo);
    console.error('');
    console.error('🔧 SOLUCIÓN:');
    console.error('   1. Ve a https://console.twilio.com/');
    console.error('   2. Copia tu Auth Token correcto');
    console.error('   3. Actualiza TWILIO_AUTH_TOKEN en credentials/.env');
  });
