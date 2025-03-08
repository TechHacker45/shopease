import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { URL } from 'url';

// Load environment variables from .env file
dotenv.config();

import { WAFService } from '../src/services/WAFService';

const app = express();
const port = 3000;

// Initialize WAF service
const wafService = WAFService.getInstance();

// Middleware
app.use(cors());
app.use(express.json());

// Middleware to log all requests
app.use(async (req, res, next) => {
  const start = Date.now();
  const fullUrl = `http://${req.get('host')}${req.originalUrl}`;
  
  // Clone the request for WAF analysis
  const requestClone = new Request(fullUrl, {
    method: req.method,
    headers: new Headers(req.headers as any),
    body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
  });

  try {
    // Check if request should be blocked
    const isAllowed = await wafService.processRequest(requestClone);
    
    if (!isAllowed) {
      console.log('Request blocked by WAF:', {
        url: fullUrl,
        method: req.method,
        headers: req.headers,
        body: req.body
      });
      return res.status(403).json({
        error: 'Request blocked by WAF',
        timestamp: new Date().toISOString()
      });
    }

    // Log successful request
    console.log('Request allowed:', {
      url: fullUrl,
      method: req.method,
      duration: Date.now() - start
    });

    next();
  } catch (error) {
    console.error('WAF Error:', error);
    console.error('Request details:', {
      url: fullUrl,
      method: req.method,
      headers: req.headers,
      body: req.body
    });
    res.status(500).json({ error: 'WAF processing error' });
  }
});

// Test endpoints
app.get('/api/test', (req, res) => {
  res.json({ message: 'Normal GET request' });
});

app.post('/api/test', (req, res) => {
  res.json({ message: 'Normal POST request', body: req.body });
});

// SQL Injection test endpoint
app.get('/api/users', (req, res) => {
  const { id } = req.query;
  res.json({ message: `Querying user with ID: ${id}` });
});

// XSS test endpoint
app.post('/api/comments', (req, res) => {
  const { comment } = req.body;
  res.json({ message: 'Comment received', comment });
});

// Path traversal test endpoint
app.get('/api/files', (req, res) => {
  const { path } = req.query;
  res.json({ message: `Accessing file: ${path}` });
});

// Command injection test endpoint
app.post('/api/execute', (req, res) => {
  const { command } = req.body;
  res.json({ message: `Executing command: ${command}` });
});

// Rate limiting test endpoint
app.get('/api/stress-test', (req, res) => {
  res.json({ message: 'Rate limit test endpoint' });
});

// Start server
app.listen(port, () => {
  console.log(`Test API running at http://localhost:${port}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('\nTest endpoints available:');
  console.log('1. Normal requests:');
  console.log('   GET  /api/test');
  console.log('   POST /api/test');
  console.log('\n2. SQL Injection test:');
  console.log('   GET  /api/users?id=1 OR 1=1');
  console.log('\n3. XSS test:');
  console.log('   POST /api/comments');
  console.log('   Body: {"comment": "<script>alert(1)</script>"}');
  console.log('\n4. Path traversal test:');
  console.log('   GET  /api/files?path=../../../etc/passwd');
  console.log('\n5. Command injection test:');
  console.log('   POST /api/execute');
  console.log('   Body: {"command": "ls; rm -rf /"}');
  console.log('\n6. Rate limiting test:');
  console.log('   GET  /api/stress-test (send multiple requests quickly)');
});