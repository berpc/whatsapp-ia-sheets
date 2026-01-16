const http = require('http');

http.get('http://localhost:4040/api/requests/http', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    console.log('📊 Total de peticiones recibidas:', json.requests.length);
    console.log('\n📱 Últimos 5 mensajes de WhatsApp:\n');

    json.requests.slice(0, 5).forEach((req, i) => {
      const body = decodeURIComponent(Buffer.from(req.request.raw, 'base64').toString());
      const bodyMatch = body.match(/Body=([^&]+)/);
      const mensaje = bodyMatch ? decodeURIComponent(bodyMatch[1].replace(/\+/g, ' ')) : 'N/A';
      const status = req.response ? req.response.status_code : 'Sin respuesta';

      console.log(`${i+1}. Hora: ${req.start}`);
      console.log(`   Mensaje: ${mensaje}`);
      console.log(`   Status del servidor: ${status}`);
      console.log(`   Duración: ${(req.duration / 1000000).toFixed(0)}ms`);
      console.log('');
    });
  });
}).on('error', (e) => {
  console.error('Error:', e.message);
});
