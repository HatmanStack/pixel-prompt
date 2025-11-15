# Phase 1: Complete Backend Implementation

This phase combines all backend work: infrastructure setup, dynamic model registry with intelligent routing, async job management with parallel execution, rate limiting, and content moderation. Complete this phase before moving to Phase 2 (Frontend).

**Estimated Tokens**: ~100,000

---

## Phase Goal

Build the complete AWS Lambda backend including infrastructure (SAM template, S3, CloudFront, API Gateway), dynamic model registry with intelligent routing, async job management with parallel execution, rate limiting, content moderation, and all API endpoints. This phase delivers a fully functional backend ready for frontend integration.

**Success Criteria**:
- SAM template deploys all infrastructure successfully
- Lambda function handles all three API endpoints (generate, status, enhance)
- Model registry loads dynamically from environment variables
- All 9+ model handlers work (OpenAI, AWS Bedrock, Google, Stability AI, BFL, Recraft, generic)
- Parallel execution processes all models simultaneously
- Job status updates in real-time via S3
- Rate limiting prevents abuse
- Content filtering blocks inappropriate prompts
- Images saved to S3 with metadata
- All integration tests pass

**Estimated Tokens**: ~100,000

---

## Prerequisites

- AWS CLI configured with valid credentials (`aws configure`)
- AWS SAM CLI installed (`sam --version` shows 1.100+)
- Git repository `pixel-prompt-complete` created
- Python 3.12 installed locally
- AWS Bedrock access enabled (for Nova Canvas and Stable Diffusion)
- API keys ready for testing (at least OpenAI and one other provider)

---

## Section 1: Infrastructure Foundation (Tasks 1-8)

### Task 1: Repository Setup

**Goal**: Initialize the `pixel-prompt-complete` repository with proper structure

**Files to Create**:
- `/README.md` - Repository overview and deployment instructions
- `/backend/` - Directory for Lambda code
- `/frontend/` - Directory for React app (placeholder for now)
- `/.gitignore` - Ignore build artifacts, dependencies, environment files

**Prerequisites**: None (starting fresh)

**Implementation Steps**:

1. Create new Git repository (local or GitHub) named `pixel-prompt-complete`
2. Initialize repository structure with three main directories:
   - `backend/` for Lambda and SAM template
   - `frontend/` for React app (Phase 2)
   - `docs/` for additional documentation
3. Create a comprehensive README explaining:
   - What Pixel Prompt Complete does (serverless text-to-image platform)
   - High-level architecture (Lambda, S3, CloudFront, API Gateway, React)
   - Prerequisites for deployment
   - Quick start deployment steps
   - Environment variables needed
   - Link to detailed documentation
4. Set up `.gitignore` to exclude:
   - Python: `__pycache__/`, `*.pyc`, `.venv/`, `.pytest_cache/`, `*.egg-info/`
   - SAM: `.aws-sam/`, `samconfig.toml` (will be generated)
   - Node: `node_modules/`, `dist/`, `.env`, `.env.local`
   - IDE: `.vscode/`, `.idea/`, `*.swp`, `.DS_Store`
   - Local testing: `.env.local`, `*.log`

**Verification Checklist**:
- [ ] Repository contains `backend/` and `frontend/` directories
- [ ] README.md includes deployment instructions and architecture overview
- [ ] `.gitignore` covers Python, Node, SAM, and IDE artifacts
- [ ] Can initialize empty git repo: `git init && git add . && git commit -m "chore: initial commit"`

**Testing Instructions**:
- Verify directory structure with `tree -L 2` or `ls -la`
- Verify `.gitignore` with `git status` (should not show ignored files if any exist)

**Commit Message Template**:
```
chore: initialize pixel-prompt-complete repository

- Create backend and frontend directories
- Add comprehensive README with deployment guide
- Configure .gitignore for Python, Node, SAM, and IDE files
```

**Estimated Tokens**: ~1,000

---

### Task 2: SAM Template - Basic Structure with Dynamic Model Parameters

**Goal**: Create the foundation SAM template with dynamic model configuration parameters

**Files to Create**:
- `/backend/template.yaml` - SAM CloudFormation template

**Prerequisites**: Task 1 complete

**Implementation Steps**:

1. Create `backend/template.yaml` with SAM transform declaration:
   ```yaml
   AWSTemplateFormatVersion: '2010-09-09'
   Transform: AWS::Serverless-2016-10-31
   Description: Pixel Prompt Complete - Serverless text-to-image generation platform
   ```

2. Define template parameters for dynamic model configuration:
   - `ModelCount` (Type: Number, Default: 9, MinValue: 1, MaxValue: 20, Description: "Number of AI models to configure")
   - Use Conditions and Mappings to create dynamic MODEL_N_NAME and MODEL_N_KEY parameters
   - Alternative approach: Use a parameter for each of the 20 possible models, with empty defaults
   - Example structure:
     ```yaml
     Parameters:
       ModelCount:
         Type: Number
         Default: 9
         MinValue: 1
         MaxValue: 20
       Model1Name:
         Type: String
         Default: "DALL-E 3"
       Model1Key:
         Type: String
         NoEcho: true
       Model2Name:
         Type: String
         Default: "Gemini 2.0"
       Model2Key:
         Type: String
         NoEcho: true
       # ... repeat for Model3 through Model20
     ```

3. Add additional parameters:
   - `PromptModelIndex` (Type: Number, Default: 1, Description: "Which model to use for prompt enhancement (1-based index)")
   - `GlobalRateLimit` (Type: Number, Default: 1000, Description: "Maximum requests per hour globally")
   - `IPRateLimit` (Type: Number, Default: 50, Description: "Maximum requests per day per IP")
   - `IPWhitelist` (Type: String, Default: "", Description: "Comma-separated IP addresses to bypass rate limits")

4. Define Lambda function resource:
   - Logical ID: `PixelPromptFunction`
   - Runtime: `python3.12`
   - Handler: `lambda_function.lambda_handler`
   - CodeUri: `./src`
   - MemorySize: 3008 (high memory for parallel processing)
   - Timeout: 900 (15 minutes - maximum allowed)
   - Environment variables:
     - MODEL_COUNT: !Ref ModelCount
     - MODEL_1_NAME: !Ref Model1Name
     - MODEL_1_KEY: !Ref Model1Key
     - (repeat for all 20 models)
     - PROMPT_MODEL_INDEX: !Ref PromptModelIndex
     - GLOBAL_LIMIT: !Ref GlobalRateLimit
     - IP_LIMIT: !Ref IPRateLimit
     - IP_INCLUDE: !Ref IPWhitelist

5. Add metadata for parameter groups (organizes SAM deployment UI):
   ```yaml
   Metadata:
     AWS::CloudFormation::Interface:
       ParameterGroups:
         - Label: {default: "Model Configuration"}
           Parameters: [ModelCount, PromptModelIndex]
         - Label: {default: "Model 1"}
           Parameters: [Model1Name, Model1Key]
         - Label: {default: "Model 2"}
           Parameters: [Model2Name, Model2Key]
         # ... etc
         - Label: {default: "Rate Limiting"}
           Parameters: [GlobalRateLimit, IPRateLimit, IPWhitelist]
   ```

