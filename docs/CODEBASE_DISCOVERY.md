# Pixel Prompt Complete - Codebase Discovery

**Discovery Date:** 2025-11-16
**Purpose:** Document the existing codebase structure to inform Phase 1 testing implementation

## Executive Summary

The Pixel Prompt Complete application is a well-structured React + AWS Lambda serverless application for multi-model AI image generation. The codebase consists of:

- **Frontend:** 25 source files (17 JSX components + 8 JS modules) - **NO existing tests**
- **Backend:** 14 Python modules - **1 integration test file with 20+ tests**
- **Architecture:** Clear separation of concerns, follows React best practices, modular Python structure

## Frontend Structure (frontend/src/)

### Component Organization

**Total Components:** 17 JSX files organized into 3 categories

#### Common Components (6 files)
Location: `frontend/src/components/common/`

1. **BreathingBackground.jsx** - Animated background component
2. **Container.jsx** - Layout wrapper component
3. **Expand.jsx** - Expandable section component
4. **Header.jsx** - Application header with navigation
5. **Footer.jsx** - Application footer
6. **LoadingSkeleton.jsx** - Skeleton loader for async content

#### Gallery Components (2 files)
Location: `frontend/src/components/gallery/`

1. **GalleryBrowser.jsx** - Main gallery list view with previews
2. **GalleryPreview.jsx** - Individual gallery preview card

#### Generation Components (7 files)
Location: `frontend/src/components/generation/`

1. **GenerationPanel.jsx** - Main orchestration component (integrates all generation features)
2. **PromptInput.jsx** - Textarea for prompt entry
3. **PromptEnhancer.jsx** - Prompt enhancement UI (calls /enhance endpoint)
4. **ParameterSliders.jsx** - Steps and guidance parameter controls
5. **GenerateButton.jsx** - Primary action button to start generation
6. **ImageCard.jsx** - Individual image result card with loading/error states
7. **ImageGrid.jsx** - Grid layout for 9 model results

### Custom Hooks (4 files)
Location: `frontend/src/hooks/`

1. **useJobPolling.js** - Polls /status/{jobId} endpoint every 2s during generation
2. **useGallery.js** - Fetches and manages gallery list state
3. **useSound.js** - Manages sound effects (completion sounds)
4. **useImageLoader.js** - Handles progressive image loading with retry logic

### Context and State (1 file)
Location: `frontend/src/context/`

1. **AppContext.jsx** - Global state provider using React Context API
   - Manages: prompt, parameters (steps/guidance/control), currentJob, generatedImages, isGenerating

### API Client (2 files)
Location: `frontend/src/api/`

1. **client.js** - Main API client with 5 exported functions:
   - `generateImages(prompt, params)` → POST /generate
   - `getJobStatus(jobId)` → GET /status/{jobId}
   - `enhancePrompt(prompt)` → POST /enhance
   - `listGalleries()` → GET /gallery/list
   - `getGallery(galleryId)` → GET /gallery/{galleryId}
   - Implements: timeout (30s), retry with exponential backoff, error handling

2. **config.js** - API configuration (base URL, routes, retry settings)

### Utilities (1 file)
Location: `frontend/src/utils/`

1. **imageHelpers.js** - Image download and manipulation utilities

### Entry Points (2 files)
- **main.jsx** - React app entry point (ReactDOM.render)
- **App.jsx** - Root component with routing and context providers

### Naming Conventions Observed

- Components: PascalCase with descriptive names (e.g., `GenerationPanel`)
- Hooks: camelCase with `use` prefix (e.g., `useJobPolling`)
- Files: Match component/module names exactly
- CSS Modules: `{ComponentName}.module.css` pattern (not discovered but implied)

### Existing Test Coverage

**Status:** ❌ NO TEST FILES FOUND

Search results:
```bash
glob "frontend/src/**/*.test.{js,jsx}" → No files found
```

All frontend testing infrastructure needs to be created from scratch.

---

## Backend Structure (backend/src/)

### API Endpoints (lambda_function.py)

**Main Handler:** `lambda_handler(event, context)` routes requests based on path

**Endpoints Identified:**

1. **POST /generate** - Create image generation job
   - Handler: `handle_generate(event)`
   - Validates: prompt length (1-1000 chars), rate limit, content filter
   - Returns: `{"jobId": "uuid", "totalModels": 9}`
   - Creates job and starts background thread execution

2. **GET /status/{jobId}** - Poll job status
   - Handler: `handle_status(event)`
   - Returns: Job status with results array (completed/in_progress/failed)
   - Adds CloudFront URLs to completed images

