import http from 'http';

const data = JSON.stringify({ mileage: '90000', subtitle: 'Test subtitle' });

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/truck-details',
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
