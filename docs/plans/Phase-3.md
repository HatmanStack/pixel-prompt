# Phase 3: Production Deployment & Verification

## Phase Goal

Create streamlined deployment automation for backend infrastructure, implement staging environment verification per PRODUCTION_CHECKLIST.md, conduct comprehensive performance benchmarking (Lambda cold starts, frontend Lighthouse audit, bundle size), and establish load testing procedures. This phase ensures the application is production-ready and performs within target metrics.

**Success Criteria:**
- One-command backend deployment script working (`./scripts/deploy.sh`)
- Frontend `.env` automatically populated with backend API endpoint
- Staging environment deployed and fully verified
- PRODUCTION_CHECKLIST.md executed with all items passing
- Performance benchmarks documented in PERFORMANCE.md
- Load testing scripts created and tested with 100 concurrent users
- CloudFront distribution verified (< 15 minute deploy time)

**Estimated Tokens:** ~110,000

---

## Prerequisites

- Phase 0 and Phase 2 complete (error handling and logging in place)
- AWS account with appropriate permissions
- AWS CLI and SAM CLI installed and configured
- Multiple AI provider API keys available
- Domain name (optional, for custom CloudFront domain)

---

## Tasks

### Task 1: Backend Deployment Script

**Goal:** Create automated deployment script that runs SAM deploy, extracts CloudFormation outputs, and writes frontend `.env` file with API Gateway endpoint and other necessary environment variables.

**Files to Modify/Create:**
- `scripts/deploy.sh` - Main deployment script
- `scripts/extract-outputs.sh` - Helper to parse SAM outputs
- `frontend/.env.example` - Template with all required variables
- `backend/samconfig.toml` - SAM configuration for environments
- `README.md` - Update with deployment instructions

**Prerequisites:**
- None (first task in phase)

**Implementation Steps:**

1. **Create Environment Configuration**
   - Update `backend/samconfig.toml` to define multiple environments (dev, staging, prod)
   - Configure stack names: `pixel-prompt-dev`, `pixel-prompt-staging`, `pixel-prompt-prod`
   - Set appropriate parameters for each environment (rate limits, model counts)
   - Document environment-specific configurations

2. **Create Deployment Script**
   - Create `scripts/deploy.sh` with command-line arguments
   - Accept environment parameter: `./scripts/deploy.sh staging`
   - Default to `dev` if no environment specified
   - Check prerequisites (AWS CLI, SAM CLI, credentials configured)
   - Display deployment plan before executing

3. **Implement SAM Build and Deploy**
   - Run `sam build` to compile backend
   - Run `sam deploy` with environment-specific config
   - Use `--no-confirm-changeset` for automated deployments (after confirmation)
   - Capture deployment output and errors
   - Exit with error code if deployment fails

4. **Extract CloudFormation Outputs**
   - After successful deployment, run `sam list stack-outputs`
   - Parse outputs for:
     - `ApiEndpoint` - API Gateway URL
     - `S3BucketName` - Generated images bucket
     - `CloudFrontDomain` - CDN distribution URL
   - Use `jq` or `awk` to extract values from JSON output

