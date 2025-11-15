# Phase 0: Architecture & Design Decisions

**READ THIS PHASE BEFORE STARTING IMPLEMENTATION**

This phase documents the foundational architectural decisions, design patterns, and conventions that apply across all implementation phases. Refer back to this document when making implementation choices.

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Vite React Frontend (Self-Hosted)            │  │
│  │  - Prompt input & parameter controls                  │  │
│  │  - Job submission & status polling                    │  │
│  │  - Image grid display (9 models parallel)             │  │
│  │  - Gallery browser for historical images              │  │
│  └────────────┬─────────────────────────────────────────┘  │
└───────────────┼─────────────────────────────────────────────┘
                │
                │ HTTPS (CORS enabled)
                ↓
┌───────────────────────────────────────────────────────────────┐
│                    AWS Cloud Infrastructure                   │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  API Gateway HTTP API                                    ││
│  │  - POST /generate (create job)                           ││
│  │  - GET /status/{jobId} (poll status)                     ││
│  │  - POST /enhance (prompt enhancement)                    ││
│  │  - CORS: Allow all origins                               ││
│  └─────────────┬────────────────────────────────────────────┘│
│                │                                              │
│                ↓                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  Lambda Function (Python 3.12)                           ││
│  │  - Dynamic model registry (variable model count)         ││
│  │  - Intelligent API routing (provider auto-detection)     ││
│  │  - Parallel model execution (threading)                  ││
│  │  - Job lifecycle management                              ││
│  │  - Rate limiting & content moderation                    ││
│  │  Environment Variables:                                  ││
│  │    MODEL_COUNT, MODEL_1_NAME, MODEL_1_KEY, ...           ││
│  │    PROMPT_MODEL_INDEX, GLOBAL_LIMIT, IP_LIMIT            ││
│  └─────┬──────────────────────┬─────────────────────────────┘│
│        │                      │                               │
│        ↓                      ↓                               │
│  ┌─────────────┐       ┌──────────────────────────┐          │
│  │  S3 Bucket  │       │  External AI APIs        │          │
│  │             │       │  - OpenAI (DALL-E 3)     │          │
│  │  /jobs/     │       │  - Stability AI (SD)     │          │
│  │  /{jobId}/  │       │  - BFL (Flux models)     │          │
│  │  status.json│       │  - Google (Gemini/Imagen)│          │
│  │             │       │  - Recraft (v3)          │          │
│  │  /group-    │       │  - AWS Bedrock (Nova)    │          │
│  │  images/    │       └──────────────────────────┘          │
│  │  /{target}/ │                                              │
│  │  /{model}-  │                                              │
│  │  {ts}.json  │                                              │
│  └──────┬──────┘                                              │
│         │                                                     │
│         ↓                                                     │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  CloudFront Distribution                                 ││
│  │  - Low-latency image delivery                            ││
│  │  - HTTPS endpoint for S3 objects                         ││
│  └──────────────────────────────────────────────────────────┘│
└───────────────────────────────────────────────────────────────┘
```

### Data Flow

**Image Generation Request:**
1. User enters prompt + parameters → clicks "Generate"
2. Frontend calls `POST /generate` with payload
3. Lambda creates job ID, saves initial status to S3 (`jobs/{jobId}/status.json`)
4. Lambda returns `{jobId}` immediately (< 1 second response)
5. Lambda spawns threads for each configured model (parallel execution)
6. Each thread calls external AI API → receives base64 image
7. Each thread saves image to S3 (`group-images/{target}/{model}-{timestamp}.json`)
8. Each thread updates job status with completion percentage
9. Frontend polls `GET /status/{jobId}` every 2 seconds
10. Frontend displays images as they complete (progressive loading)

**Gallery Loading:**
1. Frontend loads gallery on mount
2. Fetches folder list from S3 (`group-images/` prefix with delimiter)
3. For each folder (timestamp), fetches one random image as preview
4. User clicks preview → fetches all 9 images from that folder
5. Displays in grid matching model order

---

## Design Decisions & Rationale

### ADR 001: Single Lambda vs Microservices

**Decision**: Use single unified Lambda function for all operations (image generation, prompt enhancement, status checks)

**Rationale**:
- Simpler deployment (one SAM template, one function to manage)
- Shared code for model registry, S3 clients, rate limiting
- Lambda can handle parallel execution with threading
- Reduces cold start count (one function warm vs many)
- Easier debugging and logging

**Tradeoffs**:
- Larger package size (mitigated by Lambda Layers if needed)
- Slightly longer cold starts (acceptable for user-facing app)
- All operations share same timeout (15 min max - sufficient)

**Alternative Considered**: Separate Lambdas per model (rejected due to complexity and operational overhead)

---

### ADR 002: S3 for Job Status vs DynamoDB

**Decision**: Store job status as JSON files in S3 (`jobs/{jobId}/status.json`)

**Rationale**:
- Simpler architecture (one storage service for status + images)
- No additional AWS service costs (S3 free tier generous)
- Easy to inspect/debug (download JSON file)
- Sufficient performance for polling pattern (2s interval)
- Natural TTL via S3 lifecycle policies

**Tradeoffs**:
- Slower than DynamoDB (acceptable latency for 2s polling)
- No atomic updates (mitigated by single writer per job)
- No querying capabilities (not needed for this use case)

**Alternative Considered**: DynamoDB (rejected to minimize service dependencies and costs)

---

### ADR 003: Dynamic Model Registry Implementation

**Decision**: Configure models via SAM parameters (MODEL_COUNT, MODEL_N_NAME, MODEL_N_KEY), parse at Lambda initialization, route via pattern matching with generic fallback

**Rationale**:
- Flexibility: Deploy with 3 or 20 models without code changes
- Simplicity: Model config is just name + API key
- Intelligent: Auto-detect provider from model name patterns
- Extensible: Generic fallback handler for unknown models

**Implementation Pattern**:
```python
# At Lambda initialization
MODEL_COUNT = int(os.environ.get('MODEL_COUNT', 9))
MODELS = []
for i in range(1, MODEL_COUNT + 1):
    name = os.environ.get(f'MODEL_{i}_NAME')
    key = os.environ.get(f'MODEL_{i}_KEY')
    MODELS.append({'name': name, 'key': key, 'provider': detect_provider(name)})

