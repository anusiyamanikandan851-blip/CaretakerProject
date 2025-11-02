const http = require('http');
http.get('http://localhost:8082', res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('STATUS', res.statusCode);
    console.log(data.slice(0, 4000));
  });
}).on('error', err => {
  console.error('ERROR', err.message);
});
