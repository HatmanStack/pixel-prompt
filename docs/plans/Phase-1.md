# Phase 1: Testing Foundation

## Phase Goal

Establish comprehensive automated test coverage across frontend and backend, achieving 70%+ coverage on critical paths. This phase implements frontend component and integration tests using Vitest/React Testing Library, expands backend unit tests for model handlers with mocked external APIs, and sets up test infrastructure that will support all subsequent development.

**Success Criteria:**
- Vitest configured and running for frontend tests
- 15+ frontend component tests covering critical user interactions
- 5+ frontend integration tests for user flows
- Backend unit tests for all model handlers (OpenAI, Google, Bedrock, etc.)
- Test coverage reports generated for both frontend and backend
- All tests passing and documented in CI/CD-ready format

**Estimated Tokens:** ~100,000

---

## Prerequisites

- Phase 0 reviewed and understood
- Node.js 18+ and Python 3.12+ installed
- Frontend and backend dependencies installed
- Existing integration tests passing (`pytest backend/tests/integration/`)

---

## Tasks

### Task 1: Configure Vitest for Frontend Testing

**Goal:** Set up Vitest testing framework with React Testing Library, configure test environment, and verify basic test execution.

**Files to Modify/Create:**
- `frontend/package.json` - Add Vitest and testing dependencies
- `frontend/vite.config.js` - Add test configuration
- `frontend/src/setupTests.js` - Configure testing library matchers
- `frontend/src/__tests__/example.test.jsx` - Verification test

**Prerequisites:**
- None (first task in phase)

**Implementation Steps:**

1. **Install Testing Dependencies**
   - Add Vitest as dev dependency along with React Testing Library
   - Include jsdom for DOM environment simulation
   - Add @testing-library/jest-dom for extended matchers
   - Install @testing-library/user-event for simulating user interactions

2. **Configure Vite for Testing**
   - Extend existing `vite.config.js` with test configuration
   - Set test environment to jsdom (browser-like environment)
   - Configure globals to use `describe`, `it`, `expect` without imports
   - Set up coverage reporting with v8 provider
   - Include all src files in coverage, exclude test files

3. **Create Test Setup File**
   - Import jest-dom matchers for extended assertions
   - Configure any global test utilities or mocks
   - Set up cleanup between tests

4. **Add Test Scripts to package.json**
   - `test`: Run all tests
   - `test:ui`: Open Vitest UI for interactive testing
   - `test:coverage`: Generate coverage report
   - `test:watch`: Run tests in watch mode during development

5. **Create Verification Test**
   - Write simple component test to verify setup works
   - Test a basic component like Button or Header
   - Ensure test passes and coverage is generated

**Verification Checklist:**
- [ ] `npm test` runs without errors
- [ ] Test output shows passing tests
- [ ] Coverage report generated in `coverage/` directory
- [ ] Vitest UI accessible via `npm run test:ui`
- [ ] No warnings about missing dependencies or configuration

**Testing Instructions:**
This task sets up the testing infrastructure itself. Verify by:
```bash
cd frontend
npm test
# Should show: "Test Files  1 passed (1)"

npm run test:coverage
# Should generate coverage/ directory with HTML report
```

**Commit Message Template:**
```
test(frontend): configure Vitest and React Testing Library

- Add Vitest, @testing-library/react, jsdom dependencies
- Configure test environment in vite.config.js
- Set up jest-dom matchers in setupTests.js
- Add test scripts to package.json
- Create verification test for setup validation
```

**Estimated Tokens:** ~8,000

---

### Task 2: Frontend Component Tests - Core Components

**Goal:** Write comprehensive component tests for core UI components (PromptInput, ParameterSliders, ImageCard, GenerateButton) covering rendering, user interactions, and prop variations.

**Files to Modify/Create:**
- `frontend/src/__tests__/components/PromptInput.test.jsx`
- `frontend/src/__tests__/components/ParameterSliders.test.jsx`
- `frontend/src/__tests__/components/ImageCard.test.jsx`
- `frontend/src/__tests__/components/GenerateButton.test.jsx`

**Prerequisites:**
- Task 1 complete (Vitest configured)

