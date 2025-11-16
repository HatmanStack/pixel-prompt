# CI/CD Troubleshooting Guide

Solutions to common CI/CD pipeline issues.

## Table of Contents

- [Workflow Won't Trigger](#workflow-wont-trigger)
- [Test Failures](#test-failures)
- [Security Scan Failures](#security-scan-failures)
- [Deployment Failures](#deployment-failures)
- [Branch Protection Issues](#branch-protection-issues)
- [General Debugging](#general-debugging)

## Workflow Won't Trigger

### Symptom
Workflow doesn't run when expected (PR created, push to main, etc.)

### Possible Causes

**1. Workflow file syntax error**

Check YAML syntax:
```bash
# Install yamllint
pip install yamllint

# Validate workflow file
yamllint .github/workflows/test.yml
```

Fix any syntax errors and commit changes.

**2. Workflow disabled**

Check if workflow is enabled:
1. Actions → All workflows
2. Look for disabled workflows (grayed out)
3. Click workflow → Enable workflow

**3. Branch protection blocking**

If pushing to main fails:
1. Settings → Branches
2. Check branch protection rules
3. Create PR instead of direct push

**4. Event trigger mismatch**

Verify workflow triggers:
```yaml
on:
  pull_request:
    branches: [main]  # Only triggers on PRs to main
  push:
    branches: [main]  # Only triggers on push to main
```

**5. Workflow permissions**

Check repository settings:
1. Settings → Actions → General
2. Ensure workflows are enabled
3. Check read/write permissions

### Solution
```bash
# Manually trigger workflow (if workflow_dispatch is configured)
gh workflow run test.yml

# Or via GitHub UI
# Actions → Select workflow → Run workflow
```

---

## Test Failures

### Frontend Test Failures

#### Issue: "Module not found" errors

**Cause**: Missing or outdated dependencies

**Solution**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm test
```

#### Issue: "ReferenceError: document is not defined"

**Cause**: Component using browser APIs without proper mocking

**Solution**:
Add to test file:
```javascript
/**
 * @vitest-environment jsdom
 */
import { describe, it } from 'vitest';
// ... rest of test
```

Or update vite.config.js:
```javascript
export default defineConfig({
  test: {
    environment: 'jsdom',
  },
});
```

#### Issue: Tests timeout

**Cause**: Async operations not properly awaited

**Solution**:
Use `waitFor` or `findBy` queries:
```javascript
import { waitFor, screen } from '@testing-library/react';

// Bad
expect(screen.getByText('Loaded')).toBeInTheDocument();

// Good
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});

// Even better
expect(await screen.findByText('Loaded')).toBeInTheDocument();
```

#### Issue: "Cannot find module '@/components/...'"

**Cause**: Path alias not configured for tests

**Solution**:
Update vite.config.js:
```javascript
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Backend Test Failures

#### Issue: "ImportError: No module named 'src'"

**Cause**: Python path not configured

**Solution**:
Run from backend directory:
```bash
cd backend
pytest tests/ -v
```

Or set PYTHONPATH:
```bash
export PYTHONPATH="${PYTHONPATH}:$(pwd)/backend"
pytest backend/tests/ -v
```

#### Issue: "boto3 errors" in tests

**Cause**: AWS credentials not mocked

**Solution**:
Use moto for mocking:
```python
import pytest
from moto import mock_s3

@mock_s3
def test_s3_operation():
    # S3 operations will be mocked
    ...
```

#### Issue: Tests pass locally but fail in CI

**Cause**: Environment differences

**Investigation**:
1. Check Python/Node versions match CI
2. Check environment variables
3. Review CI logs for specific error

**Solution**:
```bash
# Match CI environment locally
# Frontend: Node 18
nvm use 18
npm ci
npm test

# Backend: Python 3.12
pyenv install 3.12
pyenv local 3.12
pip install -r requirements.txt
pytest tests/ -v
```

---

## Security Scan Failures

### npm Audit Failures

#### Issue: High/critical vulnerabilities in dependencies

**Investigation**:
```bash
cd frontend
npm audit

# View detailed report
npm audit --json > audit-report.json
```

**Solution 1: Auto-fix**:
```bash
npm audit fix
```

**Solution 2: Manual update**:
```bash
# Update specific package
npm update package-name

# Or update to latest
npm install package-name@latest
```

**Solution 3: Force fix** (may introduce breaking changes):
```bash
npm audit fix --force
npm test  # Verify tests still pass
```

**Solution 4: Accept risk temporarily**:
If vulnerability is in dev dependency or not exploitable:
1. Document in SECURITY.md
2. Create issue to track
3. Allow merge (maintainer decision)

### Bandit Scan Failures

#### Issue: High-severity security warnings

**Investigation**:
```bash
cd backend
bandit -r src/ -f json -o bandit-report.json
bandit -r src/ -ll  # Show high/critical only
```

**Common issues**:

**1. B101: assert_used**
```python
# Bad
assert user.is_authenticated

# Good
if not user.is_authenticated:
    raise AuthenticationError("Not authenticated")
```

**2. B105: hardcoded_password_string**
```python
# Bad
password = "secret123"

# Good
password = os.getenv("PASSWORD")
```

**3. B108: hardcoded_tmp_directory**
```python
# Bad
tmp_file = "/tmp/file.txt"

# Good
import tempfile
tmp_file = tempfile.mktemp()
```

**4. B603: subprocess_without_shell_equals_true**
```python
# Bad (if unavoidable)
subprocess.run("ls -la", shell=True)

# Good
subprocess.run(["ls", "-la"])

# If shell=True is necessary
# Add to .bandit config to suppress
```

**Suppressing false positives**:
Create `.bandit` file:
```ini
[bandit]
exclude: /tests/

[skips]
# Skip subprocess warnings in specific file
B603
```

Or inline suppression:
```python
subprocess.run(command, shell=True)  # nosec B602
```

### Dependency Review Failures

**Issue**: New dependency has known vulnerabilities

**Solution**:
1. Review dependency: Is it necessary?
2. Find alternative: Search for safer alternatives
3. Update: Use latest version
4. Document: If risk is acceptable, document why

---

## Deployment Failures

### AWS Credentials Invalid

**Symptom**: "Error: Credentials could not be loaded"

**Cause**: GitHub Secrets not configured or incorrect

**Solution**:
1. Settings → Secrets and variables → Actions
2. Verify secrets exist:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`
3. Check for typos or extra whitespace
4. Regenerate AWS credentials if necessary

**Test credentials locally**:
```bash
aws sts get-caller-identity
# Should return account details
```

### CloudFormation Stack Errors

**Symptom**: Deployment fails during SAM deploy

**Investigation**:
```bash
# View stack events
aws cloudformation describe-stack-events \
  --stack-name pixel-prompt-staging \
  --max-items 20

# View failed resources
aws cloudformation describe-stack-resources \
  --stack-name pixel-prompt-staging \
  --query 'StackResources[?ResourceStatus==`CREATE_FAILED`]'
```

**Common errors**:

**1. Stack already exists in failed state**:
```bash
# Delete failed stack
aws cloudformation delete-stack --stack-name pixel-prompt-staging

# Wait for deletion
aws cloudformation wait stack-delete-complete --stack-name pixel-prompt-staging

# Re-run deployment
```

**2. Insufficient IAM permissions**:
```bash
# Check IAM user permissions
aws iam get-user-policy --user-name YOUR_USER --policy-name YOUR_POLICY

# Required permissions:
# - CloudFormation (full)
# - Lambda (full)
# - S3 (full)
# - API Gateway (full)
# - IAM (CreateRole, AttachRolePolicy)
```

**3. Resource name conflicts**:
```bash
# Change stack name
sam deploy --stack-name pixel-prompt-dev-YOUR_NAME
```

### Lambda Function Errors

**Symptom**: Deployment succeeds but health checks fail

**Investigation**:
```bash
# Tail Lambda logs
aws logs tail /aws/lambda/FUNCTION_NAME --follow

# View recent errors
aws logs filter-log-events \
  --log-group-name /aws/lambda/FUNCTION_NAME \
  --filter-pattern "ERROR" \
  --max-items 10
```

**Common issues**:

**1. Missing API keys**:
- Check SAM parameter overrides include all `Model*Key` parameters
- Verify GitHub Secrets are set

**2. Timeout errors**:
- Increase Lambda timeout in template.yaml
- Optimize code to reduce execution time

**3. Memory errors**:
- Increase Lambda memory in template.yaml
- Current: 3008 MB (max: 10240 MB)

### S3 Bucket Errors

**Symptom**: Images not uploading or not accessible

**Investigation**:
```bash
# List buckets
aws s3 ls

# Check bucket permissions
aws s3api get-bucket-policy --bucket BUCKET_NAME

# Test upload
aws s3 cp test.txt s3://BUCKET_NAME/test.txt
```

**Solution**:
- Verify Lambda IAM role has S3 permissions
- Check S3 bucket exists (created by CloudFormation)
- Verify CloudFront OAI configured correctly

---

## Branch Protection Issues

### Can't Push to Main

**Symptom**: "Required status checks must pass before merging"

**Cause**: Branch protection enabled (as intended)

**Solution**: Create a PR instead:
```bash
git checkout -b feature/my-changes
git push origin feature/my-changes
# Create PR on GitHub
```

### PR Blocked by Failed Checks

**Symptom**: "Some checks were not successful"

**Solution**:
1. Click "Details" on failed check
2. View error logs
3. Fix issue
4. Push fix to PR branch
5. Checks will re-run automatically

### Required Reviewer Not Available

**Symptom**: PR approved but can't merge (waiting for specific reviewer)

**Solution**:
1. Tag another maintainer in PR
2. Or wait for configured reviewer
3. Maintainers can update protection rules if needed

---

## General Debugging

### Viewing Workflow Logs

**GitHub UI**:
1. Actions → Select workflow run
2. Click job name
3. Expand failed step
4. Search logs: Ctrl+F

**GitHub CLI**:
```bash
# View latest run
gh run view --log

# View specific run
gh run view RUN_ID --log

# Download logs
gh run download RUN_ID
```

### Re-running Failed Workflows

**GitHub UI**:
1. Go to failed workflow run
2. Click "Re-run jobs" → "Re-run failed jobs"

**GitHub CLI**:
```bash
# Re-run failed jobs only
gh run rerun RUN_ID --failed

# Re-run all jobs
gh run rerun RUN_ID
```

### Debugging Locally

**Reproduce test failures**:
```bash
# Frontend
cd frontend
npm ci
npm run lint
npm test
npm run build

# Backend
cd backend
pip install -r requirements.txt -r tests/requirements.txt
pytest tests/ -v
```

**Reproduce security scans**:
```bash
# npm audit
cd frontend
npm audit --audit-level=high

# Bandit
cd backend
bandit -r src/ -ll
```

### Canceling Running Workflows

**If workflow is stuck or needs to be stopped**:

**GitHub UI**:
1. Actions → Running workflow
2. Click "Cancel workflow"

**GitHub CLI**:
```bash
gh run cancel RUN_ID
```

### Common Environment Variables

**GitHub Actions provides**:
- `GITHUB_SHA`: Commit SHA
- `GITHUB_REF`: Branch/tag ref
- `GITHUB_ACTOR`: User who triggered workflow
- `GITHUB_WORKSPACE`: Workspace directory

**Custom secrets**:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `MODEL_1_KEY` through `MODEL_9_KEY`

**Access in workflow**:
```yaml
env:
  MY_VAR: ${{ secrets.MY_SECRET }}
```

## Getting Help

### GitHub Issues
1. Search existing issues: `label:ci`
2. Create new issue using bug report template
3. Include:
   - Workflow name
   - Run ID
   - Error logs (relevant portions)
   - What you've tried

### GitHub Discussions
- General questions
- Share solutions
- Request features

### AWS Support
- CloudFormation issues: AWS Console → Support
- Lambda issues: Check CloudWatch logs first

## Useful Commands Cheat Sheet

```bash
# GitHub CLI
gh run list                    # List recent runs
gh run view RUN_ID             # View run details
gh run rerun RUN_ID --failed   # Re-run failed jobs
gh run cancel RUN_ID           # Cancel run
gh workflow list               # List workflows
gh workflow run WORKFLOW       # Trigger manually

# AWS CLI
aws cloudformation describe-stacks --stack-name STACK
aws cloudformation describe-stack-events --stack-name STACK
aws logs tail LOG_GROUP --follow
aws s3 ls s3://BUCKET

# npm
npm audit                      # Audit dependencies
npm audit fix                  # Auto-fix vulnerabilities
npm outdated                   # Check outdated packages

# Python
bandit -r src/ -ll             # Security scan
pytest tests/ -v --lf          # Run last failed tests
pytest -k "test_name"          # Run specific test
```

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS CloudFormation Troubleshooting](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/troubleshooting.html)
- [CI/CD Monitoring Guide](CI_CD_MONITORING.md)
- [Development Guide](DEVELOPMENT.md)

---

**Still stuck?** Open an issue with the `ci` and `help wanted` labels.
