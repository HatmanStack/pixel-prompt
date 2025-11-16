# Troubleshooting Guide

This guide helps users and developers troubleshoot common issues with Pixel Prompt Complete.

## For Users

### Common Error Messages and Solutions

#### "Rate Limit Exceeded"

**Problem**: You've made too many requests in a short time period.

**Solution**:
- Wait for the time specified in the error message (usually 45-60 minutes)
- The rate limit resets automatically after the waiting period
- Consider spacing out your image generation requests

**Technical Details**: The system limits requests to prevent abuse and ensure fair usage for all users.

---

#### "Inappropriate Content Detected"

**Problem**: Your prompt contains content that violates our content policy.

**Solution**:
- Review your prompt and remove any inappropriate language or concepts
- Be specific and descriptive without using offensive terms
- Try rephrasing your prompt in a different way

**Technical Details**: We use content filtering to maintain a safe and appropriate platform for all users.

---

#### "Prompt Too Long"

**Problem**: Your prompt exceeds the maximum character limit.

**Solution**:
- Shorten your prompt to 1000 characters or less
- Focus on the most important details
- Remove unnecessary words while keeping the core description
- For prompt enhancement, keep prompts under 500 characters

**Technical Details**: Longer prompts can cause processing issues and may not improve image quality.

---

#### "Job Not Found"

**Problem**: The image generation job cannot be located.

**Solution**:
- Jobs expire after 24 hours - if you waited too long, the results may have been cleaned up
- Check that you're using the correct job ID
- Try generating a new image if the job is old

**Technical Details**: Jobs are stored temporarily and cleaned up automatically to manage storage.

---

#### "Request Timeout"

**Problem**: The request took too long to complete.

**Solution**:
- Check your internet connection
- Try again in a few minutes
- If the problem persists, the service may be experiencing high load

**Technical Details**: Requests have a 30-second timeout to prevent hanging connections.

---

#### "Connection Failed"

**Problem**: Unable to connect to the server.

**Solution**:
- Check your internet connection
- Try refreshing the page
- Verify that you can access other websites
- If the problem persists, the service may be down for maintenance

**Technical Details**: This usually indicates a network connectivity issue between your browser and our servers.

---

## For Developers

### Using Correlation IDs for Debugging

Every request in Pixel Prompt Complete is assigned a unique correlation ID (UUID v4) that flows through the entire request chain:

1. **Frontend generates** correlation ID when making API request
2. **Backend receives** correlation ID in `X-Correlation-ID` header
3. **All logs include** correlation ID for request tracing
4. **CloudWatch Logs** can be searched by correlation ID

### How to Get a Correlation ID

#### From Browser DevTools (Network Tab)

1. Open DevTools (F12)
2. Go to Network tab
3. Find the failed request
4. Check Headers → Request Headers → `X-Correlation-ID`
5. Copy the UUID value

#### From Error Boundary UI

When an error boundary catches an error, the correlation ID is displayed:
```
Error ID: 550e8400-e29b-41d4-a716-446655440000
```

#### From Backend Logs

All backend logs include `correlationId` field:
```json
{
  "timestamp": "2025-11-16T10:30:45Z",
  "level": "ERROR",
  "message": "Job failed",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### CloudWatch Insights Queries

#### Find All Logs for a Specific Request

```
fields @timestamp, @message, level, message, correlationId
| filter correlationId = "550e8400-e29b-41d4-a716-446655440000"
| sort @timestamp asc
```

This returns all log entries (frontend and backend) for a specific request in chronological order.

---

#### Find All Errors in Last Hour

```
fields @timestamp, level, message, correlationId, @message
| filter level = "ERROR"
| filter @timestamp > ago(1h)
| sort @timestamp desc
| limit 100
```

Returns the 100 most recent errors from the last hour.

---

#### Find Rate Limit Violations

```
fields @timestamp, message, metadata.ip, correlationId
| filter message like /Rate limit exceeded/
| stats count() by metadata.ip
| sort count() desc
```

Shows which IPs are hitting rate limits most frequently.

---

#### Find Failed Image Generation Jobs

```
fields @timestamp, metadata.jobId, message, correlationId
| filter message like /Job.*failed/
| sort @timestamp desc
```

Returns all failed image generation jobs with their job IDs.

---

#### Find Slow Requests (Backend)

```
fields @timestamp, @duration, message, correlationId
| filter @duration > 10000
| sort @duration desc
```

Find requests that took longer than 10 seconds.

---

#### Find S3 Retry Attempts

```
fields @timestamp, message, correlationId
| filter message like /Retry.*for.*after/
| stats count() by correlationId
| sort count() desc
```

Shows which requests required the most S3 retries.

---

#### Find Content Filter Blocks

```
fields @timestamp, correlationId, metadata.ip
| filter message like /Inappropriate content/
| stats count() by metadata.ip
| sort count() desc
```

Shows IPs that triggered content filtering.

---

#### Frontend Error Logs

```
fields @timestamp, level, message, correlationId, metadata.userAgent
| filter level = "ERROR"
| filter metadata.url like /localhost/
| sort @timestamp desc
```

Frontend errors during development (localhost).

---

### Tracing a Request End-to-End

To trace a complete request from frontend to backend:

1. **Get correlation ID** from browser DevTools or error message

2. **Query CloudWatch** with correlation ID:
```
fields @timestamp, @message, level, message
| filter correlationId = "YOUR-CORRELATION-ID-HERE"
| sort @timestamp asc
```

3. **Analyze the timeline**:
   - Frontend: Error logged via `/log` endpoint
   - Backend: Request received
   - Backend: Request processing (job creation, validation, etc.)
   - Backend: Response sent
   - Frontend: Response received

4. **Look for errors** at any stage:
   - Validation errors
   - Rate limiting
   - Content filtering
   - S3 errors with retry attempts
   - External API failures

### Common Issues and Solutions

#### Issue: "Import error in Lambda function"

**Cause**: Missing dependency or incorrect import path

**Solution**:
- Check `requirements.txt` includes all dependencies
- Verify import paths use absolute imports (e.g., `from utils.logger import ...`)
- Redeploy Lambda function with updated dependencies

---

#### Issue: "CORS error in browser"

**Cause**: Missing or incorrect CORS headers

**Solution**:
- Verify `X-Correlation-ID` is included in `Access-Control-Allow-Headers`
- Check API Gateway CORS configuration
- Ensure all endpoints return proper CORS headers

---

#### Issue: "S3 403 Forbidden"

**Cause**: Lambda function doesn't have permission to access S3 bucket

**Solution**:
- Check Lambda execution role has S3 permissions
- Verify bucket name is correct in environment variables
- Check bucket policy allows Lambda function access

---

#### Issue: "Test timeouts"

**Cause**: Tests waiting for async operations

**Solution**:
- Increase timeout in test: `vi test.setTimeout(10000)`
- Ensure mocks return promises
- Check for race conditions in async test code

---

### Testing Error Scenarios

#### Trigger Rate Limit Error

```bash
# Make multiple requests quickly
for i in {1..20}; do
  curl -X POST https://your-api.com/generate \
    -H "Content-Type: application/json" \
    -d '{"prompt": "test"}' &
done
```

#### Trigger Content Filter

```bash
curl -X POST https://your-api.com/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "inappropriate content here"}'
```

#### Trigger Validation Error

```bash
# Missing prompt
curl -X POST https://your-api.com/generate \
  -H "Content-Type: application/json" \
  -d '{}'
```

#### Trigger Job Not Found

```bash
curl https://your-api.com/status/invalid-job-id-123
```

### Performance Monitoring

#### Average Request Duration

```
fields @duration
| stats avg(@duration) as avg_duration,
        max(@duration) as max_duration,
        min(@duration) as min_duration
| filter @duration > 0
```

#### Request Volume by Hour

```
fields @timestamp
| stats count() as request_count by bin(1h)
| sort @timestamp desc
```

#### Error Rate

```
fields level
| stats count(*) as total,
        sum(level = "ERROR") as errors
| fields errors / total * 100 as error_rate
```

### Debug Mode

To enable additional debugging:

1. **Frontend**: Check browser console for detailed error messages
2. **Backend**: CloudWatch Logs show all structured log entries
3. **Integration Tests**: Run with `--verbose` flag for detailed output

### Getting Help

If you can't resolve an issue:

1. **Collect information**:
   - Correlation ID
   - Error message
   - CloudWatch Insights query results
   - Steps to reproduce

2. **Check documentation**:
   - [ERROR_HANDLING.md](./ERROR_HANDLING.md) - Error handling architecture
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
   - [API.md](./API.md) - API documentation

3. **Report issue**:
   - GitHub Issues: Include correlation ID and error details
   - Provide CloudWatch Logs excerpt if possible
   - Include browser/environment information
