# Development Guide

Complete guide for developing and contributing to Pixel Prompt.

## Table of Contents

- [Environment Setup](#environment-setup)
- [Development Workflow](#development-workflow)
- [Running Locally](#running-locally)
- [Testing](#testing)
- [Debugging](#debugging)
- [CI/CD Pipeline](#cicd-pipeline)
- [Troubleshooting](#troubleshooting)

## Environment Setup

### Prerequisites

Install the following tools:

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 18+ | Frontend development |
| npm | 9+ | Package management |
| Python | 3.12+ | Backend development |
| pip | Latest | Python package management |
| AWS CLI | Latest | AWS deployment |
| AWS SAM CLI | Latest | Local Lambda testing |
| Git | Latest | Version control |

### Installation

**macOS:**
```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install tools
brew install node python@3.12 awscli aws-sam-cli git
```

**Ubuntu/Debian:**
```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Python 3.12
sudo apt-get install -y python3.12 python3-pip

# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Install SAM CLI
pip install aws-sam-cli
```

**Windows:**
```powershell
# Install via Chocolatey
choco install nodejs python awscli git
pip install aws-sam-cli
```

### Repository Setup

1. **Fork and Clone**:
   ```bash
   # Fork on GitHub first, then:
   git clone https://github.com/YOUR_USERNAME/pixel-prompt.git
   cd pixel-prompt

   # Add upstream
   git remote add upstream https://github.com/HatmanStack/pixel-prompt.git
   ```

2. **Frontend Setup**:
   ```bash
   cd frontend

   # Install dependencies
   npm ci

   # Copy environment template
   cp .env.example .env

   # Edit .env with your local API endpoint
   # VITE_API_ENDPOINT=http://localhost:3000
   ```

3. **Backend Setup**:
   ```bash
   cd backend

   # Install dependencies
   pip install -r requirements.txt

   # Install test dependencies
   pip install -r tests/requirements.txt

   # Copy environment template
   cp .env.example .env

   # Edit .env with your API keys
   ```

### AWS Configuration

Configure AWS credentials for deployment:

```bash
aws configure
# AWS Access Key ID: YOUR_ACCESS_KEY
# AWS Secret Access Key: YOUR_SECRET_KEY
# Default region name: us-east-1
# Default output format: json
```

## Development Workflow

### 1. Sync with Upstream

Before starting new work:

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

### 2. Create Feature Branch

```bash
# Feature branch
git checkout -b feature/add-new-provider

# Bug fix branch
git checkout -b fix/resolve-rate-limit-issue
```

### 3. Make Changes

Follow code style guidelines and best practices.

### 4. Test Changes

Run tests locally before committing:

```bash
# Frontend
cd frontend
npm run lint        # Linting
npm test            # Tests
npm run build       # Build check

# Backend
cd backend
pytest tests/unit/ -v
pytest tests/integration/ -v
```

### 5. Commit Changes

Use conventional commits:

```bash
git add .
git commit -m "feat(frontend): add new model provider UI"
```

### 6. Push and Create PR

```bash
git push origin feature/add-new-provider
# Create PR on GitHub
```

## Running Locally

### Frontend Development

```bash
cd frontend

# Development server (hot reload)
npm run dev
# Opens at http://localhost:5173

# Production build
npm run build

# Preview production build
npm run preview
```

### Backend Development

#### Option 1: Local Lambda Emulation (SAM CLI)

```bash
cd backend

# Start local API
sam local start-api
# API available at http://localhost:3000

# Invoke function directly
sam local invoke GenerateFunction --event events/test-generate.json
```

#### Option 2: Deploy to AWS (Recommended)

```bash
cd backend

# Deploy to personal stack
sam deploy \
  --stack-name pixel-prompt-dev-YOUR_NAME \
  --resolve-s3 \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides Model1Key="YOUR_API_KEY"

# Get API endpoint
aws cloudformation describe-stacks \
  --stack-name pixel-prompt-dev-YOUR_NAME \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
  --output text
```

Update frontend `.env` with the API endpoint.

### Full Stack Development

1. **Deploy backend** to AWS (Option 2 above)
2. **Get API endpoint** from CloudFormation outputs
3. **Update frontend `.env`**:
   ```
   VITE_API_ENDPOINT=https://your-api-endpoint.execute-api.us-east-1.amazonaws.com
   ```
4. **Run frontend dev server**:
   ```bash
   cd frontend
   npm run dev
   ```
5. **Open browser** at http://localhost:5173

## Testing

### Frontend Tests

**Run all tests:**
```bash
cd frontend
npm test
```

**Run specific test:**
```bash
npm test -- ImageGrid
```

**Run with coverage:**
```bash
npm test -- --coverage
```

**Watch mode:**
```bash
npm test -- --watch
```

**Debug tests:**
```javascript
// Add .only to focus on specific test
describe.only('MyComponent', () => {
  it.only('specific test', () => {
    // ...
  });
});
```

### Backend Tests

**Run all tests:**
```bash
cd backend
pytest tests/ -v
```

**Run unit tests only:**
```bash
pytest tests/unit/ -v
```

**Run integration tests:**
```bash
# Requires deployed API
export API_ENDPOINT="https://your-endpoint.com"
pytest tests/integration/ -v
```

**Run with coverage:**
```bash
pytest tests/ -v --cov=src --cov-report=html
# Open htmlcov/index.html
```

**Run specific test:**
```bash
pytest tests/unit/test_handlers.py::test_generate_handler -v
```

**Debug tests:**
```bash
# Add breakpoint in code
import pdb; pdb.set_trace()

# Run with pdb
pytest tests/unit/test_handlers.py -v -s
```

### Writing New Tests

**Frontend test template:**
```javascript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('handles click event', async () => {
    const handleClick = vi.fn();
    render(<MyComponent onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});
```

**Backend test template:**
```python
import pytest
from src.models.handlers import generate_handler

def test_generate_handler():
    """Test generate handler with valid input"""
    result = generate_handler("test prompt", "model-name", {})

    assert result is not None
    assert "image_url" in result
    assert "model" in result
```

## Debugging

### Frontend Debugging

**Browser DevTools:**
1. Open DevTools (F12)
2. Set breakpoints in Sources tab
3. Use Console for logging

**VS Code Debugging:**
```json
// .vscode/launch.json
{
  "type": "chrome",
  "request": "launch",
  "name": "Debug Frontend",
  "url": "http://localhost:5173",
  "webRoot": "${workspaceFolder}/frontend"
}
```

**React DevTools:**
- Install React DevTools browser extension
- Inspect component props and state

### Backend Debugging

**CloudWatch Logs:**
```bash
# Tail logs in real-time
aws logs tail /aws/lambda/pixel-prompt-dev-YOUR_NAME-GenerateFunction --follow

# Filter errors
aws logs filter-log-events \
  --log-group-name /aws/lambda/pixel-prompt-dev-YOUR_NAME-GenerateFunction \
  --filter-pattern "ERROR"
```

**Local debugging:**
```python
# Add logging
import logging
logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

logger.debug(f"Variable value: {variable}")
```

**VS Code debugging:**
```json
// .vscode/launch.json
{
  "type": "python",
  "request": "launch",
  "name": "Debug Backend Tests",
  "module": "pytest",
  "args": ["tests/unit/", "-v"],
  "cwd": "${workspaceFolder}/backend"
}
```

## CI/CD Pipeline

### GitHub Actions Workflows

1. **Test Workflow** (`.github/workflows/test.yml`)
   - Triggers: PR, push to main
   - Runs: Frontend and backend tests
   - Duration: ~5 minutes

2. **Security Workflow** (`.github/workflows/security.yml`)
   - Triggers: PR, push to main, weekly
   - Runs: npm audit, bandit scan, dependency review
   - Duration: ~3 minutes

3. **Deploy Staging** (`.github/workflows/deploy-staging.yml`)
   - Triggers: Push to main
   - Deploys: Backend to staging
   - Duration: ~10 minutes

4. **Deploy Production** (`.github/workflows/deploy-production.yml`)
   - Triggers: Manual or release tag
   - Requires: Manual approval
   - Duration: ~15 minutes

### Running CI Locally

**Test workflow:**
```bash
# Frontend tests (same as CI)
cd frontend
npm ci
npm run lint
npm test
npm run build

# Backend tests (same as CI)
cd backend
pip install -r requirements.txt -r tests/requirements.txt
pytest tests/unit/ -v
pytest tests/integration/ -v -m "not slow"
```

**Security scanning:**
```bash
# Frontend
cd frontend
npm audit --audit-level=high

# Backend
cd backend
bandit -r src/ -ll
```

### Interpreting CI Results

**Green checkmark (✅)**: All tests passed, ready to merge

**Red X (❌)**: Tests failed, click for details

**Yellow dot (⏺)**: Running, wait for completion

**View detailed logs:**
1. Go to **Actions** tab
2. Click on workflow run
3. Click on failed job
4. Expand failed step to see error

## Troubleshooting

### Common Issues

#### "Module not found" in frontend

```bash
# Delete node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### "Import error" in backend

```bash
# Reinstall Python dependencies
cd backend
pip install -r requirements.txt --force-reinstall
```

#### Tests pass locally but fail in CI

- Check Node/Python versions match CI
- Review CI logs for environment differences
- Ensure all dependencies in package.json/requirements.txt

#### AWS deployment fails

```bash
# Check CloudFormation events
aws cloudformation describe-stack-events --stack-name STACK_NAME

# Delete failed stack and retry
aws cloudformation delete-stack --stack-name STACK_NAME
```

#### "Permission denied" errors

```bash
# Make scripts executable
chmod +x scripts/*.sh
```

### Getting Help

1. **Check existing issues**: Search GitHub issues
2. **Check documentation**: Review README and docs
3. **Ask in discussions**: Use GitHub Discussions
4. **Create issue**: Use bug report template

## Useful Commands

```bash
# Frontend
npm run dev             # Start dev server
npm run lint            # Run ESLint
npm run lint:fix        # Auto-fix lint errors
npm test                # Run tests
npm run build           # Production build

# Backend
pytest tests/ -v        # Run all tests
pytest -k "test_name"   # Run specific test
pytest --lf             # Run last failed tests
pytest --cov=src        # Run with coverage

# Git
git status              # Check status
git log --oneline -10   # View recent commits
git diff main           # Compare with main branch

# AWS
aws cloudformation describe-stacks --stack-name STACK_NAME
aws logs tail LOG_GROUP --follow
aws s3 ls s3://BUCKET_NAME
```

## Editor Configuration

### VS Code (Recommended)

Install extensions:
- ESLint
- Prettier
- Python
- Volar (Vue/Vite support)

**Settings (.vscode/settings.json):**
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": false,
  "python.linting.flake8Enabled": true
}
```

## Additional Resources

- [GitHub Contributing Guide](../.github/CONTRIBUTING.md)
- [Production Deployment Guide](../.github/PRODUCTION_DEPLOYMENT.md)
- [Security Policy](../SECURITY.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)

---

**Questions?** Open an issue or discussion on GitHub.
