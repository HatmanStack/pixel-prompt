# Phase 1: Backend Infrastructure & SAM Template

## Phase Goal

Create the foundational AWS infrastructure using SAM (Serverless Application Model) including Lambda function, S3 bucket, CloudFront distribution, and API Gateway HTTP API. This phase establishes the deployment framework and ensures the infrastructure can be provisioned with a single `sam deploy` command.

**Success Criteria**:
- SAM template successfully deploys all infrastructure
- Lambda function handler responds to test invocations
- S3 bucket is created with proper folder structure
- CloudFront distribution serves S3 content
- API Gateway routes to Lambda function
- All outputs (API endpoint, CloudFront domain) are displayed after deployment

**Estimated Tokens**: ~25,000

---

## Prerequisites

- AWS CLI configured with valid credentials (`aws configure`)
- AWS SAM CLI installed (`sam --version` shows 1.100+)
- Git repository `pixel-prompt-complete` created (either locally or on GitHub)
- Python 3.12 installed locally for testing
- Basic understanding of CloudFormation/SAM syntax

---

## Tasks

### Task 1: Repository Setup

**Goal**: Initialize the `pixel-prompt-complete` repository with proper structure

**Files to Create**:
- `/README.md` - Repository overview and deployment instructions
- `/backend/` - Directory for Lambda code
- `/frontend/` - Directory for React app (placeholder for now)
- `/.gitignore` - Ignore build artifacts, dependencies, environment files

**Prerequisites**: None (starting fresh)

**Implementation Steps**:

1. Create new Git repository (local or GitHub)
2. Initialize repository structure with three main directories
3. Create a comprehensive README explaining:
   - What Pixel Prompt Complete does
   - Architecture diagram (reference Phase-0)
   - Prerequisites for deployment
   - Quick start deployment steps
   - Environment variables needed
4. Set up `.gitignore` to exclude:
   - Python: `__pycache__/`, `*.pyc`, `.venv/`, `.pytest_cache/`
   - SAM: `.aws-sam/`, `samconfig.toml`
   - Node: `node_modules/`, `dist/`, `.env`, `.env.local`
   - IDE: `.vscode/`, `.idea/`, `*.swp`

**Verification Checklist**:
- [ ] Repository contains `backend/` and `frontend/` directories
- [ ] README.md includes deployment instructions
- [ ] `.gitignore` covers Python, Node, SAM artifacts
- [ ] Can initialize empty git repo: `git init && git add . && git commit -m "chore: initial commit"`

**Testing Instructions**:
- Verify directory structure with `tree -L 2` or `ls -la`
- Verify `.gitignore` with `git status` (should not show ignored files)

**Commit Message Template**:
```
chore: initialize pixel-prompt-complete repository

- Create backend and frontend directories
- Add comprehensive README with deployment guide
- Configure .gitignore for Python, Node, SAM
```

**Estimated Tokens**: ~1,000

---

### Task 2: SAM Template - Basic Structure

**Goal**: Create the foundation SAM template with parameters and basic Lambda function definition

**Files to Create**:
- `/backend/template.yaml` - SAM CloudFormation template

**Prerequisites**: Task 1 complete

**Implementation Steps**:

1. Create `backend/template.yaml` with SAM transform declaration
2. Define template parameters for dynamic model configuration:
   - `ModelCount` (Type: Number, Default: 9, Min: 1, Max: 20)
   - Loop structure for MODEL_N_NAME and MODEL_N_KEY parameters (use SAM parameter groups for organization)
   - `PromptModelIndex` (which model to use for prompt enhancement)
   - `GlobalRateLimit` and `IPRateLimit`
   - Optional: `IPWhitelist` (comma-separated IPs)
3. Define Lambda function resource:
   - Runtime: `python3.12`
   - Handler: `lambda_function.lambda_handler`
   - CodeUri: `./src`
   - Memory: 3008 MB
   - Timeout: 900 seconds (15 minutes)
   - Environment variables: Reference parameters
4. Add metadata for parameter groups (organize parameters in SAM deployment UI)

**Verification Checklist**:
- [ ] Template validates: `sam validate --lint`
- [ ] Parameters section includes MODEL_COUNT and dynamic model parameters
- [ ] Lambda function has correct runtime and handler
- [ ] Memory and timeout are configured for parallel processing

**Testing Instructions**:
- Run `sam validate --lint` and ensure no errors
- Review parameter structure (should be logical and grouped)

**Commit Message Template**:
```
feat(backend): create SAM template with dynamic model parameters

- Define ModelCount parameter (1-20 models)
- Configure Lambda function (Python 3.12, 3008MB, 15min timeout)
- Add parameter groups for organized deployment
```

