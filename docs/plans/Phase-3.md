# Phase 3: Lambda - Async Job Management & Parallel Processing

## Phase Goal

Implement the asynchronous job management system with parallel model execution, job status tracking in S3, rate limiting, and content moderation. This phase integrates the model registry and handlers from Phase 2 into a complete backend system that processes multiple models concurrently and provides real-time progress updates.

**Success Criteria**:
- Lambda creates unique job IDs and returns immediately (< 1s response)
- Multiple models execute in parallel using threading
- Job status is stored in S3 and updated as models complete
- Status endpoint returns current job progress
- Rate limiting prevents abuse
- Content filtering blocks inappropriate prompts
- Generated images are saved to S3 with metadata
- Prompt enhancement endpoint works using configured model

**Estimated Tokens**: ~35,000

---

## Prerequisites

- Phase 2 complete (model registry and handlers working)
- Understanding of Python threading and concurrent.futures
- Familiarity with S3 operations (put_object, get_object)
- Knowledge of existing rate limiting implementation from `pixel-prompt-lambda`

---

## Tasks

### Task 1: Job Manager Module

**Goal**: Create job lifecycle management system with S3-based status storage

**Files to Create**:
- `/backend/src/jobs/manager.py` - Job management logic
- `/backend/src/jobs/__init__.py` - Package initialization

**Prerequisites**: Phase 2 complete

**Implementation Steps**:

1. Create `jobs/manager.py` with `JobManager` class:
   - Constructor accepts S3 client and bucket name
   - `create_job(prompt, params, models)` → returns job_id (UUID)
   - `update_job_status(job_id, updates)` → updates S3 status file
   - `get_job_status(job_id)` → retrieves status from S3
   - `mark_model_complete(job_id, model_name, result)` → updates individual model status
   - `mark_model_error(job_id, model_name, error)` → records error for model

2. Define job status schema:
   ```python
   {
       "jobId": "uuid-v4-string",
       "status": "pending" | "in_progress" | "completed" | "partial" | "failed",
       "createdAt": "ISO-8601 timestamp",
       "updatedAt": "ISO-8601 timestamp",
       "totalModels": 9,
       "completedModels": 3,
       "prompt": "user prompt",
       "parameters": {"steps": 28, "guidance": 5, "control": 1.0},
       "results": [
           {
               "model": "DALL-E 3",
               "status": "completed",
               "imageKey": "group-images/2025-11-15-14-30-45/DALL-E-3-1234567890.json",
               "completedAt": "ISO-8601",
               "duration": 12.5  # seconds
           },
           {
               "model": "Gemini 2.0",
               "status": "in_progress",
               "startedAt": "ISO-8601"
           },
           {
               "model": "Imagen 3.0",
               "status": "error",
               "error": "API timeout after 60 seconds",
               "completedAt": "ISO-8601"
           }
       ]
   }
   ```

3. Implement S3 storage:
   - Path: `jobs/{jobId}/status.json`
   - Use JSON serialization
   - Handle race conditions (last write wins - acceptable)

4. Implement status computation:
   - `pending`: No models started
   - `in_progress`: At least one model started, not all complete
   - `completed`: All models successful
   - `partial`: All models done, at least one error
   - `failed`: Unable to process job (e.g., rate limited)

**Verification Checklist**:
- [ ] create_job() generates unique UUID and saves initial status to S3
- [ ] update_job_status() successfully modifies S3 object
- [ ] get_job_status() retrieves and parses status from S3
- [ ] Status transitions work correctly (pending → in_progress → completed)
- [ ] Handles S3 errors gracefully (e.g., object not found)

**Testing Instructions**:
- Unit test with mocked S3 client
- Integration test with real S3 bucket
- Test concurrent updates (two threads updating same job)
- Verify S3 object content matches expected schema

**Commit Message Template**:
```
feat(lambda): implement job management system

- Create JobManager class for lifecycle management
- Define job status schema with model-level tracking
- Implement S3-based status storage (jobs/{jobId}/status.json)
- Add status computation logic (pending/in_progress/completed/partial)
```

**Estimated Tokens**: ~5,000

---

### Task 2: Image Storage Module

**Goal**: Create module to save generated images to S3 with metadata

**Files to Create**:
- `/backend/src/utils/storage.py` - S3 storage utilities

**Prerequisites**: Task 1 complete, reference `/pixel-prompt-lambda/image_processing.py`

**Implementation Steps**:

1. Create `storage.py` with `ImageStorage` class:
   - Constructor accepts S3 client, bucket name, CloudFront domain
   - `save_image(base64_image, metadata) → image_key`
   - `get_image(image_key) → image_data`
   - `list_galleries() → list of gallery folders`
   - `list_gallery_images(gallery_folder) → list of image keys`

2. Implement `save_image()`:
   - Build image metadata JSON:
     ```python
     {
         "output": base64_image_data,
         "model": model_name,
         "prompt": prompt,
         "steps": steps,
         "guidance": guidance,
         "target": target_timestamp,  # groups all models together
         "timestamp": current_timestamp,
         "NSFW": false
     }
     ```
   - Generate S3 key: `group-images/{target}/{model}-{timestamp}.json`
   - Normalize model name for filename (replace spaces, special chars)
   - Upload to S3 with ContentType: application/json
   - Return S3 key

3. Implement `list_galleries()`:
   - List S3 objects with prefix `group-images/` and delimiter `/`
   - Return CommonPrefixes (folder names)

4. Implement `list_gallery_images(gallery_folder)`:
   - List S3 objects with prefix `group-images/{gallery_folder}/`
   - Return all image keys in that folder

**Verification Checklist**:
- [ ] save_image() successfully uploads JSON to S3
- [ ] S3 key follows correct format (group-images/{target}/{model}-{ts}.json)
- [ ] Model names are normalized for filenames
- [ ] list_galleries() returns folder list
- [ ] CloudFront URL construction works correctly

**Testing Instructions**:
- Unit test with mocked S3 client
- Integration test: save image, retrieve via S3 key
- Verify JSON structure by downloading from S3
- Test list_galleries() with multiple gallery folders

**Commit Message Template**:
```
feat(lambda): implement image storage module

- Create ImageStorage class for S3 operations
- Implement save_image() with metadata JSON
- Add list_galleries() and list_gallery_images() methods
- Normalize model names for S3 keys
```

**Estimated Tokens**: ~4,000

---

### Task 3: Parallel Execution Engine

**Goal**: Implement parallel model execution using threading

**Files to Create**:
- `/backend/src/jobs/executor.py` - Parallel execution engine

**Prerequisites**: Task 2 complete, Phase 2 complete

**Implementation Steps**:

1. Create `executor.py` with `JobExecutor` class:
   - Constructor accepts job_manager, image_storage, model_registry
   - `execute_job(job_id, prompt, params)` → spawns threads for all models
   - Uses `concurrent.futures.ThreadPoolExecutor`
   - Max workers: equal to number of models

