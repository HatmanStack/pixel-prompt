# Production Deployment Checklist

Pre-deployment checklist for Pixel Prompt Complete to ensure production readiness.

## Pre-Deployment

### Code Quality

- [ ] All critical bugs fixed
- [ ] Code reviewed (if team-based)
- [ ] No TODO/FIXME comments in critical paths
- [ ] Linting passes (`npm run lint`, `pylint`)
- [ ] No console.log/print statements in production code
- [ ] Error handling implemented for all critical paths

### Testing

**Phase 1: Test Suite Coverage**
- [ ] Frontend test suite passes: `npm test` (70%+ coverage on critical paths)
- [ ] Backend unit tests pass: `pytest tests/unit/` (80%+ coverage on handlers)
- [ ] Backend integration tests pass: `pytest tests/integration/`
- [ ] Component tests cover all major UI components (10+ components)
- [ ] Integration tests for user flows (generate, enhance, gallery)
- [ ] Hooks tests pass (useJobPolling, useGallery, etc.)
- [ ] Utility tests pass (logger, correlation, error messages)

**Phase 2: Error Handling & Resilience**
- [ ] Error boundaries catch React errors and show fallback UI
- [ ] Correlation IDs present in all frontend API requests
- [ ] Correlation IDs appear in CloudWatch logs (backend)
- [ ] S3 retry logic tested (simulate transient S3 error)
- [ ] Frontend error logging to /log endpoint working
- [ ] User-facing error messages tested (rate limit, network, etc.)
- [ ] Retry logic tested (exponential backoff verified)

**Manual Testing**
- [ ] Manual smoke testing completed
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices (iOS, Android)
- [ ] Test with slow network (3G throttling)
- [ ] Test error scenarios (API down, network errors)
- [ ] Gallery functionality tested (list, load, display)

### Configuration

#### Backend Configuration

- [ ] All AI model API keys configured
- [ ] SAM parameters file created (`parameters.json`)
- [ ] Environment set (`dev`, `staging`, or `prod`)
- [ ] Model count configured (1-20)
- [ ] Prompt model index set
- [ ] Rate limits configured appropriately:
  - [ ] GLOBAL_LIMIT (default: 1000/hour)
  - [ ] IP_LIMIT (default: 50/day)
  - [ ] IP_WHITELIST (if applicable)
- [ ] AWS region selected (recommend: `us-west-2` for Bedrock)
- [ ] Lambda memory size appropriate (default: 3008 MB)
- [ ] Lambda timeout appropriate (default: 900s / 15 min)
- [ ] Reserved concurrency set (default: 10)

#### Frontend Configuration

- [ ] `.env` file created from `.env.example`
- [ ] `VITE_API_ENDPOINT` set to deployed API URL
- [ ] No development URLs in production build
- [ ] Build succeeds (`npm run build`)
- [ ] Preview works (`npm run preview`)

### Security

- [ ] API keys NOT in version control
- [ ] S3 bucket is private (no public access)
- [ ] CloudFront uses HTTPS
- [ ] SAM template uses `NoEcho: true` for sensitive parameters
- [ ] IAM roles follow least privilege
- [ ] Content filter enabled and tested
- [ ] Rate limiting configured
- [ ] Security scans passed:
  - [ ] `bandit -r backend/src/` (no HIGH/CRITICAL)
  - [ ] `npm audit` (no vulnerabilities)
- [ ] CloudWatch logging enabled
- [ ] Error messages don't expose sensitive data

### Documentation

- [ ] README.md is up to date
- [ ] DEPLOYMENT.md has correct instructions
- [ ] API_INTEGRATION.md is accurate
- [ ] SECURITY.md reviewed
- [ ] Known limitations documented
- [ ] Troubleshooting guide available

### Infrastructure

- [ ] AWS account has appropriate permissions
- [ ] AWS CLI configured (`aws configure`)
- [ ] SAM CLI installed (`sam --version`)
- [ ] Service quotas sufficient:
  - [ ] Lambda concurrent executions
  - [ ] S3 storage
  - [ ] CloudFront distributions
- [ ] Bedrock access enabled (if using Nova/SD3.5)

**Phase 3: Deployment Automation**
- [ ] Deployment script works: `./scripts/deploy.sh staging`
- [ ] Frontend .env automatically generated with correct API endpoint
- [ ] CloudFormation outputs extracted successfully
- [ ] Staging environment deployed and verified

## Deployment

### Backend Deployment

```bash
# Build
cd backend
sam build

# Deploy (first time)
sam deploy --guided

# Or deploy with parameters
sam deploy --parameter-overrides file://parameters.json
```

- [ ] SAM build successful
- [ ] SAM deploy successful
- [ ] Stack created in CloudFormation
- [ ] API Gateway endpoint created
- [ ] Lambda function deployed
- [ ] S3 bucket created
- [ ] CloudFront distribution created (~15 min)

### Frontend Deployment

```bash
# Build
cd frontend
npm install
npm run build

# Deploy to hosting
# (S3, Netlify, Vercel, etc.)
```

- [ ] Build successful
- [ ] Deployed to hosting platform
- [ ] Custom domain configured (optional)
- [ ] SSL/TLS certificate configured
- [ ] DNS records updated (if custom domain)

### Post-Deployment Verification

#### Backend Smoke Tests

