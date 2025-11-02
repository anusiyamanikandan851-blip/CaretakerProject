const http = require('http');

function get(path) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: '127.0.0.1',
      port: 5000,
      path,
      method: 'GET',
      timeout: 3000,
    };

    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy(new Error('timeout'));
    });
    req.end();
  });
}

(async () => {
  try {
    console.log('Probing http://127.0.0.1:5000/');
    const root = await get('/');
    console.log('/ ->', root.status, root.body);

    console.log('Probing http://127.0.0.1:5000/api/auth/profile');
    const profile = await get('/api/auth/profile');
    console.log('/api/auth/profile ->', profile.status, profile.body);
  } catch (err) {
    console.error('Probe error:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