**Verification Checklist**:
- [ ] Template validates: `sam validate --lint`
- [ ] Parameters section includes ModelCount and 20 model name/key pairs
- [ ] Lambda function has correct runtime (python3.12) and handler
- [ ] Memory is 3008 MB and timeout is 900 seconds
- [ ] Environment variables reference all parameters correctly
- [ ] Parameter groups organize the deployment UI logically

**Testing Instructions**:
- Run `sam validate --lint` and ensure no errors
- Review parameter structure (should be logical and organized)
- Verify NoEcho is set on API key parameters (security)

**Commit Message Template**:
```
feat(backend): create SAM template with dynamic model parameters

- Define ModelCount parameter (1-20 models)
- Add 20 model name/key parameter pairs for flexibility
- Configure Lambda function (Python 3.12, 3008MB, 15min timeout)
- Add rate limiting and prompt enhancement parameters
- Organize parameters with metadata groups for better UX
```

**Estimated Tokens**: ~4,000

---

### Task 3: SAM Template - S3 Bucket & CloudFront Distribution

**Goal**: Add S3 bucket for storage and CloudFront distribution for fast delivery

**Files to Modify**:
- `/backend/template.yaml`

**Prerequisites**: Task 2 complete

**Implementation Steps**:

1. Add S3 bucket resource to template:
   ```yaml
   PixelPromptBucket:
     Type: AWS::S3::Bucket
     Properties:
       BucketName: !Sub 'pixel-prompt-complete-${AWS::AccountId}'
       VersioningConfiguration:
         Status: Disabled
       PublicAccessBlockConfiguration:
         BlockPublicAcls: true
         BlockPublicPolicy: true
         IgnorePublicAcls: true
         RestrictPublicBuckets: true
       CorsConfiguration:
         CorsRules:
           - AllowedOrigins: ['*']
             AllowedMethods: [GET, HEAD]
             AllowedHeaders: ['*']
             MaxAge: 3600
       LifecycleConfiguration:
         Rules:
           - Id: DeleteOldImages
             Status: Enabled
             ExpirationInDays: 30
             Prefix: group-images/
     DeletionPolicy: Retain
   ```

2. Add CloudFront Origin Access Identity (OAI):
   ```yaml
   CloudFrontOAI:
     Type: AWS::CloudFront::CloudFrontOriginAccessIdentity
     Properties:
       CloudFrontOriginAccessIdentityConfig:
         Comment: !Sub 'OAI for ${AWS::StackName}'
   ```

3. Add S3 bucket policy to allow CloudFront access:
   ```yaml
   BucketPolicy:
     Type: AWS::S3::BucketPolicy
     Properties:
       Bucket: !Ref PixelPromptBucket
       PolicyDocument:
         Statement:
           - Sid: AllowCloudFrontOAI
             Effect: Allow
             Principal:
               CanonicalUser: !GetAtt CloudFrontOAI.S3CanonicalUserId
             Action: s3:GetObject
             Resource: !Sub '${PixelPromptBucket.Arn}/*'
   ```

4. Add CloudFront distribution:
   ```yaml
   CloudFrontDistribution:
     Type: AWS::CloudFront::Distribution
     Properties:
       DistributionConfig:
         Enabled: true
         Origins:
           - Id: S3Origin
             DomainName: !GetAtt PixelPromptBucket.RegionalDomainName
             S3OriginConfig:
               OriginAccessIdentity: !Sub 'origin-access-identity/cloudfront/${CloudFrontOAI}'
         DefaultCacheBehavior:
           TargetOriginId: S3Origin
           ViewerProtocolPolicy: redirect-to-https
           AllowedMethods: [GET, HEAD, OPTIONS]
           CachedMethods: [GET, HEAD]
           ForwardedValues:
             QueryString: false
             Cookies:
               Forward: none
           Compress: true
           DefaultTTL: 86400
           MaxTTL: 31536000
         PriceClass: PriceClass_100
         Comment: !Sub 'CloudFront distribution for ${AWS::StackName}'
   ```

5. Update Lambda environment variables to include bucket and CloudFront domain:
   ```yaml
   Environment:
     Variables:
       # ... existing variables
       S3_BUCKET: !Ref PixelPromptBucket
       CLOUDFRONT_DOMAIN: !GetAtt CloudFrontDistribution.DomainName
   ```

6. Update Lambda IAM role to allow S3 access:
   ```yaml
   Policies:
     - S3FullAccessPolicy:
         BucketName: !Ref PixelPromptBucket
   ```

**Verification Checklist**:
- [ ] S3 bucket has CORS policy for browser access
- [ ] Bucket has public access blocked (secure)
- [ ] CloudFront OAI is created
- [ ] Bucket policy grants CloudFront read access only
- [ ] CloudFront distribution redirects HTTP to HTTPS
- [ ] Lambda has S3 read/write permissions
- [ ] Environment variables include bucket and CloudFront domain
- [ ] Lifecycle policy deletes old images after 30 days

**Testing Instructions**:
- Validate template: `sam validate --lint`
- Review CloudFormation resources (bucket, OAI, distribution, policy)
- Check that DeletionPolicy: Retain prevents accidental bucket deletion

**Commit Message Template**:
```
feat(backend): add S3 bucket and CloudFront distribution

- Create S3 bucket with CORS and lifecycle policies
- Configure CloudFront with OAI for secure access
- Set bucket policy to allow CloudFront only
- Add Lambda permissions for S3 access
- Configure 30-day lifecycle rule for cost optimization
```

**Estimated Tokens**: ~5,000

---

### Task 4: SAM Template - API Gateway HTTP API

**Goal**: Add API Gateway HTTP API with CORS and route definitions

**Files to Modify**:
- `/backend/template.yaml`

**Prerequisites**: Task 3 complete

**Implementation Steps**:

1. Add HTTP API resource:
   ```yaml
   HttpApi:
     Type: AWS::Serverless::HttpApi
     Properties:
       StageName: Prod
       CorsConfiguration:
         AllowOrigins:
           - '*'
         AllowHeaders:
           - Content-Type
           - Authorization
           - X-Requested-With
         AllowMethods:
           - GET
           - POST
           - OPTIONS
         MaxAge: 86400
         AllowCredentials: false
   ```

2. Add API events to Lambda function:
   ```yaml
   PixelPromptFunction:
     Type: AWS::Serverless::Function
     Properties:
       # ... existing properties
       Events:
         GenerateApi:
           Type: HttpApi
           Properties:
             Path: /generate
             Method: POST
             ApiId: !Ref HttpApi
         StatusApi:
           Type: HttpApi
           Properties:
             Path: /status/{jobId}
             Method: GET
             ApiId: !Ref HttpApi
         EnhanceApi:
           Type: HttpApi
           Properties:
             Path: /enhance
             Method: POST
             ApiId: !Ref HttpApi
   ```