**Estimated Tokens**: ~3,000

---

### Task 3: SAM Template - S3 Bucket & CloudFront

**Goal**: Add S3 bucket and CloudFront distribution to SAM template with proper configurations

**Files to Modify**:
- `/backend/template.yaml`

**Prerequisites**: Task 2 complete

**Implementation Steps**:

1. Add S3 bucket resource to template:
   - Bucket for images and job status
   - Versioning: Disabled (not needed for this use case)
   - Public access: Blocked (CloudFront only)
   - CORS configuration: Allow GET from any origin (for browser access)
   - Lifecycle policy: Delete objects older than 30 days (optional cost optimization)
2. Add CloudFront distribution resource:
   - Origin: S3 bucket (use Origin Access Identity for security)
   - Cache behavior: Default (cache enabled for images)
   - Viewer protocol: Redirect HTTP to HTTPS
   - Allowed methods: GET, HEAD
   - Price class: Use all edge locations (or PriceClass_100 for cost savings)
3. Configure S3 bucket policy to allow CloudFront OAI access
4. Pass bucket name and CloudFront domain to Lambda via environment variables

**Verification Checklist**:
- [ ] S3 bucket has CORS policy defined
- [ ] CloudFront distribution uses Origin Access Identity (secure)
- [ ] Bucket policy grants CloudFront read access only
- [ ] Environment variables reference bucket and CloudFront domain

**Testing Instructions**:
- Validate template: `sam validate --lint`
- Review generated CloudFormation (complex resources like CloudFront may have many properties)

**Commit Message Template**:
```
feat(backend): add S3 bucket and CloudFront distribution

- Create S3 bucket with CORS and lifecycle policies
- Configure CloudFront with OAI for secure access
- Set bucket policy to allow CloudFront only
```

**Estimated Tokens**: ~4,000

---

### Task 4: SAM Template - API Gateway HTTP API

**Goal**: Add API Gateway HTTP API with CORS and route definitions

**Files to Modify**:
- `/backend/template.yaml`

**Prerequisites**: Task 3 complete

**Implementation Steps**:

1. Add HTTP API resource to template:
   - Protocol: HTTP (cheaper than REST API)
   - CORS configuration:
     - Allow origins: `['*']` (restrict in production if needed)
     - Allow methods: `['GET', 'POST', 'OPTIONS']`
     - Allow headers: `['Content-Type', 'Authorization']`
     - Max age: 86400 (1 day)
2. Define routes:
   - `POST /generate` → Lambda function (image generation)
   - `GET /status/{jobId}` → Lambda function (job status polling)
   - `POST /enhance` → Lambda function (prompt enhancement)
3. Configure Lambda permissions to allow API Gateway invocation
4. Add API Gateway URL to Outputs section (for easy reference after deployment)

**Verification Checklist**:
- [ ] HTTP API has CORS enabled for all required headers
- [ ] Three routes are defined (generate, status, enhance)
- [ ] Lambda has invoke permissions for API Gateway
- [ ] Template outputs include API endpoint URL

**Testing Instructions**:
- Validate template: `sam validate --lint`
- Check that routes use path parameters correctly (`{jobId}`)

**Commit Message Template**:
```
feat(backend): add API Gateway HTTP API with routes

- Configure HTTP API with CORS for browser access
- Define routes: POST /generate, GET /status, POST /enhance
- Add Lambda invoke permissions for API Gateway
- Output API endpoint URL
```

**Estimated Tokens**: ~3,000

---

### Task 5: Lambda Function - Minimal Handler

**Goal**: Create a minimal Lambda handler that validates deployment and can be invoked

**Files to Create**:
- `/backend/src/lambda_function.py` - Main Lambda handler
- `/backend/src/config.py` - Environment variable loader
- `/backend/requirements.txt` - Python dependencies

**Prerequisites**: Task 4 complete

**Implementation Steps**:

1. Create `lambda_function.py` with basic structure:
   - Import necessary modules (`json`, `os`, `config`)
   - Define `lambda_handler(event, context)` function
   - Parse event to determine route (based on `rawPath` or `path` from API Gateway)
   - Return appropriate response for each route (placeholder responses)
   - Include basic error handling (try/except with 500 response)
2. Create `config.py` to load environment variables:
   - Load MODEL_COUNT
   - Load all MODEL_N_NAME and MODEL_N_KEY into list of dicts
   - Load AWS credentials, S3 bucket, CloudFront domain
   - Load rate limit settings
3. Create `requirements.txt` with initial dependencies:
   - `boto3` (included in Lambda runtime, but specify for local testing)
   - `requests`
   - `Pillow`
