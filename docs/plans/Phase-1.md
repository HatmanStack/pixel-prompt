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

### Task 0: Codebase Discovery - Frontend and Backend Structure

**Goal:** Explore the existing Pixel Prompt codebase to discover all frontend components, backend endpoints, existing tests, and file structure. Document findings to inform all subsequent tasks in this phase.

**Files to Modify/Create:**
- `docs/CODEBASE_DISCOVERY.md` - Document all findings
- Update `docs/plans/Phase-0.md` "File Structure - Current Codebase" section with detailed findings

**Prerequisites:**
- None (first task in all phases)

**Implementation Steps:**

1. **Discover Frontend Components**
   - Use Glob to find all React components:
     ```bash
     # Find all JSX/JS component files
     find frontend/src -name "*.jsx" -o -name "*.js" | grep -v test | grep -v node_modules

     # Or with Glob tool:
     glob "frontend/src/**/*.jsx"
     ```
   - List all components by category (features/common/layout)
   - Identify component file organization pattern
   - Document component naming conventions

2. **Discover Frontend Structure Details**
   - Find hooks: `glob "frontend/src/hooks/**/*.js"`
   - Find contexts: `glob "frontend/src/context/**/*.js"`
   - Find utilities: `glob "frontend/src/utils/**/*.js"`
   - Find API client: `glob "frontend/src/api/**/*.js"`
   - Check for existing tests: `glob "frontend/src/**/*.test.{js,jsx}"`

3. **Discover Backend Endpoints**
   - Read `backend/src/lambda_function.py` to identify all route handlers
   - Use Grep to find route definitions:
     ```bash
     grep -n "def.*handler\|route\|@app\|if.*path" backend/src/lambda_function.py
     ```
   - List all endpoints: /generate, /status, /enhance, /gallery/*, etc.
   - Document request/response patterns

4. **Discover Backend Structure**
   - Find model handlers: `glob "backend/src/models/**/*.py"`
   - Find utilities: `glob "backend/src/utils/**/*.py"`
   - Find existing tests: `glob "backend/tests/**/*.py"`
   - Identify which model providers are implemented
   - Use Grep to find handler functions:
     ```bash
     grep -n "def.*handler\|class.*Handler" backend/src/models/handlers.py
     ```

5. **Discover Existing Tests**
   - Frontend: count existing test files (if any)
   - Backend: read `backend/tests/integration/test_api_endpoints.py`
   - Document test coverage gaps
   - Identify testing patterns already in use

6. **Document Findings**
   - Create `docs/CODEBASE_DISCOVERY.md` with structured findings:
     - Frontend components list (grouped by type)
     - Backend endpoints list
     - Existing tests summary
     - Key files and their purposes
     - Naming conventions observed
     - Patterns to follow
   - Update Phase-0.md with accurate current structure

7. **Verify Critical Components Exist**
   - Confirm these components exist (mentioned in later tasks):
     - PromptInput (or similar prompt entry component)
     - ImageCard/ImageGrid (or similar image display)
     - GenerationPanel (or similar main generation UI)
     - GalleryBrowser (or similar gallery view)
   - If names differ, document actual names to use in later tasks

**Verification Checklist:**
- [ ] CODEBASE_DISCOVERY.md created with all findings
- [ ] Frontend components cataloged (minimum 10+ components found)
- [ ] Backend endpoints cataloged (minimum 5 endpoints)
- [ ] Existing tests documented
- [ ] Component naming conventions identified
- [ ] Critical components for testing located (or noted as missing)
- [ ] Phase-0.md updated with actual current structure

**Testing Instructions:**
```bash
# Discover frontend structure
cd frontend
find src -name "*.jsx" -type f | head -20

# Discover backend structure
cd ../backend
grep -n "path ==" src/lambda_function.py

# Check for existing tests
find . -name "*test*.py" -o -name "*test*.js"

# Document all findings in CODEBASE_DISCOVERY.md
```

**Commit Message Template:**
```
docs: add codebase discovery documentation

- Catalog all frontend components (X components found)
- Catalog all backend endpoints (Y endpoints found)
- Document existing test coverage
- Identify naming conventions and patterns
- Update Phase-0 with accurate current structure
```