3. Add Outputs section for easy access to API endpoint:
   ```yaml
   Outputs:
     ApiEndpoint:
       Description: API Gateway endpoint URL
       Value: !Sub 'https://${HttpApi}.execute-api.${AWS::Region}.amazonaws.com/Prod'
     CloudFrontDomain:
       Description: CloudFront distribution domain
       Value: !GetAtt CloudFrontDistribution.DomainName
     S3BucketName:
       Description: S3 bucket name
       Value: !Ref PixelPromptBucket
   ```

**Verification Checklist**:
- [ ] HTTP API has CORS enabled for all required headers and methods
- [ ] Three routes are defined: POST /generate, GET /status/{jobId}, POST /enhance
- [ ] Lambda has permissions to be invoked by API Gateway (automatically configured by SAM)
- [ ] Outputs section includes API endpoint, CloudFront domain, and S3 bucket
- [ ] Template validates without errors

**Testing Instructions**:
- Validate template: `sam validate --lint`
- Review API Gateway configuration
- Verify path parameter syntax for /status/{jobId}

**Commit Message Template**:
```
feat(backend): add API Gateway HTTP API with routes

- Configure HTTP API with CORS for browser access
- Define routes: POST /generate, GET /status/{jobId}, POST /enhance
- Add Lambda permissions for API Gateway invocation
- Output API endpoint, CloudFront domain, and S3 bucket name
```

**Estimated Tokens**: ~4,000

---

### Task 5: Lambda Function - Minimal Handler & Configuration Module

**Goal**: Create minimal Lambda handler and configuration module

**Files to Create**:
- `/backend/src/lambda_function.py` - Main Lambda handler
- `/backend/src/config.py` - Environment variable loader
- `/backend/requirements.txt` - Python dependencies

**Prerequisites**: Task 4 complete

**Implementation Steps**:

1. Create `config.py` to load environment variables:
   ```python
   import os

   # AWS credentials for Bedrock
   aws_id = os.environ.get('AWS_ACCESS_KEY_ID')
   aws_secret = os.environ.get('AWS_SECRET_ACCESS_KEY')
   aws_region = os.environ.get('AWS_REGION', 'us-west-2')

   # S3 and CloudFront
   s3_bucket = os.environ.get('S3_BUCKET')
   cloudfront_domain = os.environ.get('CLOUDFRONT_DOMAIN')

   # Rate limiting
   global_limit = int(os.environ.get('GLOBAL_LIMIT', 1000))
   ip_limit = int(os.environ.get('IP_LIMIT', 50))
   ip_include = os.environ.get('IP_INCLUDE', '').split(',') if os.environ.get('IP_INCLUDE') else []

   # Model configuration
   model_count = int(os.environ.get('MODEL_COUNT', 9))
   prompt_model_index = int(os.environ.get('PROMPT_MODEL_INDEX', 1))

   # Load all models
   models = []
   for i in range(1, model_count + 1):
       name = os.environ.get(f'MODEL_{i}_NAME')
       key = os.environ.get(f'MODEL_{i}_KEY')
       if name and key:
           models.append({
               'index': i,
               'name': name,
               'key': key
           })

   # Validation
   if len(models) != model_count:
       print(f"Warning: MODEL_COUNT is {model_count} but only {len(models)} models are configured")

   if prompt_model_index < 1 or prompt_model_index > len(models):
       print(f"Warning: PROMPT_MODEL_INDEX {prompt_model_index} is out of range (1-{len(models)})")

   # Negative prompt for Stable Diffusion
   perm_negative_prompt = "ugly, blurry, low quality, distorted"
   ```

2. Create `lambda_function.py` with basic handler:
   ```python
   import json
   import os
   from config import models, s3_bucket, cloudfront_domain

   def lambda_handler(event, context):
       """
       Main Lambda handler
       Routes requests to appropriate handlers based on path
       """
       print(f"Event: {json.dumps(event)}")

       # Extract path and method from API Gateway event
       path = event.get('rawPath', event.get('path', ''))
       method = event.get('requestContext', {}).get('http', {}).get('method',
                event.get('httpMethod', ''))

       try:
           # Route based on path
           if path == '/generate' and method == 'POST':
               return handle_generate(event)
           elif path.startswith('/status/') and method == 'GET':
               return handle_status(event)
           elif path == '/enhance' and method == 'POST':
               return handle_enhance(event)
           else:
               return response(404, {'error': 'Not found'})

       except Exception as e:
           print(f"Error: {str(e)}")
           import traceback
           traceback.print_exc()
           return response(500, {'error': 'Internal server error'})

   def handle_generate(event):
       """POST /generate - Create image generation job"""
       body = json.loads(event.get('body', '{}'))

       # Placeholder response
       return response(200, {
           'message': 'Generate endpoint',
           'received': {
               'prompt': body.get('prompt'),
               'steps': body.get('steps'),
               'guidance': body.get('guidance'),
               'models_configured': len(models)
           }
       })

   def handle_status(event):
       """GET /status/{jobId} - Get job status"""
       path_parameters = event.get('pathParameters', {})
       job_id = path_parameters.get('jobId', 'unknown')

       # Placeholder response
       return response(200, {
           'jobId': job_id,
           'status': 'pending',
           'message': 'Status endpoint placeholder'
       })

   def handle_enhance(event):
       """POST /enhance - Enhance prompt"""
       body = json.loads(event.get('body', '{}'))
       prompt = body.get('prompt', '')

       # Placeholder response
       return response(200, {
           'enhanced': f'Enhanced version of: {prompt}',
           'message': 'Enhance endpoint placeholder'
       })

   def response(status_code, body):
       """Helper to create API Gateway response"""
       return {
           'statusCode': status_code,
           'headers': {
               'Content-Type': 'application/json',
               'Access-Control-Allow-Origin': '*'
           },
           'body': json.dumps(body)
       }
   ```

3. Create `requirements.txt` with initial dependencies:
   ```
   boto3==1.37.22
   requests==2.32.3
   Pillow==11.1.0
   openai==1.72.0
   google-genai==1.10.0
   ```

**Verification Checklist**:
- [ ] config.py successfully loads all environment variables
- [ ] config.py builds models list from MODEL_N_* variables
- [ ] lambda_function.py imports without errors
- [ ] Route dispatch logic correctly identifies each endpoint
- [ ] Placeholder responses return proper HTTP format
- [ ] Error handling returns 500 response on exceptions

**Testing Instructions**:
- Create test Python script to import config and verify models loaded
- Create test event JSON files for each endpoint
- Test locally if possible (mock environment variables)

**Commit Message Template**:
```
feat(backend): implement minimal Lambda handler with routing

- Create config.py to load environment variables
- Build dynamic models list from MODEL_N_NAME/KEY
- Implement lambda_function.py with route dispatch
- Add placeholder responses for all endpoints
- Create requirements.txt with core dependencies
```