4. Implement route dispatch logic:
   - POST /generate → Return `{"message": "Generate endpoint", "received": event}`
   - GET /status/{jobId} → Return `{"jobId": jobId, "status": "pending"}`
   - POST /enhance → Return `{"enhanced": "Placeholder enhanced prompt"}`

**Verification Checklist**:
- [ ] Lambda handler imports successfully (no syntax errors)
- [ ] Config module loads environment variables correctly
- [ ] Route dispatch logic correctly identifies each endpoint
- [ ] Error handling returns proper HTTP response format

**Testing Instructions**:
- Local test: `sam build && sam local invoke -e events/generate.json` (create test event files)
- Unit test: Create simple Python test that imports lambda_function and calls handler

**Commit Message Template**:
```
feat(backend): implement minimal Lambda handler with routing

- Create lambda_function.py with route dispatch
- Add config.py for environment variable loading
- Define placeholder responses for all endpoints
- Add requirements.txt with core dependencies
```

**Estimated Tokens**: ~4,000

---

### Task 6: First Deployment & Verification

**Goal**: Deploy the infrastructure to AWS and verify all components are working

**Files to Modify**:
- None (deployment only)

**Prerequisites**: Tasks 1-5 complete

**Implementation Steps**:

1. Build SAM application: `sam build`
2. Deploy with guided workflow: `sam deploy --guided`
   - Stack name: `pixel-prompt-complete`
   - Region: Choose appropriate region (e.g., us-west-2)
   - Provide parameter values:
     - ModelCount: 3 (start small for testing)
     - Model 1: Name="Test Model 1", Key="test-key-1"
     - Model 2: Name="Test Model 2", Key="test-key-2"
     - Model 3: Name="Test Model 3", Key="test-key-3"
     - PromptModelIndex: 1
     - GlobalRateLimit: 100
     - IPRateLimit: 10
   - Confirm changes and deploy
3. Capture outputs from deployment (API endpoint, CloudFront domain, S3 bucket name)
4. Test each endpoint with curl or Postman:
   - `curl -X POST <api-endpoint>/generate -d '{"prompt":"test"}'`
   - `curl <api-endpoint>/status/test-job-id`
   - `curl -X POST <api-endpoint>/enhance -d '{"prompt":"test"}'`
5. Verify S3 bucket exists in AWS Console
6. Verify CloudFront distribution is deployed (may take 10-15 minutes to fully deploy)
7. Check Lambda function logs in CloudWatch

**Verification Checklist**:
- [ ] SAM build completes without errors
- [ ] SAM deploy creates all resources successfully
- [ ] Outputs section displays API endpoint and CloudFront domain
- [ ] POST /generate returns placeholder response (200 status)
- [ ] GET /status/{jobId} returns placeholder response (200 status)
- [ ] POST /enhance returns placeholder response (200 status)
- [ ] S3 bucket exists and is accessible (via AWS Console)
- [ ] CloudFront distribution is enabled
- [ ] Lambda function appears in AWS Console with correct configuration

**Testing Instructions**:
- Use `sam logs --stack-name pixel-prompt-complete --tail` to watch logs
- Test each API endpoint with curl/Postman
- Verify CloudFront: Upload a test file to S3, access via CloudFront URL

**Commit Message Template**:
```
chore(backend): deploy initial infrastructure to AWS

- Deploy SAM stack with 3 test models
- Verify all endpoints return placeholder responses
- Confirm S3 bucket and CloudFront distribution created
```

**Estimated Tokens**: ~3,000

---

### Task 7: SAM Parameter File & Documentation

**Goal**: Create reusable parameter file for easier deployments and document the process

**Files to Create**:
- `/backend/samconfig.toml` - SAM configuration file (auto-generated, customize)
- `/backend/parameters.example.json` - Example parameter overrides
- `/backend/DEPLOYMENT.md` - Detailed deployment guide

**Prerequisites**: Task 6 complete

**Implementation Steps**:

1. Review `samconfig.toml` generated by `sam deploy --guided`
2. Create `parameters.example.json` with example structure:
   ```json
   {
     "Parameters": {
       "ModelCount": 9,
       "Model1Name": "DALL-E 3",
       "Model1Key": "sk-YOUR-KEY-HERE",
       ...
     }
   }
   ```
3. Create `DEPLOYMENT.md` with step-by-step instructions:
   - Prerequisites (AWS CLI, SAM CLI, credentials)
   - How to configure parameters
   - Build and deployment commands
   - How to find outputs (API endpoint, CloudFront)
   - How to update the stack (redeploy with changes)
   - How to delete the stack (cleanup)
   - Troubleshooting common issues
