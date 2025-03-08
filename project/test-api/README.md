# WAF Test API

This is a test API to verify the functionality of the AI Web Application Firewall (WAF).

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the test server:
   ```bash
   npm run test-api
   ```

## Test Endpoints

1. Normal Requests:
   - GET `/api/test` - Basic GET request
   - POST `/api/test` - Basic POST request

2. SQL Injection Test:
   - GET `/api/users?id=1 OR 1=1`
   - Tests WAF's ability to detect SQL injection attempts

3. XSS Test:
   - POST `/api/comments`
   - Body: `{"comment": "<script>alert(1)</script>"}`
   - Tests WAF's ability to detect cross-site scripting attempts

4. Path Traversal Test:
   - GET `/api/files?path=../../../etc/passwd`
   - Tests WAF's ability to detect path traversal attempts

5. Command Injection Test:
   - POST `/api/execute`
   - Body: `{"command": "ls; rm -rf /"}`
   - Tests WAF's ability to detect command injection attempts

6. Rate Limiting Test:
   - GET `/api/stress-test`
   - Send multiple requests quickly to test rate limiting

## Using the Test File

The `test.http` file contains ready-to-use HTTP requests. If you're using VS Code with the REST Client extension, you can send requests directly from the file.

## Expected Behavior

- Normal requests should pass through
- Malicious requests should be blocked with a 403 status
- High-frequency requests should be rate limited
- All requests should be logged for analysis

## Monitoring

Check the WAF dashboard to see:
- Blocked requests
- Threat types detected
- IP addresses flagged
- Real-time traffic analysis