**Estimated Tokens**: ~6,000

---

### Task 6: First Deployment & Verification

**Goal**: Deploy infrastructure to AWS and verify all components work

**Files to Modify**: None (deployment only)

**Prerequisites**: Tasks 1-5 complete

**Implementation Steps**:

1. Build SAM application:
   ```bash
   cd backend
   sam build
   ```
   - SAM will install Python dependencies from requirements.txt
   - Package Lambda code

2. Deploy with guided workflow:
   ```bash
   sam deploy --guided
   ```
   - Stack name: `pixel-prompt-complete-dev`
   - Region: Choose appropriate region (e.g., `us-west-2`)
   - Confirm changes before deploy: Y
   - Allow SAM CLI IAM role creation: Y
   - Disable rollback: N
   - Save arguments to configuration file: Y

3. Provide parameter values when prompted:
   - ModelCount: `3` (start small for testing)
   - Model1Name: `DALL-E 3`
   - Model1Key: `sk-test-key-1` (use real key if available)
   - Model2Name: `Test Model 2`
   - Model2Key: `test-key-2`
   - Model3Name: `Test Model 3`
   - Model3Key: `test-key-3`
   - PromptModelIndex: `1`
   - GlobalRateLimit: `100`
   - IPRateLimit: `10`
   - IPWhitelist: `` (empty)
   - For Model4-20: Use empty strings or defaults

4. Wait for deployment to complete (5-15 minutes for CloudFront)
   - Monitor CloudFormation events
   - Note any errors

5. Capture outputs from deployment:
   ```bash
   aws cloudformation describe-stacks \
     --stack-name pixel-prompt-complete-dev \
     --query 'Stacks[0].Outputs'
   ```
   - Save ApiEndpoint, CloudFrontDomain, S3BucketName

6. Test each endpoint with curl:
   ```bash
   API_ENDPOINT="<from outputs>"

   # Test POST /generate
   curl -X POST $API_ENDPOINT/generate \
     -H "Content-Type: application/json" \
     -d '{"prompt":"test prompt","steps":25,"guidance":7}'

   # Test GET /status/{jobId}
   curl $API_ENDPOINT/status/test-job-id

   # Test POST /enhance
   curl -X POST $API_ENDPOINT/enhance \
     -H "Content-Type: application/json" \
     -d '{"prompt":"cat"}'
   ```

7. Verify S3 bucket exists:
   ```bash
   aws s3 ls | grep pixel-prompt-complete
   ```

8. Verify CloudFront distribution (may still be deploying):
   ```bash
   aws cloudfront list-distributions \
     --query 'DistributionList.Items[?Comment==`CloudFront distribution for pixel-prompt-complete-dev`]'
   ```

9. Check Lambda function logs in CloudWatch:
   ```bash
   sam logs --stack-name pixel-prompt-complete-dev --tail
   ```

**Verification Checklist**:
- [ ] `sam build` completes without errors
- [ ] `sam deploy` creates all resources successfully
- [ ] Outputs display API endpoint, CloudFront domain, and S3 bucket
- [ ] POST /generate returns placeholder response (200 status)
- [ ] GET /status/{jobId} returns placeholder response (200 status)
- [ ] POST /enhance returns placeholder response (200 status)
- [ ] S3 bucket exists and is accessible via AWS Console
- [ ] CloudFront distribution is enabled (may take 10-15 min)
- [ ] Lambda function appears in AWS Console with correct configuration
- [ ] CloudWatch logs show successful invocations

**Testing Instructions**:
- Use `sam logs --stack-name pixel-prompt-complete-dev --tail` to watch logs
- Test each API endpoint with curl
- Verify CloudFront: Upload test file to S3, access via CloudFront URL:
  ```bash
  echo "test" > test.txt
  aws s3 cp test.txt s3://<bucket-name>/test.txt
  curl https://<cloudfront-domain>/test.txt
  ```

**Commit Message Template**:
```
chore(backend): deploy initial infrastructure to AWS

- Build and deploy SAM stack with 3 test models
- Verify all endpoints return placeholder responses
- Confirm S3 bucket and CloudFront distribution created
- Test Lambda function invocation via API Gateway
```

**Estimated Tokens**: ~5,000

---

### Task 7: SAM Configuration Files & Documentation

**Goal**: Create reusable configuration and document deployment process

**Files to Create**:
- `/backend/samconfig.toml` - SAM configuration (auto-generated, customize)
- `/backend/parameters.example.json` - Example parameter overrides
- `/backend/DEPLOYMENT.md` - Detailed deployment guide

**Prerequisites**: Task 6 complete

**Implementation Steps**:

1. Review and customize `samconfig.toml` (generated by `sam deploy --guided`):
   - Should contain stack name, region, capabilities
   - Customize for dev/staging/prod environments if needed

2. Create `parameters.example.json`:
   ```json
   {
     "Parameters": {
       "ModelCount": 9,
       "Model1Name": "DALL-E 3",
       "Model1Key": "sk-YOUR-OPENAI-KEY",
       "Model2Name": "Gemini 2.0",
       "Model2Key": "YOUR-GOOGLE-API-KEY",
       "Model3Name": "AWS Nova Canvas",
       "Model3Key": "N/A",
       "Model4Name": "Stable Diffusion 3.5 Large",
       "Model4Key": "N/A",
       "Model5Name": "Black Forest Pro",
       "Model5Key": "YOUR-BFL-KEY",
       "Model6Name": "Imagen 3.0",
       "Model6Key": "YOUR-GOOGLE-KEY",
       "Model7Name": "Recraft v3",
       "Model7Key": "YOUR-RECRAFT-KEY",
       "Model8Name": "Stability AI Turbo",
       "Model8Key": "YOUR-STABILITY-KEY",
       "Model9Name": "Black Forest Dev",
       "Model9Key": "YOUR-BFL-KEY",
       "Model10Name": "",
       "Model10Key": "",
       ...
       "PromptModelIndex": 1,
       "GlobalRateLimit": 1000,
       "IPRateLimit": 50,
       "IPWhitelist": ""
     }
   }
   ```