def detect_provider(model_name):
    # Pattern matching logic
    if 'dalle' in model_name.lower() or 'gpt' in model_name.lower():
        return 'openai'
    elif 'gemini' in model_name.lower():
        return 'google_gemini'
    # ... etc
    return 'generic'
```

**Tradeoffs**:
- Pattern matching may fail for ambiguous names (mitigated by generic fallback)
- Adding new providers requires code update (acceptable - infrequent)

**Alternative Considered**: Hardcoded 9 models (rejected - not flexible enough)

---

### ADR 004: Async Job Pattern with Polling

**Decision**: Async request-response pattern where Lambda returns job ID immediately, frontend polls status endpoint

**Rationale**:
- Better UX: User gets immediate feedback (job accepted)
- Progressive loading: Show images as they complete, not all at once
- Avoids timeouts: API Gateway has 30s limit, image generation takes 30-90s
- Resilient: Frontend can reconnect and continue polling after disconnect

**Status Schema**:
```json
{
  "jobId": "uuid-v4",
  "status": "in_progress",
  "createdAt": "ISO-8601",
  "totalModels": 9,
  "completedModels": 3,
  "results": [
    {"model": "DALL-E 3", "status": "completed", "imageUrl": "s3://...", "completedAt": "..."},
    {"model": "Gemini 2.0", "status": "in_progress"},
    {"model": "Imagen 3.0", "status": "error", "error": "API timeout"}
  ],
  "prompt": "...",
  "parameters": {"steps": 28, "guidance": 5}
}
```

**Polling Strategy**:
- Interval: 2 seconds
- Timeout: 5 minutes (kill polling after 5 min if no completion)
- Exponential backoff on errors (2s → 4s → 8s)

**Tradeoffs**:
- More API calls (acceptable - HTTP API is cheap)
- Requires client-side polling logic (standard pattern)

**Alternative Considered**: WebSockets (rejected - adds complexity, HTTP API doesn't support natively)

---

### ADR 005: Parallel Model Execution Strategy

**Decision**: Use Python threading (`concurrent.futures.ThreadPoolExecutor`) within single Lambda invocation

**Rationale**:
- Native Python solution (no additional AWS services)
- Efficient resource usage (I/O bound operations - waiting on external APIs)
- Simple error handling (catch exceptions per thread)
- Shared context (job status, S3 client)

**Implementation Pattern**:
```python
from concurrent.futures import ThreadPoolExecutor, as_completed