3. **POST /enhance** - Enhance prompt with LLM
   - Handler: `handle_enhance(event)`
   - Validates: prompt length (1-500 chars), content filter
   - Returns: `{"original": "...", "enhanced": "..."}`
   - Uses configured LLM (via PromptEnhancer)

4. **GET /gallery/list** - List all generation galleries
   - Handler: `handle_gallery_list(event)`
   - Returns: Array of galleries with preview images and metadata

5. **GET /gallery/{galleryId}** - Get specific gallery details
   - Handler: `handle_gallery_detail(event)`
   - Returns: All images from gallery with metadata

### Module Organization

#### Models (2 files)
Location: `backend/src/models/`

1. **registry.py** - Model Registry
   - `ModelRegistry` class: Manages model configurations
   - `detect_provider(model_name)`: Pattern matching to identify provider
   - Dynamically loads models from environment variables
   - Providers detected: openai, google_gemini, google_imagen, bedrock_nova, bedrock_sd, stability, black_forest, recraft, generic

2. **handlers.py** - Provider-specific handlers
   - Each handler function signature: `handle_X(model_config, prompt, params) → dict`
   - Handlers discovered (first 100 lines):
     - `handle_openai()` - DALL-E 3 (downloads image, converts to base64)
     - `handle_google_gemini()` - Gemini 2.0 Flash Experimental
     - Additional handlers likely: Google Imagen, Bedrock Nova, Bedrock SD, Stability AI, etc.
   - Standardized response: `{"status": "success/error", "image": "base64", "model": "name"}`

#### Jobs (2 files)
Location: `backend/src/jobs/`

1. **manager.py** - JobManager class
   - `create_job(prompt, params, models)` → job_id
   - `get_job_status(job_id)` → status dict
   - `update_job_result(job_id, model, result)` → None
   - Persists job state to S3 for Lambda container statelessness

2. **executor.py** - JobExecutor class
   - `execute_job(job_id, prompt, params, target)` → None
   - Runs model handlers in parallel using threading
   - Saves results to S3 via ImageStorage

#### API (1 file)
Location: `backend/src/api/`

1. **enhance.py** - PromptEnhancer class
   - `enhance_safe(prompt)` → enhanced_text
   - Uses configured LLM model from registry
   - Fallback: returns original prompt on error

#### Utilities (3 files)
Location: `backend/src/utils/`

1. **storage.py** - ImageStorage class
   - S3 upload/download operations
   - CloudFront URL generation
   - Gallery listing and image metadata retrieval

2. **rate_limit.py** - RateLimiter class
   - Global and per-IP rate limiting
   - IP whitelist support
   - Persists counters to S3

3. **content_filter.py** - ContentFilter class
   - NSFW keyword detection
   - Prompt validation

#### Configuration (1 file)
- **config.py** - Loads environment variables (models, S3 bucket, CloudFront domain, rate limits)

### Existing Test Coverage

**Integration Tests:** ✅ 1 file with 20+ tests
Location: `backend/tests/integration/test_api_endpoints.py`

**Test Classes:**
1. `TestHealthAndBasicEndpoints` - 404 routing, CORS headers
2. `TestPromptEnhancement` - /enhance validation and success cases
3. `TestGalleryEndpoints` - /gallery/list and /gallery/{id}
4. `TestImageGeneration` (@pytest.mark.slow) - Full generation workflow
5. `TestInputValidation` - Empty prompts, long prompts, invalid JSON

**Unit Tests:** ❌ NO UNIT TESTS FOUND
Search results:
```bash
glob "backend/tests/unit/**/*.py" → No files found
```

All backend unit testing infrastructure needs to be created.

---

## Testing Gaps Identified

### Critical Components Lacking Tests

**Frontend (0% coverage):**
- ❌ All 17 components untested
- ❌ All 4 custom hooks untested
- ❌ AppContext untested
- ❌ API client retry logic untested
- ❌ User flows untested

**Backend (partial coverage):**
- ✅ API endpoints have integration tests (20+ tests)
- ❌ Model handlers untested (no mocking, no unit tests)
- ❌ Utilities untested (storage, rate_limit, content_filter)
- ❌ JobManager and JobExecutor untested
- ❌ PromptEnhancer untested

### Priority Testing Targets (Phase 1)

**High Priority:**
1. Model handlers (8+ providers) - mock external APIs
2. API client retry logic - mock fetch failures
3. Core components (PromptInput, ImageGrid, GenerationPanel)
4. User flows (generate → poll → display results)

**Medium Priority:**
5. Utilities (S3 retry, rate limiting, content filter)
6. JobManager state management
7. Gallery components
8. Error handling flows

**Low Priority:**
9. Common components (Header, Footer, LoadingSkeleton)
10. Sound effects hook
11. Image helper utilities

---

## Architecture Patterns Observed

### Frontend Patterns

