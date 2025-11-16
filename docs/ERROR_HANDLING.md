# Error Handling Architecture

This document describes the comprehensive error handling system implemented in Pixel Prompt Complete.

## Overview

The error handling system provides:
- **Frontend Error Boundaries**: Catch React component errors and prevent white screens
- **Centralized Logging**: All errors logged to CloudWatch with structured JSON
- **Correlation ID Tracing**: Track requests from frontend through backend
- **Retry Logic**: Automatic retries for transient S3 errors
- **User-Friendly Messages**: Clear, actionable error messages for users

## Architecture

### Frontend Error Flow

```
User Action
  ↓
React Component Error
  ↓
Error Boundary Catches Error
  ↓
Error Logged to Backend /log Endpoint
  ↓
CloudWatch Logs (with Correlation ID)
  ↓
Fallback UI Shown to User
```

### Backend Error Flow

```
API Request (with X-Correlation-ID header)
  ↓
Lambda Handler Extracts Correlation ID
  ↓
Request Processed
  ↓
If Error Occurs:
  ↓
Structured Logger Logs Error
  ↓
CloudWatch Logs (with Correlation ID)
  ↓
Error Response Returned
```

## Components

### 1. React Error Boundaries

**Location**: `frontend/src/components/features/errors/ErrorBoundary.jsx`

Error boundaries catch errors during:
- Component rendering
- Lifecycle methods
- Constructors of child components

**Key Features**:
- Logs errors to CloudWatch via `/log` endpoint
- Generates correlation ID for each error
- Displays fallback UI instead of blank screen
- Supports custom fallback components
- Can reset error state

**Usage**:
```jsx
<ErrorBoundary fallback={ErrorFallback} componentName="MyComponent">
  <MyComponent />
</ErrorBoundary>
```

### 2. Frontend Error Logging

**Location**: `frontend/src/utils/logger.js`

Centralized logging utility that sends errors to CloudWatch.