**Implementation Steps:**

1. **Identify Test Scenarios for Each Component**
   - Read component source code to understand props, state, and behavior
   - List user interactions (clicks, typing, slider changes)
   - Identify edge cases (empty inputs, loading states, errors)
   - Plan accessibility tests (ARIA roles, keyboard navigation)

2. **Write PromptInput Tests**
   - Renders with placeholder text
   - Updates value on user typing
   - Shows character counter (e.g., "150/500")
   - Calls onChange callback with new value
   - Handles empty input gracefully
   - Tests maxLength enforcement if applicable

3. **Write ParameterSliders Tests**
   - Renders three sliders (steps, guidance, control) with correct labels
   - Default values displayed correctly
   - onChange fires when slider moved
   - Min/max values enforced (steps: 1-100, guidance: 0-20, control: 0-2)
   - Value labels update in real-time

4. **Write ImageCard Tests**
   - Renders loading state (skeleton or spinner)
   - Displays image when URL provided
   - Shows model name and generation time
   - Download button triggers download action
   - Error state displayed when image fails to load
   - Handles missing optional props gracefully

5. **Write GenerateButton Tests**
   - Renders with correct label ("Generate Images")
   - Disabled when prompt is empty
   - Disabled when loading state active
   - Calls onClick handler when clicked
   - Shows loading indicator during generation
   - Accessible via keyboard (Enter key)

6. **Follow Testing Best Practices**
   - Use `screen.getByRole()` for accessibility-focused queries
   - Use `userEvent` for realistic user interactions (not `fireEvent`)
   - Test behavior, not implementation details (avoid testing state directly)
   - Mock external dependencies (API calls, context)

**Verification Checklist:**
- [ ] All component tests pass (`npm test`)
- [ ] Each component has 4+ test cases
- [ ] Tests cover happy path, edge cases, and error states
- [ ] No warnings about improper cleanup or async issues
- [ ] Coverage report shows 60%+ coverage for tested components

**Testing Instructions:**
Run tests for each component file:
```bash
npm test PromptInput
npm test ParameterSliders
npm test ImageCard
npm test GenerateButton
```

All tests should pass. Check coverage with `npm run test:coverage`.

**Commit Message Template:**
```
test(frontend): add component tests for core UI elements

- PromptInput: text input, character counter, validation
- ParameterSliders: slider interactions, value updates
- ImageCard: loading/error states, image display
- GenerateButton: disabled states, click handling
```

**Estimated Tokens:** ~15,000

---

### Task 3: Frontend Component Tests - Feature Components

**Goal:** Write component tests for feature-specific components (PromptEnhancer, ImageGrid, GalleryBrowser, GalleryPreview) focusing on integration with API client and state management.

**Files to Modify/Create:**
- `frontend/src/__tests__/components/PromptEnhancer.test.jsx`
- `frontend/src/__tests__/components/ImageGrid.test.jsx`
- `frontend/src/__tests__/components/GalleryBrowser.test.jsx`
- `frontend/src/__tests__/components/GalleryPreview.test.jsx`

**Prerequisites:**
- Task 2 complete (core component tests)

**Implementation Steps:**

1. **Set Up API Mocking Strategy**
   - Use Vitest `vi.fn()` to mock API client functions
   - Create fixture data (sample API responses) in `__tests__/fixtures/`
   - Mock fetch calls or use msw (Mock Service Worker) for HTTP interception
   - Ensure mocks reset between tests to avoid state pollution

2. **Write PromptEnhancer Tests**
   - Renders enhance button
   - Calls `/enhance` endpoint when clicked
   - Shows loading state during API call
   - Updates prompt field with enhanced text on success
   - Displays error message on API failure
   - Disabled when prompt already long (e.g., > 200 chars)

3. **Write ImageGrid Tests**
   - Renders grid with correct number of placeholders (9 models)
   - Shows loading state for each model initially
   - Updates images progressively as they complete
   - Handles partial results (some models succeed, others fail)
   - Responsive layout (grid adjusts to screen size)

4. **Write GalleryBrowser Tests**
   - Fetches gallery list on mount
   - Renders gallery preview cards
   - Handles empty gallery (no generations yet)
   - Pagination controls work if implemented
   - Click on preview navigates to detail view
   - Loading state shown during fetch