**State Management:**
- Global state: React Context API (AppContext)
- Local state: useState hooks in components
- Server state: Custom hooks (useJobPolling, useGallery)

**Component Composition:**
- Container/Presentational pattern (GenerationPanel orchestrates child components)
- Props drilling minimized via context
- Single responsibility (each component has clear purpose)

**API Integration:**
- Centralized API client module
- Automatic retry with exponential backoff
- Timeout handling (30s default)
- Error objects with status codes

**Async Patterns:**
- Polling: useJobPolling hook with 2s interval
- Progressive loading: Images update as models complete
- Optimistic UI: Generation starts immediately, results stream in

### Backend Patterns

**Request Routing:**
- Single Lambda handler with path-based routing
- Dedicated handler functions per endpoint
- Standardized response format (status code + JSON body)

**Job Execution:**
- Asynchronous with threading (job created → background execution)
- State persistence to S3 (job status, results)
- Partial results supported (some models succeed, others fail)

**Provider Abstraction:**
- Dynamic model registry loaded from environment
- Standardized handler interface
- Provider detection via name pattern matching

**Error Handling:**
- Try/catch in all handlers
- Structured error responses
- Logging with print statements (Lambda CloudWatch)

**Security:**
- Rate limiting (global + per-IP)
- Content filtering (NSFW keywords)
- Input validation (length, required fields)

---

## Key Files for Testing

### Must Read Before Writing Tests

**Frontend:**
1. `frontend/src/components/generation/GenerationPanel.jsx` - Main integration point
2. `frontend/src/api/client.js` - Retry logic, error handling
3. `frontend/src/hooks/useJobPolling.js` - Polling logic
4. `frontend/src/context/AppContext.jsx` - Global state shape

**Backend:**
1. `backend/src/lambda_function.py` - All endpoint handlers (lines 80-402)
2. `backend/src/models/handlers.py` - Handler function signatures
3. `backend/src/models/registry.py` - Provider detection logic
4. `backend/tests/integration/test_api_endpoints.py` - Existing test patterns

---

## Naming Conventions for Tests

Based on existing integration tests and React best practices:

**Frontend Test Files:**
- Location: `frontend/src/__tests__/components/{ComponentName}.test.jsx`
- Integration tests: `frontend/src/__tests__/integration/{flowName}.test.jsx`
- Fixtures: `frontend/src/__tests__/fixtures/apiResponses.js`

**Backend Test Files:**
- Unit tests: `backend/tests/unit/test_{module}.py`
- Fixtures: `backend/tests/unit/fixtures/api_responses.py`
- Conftest: `backend/tests/unit/conftest.py` (pytest fixtures)

**Test Naming:**
- Frontend: `describe('{ComponentName}', () => { it('renders with...', ...) })`
- Backend: `class Test{Module}: def test_{behavior}(self):`

---

## Dependencies Already Present

### Frontend (package.json)
- React 18+
- Vite (build tool)
- NO testing libraries yet ❌

**Need to Install:**
- vitest
- @testing-library/react
- @testing-library/jest-dom
- @testing-library/user-event
- jsdom

### Backend (requirements.txt)
- pytest ✅ (already present)
- requests ✅ (for integration tests)

**Need to Install:**
- responses (HTTP mocking)
- moto (boto3 S3 mocking)
- pytest-mock (enhanced mocking)
- pytest-cov (coverage reporting)

---

## Verification Checklist

- [x] Frontend components cataloged (17 components found)
- [x] Backend endpoints cataloged (5 endpoints found)
- [x] Existing tests documented (1 integration test file)
- [x] Component naming conventions identified
- [x] Critical components for testing located
- [x] Model handlers identified (8+ providers)
- [x] API client functions documented (5 functions)
- [x] Testing gaps identified and prioritized

---

## Next Steps for Phase 1

**Task 1:** Configure Vitest
- Install testing dependencies
- Configure vite.config.js for test environment
- Create setupTests.js for global matchers
- Verify with simple test

**Task 2-3:** Component Tests
- Use actual component names discovered above
- Test GenerationPanel, PromptInput, ParameterSliders, ImageCard, ImageGrid, GenerateButton
- Test GalleryBrowser, GalleryPreview
- Mock AppContext and API client

**Task 4:** Integration Tests
- Test generate → poll → display flow
- Test gallery browsing flow
- Test enhance prompt flow
- Mock all API responses with fixtures

**Task 5-6:** Backend Unit Tests
- Mock external APIs (OpenAI, Google, Bedrock) with responses library
- Mock S3 operations with moto
- Test all handler functions
- Test utilities (storage, rate_limit, content_filter)
- Test JobManager and PromptEnhancer

---

**Discovery Complete - Ready for Implementation**