2. Implement `execute_job()` logic:
   - Get all models from registry
   - Create thread pool with workers = model count
   - Submit one task per model to executor
   - Each task calls `_execute_model(job_id, model, prompt, params)`
   - Use `as_completed()` to process results as they finish
   - Update job status after each model completes
   - Return immediately (don't wait for all threads - this is background processing)

3. Implement `_execute_model(job_id, model, prompt, params)`:
   - Import handlers from Phase 2
   - Start timer
   - Update job status: model status = "in_progress"
   - Get appropriate handler based on model provider
   - Call handler with model config, prompt, params
   - If successful:
     - Save image to S3
     - Update job status: model status = "completed", imageKey, duration
   - If error:
     - Update job status: model status = "error", error message
   - End timer
   - Return result

4. Add timeout handling:
   - Each model handler should have 60-second timeout
   - If timeout, record error and continue with other models

5. Handle thread exceptions:
   - Wrap handler call in try/except
   - Log all errors for debugging
   - Ensure one failing model doesn't crash entire job

**Verification Checklist**:
- [ ] ThreadPoolExecutor spawns correct number of workers
- [ ] Each model executes in parallel (not sequential)
- [ ] Job status updates as models complete
- [ ] Failures in one model don't affect others
- [ ] Timeout prevents indefinite hanging

**Testing Instructions**:
- Integration test with real handlers
- Test with mock handlers that sleep for random times (verify parallel execution)
- Test with one failing model (others should complete)
- Monitor CloudWatch logs to see parallel execution
- Verify job status updates correctly during execution

**Commit Message Template**:
```
feat(lambda): implement parallel model execution

- Create JobExecutor with ThreadPoolExecutor
- Execute all models concurrently in separate threads
- Update job status as each model completes
- Handle individual model failures gracefully
- Add 60-second timeout per model
```

**Estimated Tokens**: ~5,000

---

### Task 4: Rate Limiting Module

**Goal**: Port existing rate limiting logic to new codebase

**Files to Create**:
- `/backend/src/utils/rate_limit.py` - Rate limiting logic

**Prerequisites**: Task 3 complete, reference `/pixel-prompt-lambda/lambda_function.py` lines 32-78

**Implementation Steps**:

1. Create `rate_limit.py` with `RateLimiter` class:
   - Constructor accepts S3 client, bucket, global_limit, ip_limit, ip_whitelist
   - `check_rate_limit(ip_address) → bool`
   - `is_rate_limited(ip_address) → bool`

2. Implement `check_rate_limit()`:
   - Load `rate-limit/ratelimit.json` from S3
   - If doesn't exist, create empty structure:
     ```python
     {
         "global_requests": [],
         "ip_requests": {}
     }
     ```
   - Get current time and calculate windows (1 hour ago, 1 day ago)
   - Clean up old requests (remove timestamps outside windows)
   - Add current request timestamp
   - Save updated data back to S3
   - Check limits:
     - If IP in whitelist → return False (not limited)
     - If global requests > GLOBAL_LIMIT → return True
     - If IP requests > IP_LIMIT → return True
     - Otherwise → return False

3. Handle S3 concurrency:
   - Use get_object followed by put_object (eventual consistency acceptable)
   - If two requests update simultaneously, one will win (acceptable tradeoff)

4. Add configuration via environment variables:
   - GLOBAL_LIMIT (requests per hour)
   - IP_LIMIT (requests per day per IP)
   - IP_INCLUDE (comma-separated whitelist)

**Verification Checklist**:
- [ ] Rate limiter correctly tracks global requests
- [ ] Rate limiter correctly tracks per-IP requests
- [ ] Whitelist IPs bypass rate limits
- [ ] Old requests are cleaned up from tracking
- [ ] Handles missing ratelimit.json file

**Testing Instructions**:
- Unit test with mocked S3 and time
- Test global limit enforcement (make 101 requests, 101st should be limited)
- Test IP limit enforcement (same IP makes many requests)
- Test whitelist (whitelisted IP makes unlimited requests)
- Integration test with real S3

**Commit Message Template**:
```
feat(lambda): implement rate limiting with S3 tracking

- Create RateLimiter class with global and per-IP limits
- Store rate limit data in S3 (rate-limit/ratelimit.json)
- Clean up old requests outside time windows
- Support IP whitelist for bypass
```

**Estimated Tokens**: ~4,000

---

### Task 5: Content Moderation Module

**Goal**: Implement NSFW/inappropriate content filtering

**Files to Create**:
- `/backend/src/utils/content_filter.py` - Content moderation

**Prerequisites**: Task 4 complete, reference `/pixel-prompt-lambda/prompt.py`

**Implementation Steps**:

1. Create `content_filter.py` with `ContentFilter` class:
   - Constructor accepts model_registry (to get prompt enhancement model for checking)
   - `check_prompt(prompt) → bool` (returns True if NSFW/inappropriate)

2. Implement simple keyword-based filter first:
   - Maintain list of blocked keywords/phrases
   - Check if prompt contains any blocked terms (case-insensitive)
   - Return True if match found

3. Implement LLM-based filter (optional, more accurate):
   - Use one of the configured models (e.g., GPT-4, Gemini) to analyze prompt
   - Send prompt: "Is this text inappropriate or NSFW? Answer only YES or NO: {user_prompt}"
   - Parse response
   - Return True if model says YES

4. Decision: Use keyword filter OR LLM filter based on configuration
   - Start with keyword filter (fast, no API cost)
   - LLM filter can be added later as enhancement

5. Define blocked keyword list:
   - Reference existing implementation's blocked words
   - Add common NSFW terms
   - Store in separate file or config

**Verification Checklist**:
- [ ] Keyword filter correctly identifies blocked prompts
- [ ] Safe prompts pass filter
- [ ] Case-insensitive matching works
- [ ] Filter is fast (< 100ms for keyword-based)

**Testing Instructions**:
- Unit test with known safe and unsafe prompts
- Test edge cases (partial word matches, special characters)
- Benchmark performance (should be very fast)

**Commit Message Template**:
```
feat(lambda): implement content moderation filter

- Create ContentFilter class with keyword-based blocking
- Check prompts for NSFW/inappropriate content
- Return boolean for blocked content
- Fast keyword matching (< 100ms)
```

**Estimated Tokens**: ~3,000

---

### Task 6: API Endpoints Implementation

**Goal**: Integrate all modules into Lambda handler with three API endpoints

**Files to Modify**:
- `/backend/src/lambda_function.py`

**Prerequisites**: Tasks 1-5 complete

**Implementation Steps**:

1. Update Lambda handler to import all modules:
   - JobManager, JobExecutor, ImageStorage
   - ModelRegistry, RateLimiter, ContentFilter

2. Initialize all components at module level (outside handler):
   - S3 client (boto3)
   - Model registry
   - Job manager
   - Image storage
   - Rate limiter
   - Content filter
   - Job executor

3. Implement `POST /generate` endpoint:
   - Extract request body: prompt, steps, guidance, control, ip
   - Check rate limit → if exceeded, return 429 error
   - Check content filter → if blocked, return 400 error
   - Create job with job manager
   - Start parallel execution (non-blocking - executor runs in background)
   - Return `{"jobId": "uuid"}` immediately

4. Implement `GET /status/{jobId}` endpoint:
   - Extract jobId from path parameters
   - Call job_manager.get_job_status(jobId)
   - If not found, return 404
   - Return job status JSON

5. Implement `POST /enhance` endpoint:
   - Extract prompt from request body
   - Get prompt enhancement model from registry
   - Call handler to enhance prompt (use text completion, not image generation)
   - Return enhanced prompt

6. Add proper HTTP response formatting:
   - Status codes: 200, 400, 404, 429, 500
   - CORS headers (if not handled by API Gateway)
   - Content-Type: application/json

7. Handle errors globally:
   - Catch all exceptions
   - Log error details
   - Return 500 with generic error message (don't leak internals)

**Verification Checklist**:
- [ ] POST /generate creates job and returns job ID immediately
- [ ] GET /status/{jobId} returns current job status
- [ ] POST /enhance enhances prompts (placeholder or real implementation)
- [ ] Rate limiting works on /generate endpoint
- [ ] Content filtering blocks inappropriate prompts
- [ ] Errors return appropriate status codes

**Testing Instructions**:
- Deploy and test with curl:
  ```bash
  # Generate
  curl -X POST $API/generate -d '{"prompt":"sunset","steps":25,"guidance":7,"ip":"1.2.3.4"}'
  # Should return: {"jobId":"..."}

  # Status
  curl $API/status/JOB_ID_HERE
  # Should return: {job status object}

  # Enhance
  curl -X POST $API/enhance -d '{"prompt":"cat"}'
  # Should return: {"enhanced":"A photorealistic cat..."}
  ```
- Test rate limiting (make many requests, should get 429)
- Test content filter (send inappropriate prompt, should get 400)
- Monitor CloudWatch logs for parallel execution

**Commit Message Template**:
```
feat(lambda): implement API endpoints with job management

- Integrate all modules into Lambda handler
- Implement POST /generate with async job creation
- Implement GET /status with job status retrieval
- Implement POST /enhance for prompt enhancement
- Add rate limiting and content filtering
- Return appropriate HTTP status codes
```

**Estimated Tokens**: ~6,000

---

### Task 7: Prompt Enhancement Implementation

**Goal**: Implement prompt enhancement using configured model

**Files to Create/Modify**:
- `/backend/src/api/enhance.py` - Prompt enhancement logic

**Prerequisites**: Task 6 complete

**Implementation Steps**:

1. Create `api/enhance.py` with `enhance_prompt(prompt, model_config)` function:
   - Use the model designated by PROMPT_MODEL_INDEX
   - Call model's text completion API (not image generation)
   - Prompt template:
     ```
     You are an expert at writing detailed, vivid image generation prompts.
     Expand this short prompt into a detailed 90-100 token description:

     "{user_prompt}"

     Provide ONLY the expanded prompt, nothing else.
     ```
   - Extract response text
   - Return both short and long versions

2. Handle different model types for text completion:
   - OpenAI: Use chat completions API (gpt-4 or gpt-3.5-turbo)
   - Google: Use Gemini text generation
   - Others: Best effort attempt or return original prompt

3. Add safety check:
   - If enhancement model is an image model (not text), log warning and return original prompt
   - Ideally, PROMPT_MODEL_INDEX should point to a text model

4. Implement caching (optional):
   - Cache enhanced prompts in S3 or in-memory (Lambda container reuse)
   - Reduces API calls for duplicate prompts

**Verification Checklist**:
- [ ] Enhancement works with text-capable models
- [ ] Returns longer, more detailed prompt
- [ ] Gracefully handles image-only models
- [ ] Does not crash on API errors

**Testing Instructions**:
- Test with short prompt: "cat" → should return detailed description
- Test with already detailed prompt → should enhance further
- Test error handling (invalid API key)
- Verify response quality (is enhancement useful?)

**Commit Message Template**:
```
feat(lambda): implement prompt enhancement with LLM

- Create enhance_prompt() function
- Use configured prompt model for text completion
- Generate detailed 90-100 token prompts
- Handle different model types (OpenAI, Google)
```

**Estimated Tokens**: ~4,000

---

### Task 8: End-to-End Integration Testing

**Goal**: Test complete workflow from request to image generation

**Files to Create**:
- `/backend/tests/test_integration.py` - Integration tests

**Prerequisites**: Tasks 1-7 complete

**Implementation Steps**:

1. Create integration test suite:
   - Test 1: Full workflow (generate → poll status → verify images)
   - Test 2: Rate limiting enforcement
   - Test 3: Content filtering
   - Test 4: Prompt enhancement
   - Test 5: Error handling (invalid job ID, API errors)

2. Implement Test 1 - Full Workflow:
   - Call POST /generate with valid prompt
   - Get job ID
   - Poll GET /status until completed (or 5 min timeout)
   - Verify all models completed successfully
   - Download images from S3
   - Verify image format (valid base64, can decode to image)

3. Implement Test 2 - Rate Limiting:
   - Make GLOBAL_LIMIT + 1 requests
   - Verify last request returns 429
   - Test IP limit separately
   - Test whitelist bypass

4. Implement Test 3 - Content Filtering:
   - Submit prompt with blocked keywords
   - Verify 400 response
   - Verify no job created

5. Implement Test 4 - Prompt Enhancement:
   - Call POST /enhance with simple prompt
   - Verify response is longer than input
   - Verify response is relevant to input

6. Implement Test 5 - Error Handling:
   - Request status for non-existent job ID → 404
   - Submit malformed JSON → 400
   - Test with invalid parameters → 400

**Verification Checklist**:
- [ ] Full workflow test passes (images generated and saved)
- [ ] Rate limiting test passes
- [ ] Content filtering test passes
- [ ] Prompt enhancement test passes
- [ ] Error handling tests pass

**Testing Instructions**:
- Run integration tests: `pytest tests/test_integration.py`
- Monitor CloudWatch logs during test execution
- Verify S3 contains generated images after tests
- Check test execution time (should complete in < 5 minutes)

**Commit Message Template**:
```
test(lambda): add end-to-end integration tests

- Test full workflow (generate, poll, verify images)
- Test rate limiting enforcement
- Test content filtering
- Test prompt enhancement
- Test error handling scenarios
```

**Estimated Tokens**: ~4,000

---

## Phase Verification

### Complete Phase Checklist

Before moving to Phase 4, verify:

- [ ] Lambda creates jobs and returns job ID in < 1 second
- [ ] Models execute in parallel (check CloudWatch logs for overlapping timestamps)
- [ ] Job status updates in real-time as models complete
- [ ] Status endpoint returns accurate progress
- [ ] Rate limiting works (global and per-IP)
- [ ] Content filtering blocks inappropriate prompts
- [ ] Images are saved to S3 with proper metadata
- [ ] Prompt enhancement generates detailed prompts
- [ ] All integration tests pass

### Integration Testing Commands

```bash
# Deploy updated Lambda
sam build && sam deploy

# Test generate endpoint
API=<your-api-endpoint>
JOB_ID=$(curl -s -X POST $API/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"beautiful mountain sunset","steps":25,"guidance":7,"ip":"1.2.3.4"}' \
  | jq -r .jobId)

echo "Job ID: $JOB_ID"

# Poll status (run multiple times)
curl $API/status/$JOB_ID | jq .

# Test enhancement
curl -X POST $API/enhance \
  -H "Content-Type: application/json" \
  -d '{"prompt":"cat"}' | jq .

# Test rate limiting (replace with script that makes 101 requests)
for i in {1..101}; do
  curl -s -X POST $API/generate -d '{"prompt":"test","ip":"1.2.3.4"}' | jq .
done
```

### Performance Benchmarks

- Job creation: < 1 second
- First model completion: 10-30 seconds
- All models complete (9 models): 30-90 seconds (depends on external APIs)
- Status endpoint response: < 500ms
- Rate limit check overhead: < 100ms

### Known Limitations

- No WebSocket support (polling only)
- No job cleanup (old jobs remain in S3 - handle with lifecycle policy)
- No job cancellation (once started, runs to completion)
- No priority queue (FIFO processing)

---

## Next Phase

Proceed to **[Phase 4: Frontend Foundation - Vite React Setup](Phase-4.md)** to build the web interface.