4. Add note about using `sam deploy --parameter-overrides $(cat parameters.json)` for deployments
5. Document cost estimation (Lambda, S3, CloudFront, API Gateway)

**Verification Checklist**:
- [ ] `parameters.example.json` has all required parameters with example values
- [ ] `DEPLOYMENT.md` covers complete deployment workflow
- [ ] Documentation includes troubleshooting section
- [ ] Example shows how to deploy with parameter file

**Testing Instructions**:
- Follow DEPLOYMENT.md instructions on a fresh machine (if possible)
- Verify parameter file can be used: `sam deploy --parameter-overrides file://parameters.json`

**Commit Message Template**:
```
docs(backend): add deployment guide and parameter examples

- Create parameters.example.json with all model configs
- Add comprehensive DEPLOYMENT.md guide
- Document cost estimation and troubleshooting
```

**Estimated Tokens**: ~2,000

---

### Task 8: Infrastructure Cleanup & Optimization

**Goal**: Optimize SAM template and add helpful features for production readiness

**Files to Modify**:
- `/backend/template.yaml`

**Prerequisites**: Task 7 complete

**Implementation Steps**:

1. Add DeletionPolicy and UpdateReplacePolicy to S3 bucket:
   - `DeletionPolicy: Retain` (prevent accidental data loss)
   - Document how to manually delete bucket if needed
2. Add tags to all resources for better organization:
   - Project: PixelPromptComplete
   - Environment: Dev/Prod (use parameter)
   - ManagedBy: SAM
3. Add Lambda reserved concurrent executions (optional, prevents runaway costs):
   - `ReservedConcurrentExecutions: 10` (adjust based on expected load)
4. Configure Lambda dead letter queue (optional, for failed invocations):
   - Create SQS queue resource
   - Configure Lambda DLQ to SQS
5. Add CloudWatch log group with retention policy:
   - RetentionInDays: 7 (reduce costs)
6. Review and optimize IAM role for Lambda:
   - Principle of least privilege
   - Only S3 bucket access needed (no wild card)
   - CloudWatch Logs write permission

**Verification Checklist**:
- [ ] S3 bucket has DeletionPolicy: Retain
- [ ] All resources have consistent tags
- [ ] Lambda has appropriate concurrent execution limits
- [ ] CloudWatch logs have retention policy
- [ ] IAM role follows least privilege principle

**Testing Instructions**:
- Deploy updated template: `sam build && sam deploy`
- Verify tags appear in AWS Console for all resources
- Check IAM role permissions in AWS Console

**Commit Message Template**:
```
feat(backend): optimize infrastructure for production

- Add DeletionPolicy: Retain to S3 bucket
- Configure resource tags for organization
- Set CloudWatch log retention to 7 days
- Optimize Lambda IAM role with least privilege
```

**Estimated Tokens**: ~3,000

---

## Phase Verification

### Complete Phase Checklist

Before moving to Phase 2, verify:

- [ ] SAM template deploys successfully with `sam deploy`
- [ ] All infrastructure resources are created:
  - Lambda function (3008MB, 15min timeout)
  - S3 bucket (with CORS and lifecycle policy)
  - CloudFront distribution (with OAI)
  - API Gateway HTTP API (with CORS and 3 routes)
- [ ] API endpoints return placeholder responses (200 status)
- [ ] CloudFront distribution serves S3 content
- [ ] Environment variables are correctly passed to Lambda
- [ ] Lambda logs appear in CloudWatch
- [ ] Documentation is complete (README, DEPLOYMENT.md)
- [ ] Parameter file example is provided

### Integration Testing

1. **Test API Gateway → Lambda**:
   ```bash
   API_ENDPOINT=<your-api-endpoint>
   curl -X POST $API_ENDPOINT/generate \
     -H "Content-Type: application/json" \
     -d '{"prompt": "test prompt", "steps": 25, "guidance": 7}'

   # Should return: {"message": "Generate endpoint", "received": {...}}
   ```

2. **Test S3 Access**:
   - Upload test file: `aws s3 cp test.txt s3://<bucket-name>/test.txt`
   - Access via CloudFront: `curl https://<cloudfront-domain>/test.txt`

3. **Test Lambda Environment Variables**:
   - Invoke Lambda directly: `sam local invoke -e events/test.json`
   - Check logs for loaded model configurations

### Known Limitations

- Lambda handler only returns placeholder responses (Phase 2 will implement actual logic)
- No job status storage yet (Phase 3)
- No parallel execution yet (Phase 3)
- Frontend not built yet (Phases 4-6)

---

## Next Phase

Proceed to **[Phase 2: Lambda - Dynamic Model Registry & Routing](Phase-2.md)** to implement the model registry and intelligent routing logic.