5. **Write GalleryPreview Tests**
   - Displays thumbnail image
   - Shows generation timestamp
   - Shows model count (e.g., "9 models")
   - Click triggers navigation or callback
   - Handles missing preview image gracefully

6. **Mock Context and Hooks**
   - Mock AppContext provider for components that use global state
   - Mock custom hooks (useJobPolling, useGallery) with controlled return values
   - Test component behavior with different context states

**Verification Checklist:**
- [ ] All feature component tests pass
- [ ] API calls are properly mocked (no real network requests)
- [ ] Tests verify loading, success, and error states
- [ ] Context and hooks mocked without errors
- [ ] Coverage for feature components > 60%

**Testing Instructions:**
```bash
npm test PromptEnhancer
npm test ImageGrid
npm test GalleryBrowser
npm test GalleryPreview

# Verify no network calls made
# Tests should complete in < 5 seconds
```

**Commit Message Template:**
```
test(frontend): add tests for feature components

- PromptEnhancer: API mocking, loading/error states
- ImageGrid: progressive image loading, partial results
- GalleryBrowser: list fetching, empty state
- GalleryPreview: thumbnail display, navigation
```

**Estimated Tokens:** ~18,000

---

### Task 4: Frontend Integration Tests - User Flows

**Goal:** Write integration tests for critical user flows (generate images, view gallery, enhance prompt) that test multiple components working together, including API interactions and state management.

**Files to Modify/Create:**
- `frontend/src/__tests__/integration/generateFlow.test.jsx`
- `frontend/src/__tests__/integration/galleryFlow.test.jsx`
- `frontend/src/__tests__/integration/enhanceFlow.test.jsx`
- `frontend/src/__tests__/integration/errorHandling.test.jsx`
- `frontend/src/__tests__/fixtures/apiResponses.js`

**Prerequisites:**
- Task 3 complete (feature component tests)

**Implementation Steps:**

1. **Create API Response Fixtures**
   - Create realistic mock responses for all API endpoints
   - Include success, partial, and error responses
   - Use actual response structure from `API_INTEGRATION.md`
   - Store in `fixtures/apiResponses.js` for reuse

2. **Write Generate Images Flow Test**
   - User enters prompt text
   - User adjusts parameter sliders
   - User clicks "Generate Images" button
   - Job is created (POST /generate)
   - Polling starts (GET /status/{jobId})
   - Images appear progressively in grid as models complete
   - Final state shows all 9 images or partial results

3. **Write Gallery Flow Test**
   - User navigates to gallery section
   - Gallery list fetches (GET /gallery/list)
   - User clicks on gallery preview
   - Gallery detail fetches (GET /gallery/{id})
   - All images from generation displayed
   - User can navigate back to list

4. **Write Enhance Prompt Flow Test**
   - User types short prompt (e.g., "cat")
   - User clicks "Enhance" button
   - Enhanced prompt returned from API (POST /enhance)
   - Prompt input updated with enhanced text
   - User can then generate with enhanced prompt

5. **Write Error Handling Flow Test**
   - Simulate network error during generation
   - Verify error message displayed to user
   - Simulate 429 rate limit error
   - Verify appropriate error message shown
   - Simulate invalid job ID (404)
   - Verify graceful degradation

6. **Use Realistic Testing Approach**
   - Render full App component, not isolated components
   - Use userEvent for realistic interactions (click, type)
   - Use waitFor/findBy for async updates
   - Avoid testing implementation details (state, props)

**Verification Checklist:**
- [ ] All integration tests pass
- [ ] Tests complete in < 10 seconds each
- [ ] No actual API calls made (all mocked)
- [ ] Tests use realistic user interactions
- [ ] Error paths covered (network failures, API errors)

**Testing Instructions:**
```bash
npm test integration/
# Should show 4+ integration tests passing

# Run specific flow test
npm test generateFlow
```

**Commit Message Template:**
```
test(frontend): add integration tests for user flows

- Generate images: end-to-end flow from input to results
- Gallery browsing: list and detail views
- Prompt enhancement: API integration
- Error handling: network failures, API errors
- Add API response fixtures for mocking
```

**Estimated Tokens:** ~20,000

---

### Task 5: Backend Unit Tests - Model Handlers

**Goal:** Write unit tests for all model handler functions (OpenAI, Google, Bedrock, Stability AI, etc.) with mocked external API calls, ensuring correct request formatting, response parsing, and error handling.

**Files to Modify/Create:**
- `backend/tests/unit/test_handlers.py`
- `backend/tests/unit/test_registry.py`
- `backend/tests/unit/conftest.py` (pytest fixtures)
- `backend/tests/unit/fixtures/api_responses.py`

**Prerequisites:**
- None (independent of frontend tests)

**Implementation Steps:**

1. **Set Up Unit Test Infrastructure**
   - Create `tests/unit/` directory structure
   - Create `conftest.py` with common fixtures (mocked S3, mocked API clients)
   - Use `responses` library to mock HTTP requests to external APIs
   - Use `moto` library to mock boto3 S3 operations
   - Install test dependencies: `responses`, `moto`, `pytest-mock`

2. **Create Mock API Response Fixtures**
   - Create realistic responses for each provider (OpenAI, Google, etc.)
   - Include success responses with image URLs
   - Include error responses (rate limits, invalid API keys, timeouts)
   - Store in `fixtures/api_responses.py`

3. **Write Tests for OpenAI Handler**
   - Test successful DALL-E 3 image generation
   - Verify request body formatting (prompt, size, quality)
   - Verify response parsing (extract image URL)
   - Test error handling (401 unauthorized, 429 rate limit)
   - Test timeout handling
   - Mock `openai.images.generate()` call

4. **Write Tests for Google Handlers**
   - Test Gemini 2.0 Flash Experimental handler
   - Test Imagen 3.0 handler
   - Verify different request formats for each model
   - Test response parsing for different Google response structures
   - Mock `genai.GenerativeModel.generate_content()` calls

5. **Write Tests for Bedrock Handlers**
   - Test Nova Canvas handler
   - Test Stable Diffusion 3.5 handler
   - Mock boto3 bedrock-runtime client
   - Verify request body formatting (prompt, cfg_scale, steps)
   - Test base64 image decoding and S3 upload
   - Test error handling for region-specific models

6. **Write Tests for Generic/Other Handlers**
   - Test Stability AI handler
   - Test Black Forest Labs (Flux) handler
   - Test Recraft handler
   - Test generic OpenAI-compatible handler
   - Verify fallback handling for unknown models

7. **Write Tests for Model Registry**
   - Test model registration from environment variables
   - Test model lookup by index and name
   - Test validation of required fields (name, key)
   - Test handling of missing or invalid models
   - Test prompt model index selection

**Verification Checklist:**
- [ ] All unit tests pass (`pytest tests/unit/ -v`)
- [ ] No real API calls made (all mocked with `responses`)
- [ ] No real S3 operations (all mocked with `moto`)
- [ ] Tests run fast (< 5 seconds total)
- [ ] Coverage for model handlers > 80% (`pytest --cov=src/models`)
- [ ] Error paths tested (timeouts, invalid responses, API errors)

**Testing Instructions:**
```bash
cd backend
pip install responses moto pytest-mock

pytest tests/unit/ -v
# Should show 20+ tests passing

# Run with coverage
pytest tests/unit/ --cov=src/models --cov-report=term-missing
# Should show > 80% coverage for handlers
```

**Commit Message Template:**
```
test(backend): add unit tests for model handlers

- Mock external API calls with responses library
- Test all providers: OpenAI, Google, Bedrock, Stability AI
- Test request formatting and response parsing
- Test error handling for rate limits and timeouts
- Mock S3 operations with moto
- Add pytest fixtures for common test setup
```

**Estimated Tokens:** ~25,000

---

### Task 6: Backend Unit Tests - Utilities and Core Logic

**Goal:** Write unit tests for utility functions (storage.py, rate_limit.py, content_filter.py) and core API logic (enhance.py, job manager), achieving comprehensive coverage of business logic.