```bash
export API_ENDPOINT="https://your-api.execute-api.us-west-2.amazonaws.com/Prod"

# Test health
curl $API_ENDPOINT/invalid-route
# Expected: 404 Not found

# Test prompt enhancement
curl -X POST $API_ENDPOINT/enhance \
  -H "Content-Type: application/json" \
  -d '{"prompt":"cat"}'
# Expected: 200 with enhanced prompt

# Test gallery list
curl $API_ENDPOINT/gallery/list
# Expected: 200 with galleries array

# Test image generation (slow)
curl -X POST $API_ENDPOINT/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test","steps":25,"guidance":7,"ip":"1.2.3.4"}'
# Expected: 200 with jobId

# Check job status
curl $API_ENDPOINT/status/<jobId>
# Expected: 200 with job status
```

- [ ] All smoke tests pass
- [ ] Images saved to S3
- [ ] CloudFront serves images
- [ ] Job status updates correctly

#### Frontend Smoke Tests

- [ ] Open app in browser
- [ ] Generate button works
- [ ] Image generation completes
- [ ] All 9 model images display
- [ ] Gallery loads
- [ ] Gallery selection works
- [ ] Prompt enhancement works
- [ ] Parameter sliders work
- [ ] Mobile view works
- [ ] No console errors

### Monitoring Setup

- [ ] CloudWatch Logs verified:
  - [ ] `/aws/lambda/<FunctionName>`
  - [ ] Logs appearing for requests
- [ ] CloudWatch Alarms configured:
  - [ ] Lambda Errors (threshold: 5 in 5 minutes)
  - [ ] Lambda Duration (threshold: 120s avg)
  - [ ] API Gateway 5xx errors
- [ ] SNS topic for alarms (optional)
- [ ] Email notifications configured (optional)

### Performance Verification

**Phase 3: Performance Benchmarking**
- [ ] Lambda cold start benchmarked and documented in PERFORMANCE.md
  - [ ] Cold start < 3 seconds (target)
  - [ ] Warm invocation < 500ms (excluding AI API calls)
  - [ ] P95 documented for both cold and warm starts
- [ ] Lighthouse audit completed and documented
  - [ ] Performance score > 90
  - [ ] Accessibility score > 90
  - [ ] Best Practices score > 90
  - [ ] SEO score > 90
  - [ ] Core Web Vitals meet targets (LCP < 2.5s, CLS < 0.1)
- [ ] Frontend bundle size measured and documented
  - [ ] Total bundle < 500 KB gzipped
  - [ ] Initial load < 200 KB gzipped
- [ ] Load testing completed with 100 concurrent users
  - [ ] Error rate < 1%
  - [ ] P95 response time < 5s (documented in PERFORMANCE.md)
  - [ ] No Lambda throttling errors
- [ ] CloudFront distribution verified
  - [ ] Images served via CloudFront URL
  - [ ] Cache hit/miss behavior verified
  - [ ] Deployment time < 15 minutes (documented)

**General Performance**
- [ ] API response time < 1 second (job creation)
- [ ] Frontend load time < 3 seconds (First Contentful Paint)
- [ ] Images load progressively
- [ ] No memory leaks (leave app open for 10+ minutes)

### Cost Estimation

- [ ] Estimated monthly costs calculated
- [ ] Billing alerts configured in AWS
- [ ] Usage limits set (if applicable)
- [ ] Cost allocation tags applied

## Post-Deployment

### Operational Readiness

- [ ] Runbook documented
- [ ] On-call rotation (if applicable)
- [ ] Escalation procedures defined
- [ ] Backup and recovery plan
- [ ] Rollback procedure tested

### Monitoring

- [ ] Monitor CloudWatch Logs for first 24 hours
- [ ] Check for errors or warnings
- [ ] Verify metrics are being recorded
- [ ] Set up dashboard (optional)

### Communication

- [ ] Stakeholders notified
- [ ] Documentation links shared
- [ ] Known issues communicated
- [ ] Support contact information available

## Rollback Plan

If issues are discovered post-deployment:

### Backend Rollback

```bash
# Option 1: Redeploy previous version
cd backend
git checkout <previous-commit>
sam build && sam deploy

# Option 2: Delete stack and redeploy
aws cloudformation delete-stack --stack-name <stack-name>
# Then deploy previous version
```

### Frontend Rollback

```bash
# Redeploy previous build
cd frontend
git checkout <previous-commit>
npm run build
# Deploy to hosting
```

## Maintenance

### Regular Tasks

- [ ] Weekly: Review CloudWatch metrics
- [ ] Monthly: Review costs and usage
- [ ] Monthly: Update dependencies (`npm update`, `pip install -U`)
- [ ] Quarterly: Security scan (`bandit`, `npm audit`)
- [ ] Quarterly: Review and rotate API keys
- [ ] Annually: Architectural review

### Scaling Considerations

If usage grows:

- [ ] Increase Lambda reserved concurrency
- [ ] Upgrade Lambda memory allocation
- [ ] Consider DynamoDB for job status (faster than S3)
- [ ] Implement Redis for rate limiting (atomic operations)
- [ ] Add CDN for frontend assets
- [ ] Implement API Gateway caching
- [ ] Add user authentication (AWS Cognito)

## Emergency Contacts

- **AWS Support**: [AWS Console -> Support]
- **Team Lead**: [Name/Email]
- **DevOps**: [Name/Email]
- **On-Call**: [Phone/Slack]

## Sign-Off

- [ ] Deployment completed by: ________________
- [ ] Verified by: ________________
- [ ] Date: ________________
- [ ] Production URL: ________________

---

**Notes**:
