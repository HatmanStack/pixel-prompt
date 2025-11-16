# Phase 2: Error Handling & Resilience

## Phase Goal

Implement comprehensive error handling across frontend and backend to prevent user-facing failures, provide actionable error messages, and enable effective debugging through structured logging with correlation IDs. This phase adds React Error Boundaries, CloudWatch logging for frontend errors, retry logic for S3 operations, and request tracing throughout the system.

**Success Criteria:**
- React Error Boundaries prevent white screen crashes
- All frontend errors logged to CloudWatch via backend endpoint
- Correlation IDs trace requests from frontend through backend
- S3 operations retry with exponential backoff
- User-facing error messages are clear and actionable
- Error logging tested and verified in staging environment

**Estimated Tokens:** ~90,000

---

## Prerequisites

- Phase 0 reviewed (error handling patterns documented)
- Phase 1 complete (tests established to verify error handling)
- Backend deployed to AWS (for CloudWatch logging)

---

## Tasks

### Task 1: Backend Logging Endpoint

**Goal:** Create new `/log` API endpoint that accepts frontend error logs and writes them to CloudWatch Logs with structured JSON format, enabling centralized error tracking.

**Files to Modify/Create:**
- `backend/src/api/log.py` - New logging endpoint
- `backend/src/lambda_function.py` - Add route for `/log`
- `backend/src/utils/logger.py` - Structured logging utility
- `backend/tests/unit/test_log_endpoint.py` - Unit tests

**Prerequisites:**
- None (first task in phase)

**Implementation Steps:**

1. **Create Structured Logging Utility**
   - Create `logger.py` with function to format log entries as JSON
   - Include fields: timestamp, level, message, correlationId, metadata
   - Use Python's `logging` module for CloudWatch integration
   - Support different log levels (ERROR, WARNING, INFO, DEBUG)

2. **Implement Log Endpoint**
   - Create POST `/log` endpoint in `log.py`
   - Accept JSON body with: level, message, correlationId, stack, metadata
   - Validate input (required fields, log level enum)
   - Write to CloudWatch using structured logger
   - Return 200 OK on success, 400 on invalid input

3. **Add CORS Support**
   - Ensure `/log` endpoint has CORS headers (same as other endpoints)
   - Allow POST method from frontend origin
   - Handle preflight OPTIONS requests

4. **Add Route to Lambda Handler**
   - Update `lambda_function.py` to route `/log` to new handler
   - Extract correlation ID from headers (X-Correlation-ID)
   - Pass correlation ID to logging function

5. **Add Rate Limiting**
   - Apply rate limiting to `/log` endpoint (prevent log spam attacks)
   - Lower limit than generate endpoint (e.g., 100 logs/hour per IP)
   - Return 429 if limit exceeded

6. **Write Unit Tests**
   - Test successful log writing
   - Test validation (missing fields, invalid log level)
   - Test correlation ID extraction
   - Test rate limiting
   - Mock CloudWatch logging to avoid actual writes

**Verification Checklist:**
- [ ] POST /log returns 200 with valid payload
- [ ] Logs appear in CloudWatch Logs console
- [ ] Correlation ID included in CloudWatch log entries
- [ ] Invalid requests return 400 with error message
- [ ] Rate limiting enforced (429 after limit)
- [ ] Unit tests pass for all scenarios

**Testing Instructions:**
```bash
# Unit tests
pytest tests/unit/test_log_endpoint.py -v

# Manual test (requires deployed API)
curl -X POST $API_ENDPOINT/log \
  -H "Content-Type: application/json" \
  -H "X-Correlation-ID: test-123" \
  -d '{"level":"ERROR","message":"Test error","stack":"Error: test\n  at..."}'

# Check CloudWatch Logs in AWS console
# Should see structured JSON log entry
```

**Commit Message Template:**
```
feat(backend): add /log endpoint for frontend error logging

- Create structured logging utility with JSON formatting
- Implement POST /log endpoint with validation
- Add correlation ID extraction from headers
- Apply rate limiting to prevent log spam
- Write to CloudWatch Logs with structured format
- Add unit tests for logging endpoint
```

**Estimated Tokens:** ~12,000

---

### Task 2: Frontend Error Logging Utility

**Goal:** Create frontend utility to send errors to backend `/log` endpoint, including automatic correlation ID generation and error serialization.

**Files to Modify/Create:**
- `frontend/src/utils/logger.js` - Error logging client
- `frontend/src/utils/correlation.js` - UUID generation
- `frontend/src/__tests__/utils/logger.test.js` - Unit tests

**Prerequisites:**
- Task 1 complete (backend logging endpoint exists)

**Implementation Steps:**

1. **Create Correlation ID Utility**
   - Install `uuid` package: `npm install uuid`
   - Create function to generate UUIDv4
   - Store correlation ID in module scope for request batching
   - Create function to get current correlation ID

2. **Create Error Logging Client**
   - Create `logError()` function that sends to `/log` endpoint
   - Accept parameters: error object, context, correlation ID (optional)
   - Serialize error: message, stack trace, component name, user agent
   - Generate correlation ID if not provided
   - Send POST request to backend `/log` endpoint
   - Handle network failures gracefully (don't throw on logging failure)

3. **Add Log Levels**
   - Support ERROR, WARNING, INFO levels
   - Create separate functions: `logError()`, `logWarning()`, `logInfo()`
   - Default to ERROR for caught exceptions

4. **Add Metadata Support**
   - Allow passing additional context (component name, user action, props)
   - Include browser info (user agent, viewport size)
   - Include app state (current route, user session info if applicable)

5. **Implement Debouncing**
   - Prevent duplicate error logs for same error (within 1 minute)
   - Use error message + stack hash as deduplication key
   - Batch logs if multiple errors occur rapidly (send every 5 seconds)

6. **Write Unit Tests**
   - Test correlation ID generation
   - Test error serialization (stack trace extraction)
   - Test POST request formatting
   - Test network error handling (logging failure doesn't crash app)
   - Test deduplication (same error logged once)
   - Mock fetch calls with Vitest

**Verification Checklist:**
- [ ] logError() sends POST to /log endpoint
- [ ] Correlation ID generated and included in request
- [ ] Error stack trace properly serialized
- [ ] Network failures handled gracefully (no console errors)
- [ ] Duplicate errors deduplicated within 1 minute
- [ ] Unit tests pass for all scenarios

**Testing Instructions:**
```bash
npm test logger
npm test correlation

# Integration test (requires running backend)
# Manually trigger error in frontend and verify CloudWatch log
```

**Commit Message Template:**
```
feat(frontend): add error logging utility with CloudWatch integration

- Create UUID correlation ID generator
- Implement error logging client for /log endpoint
- Serialize error messages and stack traces
- Add deduplication to prevent log spam
- Handle network failures gracefully
- Add unit tests for logging utility
```

**Estimated Tokens:** ~10,000

---

### Task 3: React Error Boundaries

**Goal:** Implement React Error Boundary components to catch rendering errors, prevent white screen crashes, and display user-friendly fallback UI with error logging.

**Files to Modify/Create:**
- `frontend/src/components/features/errors/ErrorBoundary.jsx`
- `frontend/src/components/features/errors/ErrorFallback.jsx`
- `frontend/src/App.jsx` - Wrap sections with boundaries
- `frontend/src/__tests__/components/ErrorBoundary.test.jsx`

**Prerequisites:**
- Task 2 complete (error logging utility exists)

**Implementation Steps:**

1. **Create ErrorBoundary Component**
   - Implement class component with `componentDidCatch` lifecycle
   - Capture error and error info (component stack)
   - Log error to CloudWatch using logging utility from Task 2
   - Update state to trigger fallback UI
   - Include correlation ID in error log
   - Support reset functionality (clear error state)

2. **Create ErrorFallback Component**
   - Design user-friendly error message ("Something went wrong")
   - Include "Refresh Page" button to reload app
   - Include "Go Home" button to reset app state
   - Optionally show error details in development mode (not production)
   - Match app's visual design (use same CSS modules)

3. **Add Error Boundaries to App**
   - Wrap GenerationPanel in separate boundary
   - Wrap GalleryBrowser in separate boundary
   - Keep Header/Footer outside boundaries (always visible)
   - This ensures one section crashing doesn't break entire app

4. **Add Error Boundary Props**
   - Support `fallback` prop for custom fallback UI
   - Support `onError` callback for custom error handling
   - Support `resetKeys` prop to auto-reset when dependencies change

5. **Test Error Boundary**
   - Create test component that throws error on render
   - Verify ErrorBoundary catches error and shows fallback
   - Verify error logged to CloudWatch (mock logging utility)
   - Verify reset functionality clears error state
   - Test with different error types (render error, lifecycle error)

6. **Document Usage**
   - Add inline comments explaining error boundary placement
   - Document when to use multiple boundaries vs. single boundary
   - Note limitations (doesn't catch event handler errors)

**Verification Checklist:**
- [ ] ErrorBoundary catches render errors
- [ ] Fallback UI displays with friendly message
- [ ] Error logged to CloudWatch with stack trace
- [ ] Refresh button reloads page successfully
- [ ] Multiple boundaries isolate errors (one crash doesn't break all)
- [ ] Tests pass for error catching and logging

**Testing Instructions:**
```bash
npm test ErrorBoundary

# Manual test: temporarily add throw in component
# Verify fallback UI appears and error logged to CloudWatch
```

**Commit Message Template:**
```
feat(frontend): implement React Error Boundaries

- Create ErrorBoundary class component with error logging
- Create ErrorFallback with user-friendly UI
- Wrap GenerationPanel and GalleryBrowser independently
- Log errors to CloudWatch with correlation IDs
- Add reset functionality to recover from errors
- Add tests for error catching and fallback UI
```

**Estimated Tokens:** ~12,000

---

### Task 4: Correlation IDs Across Request Chain

**Goal:** Implement end-to-end request tracing by generating correlation IDs in frontend, passing through API Gateway, extracting in Lambda, and including in all CloudWatch logs.

**Files to Modify/Create:**
- `frontend/src/api/client.js` - Update to include correlation ID header
- `backend/src/lambda_function.py` - Extract and propagate correlation ID
- `backend/src/utils/logger.py` - Include correlation ID in all logs
- `backend/src/models/handlers.py` - Pass correlation ID to model handlers
- `backend/tests/integration/test_correlation_ids.py` - Integration test

**Prerequisites:**
- Task 1 and 2 complete (logging infrastructure exists)

**Implementation Steps:**

1. **Update Frontend API Client**
   - Generate correlation ID for each API request (generate, status, enhance)
   - Add `X-Correlation-ID` header to all fetch calls
   - Store correlation ID in component state or context for later use
   - Include correlation ID in error logs

2. **Extract Correlation ID in Lambda**
   - Update `lambda_function.py` handler to extract `X-Correlation-ID` header
   - Store in request context or thread-local storage
   - Generate new UUID if header missing (for direct API Gateway calls)
   - Pass to all downstream functions

3. **Update Structured Logger**
   - Modify `logger.py` to accept correlation ID parameter
   - Include correlation ID in all log entries
   - Create wrapper: `log_with_correlation(level, message, correlation_id, **kwargs)`

4. **Propagate Through Backend**
   - Update job manager to log with correlation ID
   - Update model handlers to log with correlation ID
   - Update storage operations to log with correlation ID
   - Update error handlers to log with correlation ID

5. **Update Integration Tests**
   - Send `X-Correlation-ID` header in test requests
   - Verify correlation ID appears in response (if applicable)
   - Verify correlation ID in CloudWatch logs (mock or check actual logs)

6. **Document Tracing**
   - Add TROUBLESHOOTING.md section on using correlation IDs
   - Explain how to search CloudWatch Logs by correlation ID
   - Provide example CloudWatch Insights query

**Verification Checklist:**
- [ ] Frontend generates and sends correlation ID in all requests
- [ ] Backend extracts correlation ID from headers
- [ ] All CloudWatch logs include correlation ID field
- [ ] Can trace single user request through entire system
- [ ] Integration tests verify correlation ID propagation

**Testing Instructions:**
```bash
# Integration test
pytest tests/integration/test_correlation_ids.py -v

# Manual verification
# 1. Generate image in frontend with browser DevTools open
# 2. Copy X-Correlation-ID from Network tab
# 3. Search CloudWatch Logs for that ID
# 4. Verify all related logs appear (job creation, model execution, S3 upload)
```

**Commit Message Template:**
```
feat: implement end-to-end correlation ID tracing

- Generate correlation IDs in frontend API client
- Extract correlation ID from headers in Lambda
- Include correlation ID in all CloudWatch logs
- Propagate through job manager and model handlers
- Add integration tests for correlation ID flow
- Document CloudWatch Insights queries for tracing
```

**Estimated Tokens:** ~15,000

---

### Task 5: S3 Retry Logic with Exponential Backoff

**Goal:** Add automatic retry logic for S3 operations (upload, download) with exponential backoff to handle transient errors and improve reliability.

**Files to Modify/Create:**
- `backend/src/utils/retry.py` - Retry decorator
- `backend/src/utils/storage.py` - Update S3 calls with retry
- `backend/tests/unit/test_retry.py` - Unit tests

**Prerequisites:**
- Task 4 complete (correlation ID logging in place)

**Implementation Steps:**

1. **Create Retry Decorator**
   - Create `retry_with_backoff()` decorator function
   - Accept parameters: max_retries (default 3), base_delay (default 1s)
   - Implement exponential backoff: 1s, 2s, 4s
   - Log each retry attempt with correlation ID
   - Re-raise exception after max retries exhausted

2. **Identify Retryable Errors**
   - Retry on transient S3 errors: 503 SlowDown, 500 InternalError
   - Retry on network errors: connection timeout, read timeout
   - Do NOT retry on permanent errors: 403 Forbidden, 404 NotFound
   - Use boto3 exception classes: `ClientError`, `BotoCoreError`

3. **Apply Retry to S3 Upload**
   - Decorate `upload_to_s3()` function in `storage.py`
   - Log retry attempts with correlation ID and error details
   - Update error messages to indicate retry count
   - Ensure retry doesn't duplicate uploads (idempotent key)

4. **Apply Retry to S3 Download**
   - Decorate image download function (if exists)
   - Apply same retry logic as upload
   - Log retry attempts

5. **Add Retry Metrics**
   - Count retry attempts per request
   - Log final success/failure with total retry count
   - Include in job result metadata ("uploaded after 2 retries")

6. **Write Unit Tests**
   - Test successful operation (no retries needed)
   - Test single retry (first fails, second succeeds)
   - Test max retries exhausted (all 3 fail)
   - Test exponential backoff timing (verify delays)
   - Mock S3 client to simulate errors
   - Test permanent errors not retried

**Verification Checklist:**
- [ ] S3 upload retries on transient errors
- [ ] Exponential backoff implemented (1s, 2s, 4s)
- [ ] Permanent errors fail immediately (no retries)
- [ ] Retry attempts logged with correlation ID
- [ ] Unit tests verify retry logic
- [ ] Integration tests show improved reliability

**Testing Instructions:**
```bash
pytest tests/unit/test_retry.py -v

# Simulate transient error by temporarily making S3 unavailable
# Verify retries occur and eventual success/failure logged
```

**Commit Message Template:**
```
feat(backend): add S3 retry logic with exponential backoff

- Create retry decorator with configurable parameters
- Implement exponential backoff (1s, 2s, 4s delays)
- Apply to S3 upload and download operations
- Log retry attempts with correlation IDs
- Distinguish retryable vs permanent errors
- Add unit tests for retry scenarios
```

**Estimated Tokens:** ~12,000

---

### Task 6: Improved User-Facing Error Messages

**Goal:** Replace generic error messages with specific, actionable messages that guide users to resolve issues (rate limits, invalid input, API failures).

**Files to Modify/Create:**
- `frontend/src/utils/errorMessages.js` - Error message mapping
- `frontend/src/components/common/ErrorMessage.jsx` - Reusable error component
- `backend/src/utils/error_responses.py` - Standardized error responses

**Prerequisites:**
- Task 3 complete (error boundaries in place)

**Implementation Steps:**

1. **Create Error Message Mapping**
   - Map HTTP status codes to user-friendly messages
   - Map specific error codes to detailed instructions
   - Examples:
     - 400: "Invalid input. Please check your prompt and parameters."
     - 429: "Rate limit exceeded. Please wait {X} minutes and try again."
     - 500: "Server error. Please try again in a few minutes."
     - Network error: "Connection failed. Please check your internet connection."

2. **Create Error Message Component**
   - Create reusable `ErrorMessage.jsx` component
   - Accept props: errorCode, errorMessage, retry callback
   - Display appropriate icon (⚠️ warning, ❌ error, ℹ️ info)
   - Show actionable button ("Retry", "Go Back", "Contact Support")
   - Style with CSS modules to match app design

3. **Standardize Backend Error Responses**
   - Create `error_responses.py` utility
   - Define consistent error response structure:
     ```python
     {
       "error": "RATE_LIMIT_EXCEEDED",
       "message": "Rate limit exceeded",
       "details": "You have made 51 requests today. Limit is 50 per day.",
       "retryAfter": 3600  # seconds
     }
     ```
   - Use across all endpoints (generate, status, enhance, log)

4. **Add Rate Limit Details**
   - Include retry-after information in 429 responses
   - Calculate time until limit resets
   - Return in human-readable format ("Try again in 45 minutes")

5. **Add Validation Details**
   - For 400 errors, specify which field is invalid
   - Examples: "Prompt is required", "Steps must be between 1 and 100"
   - Return field name and constraint violated

6. **Update Frontend Error Handling**
   - Parse error responses from backend
   - Extract error code and message
   - Pass to ErrorMessage component
   - Show retry button for retryable errors (429, 500, 503)
   - Hide retry button for permanent errors (400, 404)

7. **Write Tests**
   - Test error message mapping (all status codes covered)
   - Test ErrorMessage component rendering
   - Test retry button functionality
   - Test backend error response formatting

**Verification Checklist:**
- [ ] All error types have user-friendly messages
- [ ] Rate limit errors show retry-after time
- [ ] Validation errors specify which field is invalid
- [ ] ErrorMessage component displays correctly
- [ ] Retry button appears only for retryable errors
- [ ] Tests verify error message formatting

**Testing Instructions:**
```bash
# Frontend component test
npm test ErrorMessage

# Backend error response test
pytest tests/unit/test_error_responses.py -v

# Manual test: trigger each error type
# - Send empty prompt (400)
# - Exceed rate limit (429)
# - Invalid job ID (404)
# Verify user-friendly messages displayed
```

**Commit Message Template:**
```
feat: improve user-facing error messages

- Create error message mapping for all status codes
- Create reusable ErrorMessage component
- Standardize backend error response format
- Add retry-after details to rate limit errors
- Add field-level details to validation errors
- Show actionable buttons (Retry, Go Back)
- Add tests for error message formatting
```

**Estimated Tokens:** ~14,000

---

### Task 7: Error Handling Documentation and Testing

**Goal:** Document error handling architecture, create troubleshooting guide, and verify error handling works in staging environment.

**Files to Modify/Create:**
- `docs/ERROR_HANDLING.md` - Architecture documentation
- `docs/TROUBLESHOOTING.md` - User troubleshooting guide
- `backend/tests/integration/test_error_scenarios.py` - Error scenario tests

**Prerequisites:**
- All previous tasks complete

**Implementation Steps:**

1. **Create Error Handling Architecture Doc**
   - Document error flow: frontend → error boundary → logging → CloudWatch
   - Explain correlation ID tracing
   - Diagram error handling architecture
   - List all error types and handling strategy
   - Document retry logic and backoff strategy

2. **Create Troubleshooting Guide**
   - **For Users:**
     - Common errors and how to fix them
     - Rate limit errors: wait and retry
     - Network errors: check connection
     - Invalid input: check prompt requirements
   - **For Developers:**
     - How to search CloudWatch Logs by correlation ID
     - CloudWatch Insights query examples
     - How to debug failed image generations
     - How to interpret structured log entries

3. **Add CloudWatch Insights Queries**
   - Query to find all logs for correlation ID
   - Query to find all errors in last hour
   - Query to find rate limit violations
   - Query to find slowest image generations
   - Include in TROUBLESHOOTING.md

4. **Write Error Scenario Integration Tests**
   - Test rate limit error (send 51 requests, verify 429)
   - Test invalid input error (empty prompt, verify 400)
   - Test not found error (invalid job ID, verify 404)
   - Test network error simulation (timeout, verify retry)
   - Test error logging (verify logs in CloudWatch)

5. **Update PRODUCTION_CHECKLIST.md**
   - Add section: "Verify Error Handling"
   - Test error boundaries (manually trigger error)
   - Verify CloudWatch logs appear
   - Test correlation ID tracing
   - Verify user-friendly error messages
   - Test retry logic (simulate S3 error)

6. **Test in Dev/Local Environment**
   - Deploy to dev environment (or use existing dev deployment) with error handling enabled
   - Manually trigger each error type
   - Verify error messages display correctly in frontend
   - Verify CloudWatch logs contain correlation IDs (check AWS console for dev stack)
   - Verify S3 retries work (simulate transient error if possible)
   - Verify rate limiting enforced
   - **Note:** Full staging verification will be done in Phase 3 after staging environment is set up

**Verification Checklist:**
- [ ] ERROR_HANDLING.md documents architecture clearly
- [ ] TROUBLESHOOTING.md provides actionable guidance
- [ ] CloudWatch Insights queries work as documented
- [ ] Integration tests cover all error scenarios
- [ ] PRODUCTION_CHECKLIST.md updated with verification steps
- [ ] Dev environment tests confirm error handling works (staging verification in Phase 3)

**Testing Instructions:**
```bash
# Run error scenario tests
pytest tests/integration/test_error_scenarios.py -v

# Manual dev environment verification
# 1. Deploy to dev (or use existing dev deployment)
# 2. Test error boundaries (manually trigger error in component)
# 3. Verify all error types work as expected
# 4. Check CloudWatch Logs for dev stack for structured entries

# NOTE: Comprehensive staging verification occurs in Phase 3
# after staging environment is deployed
```

**Commit Message Template:**
```
docs: add error handling and troubleshooting guides

- Create ERROR_HANDLING.md with architecture overview
- Create TROUBLESHOOTING.md with user and developer guides
- Add CloudWatch Insights query examples
- Write integration tests for error scenarios
- Update PRODUCTION_CHECKLIST.md with error verification
- Document correlation ID tracing workflow
```

**Estimated Tokens:** ~15,000

---

## Phase Verification

After completing all tasks:

1. **Test Error Boundaries**
   - Manually trigger render error in frontend
   - Verify fallback UI appears
   - Verify page doesn't white screen
   - Verify error logged to CloudWatch

2. **Test Correlation ID Tracing**
   - Generate image in frontend
   - Note correlation ID from Network tab
   - Search CloudWatch Logs for correlation ID
   - Verify all related logs appear (job creation, model execution, S3 upload)

3. **Test S3 Retry Logic**
   - Simulate S3 transient error (temporarily revoke permissions)
   - Verify retries occur (check CloudWatch logs)
   - Restore permissions and verify eventual success

4. **Test User-Facing Error Messages**
   - Trigger rate limit (send many requests)
   - Verify error message shows retry-after time
   - Trigger validation error (empty prompt)
   - Verify error message specifies field

5. **Review CloudWatch Logs**
   - Verify structured JSON format
   - Verify correlation IDs in all entries
   - Verify log levels used appropriately (ERROR, WARNING, INFO)
   - Test CloudWatch Insights queries from TROUBLESHOOTING.md

6. **Run Integration Tests**
   ```bash
   pytest tests/integration/test_error_scenarios.py -v
   pytest tests/integration/test_correlation_ids.py -v
   ```

**Integration Points for Next Phase:**
- Error handling tested before production deployment (Phase 3)
- CloudWatch logging ready for performance monitoring (Phase 3, 4)
- Retry logic improves reliability for production traffic (Phase 3)

**Known Limitations:**
- CloudWatch Logs viewer requires AWS console access (no custom dashboard)
- Error deduplication is client-side only (same error from multiple users logs multiple times)
- Retry logic doesn't use circuit breaker pattern (acceptable for current scale)

---

## Success Metrics

- [ ] Error boundaries prevent white screen crashes (manually verified)
- [ ] All frontend errors logged to CloudWatch
- [ ] Correlation IDs trace requests end-to-end
- [ ] S3 operations retry on transient errors (3 retries with backoff)
- [ ] User error messages are clear and actionable
- [ ] CloudWatch Insights queries work as documented
- [ ] All error scenario integration tests pass
- [ ] Staging environment verification complete

This phase significantly improves application resilience and debuggability, essential for production readiness.

---

## Review Feedback (Iteration 1)

### Overall Assessment

**Phase 2 Implementation: 70% Complete** - Strong foundation established, but critical user-facing components missing.

### Verification Summary (Tools Used)

- `Glob` to verify file existence across frontend and backend
- `Bash npm test -- --run` executed: 170 tests passing, 4 integration test failures
- `Bash pytest tests/unit/` executed: 27 tests passing (with environment-related import errors, not code issues)
- `Read` to inspect implementation quality of log.py, retry.py, ErrorBoundary.jsx, correlation.js
- `Grep` to verify correlation ID propagation throughout codebase
- `git log --format='%s' -15` to verify commit message conventions

### Tasks 1-5: ✓ EXCELLENT IMPLEMENTATION

**Verified with tools:**
- ✓ Task 1: `log.py`, `logger.py`, `test_log_endpoint.py` all exist and well-implemented
- ✓ Task 2: `logger.js`, `correlation.js`, tests exist and passing
- ✓ Task 3: `ErrorBoundary.jsx`, `ErrorFallback.jsx`, 10 tests passing
- ✓ Task 4: X-Correlation-ID headers propagated, integration tests exist
- ✓ Task 5: `retry.py` with exponential backoff, 27 retry tests passing

**Code Quality Observations:**
- Structured logging with proper validation
- Error boundary with correlation ID logging
- Retry logic distinguishes retryable vs permanent errors
- All commits follow conventional format
- Integration tests demonstrate end-to-end flows

### Task 6: Improved User-Facing Error Messages ✗ MISSING

> **Consider:** The plan at lines 454-556 specifies creating three key files for user-facing error messages. When running `Glob "frontend/src/utils/errorMessages.js"`, what result did you get?
>
> **Reflect:** Looking at line 459, the plan requires `frontend/src/components/common/ErrorMessage.jsx` - a reusable error component with retry buttons. Does this file exist in your codebase?
>
> **Think about:** The success criteria on line 720 states "User error messages are clear and actionable." Without the ErrorMessage component and errorMessages mapping, how are users currently experiencing errors? Are they seeing raw HTTP status codes or generic messages?
>
> **Consider:** The plan line 486 specifies `backend/src/utils/error_responses.py` for standardized error response structure. When checking `ls backend/src/utils/`, is this file present?
>
> **Reflect:** Without the error message mapping from Task 6, when a user hits a rate limit (429), do they see a helpful message like "Rate limit exceeded. Please wait 45 minutes and try again" or a generic error?

**Action Required:**
- Create `frontend/src/utils/errorMessages.js` with status code to message mapping
- Create `frontend/src/components/common/ErrorMessage.jsx` component with:
  - Props for errorCode, errorMessage, retry callback
  - Conditional retry button (show for 429, 500, 503; hide for 400, 404)
  - Appropriate icons (⚠️ warning, ❌ error, ℹ️ info)
- Create `backend/src/utils/error_responses.py` with standardized response format
- Update all backend endpoints to use standardized error responses
- Write tests for error message component

### Task 7: Documentation and Testing ◐ PARTIAL

**What exists (verified with tools):**
- ✓ `ERROR_HANDLING.md` exists with comprehensive architecture documentation
- ✓ `test_correlation_ids.py` integration tests exist
- ✓ `TESTING.md` updated for frontend

**Missing documentation:**

> **Consider:** The plan lines 564-567 specifies creating `docs/TROUBLESHOOTING.md` - a user troubleshooting guide. When running `Glob "docs/TROUBLESHOOTING.md"`, what result did you get?
>
> **Reflect:** The plan line 582 requires documenting "CloudWatch Insights queries for developers." Without TROUBLESHOOTING.md, how would a developer search CloudWatch Logs for a specific correlation ID?
>
> **Think about:** Lines 333-334 state: "Explain how to search CloudWatch Logs by correlation ID, Provide example CloudWatch Insights query." Where is this documented if not in TROUBLESHOOTING.md?

**Action Required:**
- Create `docs/TROUBLESHOOTING.md` with:
  - User troubleshooting section (common error messages and solutions)
  - Developer troubleshooting section (using correlation IDs)
  - CloudWatch Insights query examples
  - Step-by-step guide to trace a request through the system

### Integration Test Failures

**Frontend test results verified with `npm test -- --run`:**
- ✓ 170 tests passing
- ✗ 4 integration tests failing (minor test implementation issues, not code bugs)

> **Consider:** The integration test `generateFlow.test.jsx` is failing with "clear() is only supported on editable elements." Looking at line 59 of that test, you're trying to clear a slider element. Are sliders editable elements that support the `clear()` method?
>
> **Think about:** For slider inputs, would using `fireEvent` to set the value directly be more appropriate than `user.clear()`?
>
> **Reflect:** The `errorHandling.test.jsx` is timing out waiting for error messages. Looking at the test timeout of 5000ms, is that sufficient for the error UI to appear, or should the timeout be adjusted?

**Action Required:**
- Fix integration test interactions with sliders (use appropriate API for range inputs)
- Adjust timeouts if needed for error UI rendering
- Ensure all 4 integration test files pass completely

### Success Criteria Check

From lines 714-723:
- [x] Error boundaries prevent white screen crashes (✓ Verified: ErrorBoundary.jsx exists with 10 passing tests)
- [x] All frontend errors logged to CloudWatch (✓ Verified: logger.js sends to /log endpoint)
- [x] Correlation IDs trace requests end-to-end (✓ Verified: X-Correlation-ID in frontend, extracted in backend)
- [x] S3 operations retry on transient errors (✓ Verified: retry.py with exponential backoff, 27 tests passing)
- [ ] User error messages are clear and actionable (**FAIL** - Task 6 components missing)
- [ ] CloudWatch Insights queries work as documented (**PARTIAL** - Queries not in TROUBLESHOOTING.md)
- [ ] All error scenario integration tests pass (**FAIL** - 4 integration tests failing)
- [ ] Staging environment verification complete (**N/A** - Phase 3 prerequisite)

**Phase Completion:** 5 out of 7 tasks complete (71%)
- ✓ Task 1: Backend Logging Endpoint
- ✓ Task 2: Frontend Error Logging Utility
- ✓ Task 3: React Error Boundaries
- ✓ Task 4: Correlation ID Tracing
- ✓ Task 5: S3 Retry Logic
- ✗ Task 6: Improved User-Facing Error Messages (0% - all files missing)
- ◐ Task 7: Documentation (60% - ERROR_HANDLING.md exists, TROUBLESHOOTING.md missing)

**Overall Phase 2 Status:** ❌ **NOT APPROVED** - Core infrastructure excellent, user-facing polish incomplete

### Commit Quality ✓ EXCELLENT

**Verified with `git log --format='%s' -15`:**
- All commits follow conventional format: `type(scope): description`
- Clear categorization: feat, test, docs, fix
- Descriptive messages explaining what was implemented
- Proper scope identification (frontend, backend)

### Next Steps to Complete Phase 2

1. **Implement Task 6 (highest priority - user-facing):**
   - Create errorMessages.js mapping
   - Create ErrorMessage.jsx component
   - Create error_responses.py backend utility
   - Update endpoints to use standardized errors
   - Test error message display for all error types

2. **Complete Task 7 documentation:**
   - Create TROUBLESHOOTING.md with CloudWatch Insights queries
   - Document correlation ID tracing workflow
   - Add examples for common troubleshooting scenarios

3. **Fix integration test failures:**
   - Update slider interaction in generateFlow.test.jsx
   - Adjust timeouts in errorHandling.test.jsx
   - Verify all integration tests pass

4. **Verification:**
   - Run full test suite: `npm test -- --run` (all tests passing)
   - Manually trigger each error type to verify messages
   - Verify TROUBLESHOOTING.md queries work in CloudWatch (or document for Phase 3)