**Estimated Tokens:** ~5,000

---

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

**Goal:** Write comprehensive component tests for core UI components covering rendering, user interactions, and prop variations. Use actual component names discovered in Task 0.

**Files to Modify/Create:**
- Test files for components found in Task 0 discovery (examples below assume common names, adjust based on actual findings):
  - `frontend/src/__tests__/components/{PromptInputComponent}.test.jsx`
  - `frontend/src/__tests__/components/{ParameterSlidersComponent}.test.jsx`
  - `frontend/src/__tests__/components/{ImageCardComponent}.test.jsx`
  - `frontend/src/__tests__/components/{GenerateButtonComponent}.test.jsx`

**Prerequisites:**
- Task 0 complete (codebase discovered, components located)
- Task 1 complete (Vitest configured)

**Implementation Steps:**

1. **Review Discovery Documentation**
   - Read `CODEBASE_DISCOVERY.md` from Task 0
   - Identify which core components exist for testing
   - Note actual component names (may differ from examples: PromptInput, ParameterSliders, ImageCard, GenerateButton)
   - If expected components don't exist, document in verification notes

2. **Identify Test Scenarios for Each Component**
   - Read component source code to understand props, state, and behavior
   - List user interactions (clicks, typing, slider changes)
   - Identify edge cases (empty inputs, loading states, errors)
   - Plan accessibility tests (ARIA roles, keyboard navigation)

3. **Write Tests for Prompt Input Component**
   - (Example expectations - adjust based on actual component behavior)
   - Renders with placeholder text
   - Updates value on user typing
   - Shows character counter if implemented
   - Calls onChange callback with new value
   - Handles empty input gracefully
   - Tests maxLength enforcement if applicable

4. **Write Tests for Parameter Controls Component**
   - (May be sliders, inputs, or other controls - check discovery docs)
   - Renders parameter controls (steps, guidance, control) with correct labels
   - Default values displayed correctly
   - onChange fires when values changed
   - Min/max values enforced based on discovered constraints
   - Value labels update in real-time

5. **Write Tests for Image Display Component**
   - (May be called ImageCard, ImageTile, or similar - check discovery)
   - Renders loading state (skeleton or spinner)
   - Displays image when URL provided
   - Shows model name and generation metadata
   - Download button triggers download action if present
   - Error state displayed when image fails to load
   - Handles missing optional props gracefully

6. **Write Tests for Generate/Submit Button Component**
   - Renders with correct label (check actual label in code)
   - Disabled when prompt is invalid or empty
   - Disabled when loading state active
   - Calls onClick handler when clicked
   - Shows loading indicator during generation
   - Accessible via keyboard (Enter key)

7. **Follow Testing Best Practices**
   - Use `screen.getByRole()` for accessibility-focused queries
   - Use `userEvent` for realistic user interactions (not `fireEvent`)
   - Test behavior, not implementation details (avoid testing state directly)
   - Mock external dependencies (API calls, context)

**Verification Checklist:**
- [ ] All component tests pass (`npm test`)
- [ ] Each discovered core component has 4+ test cases
- [ ] Tests cover happy path, edge cases, and error states
- [ ] No warnings about improper cleanup or async issues
- [ ] Coverage report shows 60%+ coverage for tested components
- [ ] If expected components missing, documented in verification notes with explanation

**Testing Instructions:**
Run tests for each component file (use actual component names from Task 0):
```bash
# Example - adjust component names based on discovery
npm test {ActualPromptComponentName}
npm test {ActualParameterComponentName}
npm test {ActualImageComponentName}
npm test {ActualButtonComponentName}

# Or run all tests
npm test
```

All tests should pass. Check coverage with `npm run test:coverage`.

