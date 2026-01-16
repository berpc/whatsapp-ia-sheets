const ngrok = require('ngrok');

(async function() {
  try {
    console.log('🔄 Conectando con ngrok...');

    const url = await ngrok.connect(3000);

    console.log('\n🌍 ========================================');
    console.log('   ngrok Túnel Iniciado');
    console.log('   ========================================');
    console.log(`   📡 URL Pública: ${url}`);
    console.log(`   📱 Webhook: ${url}/webhook/whatsapp`);
    console.log('   ========================================\n');
    console.log('   ⚠️  Copia el Webhook URL para configurar en Twilio\n');
    console.log('   Presiona Ctrl+C para detener\n');

    // Mantener el proceso corriendo
    process.on('SIGINT', async () => {
      console.log('\n🛑 Deteniendo ngrok...');
      await ngrok.disconnect();
      await ngrok.kill();
      process.exit();
    });
  } catch (error) {
    console.error('❌ Error iniciando ngrok:', error.message);
    console.error('   Detalles:', error);
    process.exit(1);
  }
})();
