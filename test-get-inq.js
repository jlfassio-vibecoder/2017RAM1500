import http from 'http';

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/admin/inquiries',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => console.log('Response:', body));
});

req.on('error', (e) => console.error(e));
req.end();