5. **Generate Frontend .env File**
   - Write `frontend/.env` with extracted values
   - Format: `VITE_API_ENDPOINT=https://...`
   - Add `VITE_CLOUDFRONT_DOMAIN` if applicable
   - Add `VITE_ENVIRONMENT=staging` to distinguish environments
   - Preserve any existing custom variables (don't overwrite entire file)

6. **Add Verification Step**
   - After writing `.env`, display contents for user verification
   - Test API endpoint with health check: `curl $API_ENDPOINT/health`
   - Verify returns 200 OK
   - Display next steps (build and deploy frontend)

7. **Create .env.example Template**
   - Document all required frontend environment variables
   - Include comments explaining each variable
   - Provide placeholder values
   - Commit to repo as reference for contributors

8. **Update README.md**
   - Add "Quick Deployment" section
   - Document `./scripts/deploy.sh` usage
   - Document required AWS permissions
   - Document required API keys (pass via SAM parameters)
   - Add troubleshooting section

**Verification Checklist:**
- [ ] `./scripts/deploy.sh dev` deploys backend successfully
- [ ] `frontend/.env` created with correct API endpoint
- [ ] API endpoint responds to health check
- [ ] Script works on fresh AWS account (no manual setup required)
- [ ] Script is POSIX-compliant (works on macOS and Linux)
- [ ] README.md instructions accurate and complete

**Testing Instructions:**
```bash
# Make script executable
chmod +x scripts/deploy.sh

# Deploy to dev environment
./scripts/deploy.sh dev

# Verify .env created
cat frontend/.env
# Should show: VITE_API_ENDPOINT=https://...

# Test API endpoint
curl $(grep VITE_API_ENDPOINT frontend/.env | cut -d '=' -f2)
# Should return health check response

# Deploy to staging
./scripts/deploy.sh staging
```

**Commit Message Template:**
```
feat: add automated backend deployment script

- Create deploy.sh for one-command backend deployment
- Extract CloudFormation outputs automatically
- Generate frontend .env with API endpoint
- Support multiple environments (dev, staging, prod)
- Add .env.example template for contributors
- Update README.md with deployment instructions
```

**Estimated Tokens:** ~18,000

---

### Task 2: Staging Environment Setup

**Goal:** Deploy dedicated staging environment with production-like configuration, separate from dev environment, to enable production verification testing.

**Files to Modify/Create:**
- `backend/samconfig.toml` - Add staging environment config
- `docs/DEPLOYMENT.md` - Update with staging environment guide
- `.github/CODEOWNERS` (optional) - Protect staging deployments

**Prerequisites:**
- Task 1 complete (deployment script exists)

**Implementation Steps:**

1. **Configure Staging Parameters**
   - Add `[staging]` section to `samconfig.toml`
   - Set stack name: `pixel-prompt-staging`
   - Configure production-like settings:
     - Higher rate limits than dev (1000 req/hour global)
     - All 9 models enabled (or match planned production config)
     - Longer Lambda timeout (900s)
     - Higher memory (3008 MB)
   - Use separate S3 bucket from dev

2. **Deploy Staging Environment**
   - Run `./scripts/deploy.sh staging`
   - Verify separate CloudFormation stack created
   - Verify separate S3 bucket and CloudFront distribution
   - Verify API Gateway endpoint different from dev

3. **Configure API Keys for Staging**
   - Use same API keys as dev (or separate if preferred)
   - Pass via SAM parameters: `--parameter-overrides`
   - Document in DEPLOYMENT.md which keys to use
   - Consider using AWS Secrets Manager for staging (optional, adds complexity)

4. **Create Staging Frontend Build**
   - Deploy backend first: `./scripts/deploy.sh staging`
   - Build frontend: `cd frontend && npm run build`
   - Frontend `.env` automatically points to staging API
   - Test frontend locally against staging backend
   - Optionally deploy frontend to separate hosting (Netlify staging)

5. **Tag Staging Deployments**
   - Add git tags for staging deployments: `git tag staging-v1.0.0`
   - Document tagging strategy in DEPLOYMENT.md
   - Use tags to track what's deployed to staging

6. **Document Staging Workflow**
   - Update DEPLOYMENT.md with staging environment section
   - Explain when to use staging vs dev
   - Document promotion process: dev → staging → prod
   - Add rollback instructions (revert SAM template, redeploy)

**Verification Checklist:**
- [ ] Staging stack deployed separately from dev
- [ ] Staging API endpoint accessible
- [ ] Staging S3 bucket created
- [ ] CloudFront distribution working (can access images)
- [ ] Frontend can generate images via staging backend
- [ ] DEPLOYMENT.md documents staging workflow

**Testing Instructions:**
```bash
# Deploy staging
./scripts/deploy.sh staging

# Verify separate stack
aws cloudformation describe-stacks --stack-name pixel-prompt-staging

# Test API
API_ENDPOINT=$(sam list stack-outputs --stack-name pixel-prompt-staging | grep ApiEndpoint | awk '{print $2}')
curl -X POST $API_ENDPOINT/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test staging","ip":"1.2.3.4"}'

# Should return jobId
```

**Commit Message Template:**
```
feat: add staging environment configuration

- Configure staging environment in samconfig.toml
- Deploy separate stack for staging verification
- Document staging deployment workflow
- Add git tagging strategy for tracking deployments
- Update DEPLOYMENT.md with staging instructions
```

**Estimated Tokens:** ~12,000

---

### Task 3: Production Checklist Execution

**Goal:** Execute all items in PRODUCTION_CHECKLIST.md on staging environment, verify each passes, and document results. Update checklist with any new items discovered during this phase.

**Files to Modify/Create:**
- `PRODUCTION_CHECKLIST.md` - Update with new items from Phase 1-2
- `docs/STAGING_VERIFICATION_REPORT.md` - Document checklist results

**Prerequisites:**
- Task 2 complete (staging environment deployed)
- Phases 1-2 complete (tests and error handling in place)

**Implementation Steps:**

1. **Update PRODUCTION_CHECKLIST.md**
   - Add items from Phase 1: "Run test suite and verify 70%+ coverage"
   - Add items from Phase 2: "Verify error boundaries catch errors"
   - Add items from Phase 2: "Verify correlation IDs in CloudWatch logs"
   - Add items from Phase 2: "Test S3 retry logic (simulate transient error)"
   - Organize into clear sections: Code, Tests, Configuration, Security, Infrastructure

2. **Execute Code Quality Checks**
   - Run ESLint on frontend: `npm run lint`
   - Run frontend tests: `npm test`
   - Run backend tests: `pytest tests/ -v`
   - Verify code coverage meets targets (70%+ overall)
   - Check for TODO/FIXME comments that should be addressed

3. **Execute Testing Checks**
   - Run integration tests against staging API
   - Test image generation with all 9 models
   - Test gallery functionality (list and detail)
   - Test prompt enhancement
   - Test error scenarios (rate limit, invalid input)
   - Test on mobile device (responsive UI)
   - Test on slow network (3G simulation)

4. **Execute Configuration Checks**
   - Verify all 9 models configured with valid API keys
   - Verify rate limits set appropriately (1000/hour global, 50/day per IP)
   - Verify Lambda timeout set to 900s
   - Verify S3 lifecycle policy (30-day expiration)
   - Verify CloudWatch alarms configured (error rate, duration)

5. **Execute Security Checks**
   - Run `npm audit` on frontend, fix high/critical issues
   - Run `bandit` on backend, address findings
   - Verify no API keys or secrets in code
   - Verify CORS configuration (allowed origins)
   - Verify IAM roles use least privilege
   - Verify S3 bucket is private (no public access)

6. **Execute Infrastructure Checks**
   - Verify CloudFront distribution serving images (test image URL)
   - Measure CloudFront deploy time (should be < 15 min)
   - Verify Lambda cold start time (< 3s target)
   - Verify API Gateway throttling (50 req/s)
   - Check AWS service quotas (Lambda concurrency, S3 storage)

7. **Document Results**
   - Create `STAGING_VERIFICATION_REPORT.md`
   - List each checklist item and result (pass/fail)
   - Document any issues found and how they were resolved
   - Include timestamps and environment details (stack name, region)
   - Sign off on readiness for production

**Verification Checklist:**
- [ ] All PRODUCTION_CHECKLIST.md items executed
- [ ] All items pass (or failures documented and resolved)
- [ ] STAGING_VERIFICATION_REPORT.md created with results
- [ ] No high/critical security issues remain
- [ ] Configuration matches production requirements
- [ ] Infrastructure performing within targets

**Testing Instructions:**
```bash
# Run checklist items systematically
# Frontend
cd frontend
npm run lint
npm test
npm run build
du -sh dist/  # Check bundle size

# Backend
cd backend
pytest tests/ -v
bandit -r src/
python -m pip list --outdated  # Check for outdated deps

# Infrastructure
aws cloudformation describe-stacks --stack-name pixel-prompt-staging
aws s3 ls s3://pixel-prompt-staging-*  # Verify bucket exists

# Document in STAGING_VERIFICATION_REPORT.md
```

**Commit Message Template:**
```
docs: execute and document production checklist verification

- Update PRODUCTION_CHECKLIST.md with new items from Phase 1-2
- Execute all checklist items on staging environment
- Create STAGING_VERIFICATION_REPORT.md with results
- Resolve security issues found during verification
- Verify infrastructure configuration matches targets
```

**Estimated Tokens:** ~15,000

---

### Task 4: Performance Benchmarking - Lambda Cold Starts

**Goal:** Measure and document Lambda cold start times, identify optimization opportunities, and verify performance meets < 3 second target.

**Files to Modify/Create:**
- `docs/PERFORMANCE.md` - Performance benchmark results
- `scripts/benchmark-lambda.sh` - Cold start measurement script
- `backend/template.yaml` - Potential optimizations (Lambda Layers)

**Prerequisites:**
- Task 2 complete (staging environment deployed)

**Implementation Steps:**

1. **Create Cold Start Measurement Script**
   - Create script that invokes Lambda function when cold
   - Measure time from invocation to first response
   - Use `aws lambda invoke` with `--log-type Tail`
   - Parse CloudWatch logs for init duration and invocation duration
   - Run 10 times and calculate average, min, max, p95

2. **Trigger Cold Starts**
   - Update Lambda function code to force new deployment
   - Wait 15 minutes for Lambda to de-provision warm containers
   - Invoke function and measure cold start time
   - Repeat to collect statistical data

3. **Measure Warm Invocation Time**
   - After cold start, immediately invoke again (warm)
   - Measure warm invocation duration (excluding AI API calls)
   - Target: < 500ms for warm invocations
   - Document difference between cold and warm

4. **Analyze Cold Start Breakdown**
   - Review CloudWatch logs for init duration
   - Identify what contributes to cold start:
     - Loading dependencies (boto3, Pillow, requests)
     - Initializing model registry
     - Importing modules
   - Determine if Lambda Layers would help

5. **Implement Lambda Layers (if needed)**
   - If cold start > 3s, create Lambda Layer for dependencies
   - Move large dependencies to layer (Pillow, boto3)
   - Update `template.yaml` to reference layer
   - Re-measure cold start time after optimization
   - Document improvement (e.g., "3.2s → 2.1s")

6. **Document Results in PERFORMANCE.md**
   - Create PERFORMANCE.md with cold start metrics
   - Include table: cold start avg/min/max/p95, warm avg
   - Document methodology (how measurements taken)
   - Document optimizations applied (if any)
   - Compare to targets (< 3s cold, < 500ms warm)

7. **Add Reserved Concurrency (optional)**
   - If cold starts unacceptable, add reserved concurrency
   - Configure in `template.yaml`: `ReservedConcurrentExecutions: 5`
   - Trade-off: keeps 5 warm Lambdas, increases cost
   - Document cost implications (~$5/month for 5 reserved)

**Verification Checklist:**
- [ ] Cold start time measured (10+ samples)
- [ ] Warm invocation time measured
- [ ] Results documented in PERFORMANCE.md
- [ ] Cold start < 3s (or optimization plan documented)
- [ ] Warm invocation < 500ms
- [ ] Lambda Layers implemented if needed

**Testing Instructions:**
```bash
# Run benchmark script
./scripts/benchmark-lambda.sh staging

# Should output:
# Cold Start - Avg: 2.8s, Min: 2.1s, Max: 3.5s, P95: 3.2s
# Warm Start - Avg: 0.3s

# Manually trigger cold start
# 1. Deploy update to Lambda
# 2. Wait 15 minutes
# 3. Invoke: aws lambda invoke --function-name pixel-prompt-staging-GenerateFunction out.json
# 4. Check logs: aws logs tail /aws/lambda/pixel-prompt-staging-GenerateFunction --follow
```

**Commit Message Template:**
```
perf: benchmark Lambda cold start and warm invocation times

- Create benchmark script for cold start measurement
- Measure cold start: avg 2.8s, p95 3.2s (within 3s target)
- Measure warm invocation: avg 0.3s (within 500ms target)
- Document results in PERFORMANCE.md
- [Optional] Implement Lambda Layers to reduce cold starts
```

**Estimated Tokens:** ~18,000

---

### Task 5: Performance Benchmarking - Frontend Lighthouse Audit

**Goal:** Run Lighthouse audit on frontend to measure performance, accessibility, best practices, and SEO. Optimize to achieve > 90 performance score.

**Files to Modify/Create:**
- `docs/PERFORMANCE.md` - Add Lighthouse results section
- `scripts/lighthouse-audit.sh` - Automated Lighthouse script
- `frontend/vite.config.js` - Potential build optimizations

**Prerequisites:**
- Task 2 complete (staging environment deployed)
- Frontend built and hosted (locally or staging)

**Implementation Steps:**

1. **Install Lighthouse CLI**
   - Install globally: `npm install -g lighthouse`
   - Or add to frontend dev dependencies
   - Verify installation: `lighthouse --version`

2. **Run Lighthouse Audit**
   - Serve frontend: `npm run preview` (Vite preview server)
   - Run Lighthouse: `lighthouse http://localhost:4173 --output html,json`
   - Generate reports in `lighthouse-results/` directory
   - Review scores: Performance, Accessibility, Best Practices, SEO

3. **Analyze Performance Metrics**
   - First Contentful Paint (FCP): target < 1.8s
   - Largest Contentful Paint (LCP): target < 2.5s
   - Total Blocking Time (TBT): target < 200ms
   - Cumulative Layout Shift (CLS): target < 0.1
   - Speed Index: target < 3.4s

4. **Identify Optimization Opportunities**
   - Review Lighthouse recommendations
   - Common issues:
     - Large bundle size (code splitting needed)
     - Unoptimized images (use WebP, responsive sizes)
     - Render-blocking resources (async/defer scripts)
     - Unused JavaScript (tree shaking)
     - No caching headers (CloudFront cache config)

5. **Implement Quick Wins**
   - Add meta description for SEO
   - Add alt text to images for accessibility
   - Ensure proper heading hierarchy (h1, h2, h3)
   - Add aria-labels to icon buttons
   - Fix any color contrast issues

6. **Measure Bundle Size**
   - Run `npm run build`
   - Check `dist/` size: `du -sh dist/`
   - Target: total < 500 KB gzipped
   - Use `rollup-plugin-visualizer` to analyze bundle composition
   - Identify large dependencies to lazy-load or remove

7. **Document Results**
   - Add Lighthouse section to PERFORMANCE.md
   - Include before/after scores if optimizations made
   - Screenshot of Lighthouse report
   - Document bundle size (raw and gzipped)
   - List optimizations applied

8. **Create Automated Script**
   - Create `scripts/lighthouse-audit.sh`
   - Automate: build frontend, start preview server, run Lighthouse, stop server
   - Save reports with timestamp
   - Can be run manually or in CI/CD later

**Verification Checklist:**
- [ ] Lighthouse audit completed on staging frontend
- [ ] Performance score > 90 (or optimization plan documented)
- [ ] Accessibility score > 90
- [ ] Best Practices score > 90
- [ ] Bundle size < 500 KB gzipped
- [ ] Results documented in PERFORMANCE.md

**Testing Instructions:**
```bash
# Build and serve frontend
cd frontend
npm run build
npm run preview &

# Run Lighthouse audit
lighthouse http://localhost:4173 --output html --output-path ./lighthouse-report.html

# Open report
open lighthouse-report.html

# Check bundle size
du -sh dist/
gzip -k dist/assets/*.js && ls -lh dist/assets/*.js.gz

# Kill preview server
pkill -f "vite preview"
```

**Commit Message Template:**
```
perf: run Lighthouse audit and optimize frontend performance

- Run Lighthouse audit: Performance 92, Accessibility 95
- Measure bundle size: 420 KB (220 KB gzipped)
- Add meta descriptions and alt text for SEO/a11y
- Document results in PERFORMANCE.md
- Create automated lighthouse-audit.sh script
```

**Estimated Tokens:** ~20,000

---

### Task 6: Load Testing Scripts

**Goal:** Create manual load testing scripts using Artillery to simulate 100 concurrent users generating images, measure system performance under load, and document results.

**Files to Modify/Create:**
- `scripts/loadtest/artillery-config.yml` - Artillery test scenario
- `scripts/loadtest/README.md` - Load test documentation
- `scripts/run-loadtest.sh` - Wrapper script to run load test
- `docs/PERFORMANCE.md` - Add load testing results section

**Prerequisites:**
- Task 2 complete (staging environment deployed)
- Task 3 complete (staging verified working)

**Implementation Steps:**

1. **Install Artillery**
   - Install Artillery locally or globally: `npm install -g artillery`
   - Verify installation: `artillery --version`
   - Document in loadtest README

2. **Create Artillery Configuration**
   - Create `artillery-config.yml` with test scenario
   - Target staging API endpoint
   - Simulate load:
     - Warm-up: 10 users over 1 minute
     - Ramp: 10 → 100 users over 5 minutes
     - Sustained: 100 users for 5 minutes
     - Cool-down: 100 → 0 users over 2 minutes
   - Test scenarios:
     - POST /generate (50% of requests)
     - GET /status/{jobId} (30% of requests)
     - POST /enhance (10% of requests)
     - GET /gallery/list (10% of requests)

3. **Configure Realistic Payloads**
   - Use variable prompts from CSV or inline array
   - Realistic parameters (steps: 25-50, guidance: 5-10)
   - Include correlation IDs in headers
   - Include realistic IP addresses (or same IP to test rate limiting)

4. **Define Success Criteria**
   - Response time p95 < 5s (excluding AI model generation time)
   - Response time p99 < 10s
   - Error rate < 1%
   - Successful completions > 95%
   - No Lambda throttling errors (429 from AWS)
   - No timeout errors (504)

5. **Create Wrapper Script**
   - Create `run-loadtest.sh` that:
     - Checks Artillery installed
     - Asks for confirmation (cost warning)
     - Runs Artillery with config
     - Saves results to timestamped file
     - Generates HTML report
   - Make executable: `chmod +x scripts/run-loadtest.sh`

6. **Run Load Test on Staging**
   - Execute: `./scripts/run-loadtest.sh staging`
   - Monitor CloudWatch metrics during test:
     - Lambda invocations
     - Lambda errors
     - Lambda duration
     - API Gateway 4xx/5xx errors
   - Monitor costs (expect ~$5-10 for 100 concurrent users x 10 minutes)

7. **Analyze Results**
   - Review Artillery report:
     - Total requests, successful, failed
     - Response times: min, max, median, p95, p99
     - Requests per second (RPS)
     - Errors by type
   - Review CloudWatch metrics:
     - Lambda concurrent executions (should spike to ~100)
     - Lambda throttles (should be 0)
     - Error rates

8. **Document Results in PERFORMANCE.md**
   - Add "Load Testing" section
   - Document test configuration (100 users, 10 minute test)
   - Document results (RPS, response times, error rate)
   - Document CloudWatch observations
   - Document cost of test run
   - Document any issues encountered and resolutions

9. **Create Load Test README**
   - Document how to install Artillery
   - Document how to run load test
   - Document cost implications (warn users)
   - Document how to interpret results
   - Document troubleshooting (rate limits, timeouts)

**Verification Checklist:**
- [ ] Artillery configuration created and tested
- [ ] Load test successfully runs against staging
- [ ] 100 concurrent users simulated for 5+ minutes
- [ ] Error rate < 1% during sustained load
- [ ] Response time p95 < 5s (excluding AI generation)
- [ ] Results documented in PERFORMANCE.md
- [ ] Load test README provides clear instructions

**Testing Instructions:**
```bash
# Install Artillery
npm install -g artillery

# Run light load test first (10 users)
cd scripts/loadtest
artillery run --target $STAGING_API_ENDPOINT artillery-config-light.yml

# Review results
# If successful, run full load test
./run-loadtest.sh staging

# Monitor CloudWatch during test
# Should see Lambda concurrent executions spike to ~100

# Review generated report
open artillery-report-<timestamp>.html
```

**Commit Message Template:**
```
test: add load testing scripts with Artillery

- Create Artillery config for 100 concurrent user test
- Define test scenarios: generate, status, enhance, gallery
- Create wrapper script for running load tests
- Run load test on staging: 95% success rate, p95 4.2s
- Document results in PERFORMANCE.md
- Add load testing README with instructions
```

**Estimated Tokens:** ~22,000

---

### Task 7: CloudFront Verification and Optimization

**Goal:** Verify CloudFront distribution works correctly, measure deployment time, optimize cache headers for performance, and document CDN configuration.

**Files to Modify/Create:**
- `backend/template.yaml` - Update CloudFront cache settings
- `docs/PERFORMANCE.md` - Add CloudFront metrics section
- `scripts/test-cloudfront.sh` - CloudFront verification script

**Prerequisites:**
- Task 2 complete (staging environment deployed with CloudFront)

**Implementation Steps:**

1. **Verify CloudFront Distribution**
   - Get CloudFront domain from CloudFormation outputs
   - Verify distribution status: `aws cloudfront get-distribution`
   - Generate test image in staging
   - Access image via CloudFront URL
   - Verify image loads correctly

2. **Measure CloudFront Deployment Time**
   - Update Lambda function code (trigger SAM deploy)
   - Note CloudFormation update start time
   - Monitor CloudFront distribution status: "InProgress" → "Deployed"
   - Measure total time for CloudFront update to complete
   - Target: < 15 minutes
   - Document in PERFORMANCE.md

3. **Test Cache Behavior**
   - Access image via CloudFront (first request: miss, cached)
   - Access same image again (second request: hit, from cache)
   - Verify `X-Cache` header: "Hit from cloudfront" vs "Miss from cloudfront"
   - Verify faster response time on cache hit

4. **Optimize Cache Settings**
   - Review `template.yaml` CloudFront configuration
   - Set appropriate cache TTL:
     - Images: long cache (7 days or more, images immutable)
     - API responses: short cache or no cache (dynamic data)
   - Configure cache based on query strings if needed
   - Add `Cache-Control` headers from S3 objects

5. **Test Edge Locations**
   - Use online tools to test CloudFront from multiple geographic locations
   - Verify images accessible globally
   - Measure latency from different regions
   - Document in PERFORMANCE.md

6. **Create Verification Script**
   - Create `scripts/test-cloudfront.sh`
   - Script tests:
     - CloudFront domain resolves
     - Image accessible via CloudFront
     - Cache headers present
     - Response time acceptable (< 1s for cached images)
   - Automate as part of deployment verification

7. **Document CloudFront Configuration**
   - Add section to PERFORMANCE.md on CDN performance
   - Document deployment time
   - Document cache hit rates (if available from CloudWatch metrics)
   - Document global latency (if tested)
   - Document cost implications (CloudFront pricing)

**Verification Checklist:**
- [ ] CloudFront distribution deployed and active
- [ ] Images accessible via CloudFront URL
- [ ] Cache headers configured correctly
- [ ] Cache hit/miss behavior verified
- [ ] Deployment time < 15 minutes
- [ ] Verification script created and working
- [ ] CloudFront configuration documented

**Testing Instructions:**
```bash
# Get CloudFront domain
CLOUDFRONT_DOMAIN=$(sam list stack-outputs --stack-name pixel-prompt-staging | grep CloudFrontDomain | awk '{print $2}')

# Generate image via API
JOB_ID=$(curl -X POST $API_ENDPOINT/generate -H "Content-Type: application/json" -d '{"prompt":"test","ip":"1.2.3.4"}' | jq -r .jobId)

# Wait for image generation
sleep 60

# Get image URL
IMAGE_URL=$(curl $API_ENDPOINT/status/$JOB_ID | jq -r '.results[0].imageUrl')

# Test via CloudFront (should work if URL is CloudFront domain)
curl -I $IMAGE_URL
# Should show: X-Cache: Miss from cloudfront (first request)

curl -I $IMAGE_URL
# Should show: X-Cache: Hit from cloudfront (second request)

# Run verification script
./scripts/test-cloudfront.sh staging
```

**Commit Message Template:**
```
feat: verify and optimize CloudFront distribution

- Verify CloudFront serves images correctly
- Measure deployment time: 12 minutes (within 15 min target)
- Optimize cache headers for images (7 day TTL)
- Test cache hit/miss behavior
- Create CloudFront verification script
- Document CDN performance in PERFORMANCE.md
```

**Estimated Tokens:** ~15,000

---

## Phase Verification

After completing all tasks:

1. **End-to-End Deployment Test**
   ```bash
   # Deploy from scratch
   ./scripts/deploy.sh staging

   # Verify .env created
   cat frontend/.env

   # Build frontend
   cd frontend && npm run build

   # Test image generation
   # Use frontend to generate image, verify works end-to-end
   ```

2. **Review PERFORMANCE.md**
   - Verify all sections complete:
     - Lambda cold start metrics
     - Lighthouse audit results
     - Bundle size measurements
     - Load testing results
     - CloudFront deployment time and cache behavior
   - Verify all metrics meet targets or have optimization plan

3. **Review STAGING_VERIFICATION_REPORT.md**
   - Verify all PRODUCTION_CHECKLIST.md items executed
   - Verify all pass (or failures documented with resolutions)
   - Verify sign-off on staging readiness

4. **Review Deployment Automation**
   - Verify deployment script works reliably (run 3 times)
   - Verify .env file always correct
   - Verify script error handling (fails gracefully on errors)

5. **Cost Check**
   - Review AWS billing for staging environment
   - Document monthly cost estimate
   - Verify within budget expectations
   - Document in PERFORMANCE.md or DEPLOYMENT.md

**Integration Points for Next Phase:**
- Deployment automation ready for CI/CD integration (Phase 5)
- Performance baselines established for monitoring (Phase 4, 5)
- Staging environment ready for automated testing (Phase 5)

**Known Limitations:**
- Load testing is manual (not automated in CI/CD by design)
- CloudFront deployment time cannot be optimized (AWS limitation)
- Performance metrics are point-in-time (not continuous monitoring)

---

## Success Metrics

- [ ] Backend deploys in one command (`./scripts/deploy.sh`)
- [ ] Frontend `.env` automatically populated
- [ ] Staging environment fully functional
- [ ] PRODUCTION_CHECKLIST.md 100% complete
- [ ] Lambda cold start < 3s (documented)
- [ ] Lighthouse performance > 90 (documented)
- [ ] Bundle size < 500 KB gzipped (documented)
- [ ] Load test with 100 users successful (> 95% success rate)
- [ ] CloudFront deployment < 15 min (documented)
- [ ] All metrics documented in PERFORMANCE.md

This phase ensures the application is production-ready with automated deployment, verified functionality, and documented performance characteristics.
