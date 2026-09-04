import http from 'http';

const data = JSON.stringify({
  message: 'What is generative AI?',
  actionType: 'explain',
  context: {
    courseId: 'CK-101',
    courseName: 'Test Course',
    lessonTitle: 'Intro to AI'
  }
});

const req = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/api/chat',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response Body:', body);
  });
});

req.on('error', (err) => {
  console.error('Request Error:', err);
});

req.write(data);
req.end();
