# Phase 0: Architecture & Design Decisions

## Overview

This document outlines foundational architecture decisions, design patterns, and technical choices that apply across all implementation phases. Read this completely before starting any implementation phase to understand the technical context and rationale behind specific approaches.

## Architecture Decision Records (ADRs)

### ADR-001: Vitest for Frontend Testing

**Decision:** Use Vitest as the frontend testing framework instead of Jest.

**Rationale:**
- Native Vite integration with zero configuration needed
- 2-10x faster than Jest for Vite projects
- Better ESM (ECMAScript Modules) support
- Uses same `vite.config.js` for both dev and test
- Compatible with Jest API, so React Testing Library works identically
- Smaller ecosystem but growing rapidly with strong community

**Implications:**
- Install `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
- Test files use `.test.jsx` or `.spec.jsx` extensions
- Configuration in `vite.config.js` under `test` property
- Use `describe`, `it`, `expect` API (same as Jest)

**Alternatives Considered:**
- Jest: More mature but slower and requires complex Vite configuration
- Cypress Component Testing: Too heavy for unit tests

---

### ADR-002: CloudWatch for Error Logging (No External Services)

**Decision:** Use AWS CloudWatch Logs for all error logging and monitoring, avoiding third-party services like Sentry or LogRocket.

**Rationale:**
- **Public repo constraint:** Free and accessible to all contributors without requiring external accounts
- Already integrated with Lambda backend (no additional setup)
- Frontend can send logs to backend endpoint that writes to CloudWatch
- Supports structured logging with JSON
- Built-in retention policies and log querying (CloudWatch Insights)
- No monthly limits or pricing tiers to manage
- Keeps all infrastructure within AWS ecosystem

**Implications:**
- Backend needs new `/log` endpoint for frontend error reporting
- Frontend errors sent as POST requests to backend
- Use correlation IDs to trace requests across frontend/backend
- CloudWatch Insights queries replace Sentry dashboards
- No fancy UI, but sufficient for debugging and monitoring
- Users must have AWS console access to view logs

**Alternatives Considered:**
- Sentry: Excellent but requires account signup; not accessible for open-source
- LogRocket: Premium pricing, session replay overkill for this project
- console.log only: Insufficient for production debugging

---

### ADR-003: Manual Load Testing Scripts (Not Automated in CI/CD)

**Decision:** Provide documented manual load testing scripts using Artillery or k6, but do not run them automatically in CI/CD pipeline.

**Rationale:**
- Load tests with 100 concurrent users can take 5-10 minutes
- Adds significant time and AWS costs to every deployment
- Results vary based on Lambda cold starts and external API availability
- Manual execution allows controlled testing environment (pre-warmed Lambdas)
- Users deploying their own instances can run when needed
- CI/CD focuses on functional correctness, not performance validation

**Implications:**
- Create `scripts/loadtest/` directory with Artillery YAML configs
- Document how to run: `npm run loadtest` in package.json
- Results saved to `PERFORMANCE.md` manually
- Include smoke test (10 users) in deployment verification, not full load test
- CI/CD remains fast (< 10 minutes total)

**Alternatives Considered:**
- Automated in CI: Too slow and expensive for every PR
- No load testing: Missing critical production validation
- Hybrid (light automation + heavy manual): Considered, but complexity not worth it

---

### ADR-004: Skip OpenAPI Spec (Markdown Docs Sufficient)

**Decision:** Do not create OpenAPI 3.0 specification or Swagger UI. Existing markdown documentation in `API_INTEGRATION.md` is sufficient.

**Rationale:**
- `API_INTEGRATION.md` already documents all 5 endpoints comprehensively
- OpenAPI spec adds maintenance burden (keeping YAML in sync with code)
- Swagger UI deployment adds infrastructure complexity
- API is simple enough (5 endpoints) that interactive docs not necessary
- Public repo benefits from lower barrier to entry (no extra tools to learn)

**Implications:**
- No OpenAPI YAML file
- No Swagger UI deployment or static page
- API documentation remains in markdown only
- Any changes to API require updating `API_INTEGRATION.md`

**Alternatives Considered:**
- OpenAPI with static Swagger UI: Adds complexity without sufficient value
- Postman collections: Requires external tool, inconsistent with "free only" philosophy

---

### ADR-005: GitHub Actions for CI/CD (Public Repo Free Tier)

**Decision:** Use GitHub Actions for all CI/CD automation, leveraging the free tier for public repositories (2000 minutes/month).

**Rationale:**
- Public repos get free unlimited minutes for Linux runners
- Native GitHub integration (no external CI tool accounts)
- YAML-based workflow configuration in `.github/workflows/`
- Built-in secrets management for AWS credentials and API keys
- Supports matrix builds for testing multiple Node/Python versions
- Can trigger on PR, push, or manual dispatch

**Implications:**
- Workflow files: `test.yml` (run tests), `deploy.yml` (deploy to AWS)
- Use GitHub Secrets for AWS credentials (document required secrets in README)
- Separate workflows for frontend and backend testing
- SAM CLI commands in GitHub Actions to deploy
- Use `aws-actions/configure-aws-credentials` action for authentication

**Alternatives Considered:**
- GitLab CI: Not needed, repo is on GitHub
- CircleCI: Requires external account
- AWS CodePipeline: More complex setup, overkill for this project

---

### ADR-006: CloudFormation Template Enhancements for Easy Public Deployment

**Decision:** Enhance SAM `template.yaml` to simplify deployment for external users, including automated script to inject CloudFormation outputs into frontend `.env` file.

**Rationale:**
- **Public repo goal:** Users should deploy in under 30 minutes
- Manual copy-pasting API endpoint URL is error-prone
- CloudFormation outputs already contain all required values
- Bash script can automate: `sam deploy` → parse outputs → write `.env` → deploy frontend
- Reduces friction for contributors and users trying the project

**Implications:**
- Create `scripts/deploy.sh` for one-command deployment
- Script runs `sam deploy`, extracts outputs (API endpoint, S3 bucket, CloudFront URL)
- Writes `frontend/.env` with `VITE_API_ENDPOINT` automatically
- Document script usage in `README.md` and `DEPLOYMENT.md`
- Include `.env.example` with placeholder values for reference

**Alternatives Considered:**
- Manual deployment: Too error-prone, poor user experience
- Terraform instead of SAM: More complex, CloudFormation is AWS-native
- CDK: Requires TypeScript knowledge, SAM is simpler for this use case

---

### ADR-007: React Error Boundaries for Frontend Resilience

**Decision:** Implement React Error Boundaries to catch component errors and prevent white screen of death, with graceful fallback UI.

**Rationale:**
- Uncaught errors in React crash the entire app (blank screen)
- Error boundaries catch errors in child components during render, lifecycle, and constructors
- Provides fallback UI ("Something went wrong") instead of blank screen
- Logs errors to CloudWatch for debugging
- Required for production-grade React applications
- No external library needed (built-in React feature)

**Implications:**
- Create `ErrorBoundary.jsx` component wrapping main app sections
- Fallback UI shows friendly error message with refresh button
- Log error stack trace to backend `/log` endpoint
- Test error boundaries with intentionally broken components
- Document error boundary placement in component tree

**Alternatives Considered:**
- No error handling: Unacceptable for production
- try/catch in every component: Error boundaries are React best practice
- External library (react-error-boundary): Adds dependency for minimal value

---

### ADR-008: Request Correlation IDs for Distributed Tracing

**Decision:** Implement correlation IDs (UUIDs) generated by frontend and passed through entire request chain (frontend → API Gateway → Lambda → CloudWatch).

**Rationale:**
- Multi-model parallel generation creates complex execution flows
- Debugging requires tracing a single user request across multiple Lambda invocations
- CloudWatch Insights can filter logs by correlation ID
- Frontend errors can be correlated with backend errors
- Industry best practice for distributed systems
- Minimal implementation cost (UUID generation + header passing)

**Implications:**
- Frontend generates UUID on each API call, passes as `X-Correlation-ID` header
- Backend extracts header and includes in all log statements
- Lambda logs to CloudWatch with structured JSON: `{"correlationId": "...", "message": "..."}`
- Error logs include correlation ID for easy filtering
- Document correlation ID usage in troubleshooting guide

**Alternatives Considered:**
- No tracing: Debugging becomes extremely difficult in production
- AWS X-Ray: Too complex for this project's needs
- OpenTelemetry: Overkill for simple correlation

---

### ADR-009: S3 Retry Logic with Exponential Backoff

**Decision:** Implement automatic retry logic for S3 operations (PutObject, GetObject) with exponential backoff (3 retries: 1s, 2s, 4s).

**Rationale:**
- S3 occasionally has transient errors (503 Slow Down, 500 Internal Error)
- Retrying with backoff significantly improves reliability
- boto3 has built-in retry logic, but explicit retries provide better control
- Failed uploads should not fail entire job (partial results still valuable)
- Aligns with AWS best practices for S3 operations

**Implications:**
- Wrap S3 `put_object` and `get_object` calls in retry decorator
- Log each retry attempt with correlation ID
- After 3 retries, mark model as failed but continue with other models
- Include retry count in CloudWatch metrics
- Document S3 error handling in TROUBLESHOOTING.md

**Alternatives Considered:**
- No retries: Poor reliability, users see intermittent failures
- boto3 default retries only: Less control over backoff strategy
- Infinite retries: Can cause timeouts and user frustration

---

### ADR-010: Lambda Layers for Dependency Optimization

**Decision:** Extract heavy Python dependencies (Pillow, boto3, requests) into Lambda Layer to reduce deployment package size and improve cold start times.

**Rationale:**
- Current deployment package includes all dependencies (~50MB)
- Lambda cold starts load entire package into memory
- Layers are cached separately and loaded faster
- Reduces deployment time (only code changes, not dependencies)
- Layer can be shared across multiple Lambda functions if needed

**Implications:**
- Create `layers/python-deps/` directory with requirements
- Build layer: `pip install -r requirements.txt -t python/`
- Update `template.yaml` to define and reference layer
- Layer ARN used in Lambda function configuration
- Document layer build process in DEPLOYMENT.md

**Alternatives Considered:**
- No layers: Slower cold starts and larger deployments
- Separate layer per dependency: Over-optimization, management overhead
- Lambda containers: Overkill for this use case

---

## Tech Stack Summary

### Frontend
| Component | Technology | Version | Justification |
|-----------|-----------|---------|---------------|
| Framework | React | 18+ | Modern hooks, error boundaries, widespread adoption |
| Build Tool | Vite | Latest | Fast HMR, native ESM, simple config |
| Testing | Vitest | Latest | Vite-native, fast, Jest-compatible API |
| Test Utils | React Testing Library | Latest | Best practice for component testing |
| Styling | CSS Modules | N/A | Scoped styles, no runtime overhead |
| State | Context API | Built-in | Sufficient for app size, no Redux needed |
| HTTP Client | fetch | Native | No axios needed, native retries via wrapper |
| Error Logging | CloudWatch via API | N/A | Free, AWS-native, no external accounts |

### Backend
| Component | Technology | Version | Justification |
|-----------|-----------|---------|---------------|
| Runtime | Python | 3.12 | Latest Lambda-supported version |
| Framework | AWS Lambda | N/A | Serverless, auto-scaling, pay-per-use |
| API | API Gateway HTTP | N/A | Simpler than REST API, lower latency |
| Testing | pytest | Latest | Python standard, rich plugin ecosystem |
| Storage | S3 + CloudFront | N/A | Scalable, CDN, low-cost |
| Logging | CloudWatch Logs | N/A | Built-in Lambda integration |
| Monitoring | CloudWatch Metrics | N/A | Lambda metrics, custom metrics |

### Infrastructure
| Component | Technology | Justification |
|-----------|-----------|---------------|
| IaC | AWS SAM / CloudFormation | AWS-native, simpler than Terraform for Lambda |
| CI/CD | GitHub Actions | Free for public repos, native integration |
| Security Scanning | npm audit, bandit | Built-in tools, no external services |
| Load Testing | Artillery or k6 | Popular, scriptable, free |
| Performance | Lighthouse CLI | Industry standard for web performance |

---

## Design Patterns & Conventions

### Frontend Patterns

#### Component Structure
```
components/
├── common/              # Reusable components (Button, Input, etc.)
├── features/            # Feature-specific components
│   ├── generation/      # GenerationPanel, PromptInput, etc.
│   ├── gallery/         # GalleryBrowser, GalleryDetail, etc.
│   └── errors/          # ErrorBoundary, ErrorFallback, etc.
└── layout/              # Header, Footer, etc.
```

#### Testing Patterns
```javascript
// Component Test Template
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders with default props', () => {
    render(<MyComponent />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const handleClick = vi.fn();
    render(<MyComponent onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

#### Error Boundary Pattern
```javascript
// Wrap sections of app independently
<ErrorBoundary fallback={<ErrorFallback />}>
  <GenerationPanel />
</ErrorBoundary>
<ErrorBoundary fallback={<ErrorFallback />}>
  <GalleryBrowser />
</ErrorBoundary>
```

#### Correlation ID Pattern
```javascript
// Generate on API call
import { v4 as uuidv4 } from 'uuid';

const correlationId = uuidv4();
fetch(url, {
  headers: {
    'X-Correlation-ID': correlationId,
    'Content-Type': 'application/json'
  }
});
```

---

### Backend Patterns

#### Testing Patterns
```python
# Integration Test Template
import pytest
import requests

@pytest.fixture(scope="session")
def api_endpoint():
    return os.getenv("API_ENDPOINT")

def test_generate_endpoint(api_endpoint):
    """Test /generate endpoint with valid input"""
    response = requests.post(
        f"{api_endpoint}/generate",
        json={"prompt": "test", "ip": "1.2.3.4"},
        headers={"X-Correlation-ID": "test-123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "jobId" in data
    assert data["totalModels"] > 0
```

#### Retry Pattern
```python
import time
from functools import wraps

def retry_with_backoff(max_retries=3):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_retries - 1:
                        raise
                    wait_time = 2 ** attempt
                    logger.warning(f"Retry {attempt+1}/{max_retries} after {wait_time}s: {e}")
                    time.sleep(wait_time)
        return wrapper
    return decorator
```

#### Structured Logging Pattern
```python
import json
import logging

def log_structured(level, message, correlation_id=None, **kwargs):
    log_data = {
        "message": message,
        "correlationId": correlation_id,
        **kwargs
    }
    logger.log(level, json.dumps(log_data))
```

---

## Testing Strategy

### Coverage Targets
- **Critical paths**: 70%+ (generate, status, enhance, gallery endpoints)
- **Model handlers**: 80%+ (with mocked external APIs)
- **Frontend components**: 60%+ (focus on user interactions)
- **Integration tests**: All API endpoints covered
- **Error paths**: All error boundaries and retry logic tested

### Test Pyramid
```
       /\
      /E2E\      ← Few (10%) - Manual smoke tests via PRODUCTION_CHECKLIST
     /------\
    /Integra.\   ← Some (30%) - API endpoint tests, user flow tests
   /----------\
  /   Unit     \  ← Many (60%) - Component tests, handler tests
 /--------------\
```

### Testing Philosophy
- **Fast**: Unit tests < 100ms, integration tests < 5s
- **Isolated**: Use mocks/stubs for external APIs and S3
- **Deterministic**: No flaky tests, consistent results
- **Readable**: Test names describe behavior, not implementation

### Mocking Strategy
- **External AI APIs**: Mock with fixtures (sample image URLs)
- **S3 Operations**: Use moto library for mocking boto3
- **API Gateway**: Use requests-mock for frontend integration tests
- **Time-dependent**: Use vitest `vi.useFakeTimers()` for polling tests

---

## Common Pitfalls to Avoid

### Frontend

1. **Error Boundary Placement**
   - ❌ Don't: Wrap entire app in single error boundary
   - ✅ Do: Multiple boundaries for independent sections

2. **Test Environment**
   - ❌ Don't: Test implementation details (state variables, internal functions)
   - ✅ Do: Test user-visible behavior (rendered output, interactions)

3. **Async Testing**
   - ❌ Don't: Use `setTimeout` to wait for async updates
   - ✅ Do: Use `waitFor`, `findBy` queries from Testing Library

4. **Correlation IDs**
   - ❌ Don't: Generate in API client, separate from component
   - ✅ Do: Generate at call site, pass through context if needed

### Backend

1. **Lambda Timeouts**
   - ❌ Don't: Wait for all models synchronously
   - ✅ Do: Already using threading, ensure timeout < 900s

2. **S3 Retries**
   - ❌ Don't: Fail entire job on single S3 error
   - ✅ Do: Retry with backoff, mark model failed, continue

3. **Test Dependencies**
   - ❌ Don't: Run tests against real AWS services
   - ✅ Do: Mock boto3 with moto, external APIs with responses library

4. **Logging**
   - ❌ Don't: Use print() statements
   - ✅ Do: Use logging library with structured JSON

### Infrastructure

1. **Secrets in Repo**
   - ❌ Don't: Commit `.env` files or hardcode API keys
   - ✅ Do: Use `.env.example` with placeholders, document required secrets

2. **CloudFormation Parameters**
   - ❌ Don't: Use Parameters for values that never change
   - ✅ Do: Parameters only for secrets and environment-specific config

3. **Deployment Script**
   - ❌ Don't: Assume specific shell (zsh, bash)
   - ✅ Do: Use POSIX-compliant scripts, test on Ubuntu

---

## Performance Optimization Guidelines

### Frontend

**Bundle Size Targets**
- Total bundle: < 500 KB gzipped
- Initial load: < 200 KB gzipped
- Lazy-loaded chunks: < 100 KB each

**Optimization Techniques**
- Code splitting: Separate vendor bundle
- Lazy loading: React.lazy() for Gallery, Admin sections
- Image optimization: WebP format, responsive sizes
- Tree shaking: Import only what's used
- React.memo: Memoize expensive components (ImageCard)

### Backend

**Lambda Performance Targets**
- Cold start: < 3 seconds
- Warm invocation: < 500ms (excluding AI API calls)
- Memory usage: < 2 GB (currently allocated 3 GB)

**Optimization Techniques**
- Lambda Layers: Reduce deployment package size
- Reserved concurrency: Prevent cold starts during traffic spikes
- Threading: Parallel model execution (already implemented)
- S3 optimizations: Use CloudFront for reads, direct upload for writes

---

## Security Considerations

### Public Repository Constraints

1. **No Secrets in Code**
   - Use environment variables for all API keys
   - Document required secrets in README
   - Provide `.env.example` with placeholders
   - GitHub Secrets for CI/CD credentials

2. **Dependency Scanning**
   - Run `npm audit` in CI/CD, fail on high/critical
   - Run `bandit` for Python security linting
   - Keep dependencies updated (Dependabot)

3. **IAM Least Privilege**
   - Lambda execution role: only S3, CloudWatch, Bedrock
   - CloudFront OAI: read-only S3 access
   - No wildcard permissions (`*`)

4. **Input Validation**
   - Already implemented: content filtering, rate limiting
   - Add: SQL injection protection (not applicable, no DB)
   - Add: XSS protection (React escapes by default)

---

## File Structure - Current Codebase

**Updated:** 2025-11-16 (Phase 1, Task 0 - Codebase Discovery)

```
pixel-prompt/
├── frontend/
│   ├── src/
│   │   ├── api/                           # API client & integration
│   │   │   ├── client.js                  # Main API client (5 functions)
│   │   │   └── config.js                  # API configuration
│   │   ├── components/                    # React components (17 total)
│   │   │   ├── common/                    # Reusable components (6)
│   │   │   │   ├── BreathingBackground.jsx
│   │   │   │   ├── Container.jsx
│   │   │   │   ├── Expand.jsx
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── LoadingSkeleton.jsx
│   │   │   ├── gallery/                   # Gallery components (2)
│   │   │   │   ├── GalleryBrowser.jsx
│   │   │   │   └── GalleryPreview.jsx
│   │   │   └── generation/                # Generation components (7)
│   │   │       ├── GenerationPanel.jsx    # Main orchestrator
│   │   │       ├── PromptInput.jsx
│   │   │       ├── PromptEnhancer.jsx
│   │   │       ├── ParameterSliders.jsx
│   │   │       ├── GenerateButton.jsx
│   │   │       ├── ImageCard.jsx
│   │   │       └── ImageGrid.jsx
│   │   ├── hooks/                         # Custom React hooks (4)
│   │   │   ├── useJobPolling.js           # Status polling
│   │   │   ├── useGallery.js              # Gallery state
│   │   │   ├── useSound.js                # Sound effects
│   │   │   └── useImageLoader.js          # Progressive loading
│   │   ├── context/                       # Global state
│   │   │   └── AppContext.jsx             # React Context API
│   │   ├── utils/                         # Helper functions
│   │   │   └── imageHelpers.js
│   │   ├── App.jsx                        # Root component
│   │   └── main.jsx                       # Entry point
│   ├── public/                            # Static assets
│   ├── vite.config.js                     # Build configuration
│   ├── eslint.config.js                   # Linting rules
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── lambda_function.py             # Main Lambda handler (5 routes)
│   │   ├── config.py                      # Environment configuration
│   │   ├── models/
│   │   │   ├── registry.py                # Dynamic model registry
│   │   │   └── handlers.py                # Provider handlers (8+ providers)
│   │   ├── jobs/
│   │   │   ├── manager.py                 # Job lifecycle management
│   │   │   └── executor.py                # Parallel job execution
│   │   ├── api/
│   │   │   └── enhance.py                 # Prompt enhancement
│   │   └── utils/
│   │       ├── storage.py                 # S3 operations
│   │       ├── rate_limit.py              # Rate limiting
│   │       └── content_filter.py          # NSFW detection
│   ├── tests/
│   │   └── integration/
│   │       └── test_api_endpoints.py      # 20+ integration tests
│   ├── template.yaml                      # AWS SAM CloudFormation template
│   └── requirements.txt
├── docs/
│   ├── plans/                             # Implementation plans
│   └── CODEBASE_DISCOVERY.md              # Detailed structure documentation
├── README.md
├── SECURITY.md
└── PRODUCTION_CHECKLIST.md
```

**Key Findings:**
- **Frontend:** 25 source files (17 JSX + 8 JS) - **NO existing tests**
- **Backend:** 14 Python modules - **1 integration test file with 20+ tests**
- **API Endpoints:** 5 routes (generate, status, enhance, gallery/list, gallery/{id})
- **Model Providers:** 8+ AI providers (OpenAI, Google Gemini, Google Imagen, Bedrock Nova, Bedrock SD, Stability AI, Black Forest, Recraft, Generic)

See `docs/CODEBASE_DISCOVERY.md` for complete details on components, endpoints, and testing gaps.

---

## File Structure After Implementation

```
pixel-prompt/
├── .github/
│   └── workflows/
│       ├── test.yml              # Run tests on PR
│       ├── deploy-staging.yml    # Deploy to staging on merge
│       └── deploy-prod.yml       # Deploy to prod on release
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── features/
│   │   │   │   ├── errors/
│   │   │   │   │   ├── ErrorBoundary.jsx
│   │   │   │   │   └── ErrorFallback.jsx
│   │   │   │   └── ...
│   │   │   └── layout/
│   │   ├── __tests__/            # Component tests
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── integration/
│   │   ├── utils/
│   │   │   ├── logger.js         # CloudWatch logging
│   │   │   └── correlation.js    # UUID generation
│   │   └── ...
│   ├── vite.config.js            # Updated with test config
│   └── .env.example              # Template environment file
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   └── log.py            # New logging endpoint
│   │   ├── utils/
│   │   │   └── retry.py          # S3 retry decorator
│   │   └── ...
│   ├── layers/
│   │   └── python-deps/          # Lambda Layer dependencies
│   ├── tests/
│   │   ├── unit/                 # New unit tests
│   │   │   └── test_handlers.py
│   │   └── integration/
│   ├── template.yaml             # Enhanced with Layer
│   └── ...
├── scripts/
│   ├── deploy.sh                 # One-command deployment
│   └── loadtest/
│       ├── artillery-config.yml
│       └── README.md
├── docs/
│   ├── plans/                    # This directory
│   ├── PERFORMANCE.md            # Performance benchmark results
│   └── TROUBLESHOOTING.md        # Debugging guide
└── PRODUCTION_CHECKLIST.md       # Updated with new steps
```

---

## Next Steps

After reviewing this Phase 0 document:
1. Ensure all prerequisites are installed
2. Understand the architecture decisions and their implications
3. Read the testing strategy and patterns
4. Proceed to Phase 1: Testing Foundation
5. Reference this document whenever making technical decisions

This foundation ensures consistent implementation across all phases and sets the project up for long-term maintainability.
