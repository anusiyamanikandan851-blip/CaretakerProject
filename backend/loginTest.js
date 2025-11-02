const http = require('http');

const payload = JSON.stringify({
  email: 'john@example.com',
  password: 'password123'
});

const opts = {
  hostname: '127.0.0.1',
  port: 5000,
  path: '/api/auth/signin',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  },
  timeout: 5000
};

const req = http.request(opts, (res) => {
  let data = '';
  res.on('data', (c) => data += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      console.log('Body:', JSON.parse(data));
    } catch (e) {
      console.log('Body (raw):', data);
    }
  });
});

req.on('error', (err) => console.error('Request error:', err));
req.on('timeout', () => { req.destroy(new Error('timeout')); });
req.write(payload);
req.end();