3. Create `DEPLOYMENT.md`:
   ```markdown
   # Deployment Guide

   ## Prerequisites
   - AWS CLI configured
   - AWS SAM CLI installed
   - Python 3.12
   - Valid API keys for desired models

   ## Configuration

   1. Copy parameters example:
      ```bash
      cp parameters.example.json parameters.json
      ```

   2. Edit `parameters.json` with your API keys:
      - ModelCount: Number of models (1-20)
      - Model1-20 Name/Key: Your model configurations
      - Use "N/A" for keys when AWS credentials are used (Bedrock)
      - PromptModelIndex: Which model to use for enhancement
      - Rate limits: Adjust as needed

   ## Deployment Steps

   1. Build:
      ```bash
      sam build
      ```

   2. Deploy (first time):
      ```bash
      sam deploy --guided
      ```
      Follow prompts and provide parameter values

   3. Deploy (subsequent):
      ```bash
      sam deploy
      ```
      Uses saved configuration from samconfig.toml

   4. Deploy with parameter file:
      ```bash
      sam deploy --parameter-overrides $(cat parameters.json | jq -r '.Parameters | to_entries | map("\(.key)=\(.value)") | join(" ")')
      ```

   ## Verification

   After deployment:
   1. Get outputs:
      ```bash
      sam list stack-outputs --stack-name <stack-name>
      ```

   2. Test API:
      ```bash
      API_ENDPOINT=<from-outputs>
      curl -X POST $API_ENDPOINT/generate -d '{"prompt":"test"}'
      ```

   ## Updating

   To update Lambda code only:
   ```bash
   sam build && sam deploy
   ```

   To update parameters (model keys, rate limits):
   ```bash
   sam deploy --parameter-overrides ModelCount=10 Model1Key=new-key
   ```

   ## Cost Estimation

   - Lambda: ~$0.20 per 1M requests + compute time
   - S3: ~$0.023 per GB storage
   - CloudFront: ~$0.085 per GB transfer
   - API Gateway HTTP API: ~$1.00 per 1M requests

   Expected monthly cost for moderate usage (~1000 generations/month): $5-20

   ## Cleanup

   To delete stack and all resources:
   ```bash
   sam delete --stack-name <stack-name>
   ```

   **Note**: S3 bucket is retained by default. Delete manually if needed:
   ```bash
   aws s3 rb s3://<bucket-name> --force
   ```

   ## Troubleshooting

   ### CloudFormation fails
   - Check CloudWatch logs for Lambda errors
   - Verify IAM permissions
   - Check CloudFormation events for specific error

   ### API returns errors
   - Check Lambda logs: `sam logs --stack-name <name> --tail`
   - Verify API keys are correct
   - Check rate limiting (may need to increase limits)

   ### Images not displaying
   - Verify CloudFront distribution is deployed (takes 10-15 min)
   - Check S3 bucket policy allows CloudFront access
   - Verify CORS configuration on bucket
   ```

**Verification Checklist**:
- [ ] `samconfig.toml` exists and is configured
- [ ] `parameters.example.json` has all 20 model parameters with examples
- [ ] `DEPLOYMENT.md` covers complete deployment workflow
- [ ] Documentation includes troubleshooting section
- [ ] Cost estimation is included
- [ ] Cleanup instructions are clear

**Testing Instructions**:
- Follow DEPLOYMENT.md on fresh clone (if possible)
- Verify parameter file approach works
- Test cleanup and redeployment

**Commit Message Template**:
```
docs(backend): add deployment guide and parameter examples

- Create parameters.example.json with all 20 model configs
- Add comprehensive DEPLOYMENT.md guide
- Document deployment steps, cost estimation, troubleshooting
- Include samconfig.toml configuration
```

**Estimated Tokens**: ~4,000

---

### Task 8: Infrastructure Optimization & Production Readiness

**Goal**: Optimize SAM template for production with tags, policies, and monitoring

**Files to Modify**:
- `/backend/template.yaml`

**Prerequisites**: Task 7 complete

**Implementation Steps**:

1. Add resource tags (apply to all resources):
   ```yaml
   Globals:
     Function:
       Tags:
         Project: PixelPromptComplete
         Environment: !Ref Environment
         ManagedBy: SAM

   Parameters:
     Environment:
       Type: String
       Default: dev
       AllowedValues: [dev, staging, prod]
   ```

2. Configure Lambda reserved concurrency (prevent runaway costs):
   ```yaml
   PixelPromptFunction:
     Properties:
       ReservedConcurrentExecutions: 10  # Adjust based on expected load
   ```

3. Add CloudWatch log group with retention:
   ```yaml
   FunctionLogGroup:
     Type: AWS::Logs::LogGroup
     Properties:
       LogGroupName: !Sub '/aws/lambda/${PixelPromptFunction}'
       RetentionInDays: 7
   ```

4. Optimize Lambda IAM role with least privilege:
   ```yaml
   PixelPromptFunction:
     Properties:
       Policies:
         - S3CrudPolicy:
             BucketName: !Ref PixelPromptBucket
         - Version: '2012-10-17'
           Statement:
             - Effect: Allow
               Action:
                 - bedrock-runtime:InvokeModel
               Resource: '*'
   ```

5. Add CloudWatch alarms for monitoring:
   ```yaml
   LambdaErrorAlarm:
     Type: AWS::CloudWatch::Alarm
     Properties:
       AlarmName: !Sub '${AWS::StackName}-lambda-errors'
       AlarmDescription: Alert on Lambda errors
       MetricName: Errors
       Namespace: AWS/Lambda
       Statistic: Sum
       Period: 300
       EvaluationPeriods: 1
       Threshold: 5
       ComparisonOperator: GreaterThanThreshold
       Dimensions:
         - Name: FunctionName
           Value: !Ref PixelPromptFunction

   LambdaDurationAlarm:
     Type: AWS::CloudWatch::Alarm
     Properties:
       AlarmName: !Sub '${AWS::StackName}-lambda-duration'
       MetricName: Duration
       Namespace: AWS/Lambda
       Statistic: Average
       Period: 300
       EvaluationPeriods: 1
       Threshold: 120000  # 2 minutes
       ComparisonOperator: GreaterThanThreshold
       Dimensions:
         - Name: FunctionName
           Value: !Ref PixelPromptFunction
   ```

6. Configure S3 bucket encryption:
   ```yaml
   PixelPromptBucket:
     Properties:
       BucketEncryption:
         ServerSideEncryptionConfiguration:
           - ServerSideEncryptionByDefault:
               SSEAlgorithm: AES256
   ```

7. Add API Gateway throttling:
   ```yaml
   HttpApi:
     Properties:
       DefaultRouteSettings:
         ThrottlingBurstLimit: 100
         ThrottlingRateLimit: 50
   ```

**Verification Checklist**:
- [ ] All resources have consistent tags
- [ ] Lambda has reserved concurrent executions
- [ ] CloudWatch log retention is set to 7 days
- [ ] IAM role follows least privilege (only necessary permissions)
- [ ] CloudWatch alarms are configured
- [ ] S3 bucket has encryption enabled
- [ ] API Gateway has throttling configured
- [ ] Template validates without errors

**Testing Instructions**:
- Deploy updated template: `sam build && sam deploy`
- Verify tags in AWS Console for all resources
- Check CloudWatch alarms are created
- Verify IAM role permissions in AWS Console

**Commit Message Template**:
```
feat(backend): optimize infrastructure for production

- Add resource tags for all components
- Configure Lambda reserved concurrency (10)
- Set CloudWatch log retention to 7 days
- Optimize IAM role with least privilege
- Add CloudWatch alarms for errors and duration
- Enable S3 bucket encryption
- Configure API Gateway throttling
```

**Estimated Tokens**: ~5,000

---

## Section 2: Model Registry & Intelligent Routing (Tasks 9-15)

