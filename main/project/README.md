# AI Web Application Firewall (WAF)

A modern web application firewall powered by AI/ML for real-time threat detection and protection.

## Features

- Real-time traffic monitoring
- AI-powered threat detection
- IP blocking and management
- Protected sites management
- Botnet detection
- Beautiful real-time dashboard

## Getting Started

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd ai-waf
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Start the test API server (in a new terminal):
   ```bash
   npm run test-api
   ```

## Testing the WAF

1. Open the application in your browser
2. Sign up for a new account
3. Add a test site to protect (e.g., "http://localhost:3000")
4. Use the test API endpoints to verify WAF functionality:

   - Normal requests:

     ```
     GET http://localhost:3000/api/test
     POST http://localhost:3000/api/test
     ```

   - SQL Injection test:

     ```
     GET http://localhost:3000/api/users?id=1 OR 1=1
     ```

   - XSS test:

     ```
     POST http://localhost:3000/api/comments
     Body: {"comment": "<script>alert(1)</script>"}
     ```

   - Path traversal test:

     ```
     GET http://localhost:3000/api/files?path=../../../etc/passwd
     ```

   - Command injection test:

     ```
     POST http://localhost:3000/api/execute
     Body: {"command": "ls; rm -rf /"}
     ```

   - Rate limiting test:
     ```
     GET http://localhost:3000/api/stress-test
     ```

## Architecture

- Frontend: React + TypeScript + Vite
- State Management: React Hooks
- Database: Supabase
- AI/ML: Edge Functions
- Test API: Express

## Environment Variables

Create a `.env` file with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Development

1. Main application:

   ```bash
   npm run dev
   ```

2. Test API server:
   ```bash
   npm run test-api
   ```

## Testing

Use the provided test API endpoints to verify WAF functionality. Monitor the dashboard for:

- Blocked requests
- Detected threats
- IP blocking
- Traffic patterns
- Real-time metrics