**Features**:
- Log levels: ERROR, WARNING, INFO, DEBUG
- Automatic correlation ID generation
- Error deduplication (1-minute window)
- Graceful failure (logging errors don't crash app)
- Browser metadata included

**Usage**:
```javascript
import { logError } from '../utils/logger';

try {
  // risky operation
} catch (error) {
  logError('Operation failed', error, {
    component: 'MyComponent',
    action: 'submit'
  });
}
```

### 3. Backend Logging Endpoint

**Location**: `backend/src/api/log.py`

POST endpoint that receives frontend logs and writes to CloudWatch.

**Request Format**:
```json
{
  "level": "ERROR",
  "message": "Error message",
  "stack": "Error stack trace",
  "metadata": {
    "component": "ErrorBoundary",
    "userAgent": "Mozilla/5.0..."
  }
}
```

**Headers**:
- `X-Correlation-ID`: UUID for request tracing

**Rate Limiting**: 100 logs per hour per IP

### 4. Correlation IDs

**Frontend**: `frontend/src/utils/correlation.js`
**Backend**: Extracted in `backend/src/lambda_function.py`

Correlation IDs enable end-to-end request tracing.

**Flow**:
1. Frontend generates UUIDv4 for each API request
2. Added to `X-Correlation-ID` header
3. Backend extracts from headers (or generates if missing)
4. Included in all log entries
5. Searchable in CloudWatch Logs

**Usage**:
```javascript
// Frontend - automatic in API client
const response = await generateImages(prompt, params);
// Correlation ID automatically added to headers

// Backend - automatic in handlers
def handle_generate(event, correlation_id=None):
    StructuredLogger.info("Processing request", correlation_id=correlation_id)
```

### 5. S3 Retry Logic

**Location**: `backend/src/utils/retry.py`

Automatic retry with exponential backoff for transient S3 errors.

**Retry Strategy**:
- Max retries: 3
- Delays: 1s, 2s, 4s (exponential backoff)
- Max delay cap: 4s

**Retryable Errors**:
- 503 SlowDown
- 500 InternalError
- Network errors (ConnectionError, TimeoutError)

**Permanent Errors** (no retry):
- 403 Forbidden
- 404 NotFound
- 400 BadRequest

**Usage**:
```python
from utils.retry import retry_with_backoff

@retry_with_backoff(max_retries=3, base_delay=1.0)
def upload_to_s3(bucket, key, data):
    s3_client.put_object(Bucket=bucket, Key=key, Body=data)
```

### 6. Structured Logging

**Location**: `backend/src/utils/logger.py`

JSON-formatted logging for CloudWatch.

**Log Entry Format**:
```json
{
  "timestamp": "2025-11-16T02:00:00Z",
  "level": "ERROR",
  "message": "Job failed",
  "correlationId": "uuid-v4",
  "metadata": {
    "jobId": "...",
    "error": "..."
  }
}
```

**Usage**:
```python
from utils.logger import StructuredLogger

StructuredLogger.error(
    "Operation failed",
    correlation_id="abc-123",
    jobId=job_id,
    reason="timeout"
)
```

## Error Types

### Frontend Errors

1. **Component Render Errors**: Caught by Error Boundaries
2. **API Errors**: HTTP errors from backend
3. **Network Errors**: Connection failures
4. **Validation Errors**: Invalid user input

### Backend Errors

1. **S3 Errors**: Transient (retried) or permanent
2. **API Errors**: External AI provider failures
3. **Validation Errors**: Invalid request data
4. **Rate Limit Errors**: Too many requests

## Debugging

### Finding Errors by Correlation ID

1. Get correlation ID from error message or Network tab
2. Open CloudWatch Logs console
3. Select log group: `/aws/lambda/pixel-prompt-function`
4. Use CloudWatch Insights query:

```
fields @timestamp, @message
| filter correlationId = "YOUR-CORRELATION-ID"
| sort @timestamp desc
```

### Common Queries

**All errors in last hour**:
```
fields @timestamp, level, message, correlationId
| filter level = "ERROR"
| filter @timestamp > ago(1h)
| sort @timestamp desc
```

**Rate limit violations**:
```
fields @timestamp, message, metadata.ip
| filter message like /Rate limit exceeded/
| sort @timestamp desc
```

**Failed image generations**:
```
fields @timestamp, correlationId, metadata.jobId
| filter message like /Job.*failed/
| sort @timestamp desc
```

## Best Practices

### Frontend

1. **Always wrap independent sections** in separate Error Boundaries
2. **Include correlation ID** in all error logs
3. **Provide context** in error metadata (component name, user action)
4. **Test error boundaries** by throwing errors in development

### Backend

1. **Use structured logging** for all log statements
2. **Include correlation ID** in all logs
3. **Retry transient errors** but fail fast on permanent errors
4. **Log retry attempts** with correlation ID

### General

1. **Never log sensitive data** (credentials, PII)
2. **Use appropriate log levels** (ERROR for failures, INFO for success)
3. **Keep error messages actionable** for users
4. **Test error scenarios** regularly

## Testing

### Frontend

```bash
npm test -- ErrorBoundary.test.jsx
npm test -- logger.test.js
```

### Backend

```bash
pytest tests/unit/test_log_endpoint.py
pytest tests/unit/test_retry.py
pytest tests/integration/test_correlation_ids.py
```

## Limitations

1. **CloudWatch access required**: No custom dashboard for viewing logs
2. **Client-side deduplication only**: Same error from multiple users logs multiple times
3. **No circuit breaker**: Retry logic doesn't implement circuit breaker pattern
4. **Error Boundaries don't catch**:
   - Event handler errors
   - Asynchronous code errors (use try/catch)
   - Server-side rendering errors

## Future Improvements

1. Add custom CloudWatch dashboard for error visualization
2. Implement circuit breaker for external API calls
3. Add error analytics and alerting
4. Create error recovery workflows for common failures