def process_job(job_id, prompt, params, models):
    with ThreadPoolExecutor(max_workers=len(models)) as executor:
        futures = {
            executor.submit(generate_image, job_id, model, prompt, params): model
            for model in models
        }

        for future in as_completed(futures):
            model = futures[future]
            try:
                result = future.result()
                update_job_status(job_id, model, 'completed', result)
            except Exception as e:
                update_job_status(job_id, model, 'error', str(e))
```

**Configuration**:
- Lambda memory: 3008 MB (for parallel processing)
- Lambda timeout: 15 minutes (max allowed)
- Max workers: Equal to model count (e.g., 9 threads for 9 models)

**Tradeoffs**:
- Higher Lambda memory costs (acceptable - pay for value)
- Risk of timeout if all models are slow (mitigated by 15 min limit)

**Alternative Considered**: Step Functions fan-out (rejected - overengineered for this use case)

---

### ADR 006: Rate Limiting Strategy

**Decision**: Maintain existing S3-based rate limiting from `pixel-prompt-lambda`

**Rationale**:
- Proven implementation already exists
- No additional infrastructure needed
- Granular control (global + per-IP limits)
- IP whitelist support for trusted users

**Implementation**:
- Global limit: Configurable via `GLOBAL_LIMIT` env var (requests per hour)
- IP limit: Configurable via `IP_LIMIT` env var (requests per day per IP)
- Storage: `{bucket}/rate-limit/ratelimit.json`
- Cleanup: Automatic via time-windowed checks

**Tradeoffs**:
- S3 as database is unconventional (but works for low scale)
- Potential race conditions with concurrent requests (acceptable - eventual consistency)

**Alternative Considered**: Redis/ElastiCache (rejected - overkill and expensive)

---

### ADR 007: Frontend State Management

**Decision**: Use React hooks (useState, useEffect, useContext) without external state library

**Rationale**:
- Sufficient for application complexity
- No additional dependencies (smaller bundle)
- Easier for engineers to understand (standard React)
- Performance adequate (< 100 components)

**State Structure**:
```javascript
// Global context (if needed)
const AppContext = {
  models: [], // Configured model names
  apiEndpoint: ''
}