**Files to Modify/Create:**
- `backend/tests/unit/test_storage.py`
- `backend/tests/unit/test_rate_limit.py`
- `backend/tests/unit/test_content_filter.py`
- `backend/tests/unit/test_enhance.py`
- `backend/tests/unit/test_job_manager.py`

**Prerequisites:**
- Task 5 complete (handler tests)

**Implementation Steps:**

1. **Write Storage Utility Tests**
   - Test S3 upload function with mocked boto3
   - Test image download from external URL
   - Test metadata formatting (prompt, model, steps)
   - Test S3 key generation (timestamp, model name)
   - Test error handling (S3 errors, network errors)
   - Use `moto` to mock S3 bucket operations

2. **Write Rate Limiting Tests**
   - Test global rate limit enforcement (requests per hour)
   - Test per-IP rate limit enforcement (requests per day)
   - Test whitelist bypass (whitelisted IPs skip limits)
   - Test rate limit expiration (counters reset after time period)
   - Test concurrent requests (thread-safe counter updates)
   - Mock time with `freezegun` or `pytest-mock`

3. **Write Content Filter Tests**
   - Test NSFW keyword detection in prompts
   - Test allowed prompts (no false positives)
   - Test case-insensitive matching
   - Test partial word matching vs. whole words
   - Test filter configuration (add/remove keywords)

4. **Write Prompt Enhancement Tests**
   - Test successful enhancement (short prompt → detailed prompt)
   - Test LLM API call formatting (OpenAI or configured model)
   - Test response parsing (extract enhanced text)
   - Test error handling (API timeout, invalid response)
   - Test fallback (return original prompt on error)
   - Mock LLM API with `responses` library

5. **Write Job Manager Tests**
   - Test job creation (generate unique job ID)
   - Test job status tracking (in_progress, completed, partial, failed)
   - Test model result aggregation
   - Test completed model counting
   - Test job expiration (old jobs cleaned up)

6. **Test Edge Cases and Error Paths**
   - Empty inputs (empty prompts, missing parameters)
   - Invalid inputs (negative steps, out-of-range guidance)
   - Resource exhaustion (S3 quota, rate limit exceeded)
   - External service failures (S3 down, LLM API down)

**Verification Checklist:**
- [ ] All utility tests pass (`pytest tests/unit/ -v`)
- [ ] Coverage for utils > 80% (`pytest --cov=src/utils`)
- [ ] Rate limiting tests pass consistently (no race conditions)
- [ ] Content filter has no false positives in test suite
- [ ] Job manager handles concurrent updates safely

**Testing Instructions:**
```bash
pytest tests/unit/test_storage.py -v
pytest tests/unit/test_rate_limit.py -v
pytest tests/unit/test_content_filter.py -v
pytest tests/unit/test_enhance.py -v
pytest tests/unit/test_job_manager.py -v

# Run with coverage
pytest tests/unit/ --cov=src --cov-report=html
# Open htmlcov/index.html to see coverage report
```

**Commit Message Template:**
```
test(backend): add unit tests for utilities and core logic

- Storage: S3 upload/download with moto mocking
- Rate limiting: global and per-IP limits, whitelist
- Content filter: NSFW detection, edge cases
- Prompt enhancement: LLM API mocking
- Job manager: status tracking, result aggregation
```

**Estimated Tokens:** ~18,000

---

### Task 7: Update Documentation and CI/CD Preparation

**Goal:** Document testing strategy, update README files with test instructions, and prepare test configuration for CI/CD integration in Phase 5.

**Files to Modify/Create:**
- `frontend/README.md` - Add testing section
- `backend/TESTING.md` - Update with unit test instructions
- `CONTRIBUTING.md` - Create contributor guide with testing requirements
- `.gitignore` - Add coverage directories

**Prerequisites:**
- All previous tasks complete (all tests written)

**Implementation Steps:**

1. **Update Frontend README**
   - Add "Testing" section with commands (`npm test`, `npm run test:coverage`)
   - Document test file structure (`__tests__/` directory)
   - Explain how to run specific tests
   - Document coverage targets (60%+ for components)
   - Add troubleshooting section for common test failures

