# CI/CD Monitoring and Notifications

Guide for monitoring the CI/CD pipeline health and understanding notifications.

## Table of Contents

- [Workflow Status Badges](#workflow-status-badges)
- [Monitoring Dashboard](#monitoring-dashboard)
- [Notifications](#notifications)
- [Deployment History](#deployment-history)
- [Metrics and Analytics](#metrics-and-analytics)
- [Troubleshooting CI Failures](#troubleshooting-ci-failures)

## Workflow Status Badges

Status badges in README show real-time workflow status:

| Badge | Workflow | Status Meanings |
|-------|----------|-----------------|
| ![Tests](https://github.com/HatmanStack/pixel-prompt/actions/workflows/test.yml/badge.svg) | Test | ✅ All tests passing<br>❌ Tests failing |
| ![Security](https://github.com/HatmanStack/pixel-prompt/actions/workflows/security.yml/badge.svg) | Security | ✅ No vulnerabilities<br>❌ Vulnerabilities found |
| ![Production](https://github.com/HatmanStack/pixel-prompt/actions/workflows/deploy-production.yml/badge.svg) | Production | ✅ Last deployment successful<br>❌ Deployment failed |

### Viewing Detailed Status

Click any badge to:
- View workflow run history
- See detailed logs
- Download artifacts (test reports, coverage)

## Monitoring Dashboard

### GitHub Actions Dashboard

**Location**: Repository → **Actions** tab

**Overview**:
- All workflows listed on left sidebar
- Recent runs in center panel
- Click any run for detailed logs

**Filtering**:
- Filter by workflow: Click workflow name in sidebar
- Filter by status: Use status dropdown (✅ Success, ❌ Failure, ⏺ In Progress)
- Filter by branch: Use branch dropdown
- Filter by event: PR, push, manual, schedule

### Workflow Health Indicators

**Green (✅)**: Workflow passed
- All jobs completed successfully
- Ready to merge (for PRs)
- Deployment successful (for deploys)

**Red (❌)**: Workflow failed
- One or more jobs failed
- Click to view error logs
- Fix required before merge

**Yellow (🟡)**: Workflow in progress
- Jobs currently running
- Wait for completion

**Gray (⚪)**: Workflow cancelled or skipped
- Manually cancelled
- Skipped due to conditions

## Notifications

### Email Notifications

GitHub sends emails for:
- Workflow failures on your branches
- PR checks completion
- Required review requests
- Deployment approvals needed

**Configure**:
1. GitHub Settings → Notifications
2. Actions section:
   - ✅ Only notify for failed workflows
   - ✅ Only notify for workflows you're involved in

### GitHub Issue Notifications

Workflows automatically create issues on failure:

**Staging Deployment Failure**:
- **Title**: ❌ Staging Deployment Failed - [commit]
- **Labels**: `deployment`, `staging`, `bug`
- **Content**: Workflow link, commit SHA, actor, timestamp

**Production Deployment Failure**:
- **Title**: 🚨 PRODUCTION Deployment Failed - [commit]
- **Labels**: `deployment`, `production`, `critical`, `bug`
- **Content**: Workflow link, rollback procedure, investigation steps

**To monitor**:
1. Watch repository: Click **Watch** → **Custom** → ✅ Issues
2. Filter issues: `label:deployment`
3. Subscribe to specific issues

### Slack Notifications (Optional)

To add Slack notifications:

1. **Create Slack App**:
   - Go to https://api.slack.com/apps
   - Create new app → From scratch
   - Add Incoming Webhooks
   - Copy webhook URL

2. **Add GitHub Secret**:
   - Repository Settings → Secrets → New secret
   - Name: `SLACK_WEBHOOK_URL`
   - Value: Webhook URL from step 1

3. **Update Workflows**:
   Add to staging and production workflows:
   ```yaml
   - name: Notify Slack
     if: always()
     uses: slackapi/slack-github-action@v1
     with:
       payload: |
         {
           "text": "Deployment ${{ job.status }}: ${{ github.workflow }}",
           "blocks": [
             {
               "type": "section",
               "text": {
                 "type": "mrkdwn",
                 "text": "*Deployment ${{ job.status }}*\n*Workflow*: ${{ github.workflow }}\n*Commit*: ${{ github.sha }}\n*Actor*: ${{ github.actor }}"
               }
             }
           ]
         }
     env:
       SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
   ```

## Deployment History

### Via GitHub Actions

**View all deployments**:
1. Actions → Deploy to Production (or Staging)
2. See chronological list of deployments
3. Click run for details (commit, actor, timestamp)

### Via GitHub Discussions (Recommended)

**Setup**:
1. Repository Settings → Features → ✅ Discussions
2. Create "Deployments" category
3. Update workflows to post deployment summaries

**Benefits**:
- Public deployment log
- Stakeholders can subscribe
- Search by version or date
- Comment on deployments

**Workflow addition**:
```yaml
- name: Post deployment to Discussions
  if: success()
  uses: actions/github-script@v7
  with:
    script: |
      github.rest.discussions.create({
        owner: context.repo.owner,
        repo: context.repo.repo,
        category_id: 'DEPLOYMENTS_CATEGORY_ID',
        title: `Production Deployment - v${{ github.event.release.tag_name }}`,
        body: `
          ## Deployment Details
          - **Version**: ${{ github.event.release.tag_name }}
          - **Commit**: ${{ github.sha }}
          - **API Endpoint**: ${{ steps.stack-outputs.outputs.api_endpoint }}
          - **Timestamp**: ${new Date().toISOString()}
        `
      })
```

### Via Git Tags

**View deployment tags**:
```bash
# List all release tags
git tag -l "v*"

# View tag details
git show v1.0.0

# View commits since last tag
git log v1.0.0..HEAD --oneline
```

## Metrics and Analytics

### Workflow Performance Metrics

**Track via Actions insights**:
1. Repository → Insights → Actions
2. View:
   - Workflow run duration
   - Success/failure rate
   - Most active workflows

**Key metrics**:
- **Mean duration**: Average workflow run time
- **Success rate**: % of successful runs
- **Failure rate**: % of failed runs
- **Queue time**: Time waiting for runner

### DORA Metrics (Optional)

Track DevOps Research and Assessment (DORA) metrics:

**1. Deployment Frequency**
- How often: Daily, weekly, monthly
- Track via: Count production deployments
- Goal: Increase frequency

**2. Lead Time for Changes**
- Time: Commit → production
- Track via: Git commit time → deployment time
- Goal: Decrease lead time

**3. Change Failure Rate**
- Metric: Failed deploys / total deploys
- Track via: Count failed vs successful deployments
- Goal: Decrease failure rate

**4. Mean Time to Recovery (MTTR)**
- Time: Failure detected → issue resolved
- Track via: Issue creation → close time
- Goal: Decrease MTTR

**Tracking script** (optional):
```bash
#!/bin/bash
# scripts/dora-metrics.sh

# Deployment frequency (last 30 days)
DEPLOYS=$(gh api \
  /repos/OWNER/REPO/actions/workflows/deploy-production.yml/runs \
  --jq '.workflow_runs | length')

echo "Deployments (30d): $DEPLOYS"

# Lead time (example: last deployment)
COMMIT_TIME=$(git log -1 --format=%ct)
DEPLOY_TIME=$(gh run list --workflow=deploy-production.yml --limit 1 --json createdAt --jq '.[0].createdAt' | xargs -I{} date -d {} +%s)
LEAD_TIME=$(( ($DEPLOY_TIME - $COMMIT_TIME) / 3600 ))

echo "Lead time (last deploy): ${LEAD_TIME}h"
```

### Cost Monitoring

**GitHub Actions usage**:
1. Repository Settings → Usage
2. View:
   - Minutes used (free tier: 2000/month for private, unlimited for public)
   - Storage used (500 MB free)

**AWS costs**:
```bash
# View Lambda invocations
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=pixel-prompt-production-GenerateFunction \
  --start-time $(date -u -d '30 days ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 86400 \
  --statistics Sum

# View S3 storage size
aws cloudwatch get-metric-statistics \
  --namespace AWS/S3 \
  --metric-name BucketSizeBytes \
  --dimensions Name=BucketName,Value=YOUR_BUCKET Name=StorageType,Value=StandardStorage \
  --start-time $(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 86400 \
  --statistics Average
```

## Troubleshooting CI Failures

### Test Workflow Failures

**Common causes**:
- Failing unit tests
- Linting errors
- Build errors
- Dependency issues

**Investigation**:
1. Click failed workflow run
2. Expand failed job (test-frontend or test-backend)
3. View error in logs
4. Reproduce locally:
   ```bash
   npm test  # Frontend
   pytest tests/ -v  # Backend
   ```

**Quick fixes**:
- Linting: `npm run lint:fix`
- Dependencies: `npm ci` or `pip install -r requirements.txt --force-reinstall`

### Security Workflow Failures

**Common causes**:
- High/critical npm vulnerabilities
- Bandit security issues
- Dependency review warnings

**Investigation**:
1. Download audit artifacts
2. Review npm-audit-report.json or bandit-report.json
3. Identify vulnerability

**Fixes**:
- npm: `npm audit fix` or update specific package
- Bandit: Review flagged code, fix if real issue, suppress if false positive

### Deployment Workflow Failures

**Common causes**:
- AWS credentials invalid
- CloudFormation stack errors
- Missing API keys
- Health checks failing

**Investigation**:
1. View workflow logs
2. Check CloudFormation events:
   ```bash
   aws cloudformation describe-stack-events --stack-name STACK_NAME
   ```
3. Check Lambda logs:
   ```bash
   aws logs tail /aws/lambda/FUNCTION_NAME --follow
   ```

**Fixes**:
- Credentials: Verify GitHub Secrets
- Stack errors: Review CloudFormation events, fix template
- Health checks: Test API endpoint manually

### Viewing Workflow Logs

**In GitHub UI**:
1. Actions → Select workflow run
2. Click job name
3. Expand steps to view logs
4. Search logs: Ctrl+F

**Via GitHub CLI**:
```bash
# View latest run logs
gh run view --log

# View specific run
gh run view RUN_ID --log

# Download logs
gh run download RUN_ID
```

## Useful Commands

```bash
# List recent workflow runs
gh run list --limit 10

# View workflow status
gh run view RUN_ID

# Re-run failed workflow
gh run rerun RUN_ID

# Cancel running workflow
gh run cancel RUN_ID

# Watch workflow in real-time
gh run watch RUN_ID

# List workflows
gh workflow list

# Trigger workflow manually
gh workflow run deploy-production.yml
```

## Monitoring Checklist

Daily:
- [ ] Check workflow status badges (all green?)
- [ ] Review any failed workflows in Actions tab
- [ ] Close resolved deployment issues

Weekly:
- [ ] Review security scan results
- [ ] Update dependencies (Dependabot PRs)
- [ ] Check GitHub Actions usage (Settings → Usage)

Monthly:
- [ ] Review DORA metrics (deployment frequency, lead time)
- [ ] Review AWS costs (CloudWatch, S3, Lambda)
- [ ] Update runbooks based on recent incidents

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Actions Usage Limits](https://docs.github.com/en/billing/managing-billing-for-github-actions/about-billing-for-github-actions)
- [DORA Metrics](https://cloud.google.com/blog/products/devops-sre/using-the-four-keys-to-measure-your-devops-performance)
- [Troubleshooting Guide](TROUBLESHOOTING.md)

---

**Questions?** Open an issue with the `ci` label.
