# Testing in VS Code

## Prerequisites
1. Install REST Client extension for VS Code
   - Open VS Code Extensions (Ctrl+Shift+X)
   - Search for "REST Client"
   - Install "REST Client" by Huachao Mao

## Running the Application

1. Start the main application:
   ```bash
   npm run dev
   ```

2. Start the test API (in a new terminal):
   ```bash
   npm run test-api
   ```

## Testing Endpoints

1. Open `test-api/test.http`
2. Click "Send Request" above any request to test it
3. View results in the "Response" panel

## Available Test Endpoints

1. Normal Requests:
   - GET http://localhost:3000/api/test
   - POST http://localhost:3000/api/test

2. SQL Injection Test:
   - GET http://localhost:3000/api/users?id=1 OR 1=1

3. XSS Test:
   - POST http://localhost:3000/api/comments
   - Body: {"comment": "<script>alert(1)</script>"}

4. Path Traversal Test:
   - GET http://localhost:3000/api/files?path=../../../etc/passwd

5. Command Injection Test:
   - POST http://localhost:3000/api/execute
   - Body: {"command": "ls; rm -rf /"}

6. Rate Limiting Test:
   - GET http://localhost:3000/api/stress-test