2. **Update Backend TESTING.md**
   - Add "Unit Tests" section alongside existing integration tests
   - Document test structure (`tests/unit/`, `tests/integration/`)
   - Explain mocking strategy (responses, moto)
   - Document how to run unit vs. integration tests
   - Add coverage targets (70%+ overall, 80%+ for handlers)

3. **Create CONTRIBUTING.md**
   - Add "Testing Requirements" section for contributors
   - All new features must include tests
   - PRs must maintain or improve coverage
   - Tests must pass before merging
   - Document how to run full test suite before submitting PR
   - Include conventional commit message format

4. **Update .gitignore**
   - Add `frontend/coverage/` to ignore frontend coverage reports
   - Add `backend/.coverage`, `backend/htmlcov/` for backend coverage
   - Add `.pytest_cache/` for pytest cache
   - Add `node_modules/.vitest/` for Vitest cache

5. **Create Test Summary Report**
   - Document total number of tests (frontend + backend)
   - Document coverage percentages for critical paths
   - List any known limitations or test gaps
   - Add to TESTING.md or create TEST_REPORT.md

6. **Prepare for CI/CD**
   - Ensure tests can run in headless environment (no browser UI)
   - Ensure tests don't require AWS credentials (all mocked)
   - Ensure tests don't require API keys (all mocked)
   - Document any environment variables needed for tests

**Verification Checklist:**
- [ ] README files updated with clear testing instructions
- [ ] CONTRIBUTING.md created with testing requirements
- [ ] .gitignore includes coverage directories
- [ ] Tests run successfully without any manual setup
- [ ] Documentation reviewed for accuracy

**Testing Instructions:**
Follow documented instructions in README and TESTING.md to verify they work:
```bash
# Frontend
cd frontend
npm test          # Should match README instructions
npm run test:coverage

# Backend
cd backend
pytest tests/ -v  # Should match TESTING.md instructions
pytest tests/ --cov=src
```

**Commit Message Template:**
```
docs: update testing documentation and contributor guide

- Add testing section to frontend README
- Update backend TESTING.md with unit test instructions
- Create CONTRIBUTING.md with test requirements
- Update .gitignore for coverage directories
- Document test coverage targets and strategy
```

**Estimated Tokens:** ~6,000

---

## Phase Verification

After completing all tasks:

1. **Run Full Test Suite**
   ```bash
   # Frontend
   cd frontend
   npm test
   npm run test:coverage

   # Backend
   cd backend
   pytest tests/ -v
   pytest tests/ --cov=src --cov-report=term
   ```

2. **Verify Coverage Targets**
   - Frontend: 60%+ coverage for components
   - Backend: 70%+ overall, 80%+ for model handlers
   - Check coverage reports (HTML) for uncovered lines

3. **Verify Test Quality**
   - All tests pass consistently (run 3 times to check for flakiness)
   - Tests run fast (frontend < 30s, backend < 10s)
   - No warnings about cleanup, timers, or async issues
   - Tests are readable and well-documented

4. **Verify Documentation**
   - README and TESTING.md instructions work for new contributor
   - CONTRIBUTING.md clearly explains testing requirements
   - Test output matches documented examples

5. **Check for Known Issues**
   - No skipped tests without documented reason
   - No hardcoded timeouts or sleep statements (use waitFor)
   - No console errors during test runs

**Integration Points for Next Phase:**
- Tests are ready to run in CI/CD (Phase 5)
- Error boundary tests prepare for error handling implementation (Phase 2)
- Component tests provide baseline for performance testing (Phase 4)

**Known Limitations:**
- Visual regression testing not included (out of scope)
- E2E tests with real browser not included (Vitest focuses on component tests)
- Load testing covered in Phase 3, not automated in test suite

---

## Success Metrics

- [ ] 40+ total tests across frontend and backend
- [ ] 60%+ frontend component coverage
- [ ] 70%+ backend overall coverage
- [ ] 80%+ backend handler coverage
- [ ] All tests passing on first run
- [ ] Test suite runs in < 1 minute total
- [ ] Documentation complete and accurate
- [ ] Zero test flakiness (consistent results)

This phase establishes a strong testing foundation that enables confident development in all subsequent phases.
