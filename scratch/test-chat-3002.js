import http from 'http';

const data = JSON.stringify({
  message: 'What are high impact opportunities?',
  actionType: 'explain',
  context: {
    courseId: 'CK-MODULE-5',
    courseName: 'Creative Thinking and AI',
    lessonTitle: 'Find high-impact AI opportunities'
  }
});

const req = http.request({
  hostname: 'localhost',
  port: 3002,
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
    console.log('STATUS:', res.statusCode);
    console.log('RESPONSE:', body);
  });
});

req.on('error', (err) => {
  console.error('Request Error:', err);
});

req.write(data);
req.end();