// Component state
- currentJob: {jobId, status, results[]}
- galleryFolders: []
- selectedGallery: null
- prompt: ''
- parameters: {steps, guidance, control}
- loadingStatus: Array(9).fill(false)
```

**Tradeoffs**:
- Prop drilling for deeply nested components (mitigated by composition)
- No time-travel debugging (not needed)

**Alternative Considered**: Redux (rejected - overengineered)

---

### ADR 008: Image Storage Format

**Decision**: Store images as JSON files containing base64-encoded image + metadata

**Rationale**:
- Matches existing `pixel-prompt-lambda` implementation
- Single file contains all info (image + prompt + params + model)
- Easy to fetch and parse (one S3 request per image)
- CloudFront can cache JSON responses

**Schema**:
```json
{
  "output": "base64-encoded-image-data",
  "model": "DALL-E 3",
  "prompt": "vivid description...",
  "steps": 28,
  "guidance": 5,
  "target": "2025-11-15-14-30-45",
  "timestamp": "ISO-8601",
  "NSFW": false
}
```

**Path Structure**:
- `group-images/{target}/{model}-{timestamp}.json`
- Target: Timestamp of generation request (groups all 9 models together)
- Model: Normalized model name
- Timestamp: Individual image completion time

**Tradeoffs**:
- Larger files than raw images (base64 encoding overhead ~33%)
- JSON parsing required (fast in JavaScript)

**Alternative Considered**: Separate image files (.png) + metadata (.json) (rejected - two fetches needed)

---

## Tech Stack

### Backend
- **Runtime**: Python 3.12 (Lambda managed runtime)
- **Framework**: AWS SAM (CloudFormation extension)
- **Dependencies**:
  - `boto3`: AWS SDK (S3, Bedrock)
  - `requests`: HTTP client for external APIs
  - `Pillow`: Image processing
  - `openai`: OpenAI SDK
  - `google-genai`: Google Gemini/Imagen SDK
  - Standard library: `json`, `uuid`, `datetime`, `concurrent.futures`, `threading`

### Frontend
- **Build Tool**: Vite 5.x (fast dev server, optimized builds)
- **Framework**: React 18.x (functional components, hooks)
- **Language**: JavaScript (ES6+, no TypeScript to reduce complexity)
- **HTTP Client**: `fetch` API (native browser, no axios needed)
- **Styling**: CSS Modules or styled-components (decide in Phase 2, Section 1)
- **Dependencies**:
  - `react`, `react-dom`
  - `react-router-dom`: Client-side routing (if needed)
  - Minimal external deps (prefer native solutions)

### Infrastructure
- **Compute**: AWS Lambda (3008 MB, 15 min timeout)
- **Storage**: AWS S3 (Standard tier, lifecycle policies)
- **CDN**: AWS CloudFront (default cache behavior)
- **API**: AWS API Gateway HTTP API (cheaper than REST API)
- **IaC**: AWS SAM / CloudFormation YAML

---

## Shared Patterns & Conventions

### Error Handling

**Backend (Lambda)**:
- Always return HTTP 200 (errors in response body)
- Error schema: `{"error": "message", "code": "ERROR_TYPE"}`
- Log errors with context: `print(f"Error in {function}: {error}")`
- Graceful degradation: Partial results better than total failure

**Frontend**:
- Display user-friendly messages (no stack traces)
- Retry failed requests with exponential backoff
- Show error state in UI (error icon, red border)

### Commit Message Convention

Follow Conventional Commits:
```
<type>(<scope>): <subject>

<body>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring (no behavior change)
- `test`: Add/update tests
- `docs`: Documentation only
- `chore`: Build process, dependencies

**Examples**:
```
feat(lambda): implement dynamic model registry

- Parse MODEL_COUNT and MODEL_N_* env vars
- Build models list at initialization
- Add provider detection logic

test(lambda): add tests for model registry parsing
```

### Testing Strategy

**Backend Testing**:
- **Unit Tests**: Test each handler function in isolation (mock external APIs)
- **Integration Tests**: Test Lambda locally with `sam local invoke`
- **Manual Tests**: Deploy to dev account, test end-to-end

**Frontend Testing**:
- **Component Tests**: Render components with mock props
- **Integration Tests**: Test API client with mock responses
- **Manual Tests**: Test in browser with real backend

**Coverage Targets**:
- Backend: 70%+ line coverage
- Frontend: Focus on critical paths (job submission, polling, gallery)

### Code Organization

**Backend Directory Structure**:
```
backend/
├── src/
│   ├── lambda_function.py    # Main handler
│   ├── models/
│   │   ├── registry.py       # Model registry & detection
│   │   └── handlers.py       # Provider-specific handlers
│   ├── jobs/
│   │   ├── manager.py        # Job lifecycle
│   │   └── executor.py       # Parallel execution
│   ├── api/
│   │   ├── generate.py       # POST /generate logic
│   │   ├── status.py         # GET /status logic
│   │   └── enhance.py        # POST /enhance logic
│   ├── utils/
│   │   ├── s3.py             # S3 helpers
│   │   ├── rate_limit.py     # Rate limiting
│   │   └── content_filter.py # NSFW detection
│   └── config.py             # Environment variable loading
├── template.yaml             # SAM template
├── requirements.txt          # Python dependencies
└── tests/
```