**Commit Message Template:**
```
test(frontend): add component tests for core UI elements

- {ActualComponent1Name}: text input, character counter, validation
- {ActualComponent2Name}: parameter controls, value updates
- {ActualComponent3Name}: loading/error states, image display
- {ActualComponent4Name}: disabled states, click handling

[List actual components tested based on discovery findings]
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

---

## Review Feedback (Iteration 1)

### Task 1: Vitest Configuration ✓ COMPLETED

**Excellent work!** Verified with tools:
- ✓ `Read vite.config.js`: Test config present with globals, jsdom, coverage
- ✓ `Read package.json`: All test scripts configured correctly
- ✓ `Read setupTests.js`: jest-dom imported, cleanup configured
- ✓ `Bash npm test`: All 122 tests passing

**Critical Dependency Issue Found:**

> **Consider:** When running `npm install`, the installation fails with a peer dependency error. Looking at `package.json` line 17, the project uses `"react": "^19.2.0"`, but `@testing-library/react@15.0.0` has a peer dependency on React 18. Have you verified that the tests actually work without using `--legacy-peer-deps`?
>
> **Reflect:** The plan at Phase-0.md line 268 specifies "React 18+" as the framework. Does the current codebase use React 19? If so, should you update `@testing-library/react` to a version compatible with React 19, or downgrade React to 18?
>
> **Think about:** Future contributors will run `npm install` and encounter this error. What would make the setup experience smoother? (Hint: Either update the dependency versions to be compatible, or document the `--legacy-peer-deps` requirement in the README.)

### Tasks 2 & 3: Component Tests ✓ EXCELLENT

**Outstanding test coverage!** Verified with tools:
- ✓ `Glob frontend/src/__tests__/components/*.jsx`: Found 8 component test files
- ✓ `Bash npm test`: 122 tests passing across 9 files
- ✓ `Bash npm run test:coverage`: 97% coverage for tested generation components, 97% for gallery components
- ✓ `Read PromptInput.test.jsx`: High-quality tests using userEvent, accessibility queries, edge cases

The tests follow best practices: userEvent for interactions, accessibility-focused queries, comprehensive edge case coverage. Well done!

### Task 4: Integration Tests ✗ MISSING

> **Consider:** Looking at the success criteria on line 10, the plan requires "5+ frontend integration tests for user flows." When running `Glob "frontend/src/__tests__/integration/*.jsx"`, what result did you get?
>
> **Reflect:** The plan at lines 418-505 specifies creating integration tests for: generateFlow, galleryFlow, enhanceFlow, and errorHandling. Where are these files located in your implementation?
>
> **Think about:** Integration tests verify that multiple components work together. The current tests only test individual components in isolation. How will you verify that the complete user flow—from entering a prompt, clicking generate, polling for status, and displaying results—actually works end-to-end?

**Action Required:**
- Create `frontend/src/__tests__/integration/` directory
- Implement the 4 integration test files specified in Task 4
- Each test should render the full App or major component trees
- Mock API calls with fixtures
- Verify complete user workflows

### Task 5: Backend Unit Tests - Model Handlers ✗ MISSING

> **Consider:** When running `ls backend/tests/unit/`, what directory structure do you see? The plan on line 519 specifies creating `backend/tests/unit/test_handlers.py`. Does this file exist?
>
> **Reflect:** The plan lines 538-566 detail writing tests for OpenAI, Google, Bedrock, and other handlers. Looking at the CODEBASE_DISCOVERY.md you created, you documented 8+ model providers. Have you created any unit tests for these handlers?
>
> **Think about:** The success criteria on line 11 states "Backend unit tests for all model handlers." Without these tests, how will you ensure that request formatting, response parsing, and error handling work correctly for each provider?

**Action Required:**
- Create `backend/tests/unit/` directory structure
- Create `test_handlers.py`, `test_registry.py`, `conftest.py`
- Install test dependencies: `responses`, `moto`, `pytest-mock`
- Write tests for ALL model handlers discovered in Task 0
- Mock external API calls—no real network requests in tests

### Task 6: Backend Unit Tests - Utilities ✗ MISSING

> **Consider:** The plan lines 612-705 specify creating tests for `storage.py`, `rate_limit.py`, `content_filter.py`, `enhance.py`, and `job_manager.py`. Looking at your git commits with `git log --format='%s' -10`, do any commit messages mention backend unit tests?
>
> **Reflect:** These utility functions contain critical business logic (S3 operations, rate limiting, content filtering). Without tests, how confident are you that error handling, edge cases, and concurrent operations work correctly?
>
> **Think about:** Task 6 verification checklist (line 672) requires "Coverage for utils > 80%." What is your current backend coverage? (Hint: You can check with `pytest backend/tests/unit/ --cov=src/utils`)

**Action Required:**
- Create test files for each utility module
- Use `moto` for S3 mocking (storage tests)
- Use `freezegun` or `pytest-mock` for time-dependent tests (rate limiting)
- Test edge cases: empty inputs, concurrent requests, external failures

### Task 7: Documentation Updates ✗ INCOMPLETE

**Partial completion verified:**
- ✓ `Read .gitignore`: Coverage directories added (line 39: `coverage/`)

**Missing documentation verified:**

> **Consider:** The plan lines 721-728 requires updating `frontend/README.md` with a "Testing" section. When running `Grep "test|Test|coverage" frontend/README.md`, what testing-related content appears in the README?
>
> **Reflect:** Looking at the current `frontend/README.md`, do you see test scripts documented? The plan specifically states to "Add 'Testing' section with commands (`npm test`, `npm run test:coverage`)."
>
> **Think about:** The plan line 732 requires creating `CONTRIBUTING.md` with testing requirements. When running `ls /home/user/pixel-prompt/ | grep CONTRIBUTING`, what file do you see?

**Action Required:**
- Add comprehensive "Testing" section to `frontend/README.md` including:
  - How to run tests (`npm test`)
  - How to run coverage (`npm run test:coverage`)
  - Test file structure explanation
  - Coverage targets (60%+ for components)
  - Troubleshooting common test failures
- Create `CONTRIBUTING.md` at project root with:
  - Testing requirements for contributors
  - PR must maintain/improve coverage
  - How to run full test suite before submitting
  - Conventional commit format
- Update `backend/TESTING.md` with unit test instructions (not just integration tests)

### Phase Completion Status

**Completed Tasks:** 3.5 out of 7
- ✓ Task 0: Codebase Discovery
- ✓ Task 1: Vitest Configuration (with dependency issue noted)
- ✓ Task 2: Core Component Tests
- ✓ Task 3: Feature Component Tests
- ✗ Task 4: Integration Tests (0% complete)
- ✗ Task 5: Backend Model Handler Tests (0% complete)
- ✗ Task 6: Backend Utility Tests (0% complete)
- ◐ Task 7: Documentation (30% complete - only .gitignore updated)

**Overall Phase 1 Status:** ❌ **NOT APPROVED** - Requires significant additional work

### Success Criteria Check

From lines 850-858:
- [ ] 40+ total tests across frontend and backend (Current: **122 frontend, 0 backend unit** = FAIL, need backend tests)
- [x] 60%+ frontend component coverage (Current: **70-100% for tested components** = PASS)
- [ ] 70%+ backend overall coverage (Current: **Unknown, no unit tests exist** = FAIL)
- [ ] 80%+ backend handler coverage (Current: **0%, no tests** = FAIL)
- [x] All tests passing on first run (Frontend: **YES**, Backend unit: **N/A**)
- [ ] Test suite runs in < 1 minute total (Frontend: **11s**, Backend: **N/A**)
- [ ] Documentation complete and accurate (**FAIL** - missing README testing section, CONTRIBUTING.md)
- [x] Zero test flakiness (**PASS** - tests are deterministic)

**Critical Gaps:**
1. **No integration tests** - Cannot verify user flows work end-to-end
2. **No backend unit tests** - Zero coverage for model handlers and utilities (Tasks 5-6 entirely missing)
3. **Incomplete documentation** - Contributors don't know how to run tests or contribute

**Next Steps:**
1. Resolve React version conflict (React 19 vs @testing-library/react peer deps)
2. Implement Task 4: Create all 4 integration test files
3. Implement Task 5: Create backend unit tests for all model handlers
4. Implement Task 6: Create backend unit tests for all utilities
5. Complete Task 7: Update all documentation (README, CONTRIBUTING.md, backend/TESTING.md)
