# Deployment Guide

Comprehensive deployment guide for Pixel Prompt Complete across dev, staging, and production environments.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Strategy](#environment-strategy)
- [Quick Start](#quick-start)
- [Detailed Deployment Steps](#detailed-deployment-steps)
- [Staging Workflow](#staging-workflow)
- [Production Deployment](#production-deployment)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)

## Overview

Pixel Prompt uses a three-tier deployment strategy:

- **dev**: Development environment for testing features
- **staging**: Production-like environment for final verification
- **prod**: Production environment for end users

Each environment is deployed as a separate AWS CloudFormation stack with isolated resources (Lambda, S3, CloudFront, API Gateway).

## Prerequisites

### Required Tools

- **AWS CLI** (v2.x+): [Installation Guide](https://aws.amazon.com/cli/)
- **AWS SAM CLI** (v1.100+): [Installation Guide](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
- **Node.js** (v18+) and npm
- **Python** (v3.12+)
- **Git**

### AWS Account Requirements

Your AWS account must have permissions to create:

- Lambda functions
- API Gateway HTTP APIs
- S3 buckets
- CloudFront distributions
- IAM roles and policies
- CloudFormation stacks
- CloudWatch log groups and alarms

### API Keys

Obtain API keys from AI providers:

- **OpenAI**: DALL-E 3 ([platform.openai.com](https://platform.openai.com))
- **Google**: Gemini 2.0, Imagen 3.0 ([ai.google.dev](https://ai.google.dev))
- **Black Forest Labs**: ([api.bfl.ml](https://api.bfl.ml))
- **Recraft AI**: ([recraft.ai](https://www.recraft.ai))
- **Stability AI**: ([stability.ai](https://stability.ai))
- **AWS Bedrock**: No API key needed (uses IAM role)

## Environment Strategy

### Development (dev)

**Purpose**: Rapid iteration and feature testing

**Configuration**:
- Stack name: `pixel-prompt-dev`
- Model count: 3 (faster, cheaper)
- Rate limits: Lower (testing only)
- Confirm changeset: Yes (review before deploy)

**Usage**: Daily development work, experimenting with new features

### Staging (staging)

**Purpose**: Production verification and testing

**Configuration**:
- Stack name: `pixel-prompt-staging`
- Model count: 9 (full production configuration)
- Rate limits: Production-like (1000 req/hour global, 50 req/day per IP)
- Confirm changeset: Yes (review before deploy)

**Usage**: Final testing before production, running PRODUCTION_CHECKLIST.md, performance benchmarking, load testing

### Production (prod)

**Purpose**: End-user facing application

**Configuration**:
- Stack name: `pixel-prompt-prod`
- Model count: 9
- Rate limits: Production (2000 req/hour global, 100 req/day per IP)
- Confirm changeset: No (automated deployments)

**Usage**: Live application serving real users

## Quick Start

### 1. Configure AWS Credentials

```bash
aws configure
# Enter:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region (recommend: us-west-2)
# - Output format: json
```

### 2. Deploy Backend (First Time)

```bash
# Deploy to staging (recommended first deployment)
./scripts/deploy.sh staging
```

On first deployment, SAM will prompt for parameters:

- **Model API Keys**: Enter your AI provider API keys
- **Confirm**: Review and confirm CloudFormation changeset

The script will:
1. Build Lambda function
2. Deploy CloudFormation stack
3. Create S3 bucket and CloudFront distribution (~15 minutes)
4. Extract outputs and generate `frontend/.env`

### 3. Deploy Frontend

```bash
cd frontend
npm install
npm run build

# Test locally
npm run preview
# Visit http://localhost:4173

# Deploy to hosting (e.g., Netlify)
# netlify deploy --prod --dir=dist
```

## Detailed Deployment Steps

### Backend Deployment

#### Option 1: Using Deployment Script (Recommended)

```bash
# Deploy to environment (dev, staging, or prod)
./scripts/deploy.sh staging
```

The script automates:
- SAM build
- SAM deploy with environment config
- Output extraction
- Frontend .env generation
- API health check

#### Option 2: Manual SAM Commands

```bash
cd backend

# Build
sam build --config-env staging

# Deploy (first time - interactive)
sam deploy --guided --config-env staging

# Deploy (subsequent - non-interactive)
sam deploy --config-env staging
```

### Frontend Deployment

```bash
cd frontend

# Install dependencies
npm install

# Build production bundle
npm run build

# Output in dist/ directory
ls -lh dist/
```

**Deploy to Hosting Platform:**

- **Netlify**: `netlify deploy --prod --dir=dist`
- **Vercel**: `vercel --prod`
- **AWS S3 + CloudFront**: See [AWS Static Hosting Guide](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)

## Staging Workflow

### Purpose of Staging

Staging is a **production-identical environment** used for:

1. **Final verification**: Execute full PRODUCTION_CHECKLIST.md
2. **Performance testing**: Benchmark Lambda cold starts, Lighthouse scores
3. **Load testing**: Test with 100 concurrent users
4. **Integration testing**: Verify all 9 models work correctly
5. **Security scanning**: Run security audits before production

### Deploying to Staging

```bash
# 1. Deploy backend to staging
./scripts/deploy.sh staging

# 2. Verify backend outputs
cat frontend/.env
# Should show:
# VITE_API_ENDPOINT=https://...execute-api.us-west-2.amazonaws.com/Prod
# VITE_ENVIRONMENT=staging

# 3. Build and test frontend
cd frontend
npm run build
npm run preview

# 4. Test image generation
# Visit http://localhost:4173
# Generate test image, verify all 9 models complete
```

### Staging Verification Checklist

Before promoting to production, verify:

- [ ] All PRODUCTION_CHECKLIST.md items pass
- [ ] Integration tests pass against staging API
- [ ] All 9 models generate images successfully
- [ ] Gallery functionality works
- [ ] Error handling tested (rate limits, invalid input)
- [ ] Performance benchmarks documented
- [ ] Load testing completed (100 concurrent users)
- [ ] Security scans pass (npm audit, bandit)
- [ ] Frontend Lighthouse score > 90

See `docs/STAGING_VERIFICATION_REPORT.md` (created during Phase 3, Task 3) for detailed results.

### Tagging Staging Deployments

Track what's deployed to staging with git tags:

```bash
# After successful staging deployment
git tag -a staging-v1.0.0 -m "Staging deployment: Phase 3 complete"
git push origin staging-v1.0.0

# List staging deployments
git tag -l "staging-*"
```

### Promotion Workflow: Staging → Production

```bash
# 1. Verify staging is working
curl $STAGING_API_ENDPOINT/gallery/list

# 2. Run final staging verification
# Execute PRODUCTION_CHECKLIST.md

# 3. If all checks pass, deploy to production
./scripts/deploy.sh prod

# 4. Tag production deployment
git tag -a prod-v1.0.0 -m "Production deployment: Phase 3"
git push origin prod-v1.0.0

# 5. Monitor production for first 24 hours
# Check CloudWatch logs for errors
```

## Production Deployment

### Pre-Deployment Checklist

Before deploying to production:

- [ ] Staging fully verified (PRODUCTION_CHECKLIST.md complete)
- [ ] All tests pass
- [ ] Security scans pass
- [ ] Performance benchmarks meet targets
- [ ] Rollback plan documented
- [ ] Stakeholders notified

### Deploy to Production

```bash
# Deploy backend
./scripts/deploy.sh prod

# Deploy frontend to production hosting
cd frontend
npm run build
# Deploy dist/ to your production hosting
```

### Post-Deployment Verification

```bash
# Get production API endpoint
export API_ENDPOINT=$(grep VITE_API_ENDPOINT frontend/.env | cut -d '=' -f2)

# Test generate endpoint
curl -X POST $API_ENDPOINT/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test production","steps":25,"guidance":7,"ip":"1.2.3.4"}'
# Should return: {"jobId": "..."}

# Test status endpoint
curl $API_ENDPOINT/status/<jobId>
# Should return job status

# Test gallery
curl $API_ENDPOINT/gallery/list
# Should return: {"galleries": [...]}
```

### Monitoring Production

**CloudWatch Logs**:
```bash
# View Lambda logs
aws logs tail /aws/lambda/pixel-prompt-prod-function --follow

# Filter for errors
aws logs filter-pattern /aws/lambda/pixel-prompt-prod-function --filter-pattern "ERROR"
```

**CloudWatch Alarms**:
- Lambda Errors: Alerts when > 5 errors in 5 minutes
- Lambda Duration: Alerts when avg duration > 120 seconds

**Metrics to Monitor**:
- Lambda invocations
- API Gateway 4xx/5xx errors
- S3 storage usage
- CloudFront requests and bandwidth

## Rollback Procedures

### Backend Rollback

If production issues are detected:

#### Option 1: Redeploy Previous Version

```bash
# 1. Check git history for last known good commit
git log --oneline -10

# 2. Checkout previous version
git checkout <previous-commit>

# 3. Redeploy
cd backend
sam build --config-env prod
sam deploy --config-env prod

# 4. Return to latest
git checkout main
```

#### Option 2: CloudFormation Stack Rollback

```bash
# AWS will rollback to previous stable state
aws cloudformation cancel-update-stack --stack-name pixel-prompt-prod

# Or delete and redeploy previous version
aws cloudformation delete-stack --stack-name pixel-prompt-prod
# Wait for deletion to complete
git checkout <previous-commit>
./scripts/deploy.sh prod
```

### Frontend Rollback

```bash
# Checkout previous version
git checkout <previous-commit>

# Rebuild and redeploy
cd frontend
npm run build
# Deploy dist/ to hosting platform
```

## Troubleshooting

### Deployment Fails

**Error: "Unable to locate credentials"**

```bash
# Configure AWS credentials
aws configure

# Or use environment variables
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
export AWS_DEFAULT_REGION=us-west-2
```

**Error: "Stack already exists"**

```bash
# Stack exists but deploy failed
# Try deploying again (SAM will update existing stack)
sam deploy --config-env staging

# Or delete stack and redeploy
aws cloudformation delete-stack --stack-name pixel-prompt-staging
# Wait ~5 minutes for deletion
./scripts/deploy.sh staging
```

**Error: "No changes to deploy"**

```bash
# Force deploy with --force-upload
sam deploy --config-env staging --force-upload
```

### Frontend .env Not Generated

```bash
# Manually extract outputs
cd backend
sam list stack-outputs --stack-name pixel-prompt-staging

# Manually create frontend/.env
cd ../frontend
cat > .env << EOF
VITE_API_ENDPOINT=https://your-api.execute-api.us-west-2.amazonaws.com/Prod
VITE_ENVIRONMENT=staging
EOF
```

### CloudFront Taking Too Long

CloudFront distribution creation takes ~15 minutes. To check status:

```bash
# Get distribution ID from CloudFormation outputs
DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
  --stack-name pixel-prompt-staging \
  --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDomain'].OutputValue" \
  --output text | cut -d '.' -f1)

# Check distribution status
aws cloudfront get-distribution --id $DISTRIBUTION_ID \
  --query "Distribution.Status" --output text
# Status: "InProgress" or "Deployed"
```

### Lambda Deployment Package Too Large

If deployment package exceeds 50 MB:

```bash
# Use Lambda Layers for dependencies
# See backend/template.yaml for layer configuration
# Or reduce dependencies in requirements.txt
```

### API Keys Not Working

```bash
# Update stack with new API keys
sam deploy --config-env staging \
  --parameter-overrides \
    Model1Key=new-openai-key \
    Model2Key=new-google-key
```

## Cost Estimation

### Staging Environment (Monthly)

- Lambda: ~$5-10 (with reserved concurrency)
- API Gateway: ~$3-5 (per million requests)
- S3: ~$1-2 (with 30-day lifecycle)
- CloudFront: ~$1-5 (depends on traffic)
- **Total**: ~$10-25/month (light usage)

### Production Environment (Monthly)

Depends on traffic. For 10,000 generations/month:

- Lambda: ~$20-50
- API Gateway: ~$5-10
- S3: ~$5-10
- CloudFront: ~$10-20
- **Total**: ~$40-90/month

**Cost Optimization**:
- Use 30-day S3 lifecycle rules (already configured)
- Reduce Lambda reserved concurrency if not needed
- Use CloudFront caching aggressively (configured)

## Maintenance

### Regular Tasks

- **Weekly**: Review CloudWatch metrics
- **Monthly**: Review AWS costs
- **Monthly**: Update dependencies
- **Quarterly**: Security scan
- **Quarterly**: Review and rotate API keys
- **Annually**: Architectural review

### Updating Dependencies

```bash
# Backend
cd backend
pip install --upgrade -r requirements.txt
# Test locally
pytest tests/
# Deploy to dev first
./scripts/deploy.sh dev

# Frontend
cd frontend
npm update
npm audit fix
# Test locally
npm run build && npm run preview
```

## Additional Resources

- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [CloudFormation Best Practices](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/best-practices.html)
- [PRODUCTION_CHECKLIST.md](../PRODUCTION_CHECKLIST.md) - Pre-deployment verification
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues and solutions
- [PERFORMANCE.md](./PERFORMANCE.md) - Performance benchmarks and optimization

## Support

For deployment issues:

1. Check this guide's troubleshooting section
2. Review CloudWatch logs for errors
3. Consult AWS SAM documentation
4. Open an issue on GitHub with:
   - Error message
   - CloudFormation events
   - CloudWatch logs (redact sensitive info)