**Frontend Directory Structure**:
```
frontend/
├── src/
│   ├── main.jsx              # Entry point
│   ├── App.jsx               # Root component
│   ├── api/
│   │   └── client.js         # API client (fetch wrapper)
│   ├── components/
│   │   ├── PromptInput.jsx
│   │   ├── ParameterSliders.jsx
│   │   ├── GenerateButton.jsx
│   │   ├── ImageGrid.jsx
│   │   ├── Gallery.jsx
│   │   └── ...
│   ├── hooks/
│   │   ├── useJobPolling.js
│   │   └── useGallery.js
│   ├── utils/
│   │   └── helpers.js
│   └── assets/
│       ├── images/
│       ├── sounds/
│       └── fonts/
├── public/
├── index.html
├── vite.config.js
└── package.json
```

---

## Common Pitfalls to Avoid

### Backend Pitfalls

1. **Forgetting to update job status on error**: Always update S3 status file in finally block
2. **Not handling API timeouts**: Set reasonable timeouts for external API calls (30-60s)
3. **Hardcoding bucket names**: Always use environment variables
4. **Blocking the main thread**: Use threading for parallel work
5. **Not validating input**: Check prompt length, parameter ranges before processing
6. **Forgetting CORS**: API Gateway must have CORS enabled for browser requests

### Frontend Pitfalls

1. **Not revoking blob URLs**: Memory leaks from creating blob URLs without cleanup
2. **Infinite polling**: Always have timeout/escape condition for polling loops
3. **Rendering base64 directly**: Convert to blob URL for better performance
4. **Not handling partial results**: Display images as they complete, not all or nothing
5. **Hardcoding API endpoint**: Use environment variables (Vite: `import.meta.env.VITE_API_ENDPOINT`)

---

## Environment Variable Schema

### Backend (Lambda)

**Required**:
```bash
MODEL_COUNT=9                      # Number of models configured
MODEL_1_NAME=DALL-E 3             # Model name (for routing)
MODEL_1_KEY=sk-xxx                # API key
MODEL_2_NAME=Gemini 2.0
MODEL_2_KEY=AIza...
# ... repeat for MODEL_3 through MODEL_N

PROMPT_MODEL_INDEX=2              # Which model to use for prompt enhancement (1-based)
AWS_ID=AKIA...                    # AWS access key (for Bedrock)
AWS_SECRET=xxx                    # AWS secret key
GLOBAL_LIMIT=1000                 # Requests per hour (all IPs)
IP_LIMIT=50                       # Requests per day (per IP)
S3_BUCKET=pixel-prompt-complete   # Created by SAM template
CLOUDFRONT_DOMAIN=xxx.cloudfront.net  # Created by SAM template
```

**Optional**:
```bash
IP_INCLUDE=1.2.3.4,5.6.7.8        # Whitelisted IPs (bypass rate limits)
PERM_NEGATIVE_PROMPT=ugly, blurry # Negative prompt for Stable Diffusion
```

### Frontend

```bash
VITE_API_ENDPOINT=https://xxx.execute-api.us-west-2.amazonaws.com  # API Gateway URL
```

---

## Performance Targets

- **API Response Time** (job creation): < 1 second
- **Image Generation** (per model): 10-60 seconds (depends on external API)
- **Total Job Time** (9 models parallel): 30-90 seconds
- **Gallery Load Time**: < 5 seconds for 50 folders
- **Frontend Bundle Size**: < 500 KB (gzipped)

---

## Security Considerations

1. **API Keys**: Stored as Lambda environment variables (encrypted at rest by AWS)
2. **CORS**: Restrict origins in production (wildcard OK for MVP)
3. **Rate Limiting**: Prevent abuse via global + per-IP limits
4. **Content Filtering**: Block NSFW prompts before API calls
5. **Input Validation**: Sanitize prompt (max length 1000 chars), validate parameters
6. **S3 Bucket Policy**: Private bucket, CloudFront access only (OAI)

---

## Next Steps

Read through all phases (1-2) to understand the full implementation path, then begin with **[Phase 1: Complete Backend Implementation](Phase-1.md)**.