This section implements the dynamic model registry system that parses environment variables, detects AI providers from model names, and routes requests to appropriate handler functions. This builds the intelligent routing layer that allows flexible model configuration without code changes.

**Section Goal**:
- Lambda successfully parses MODEL_COUNT and MODEL_N_* environment variables
- Provider detection logic correctly identifies AI providers from model names
- Each provider has a dedicated handler function (OpenAI, AWS Bedrock, Google, Stability AI, BFL, Recraft, generic)
- Generic fallback handler exists for unknown models
- Model registry is testable and maintainable

**Estimated Tokens**: ~30,000

---

### Prerequisites

- Section 1 complete (infrastructure deployed)
- Familiarity with existing model handlers in `/pixel-prompt-lambda/utils.py`
- Understanding of provider APIs (OpenAI, Stability AI, BFL, Google, Recraft)
- AWS Bedrock access enabled (for Nova Canvas and Stable Diffusion)

---

### Task 9: Model Registry Module

**Goal**: Create the model registry that loads and manages model configurations

**Files to Create**:
- `/backend/src/models/registry.py` - Model registry implementation
- `/backend/src/models/__init__.py` - Package initialization

**Prerequisites**: Task 8 complete

**Implementation Steps**:

1. Create `models/registry.py` with `ModelRegistry` class:
   - Constructor loads models from environment variables
   - Parse `MODEL_COUNT` to determine how many models to load
   - Loop through MODEL_1_NAME through MODEL_N_NAME
   - Build list of model configurations (name, key, detected provider)
   - Store PROMPT_MODEL_INDEX to identify which model to use for enhancement
2. Implement `get_model_by_index(index)` method
3. Implement `get_prompt_model()` method (returns model for prompt enhancement)
4. Implement `get_all_models()` method (returns list of all models)
5. Add validation:
   - Ensure MODEL_COUNT matches actual number of configured models
   - Warn if PROMPT_MODEL_INDEX is out of range
   - Handle missing environment variables gracefully

**Data Structure**:
```python
{
    'name': 'DALL-E 3',
    'key': 'sk-xxx...',
    'provider': 'openai',
    'index': 1  # 1-based index
}
```

**Verification Checklist**:
- [ ] ModelRegistry class successfully loads models from environment
- [ ] Handles cases where MODEL_COUNT doesn't match configured models
- [ ] Returns correct model for prompt enhancement
- [ ] Validation prevents crashes from misconfiguration

**Testing Instructions**:
- Unit test: Mock `os.environ` with test model configs
- Test with 1 model, 9 models, 20 models
- Test with mismatched MODEL_COUNT (should log warning)
- Test with missing MODEL_N_NAME (should skip gracefully)

**Commit Message Template**:
```
feat(lambda): implement model registry system

- Create ModelRegistry class to parse environment variables
- Load MODEL_COUNT and MODEL_N_* configs dynamically
- Add validation for model count and prompt model index
- Support 1-20 configurable models
```

**Estimated Tokens**: ~4,000

---

### Task 10: Provider Detection Logic

**Goal**: Implement intelligent provider detection from model names

**Files to Modify**:
- `/backend/src/models/registry.py`

**Prerequisites**: Task 9 complete

**Implementation Steps**:

1. Create `detect_provider(model_name)` function:
   - Takes model name string as input
   - Returns provider identifier string
   - Use case-insensitive pattern matching
2. Implement detection patterns based on known model names:
   - OpenAI: "dalle", "dall-e", "gpt", "chatgpt"
   - Google Gemini: "gemini"
   - Google Imagen: "imagen"
   - Stability AI: "stable diffusion", "sd", "sdxl"
   - Black Forest Labs: "flux", "black forest", "bfl"
   - Recraft: "recraft"
   - AWS Bedrock Nova: "nova", "amazon nova"
   - Hunyuan: "hunyuan"
   - Qwen: "qwen"
3. Return "generic" for unknown patterns (fallback handler)
4. Log detected provider for debugging: `print(f"Detected provider '{provider}' for model '{model_name}'")`
5. Integrate into ModelRegistry constructor (set provider field for each model)

**Detection Logic Pattern**:
```python
def detect_provider(model_name: str) -> str:
    name_lower = model_name.lower()

    if 'dalle' in name_lower or 'dall-e' in name_lower or 'gpt' in name_lower:
        return 'openai'
    elif 'gemini' in name_lower:
        return 'google_gemini'
    # ... continue for all providers
    else:
        return 'generic'
```

**Verification Checklist**:
- [ ] Correctly detects all known providers
- [ ] Returns 'generic' for unknown model names
- [ ] Case-insensitive matching works
- [ ] No false positives (e.g., "my dalle model" → openai, not generic)

**Testing Instructions**:
- Unit test with known model names:
  - "DALL-E 3" → openai
  - "Gemini 2.0 Flash" → google_gemini
  - "Stable Diffusion XL" → stability
  - "Flux Pro" → bfl
  - "Unknown Model X" → generic
- Test edge cases: empty string, special characters, unicode

**Commit Message Template**:
```
feat(lambda): add intelligent provider detection

- Implement detect_provider() with pattern matching
- Support OpenAI, Google, Stability AI, BFL, Recraft, AWS
- Add fallback to 'generic' for unknown models
- Case-insensitive detection logic
```

**Estimated Tokens**: ~3,000

---

### Task 11: Provider Handler Stubs

**Goal**: Create stub handler functions for each AI provider

**Files to Create**:
- `/backend/src/models/handlers.py` - Provider-specific handlers

**Prerequisites**: Task 10 complete

**Implementation Steps**:

1. Create `handlers.py` with one function per provider:
   - `handle_openai(model_config, prompt, params) -> dict`
   - `handle_google_gemini(model_config, prompt, params) -> dict`
   - `handle_google_imagen(model_config, prompt, params) -> dict`
   - `handle_stability(model_config, prompt, params) -> dict`
   - `handle_bfl(model_config, prompt, params) -> dict`
   - `handle_recraft(model_config, prompt, params) -> dict`
   - `handle_bedrock_nova(model_config, prompt, params) -> dict`
   - `handle_bedrock_sd(model_config, prompt, params) -> dict`
   - `handle_generic(model_config, prompt, params) -> dict`
2. Each handler should:
   - Accept standardized parameters (model_config dict, prompt string, params dict)
   - Log entry: `print(f"Calling {provider} with model {model_config['name']}")`
   - Return placeholder response: `{"status": "success", "provider": "...", "image": "base64-placeholder"}`
   - Include error handling (try/except)
3. Define standard return schema:
   ```python
   {
       "status": "success" | "error",
       "image": "base64-encoded-image-string",
       "model": "model-name",
       "provider": "provider-name",
       "error": "error-message"  # only if status=error
   }
   ```
4. Create `get_handler(provider: str)` function that returns appropriate handler function

