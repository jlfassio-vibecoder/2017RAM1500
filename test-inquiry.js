import http from 'http';

const data = JSON.stringify({ name: 'Test User', phone: '123-456-7890', email: 'test@example.com', message: 'Hello' });

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/inquiries',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => console.log('Response:', body));
});

req.on('error', (e) => console.error(e));
req.write(data);
req.end();