**Verification Checklist**:
- [ ] All handler functions follow same signature
- [ ] Each handler returns standardized response format
- [ ] get_handler() returns correct function for each provider
- [ ] Unknown providers return generic handler

**Testing Instructions**:
- Unit test each handler with mock inputs
- Test get_handler() mapping for all providers
- Verify error handling (e.g., missing API key should return error response, not crash)

**Commit Message Template**:
```
feat(lambda): create provider handler stubs

- Implement handler functions for all providers
- Standardize handler signature and return format
- Add get_handler() dispatcher function
- Include error handling in each handler
```

**Estimated Tokens**: ~4,000

---

### Task 12: Implement OpenAI Handler

**Goal**: Implement the real OpenAI (DALL-E 3) handler based on existing code

**Files to Modify**:
- `/backend/src/models/handlers.py`
- `/backend/requirements.txt` (add `openai` package)

**Prerequisites**: Task 11 complete, reference `/pixel-prompt-lambda/utils.py` lines 13-32

**Implementation Steps**:

1. Add `openai` to `requirements.txt`
2. Import `openai` library at top of handlers.py
3. Update `handle_openai()` function:
   - Extract API key from model_config
   - Set `openai.api_key = model_config['key']`
   - Call `openai.images.generate()` with:
     - model: "dall-e-3"
     - prompt: prompt parameter
     - size: "1024x1024"
     - quality: "standard"
     - n: 1
   - Extract image URL from response
   - Download image using `requests.get()`
   - Convert to base64
   - Return standardized response
4. Add timeout to requests (30 seconds)
5. Handle specific errors:
   - Invalid API key
   - Rate limit exceeded
   - Content policy violation
   - Network timeout

**Verification Checklist**:
- [ ] Handler successfully generates images with valid API key
- [ ] Returns base64-encoded image in response
- [ ] Handles errors gracefully (returns error response, not crash)
- [ ] Timeout prevents indefinite hanging

**Testing Instructions**:
- Integration test with real OpenAI API key
- Test with valid prompt → should return image
- Test with invalid API key → should return error response
- Test with prohibited prompt → should return policy violation error
- Manual verification: Decode base64 and save as .png to visually inspect

**Commit Message Template**:
```
feat(lambda): implement OpenAI DALL-E 3 handler

- Add openai SDK to requirements
- Implement image generation with DALL-E 3
- Convert response to base64 format
- Handle API errors and timeouts
```

**Estimated Tokens**: ~4,000

---

### Task 13: Implement AWS Bedrock Handlers

**Goal**: Implement handlers for AWS Bedrock models (Nova Canvas, Stable Diffusion)

**Files to Modify**:
- `/backend/src/models/handlers.py`

**Prerequisites**: Task 12 complete, reference `/pixel-prompt-lambda/utils.py` lines 34-81

**Implementation Steps**:

1. Import `boto3` and `json` at top of handlers.py
2. Update `handle_bedrock_nova()` function:
   - Create boto3 session with credentials from environment (AWS_ID, AWS_SECRET)
   - Use region: `us-east-1` (Nova Canvas requirement)
   - Create bedrock-runtime client
   - Build request body for `amazon.nova-canvas-v1:0`:
     ```python
     {
       "taskType": "TEXT_IMAGE",
       "textToImageParams": {"text": prompt},
       "imageGenerationConfig": {
         "numberOfImages": 1,
         "height": 1024,
         "width": 1024,
         "cfgScale": params.get('guidance', 8.0),
         "seed": 0
       }
     }
     ```
   - Invoke model with `bedrock.invoke_model()`
   - Extract base64 image from response
3. Update `handle_bedrock_sd()` function:
   - Similar structure but use model `stability.sd3-5-large-v1:0`
   - Use region: `us-west-2` (Stable Diffusion requirement)
   - Build request body:
     ```python
     {
       "prompt": prompt,
       "mode": "text-to-image",
       "aspect_ratio": "1:1",
       "output_format": "png",
       "seed": 0,
       "negative_prompt": params.get('negative_prompt', '')
     }
     ```
4. Update provider detection to distinguish between bedrock_nova and bedrock_sd
5. Handle Bedrock-specific errors (model not enabled, region mismatch, quota exceeded)

**Verification Checklist**:
- [ ] Nova Canvas handler works with us-east-1 region
- [ ] Stable Diffusion handler works with us-west-2 region
- [ ] Both handlers return base64 images
- [ ] Credentials from environment variables are used correctly

**Testing Instructions**:
- Integration test with AWS account that has Bedrock access
- Test both models with same prompt
- Verify region-specific requirements
- Test error handling for disabled models

**Commit Message Template**:
```
feat(lambda): implement AWS Bedrock handlers

- Add Nova Canvas handler (us-east-1)
- Add Stable Diffusion 3.5 Large handler (us-west-2)
- Configure boto3 session with credentials
- Handle region-specific requirements
```

**Estimated Tokens**: ~5,000

---

### Task 14: Implement Google Handlers

**Goal**: Implement handlers for Google Gemini 2.0 and Imagen 3.0

**Files to Modify**:
- `/backend/src/models/handlers.py`
- `/backend/requirements.txt` (add `google-genai` package)

**Prerequisites**: Task 13 complete, reference `/pixel-prompt-lambda/utils.py` lines 83-127

**Implementation Steps**:

1. Add `google-genai` to requirements.txt
2. Import `google.genai` and related types
3. Update `handle_google_gemini()` function:
   - Create client: `genai.Client(api_key=model_config['key'])`
   - Call `client.models.generate_content()` with:
     - model: "gemini-2.0-flash-exp-image-generation"
     - contents: prompt
     - config: `types.GenerateContentConfig(response_modalities=['Text', 'Image'])`
   - Extract inline image data from response parts
   - Convert bytes to base64
4. Update `handle_google_imagen()` function:
   - Create client same as Gemini
   - Call `client.models.generate_images()` with:
     - model: "imagen-3.0-generate-002"
     - prompt: prompt
     - config: `types.GenerateImagesConfig(number_of_images=1)`
   - Extract image bytes from generated_images
   - Save to /tmp/ temporarily, read back as base64 (matches existing implementation)
   - Clean up temp file
5. Handle Google-specific errors (quota exceeded, safety filters)

**Verification Checklist**:
- [ ] Gemini handler generates images with multimodal model
- [ ] Imagen handler generates images with dedicated image model
- [ ] Both return base64-encoded images
- [ ] Temp files are cleaned up after Imagen generation

**Testing Instructions**:
- Integration test with Google Cloud API key
- Test both handlers with same prompt
- Compare image quality/style between models
- Test safety filter (inappropriate prompt should be rejected)

**Commit Message Template**:
```
feat(lambda): implement Google Gemini and Imagen handlers

- Add google-genai SDK to requirements
- Implement Gemini 2.0 image generation
- Implement Imagen 3.0 generation
- Handle temp file cleanup for Imagen
```

**Estimated Tokens**: ~4,000

---

### Task 15: Implement Remaining Handlers

**Goal**: Implement handlers for Stability AI, BFL, Recraft, and generic fallback

**Files to Modify**:
- `/backend/src/models/handlers.py`

**Prerequisites**: Task 14 complete, reference `/pixel-prompt-lambda/utils.py`

**Implementation Steps**:

1. Update `handle_stability()` function:
   - Use Stability AI API endpoint: `https://api.stability.ai/v2beta/stable-image/generate/sd3`
   - Headers: `{"authorization": f"Bearer {api_key}", "accept": "image/*"}`
   - POST with multipart/form-data
   - Data: prompt, model (sd3-large-turbo), output_format (png), aspect_ratio (1:1)
   - Response is raw image bytes → convert to base64

2. Update `handle_bfl()` function:
   - BFL API endpoint: `https://api.us1.bfl.ai/v1/flux-dev` or `/flux-pro-1.1`
   - Determine endpoint from model name (dev vs pro)
   - Headers: `{"x-key": api_key, "Content-Type": "application/json"}`
   - POST request to start job, get job ID
   - Poll `/v1/get_result?id={job_id}` until status is "Ready"
   - Extract image URL from result, download, convert to base64
   - Add timeout to polling (max 2 minutes)

3. Update `handle_recraft()` function:
   - Use OpenAI-compatible API: `https://external.api.recraft.ai/v1`
   - Create OpenAI client with custom base_url
   - Call `client.images.generate()` (same as OpenAI)
   - Download image from returned URL

4. Update `handle_generic()` function:
   - Attempt to call as OpenAI-compatible API (many providers follow this pattern)
   - Use model_config['name'] as model parameter
   - If successful, return image
   - If fails, return error response with helpful message

**Verification Checklist**:
- [ ] Stability AI handler works with API key
- [ ] BFL handler correctly polls for job completion
- [ ] Recraft handler uses custom base URL
- [ ] Generic handler attempts OpenAI-compatible call

**Testing Instructions**:
- Integration test each handler with real API keys
- Test BFL polling logic (should wait for completion)
- Test generic handler with known OpenAI-compatible API
- Test generic handler with non-compatible API (should fail gracefully)

**Commit Message Template**:
```
feat(lambda): implement Stability AI, BFL, Recraft, and generic handlers

- Add Stability AI SD3 handler with multipart requests
- Add BFL handler with async polling
- Add Recraft handler with custom OpenAI base URL
- Implement generic fallback for OpenAI-compatible APIs
```

**Estimated Tokens**: ~6,000

---

## Section 2 Complete

### Verification Checklist

Before moving to Section 3, verify:

- [ ] ModelRegistry successfully loads models from environment
- [ ] Provider detection works for all known providers
- [ ] All provider handlers are implemented:
  - OpenAI (DALL-E 3)
  - AWS Bedrock Nova Canvas
  - AWS Bedrock Stable Diffusion
  - Google Gemini 2.0
  - Google Imagen 3.0
  - Stability AI
  - Black Forest Labs (Flux)
  - Recraft
  - Generic fallback
- [ ] Each handler returns standardized response format
- [ ] Error handling prevents crashes
- [ ] Integration tests pass with real API keys

### Integration Testing

1. **Test Model Registry**:
   ```python
   # Deploy with 3 test models
   from models.registry import ModelRegistry
   registry = ModelRegistry()
   assert len(registry.get_all_models()) == 3
   assert registry.get_prompt_model()['name'] == "DALL-E 3"
   ```

2. **Test Provider Detection**:
   ```python
   from models.registry import detect_provider
   assert detect_provider("DALL-E 3") == "openai"
   assert detect_provider("Gemini Flash") == "google_gemini"
   assert detect_provider("Unknown Model") == "generic"
   ```

3. **Test Handlers**:
   ```python
   from models.handlers import handle_openai
   config = {'name': 'DALL-E 3', 'key': 'sk-xxx'}
   result = handle_openai(config, "a beautiful sunset", {})
   assert result['status'] == 'success'
   assert 'image' in result
   ```

---

## Section 3: Async Job Management & Parallel Processing (Tasks 16-23)

This section implements the asynchronous job management system with parallel model execution, job status tracking in S3, rate limiting, and content moderation. This integrates the model registry and handlers from Section 2 into a complete backend system that processes multiple models concurrently and provides real-time progress updates.

**Section Goal**:
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

### Prerequisites

- Section 2 complete (model registry and handlers working)
- Understanding of Python threading and concurrent.futures
- Familiarity with S3 operations (put_object, get_object)
- Knowledge of existing rate limiting implementation from `pixel-prompt-lambda`

---

### Task 16: Job Manager Module

**Goal**: Create job lifecycle management system with S3-based status storage

**Files to Create**:
- `/backend/src/jobs/manager.py` - Job management logic
- `/backend/src/jobs/__init__.py` - Package initialization

**Prerequisites**: Section 2 complete

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

### Task 17: Image Storage Module

**Goal**: Create module to save generated images to S3 with metadata

**Files to Create**:
- `/backend/src/utils/storage.py` - S3 storage utilities

**Prerequisites**: Task 16 complete, reference `/pixel-prompt-lambda/image_processing.py`

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

### Task 18: Parallel Execution Engine

**Goal**: Implement parallel model execution using threading

**Files to Create**:
- `/backend/src/jobs/executor.py` - Parallel execution engine

**Prerequisites**: Task 17 complete, Section 2 complete

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

### Task 19: Rate Limiting Module

**Goal**: Port existing rate limiting logic to new codebase

**Files to Create**:
- `/backend/src/utils/rate_limit.py` - Rate limiting logic

**Prerequisites**: Task 18 complete, reference `/pixel-prompt-lambda/lambda_function.py` lines 32-78

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

### Task 20: Content Moderation Module

**Goal**: Implement NSFW/inappropriate content filtering

**Files to Create**:
- `/backend/src/utils/content_filter.py` - Content moderation

**Prerequisites**: Task 19 complete, reference `/pixel-prompt-lambda/prompt.py`

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

### Task 21: API Endpoints Implementation

**Goal**: Integrate all modules into Lambda handler with three API endpoints

**Files to Modify**:
- `/backend/src/lambda_function.py`

**Prerequisites**: Tasks 16-20 complete

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

### Task 22: Prompt Enhancement Implementation

**Goal**: Implement prompt enhancement using configured model

**Files to Create/Modify**:
- `/backend/src/api/enhance.py` - Prompt enhancement logic

**Prerequisites**: Task 21 complete

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

### Task 23: End-to-End Integration Testing

**Goal**: Test complete workflow from request to image generation

**Files to Create**:
- `/backend/tests/test_integration.py` - Integration tests

**Prerequisites**: Tasks 16-22 complete

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

## Section 3 Complete

### Verification Checklist

Before moving to Phase 2 (Frontend), verify:

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

## Phase Complete!

All backend infrastructure and functionality is now implemented. Proceed to **[Phase 2: Complete Frontend Implementation & Testing](Phase-2.md)** to build the web interface.
