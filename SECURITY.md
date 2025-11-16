# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### How to Report

1. **Do NOT** open a public GitHub issue
2. Email security reports to: [repository owner's email]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### What to Expect

- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 7 days
- **Fix Timeline**: Varies by severity (Critical: 7 days, High: 30 days)
- **Disclosure**: Coordinated disclosure after fix is deployed

## Security Best Practices for Deployment

### Backend (AWS Lambda)

1. **API Keys**:
   - Never commit API keys to version control
   - Use SAM parameter overrides or AWS Secrets Manager
   - Rotate keys regularly
   - Use NoEcho in CloudFormation for sensitive parameters

2. **IAM Permissions**:
   - Follow least privilege principle
   - Review IAM roles regularly
   - Use specific resource ARNs (not wildcards)
   - Enable CloudTrail for audit logging

3. **S3 Bucket**:
   - Keep bucket private (no public access)
   - Use CloudFront OAI for controlled access
   - Enable versioning for critical data
   - Configure lifecycle policies for data retention
   - Enable server-side encryption (AES256 or KMS)

4. **Rate Limiting**:
   - Configure appropriate GLOBAL_LIMIT and IP_LIMIT
   - Use IP whitelisting for trusted sources only
   - Monitor rate limit violations in CloudWatch

5. **Lambda Security**:
   - Keep runtime updated (currently Python 3.12)
   - Review dependencies regularly (`pip list --outdated`)
   - Set appropriate memory and timeout limits
   - Use reserved concurrency to prevent runaway costs

### Frontend (React/Vite)

1. **Environment Variables**:
   - Never commit `.env` files
   - Use `.env.example` as template
   - Only expose necessary variables (prefix with `VITE_`)
   - No secrets in frontend code (client-side)

2. **Dependencies**:
   - Run `npm audit` regularly
   - Update dependencies: `npm update`
   - Fix vulnerabilities: `npm audit fix`
   - Review dependency licenses

3. **XSS Protection**:
   - React handles escaping by default
   - Avoid `dangerouslySetInnerHTML`
   - Sanitize user input before rendering
   - Use Content Security Policy headers

4. **HTTPS**:
   - Always serve over HTTPS in production
   - Configure HSTS headers
   - Use SSL/TLS certificates (Let's Encrypt, AWS Certificate Manager)

### Infrastructure

1. **CloudFront**:
   - Enable HTTPS enforcement
   - Configure appropriate caching policies
   - Use signed URLs for sensitive content (if needed)
   - Enable logging for security monitoring

2. **API Gateway**:
   - Configure CORS appropriately (restrict origins in production)
   - Enable CloudWatch logging
   - Set up usage plans and API keys (optional)
   - Use throttling to prevent abuse

## Known Security Considerations

### Authentication & Authorization

- **Current**: No authentication implemented (public API)
- **Consideration**: Add API key authentication or AWS Cognito for production
- **Risk**: Anyone can generate images (mitigated by rate limiting)
- **Mitigation**: Monitor usage, implement stricter rate limits if abused

### Content Filtering

- **Current**: Keyword-based content filter
- **Limitation**: Not comprehensive (can be bypassed)
- **Recommendation**: Consider using AWS Rekognition for image content moderation
- **Mitigation**: Monitor generated content, review filter keywords regularly

### Rate Limiting

- **Current**: S3-based with eventual consistency
- **Limitation**: Race conditions possible during burst traffic
- **Recommendation**: Use Redis/ElastiCache for atomic rate limiting in production
- **Mitigation**: Acceptable for MVP, monitor CloudWatch metrics

### Error Messages

- **Current**: Error messages are descriptive
- **Consideration**: May leak stack traces or internal details
- **Mitigation**: Review error responses, ensure no sensitive data exposed

### Data Privacy

- **Storage**: Generated images stored in S3 (30-day lifecycle)
- **Access**: Images accessible via CloudFront (no authentication)
- **Consideration**: Users may generate sensitive content
- **Mitigation**: Clear privacy policy, short retention period

## Security Scanning

### Automated CI Scanning

Security scanning is automated in the CI/CD pipeline via GitHub Actions:

- **Workflow**: `.github/workflows/security.yml`
- **Triggers**: Every PR, push to main, and weekly on Mondays
- **Scans**:
  - `npm audit` for frontend dependencies (fails on high/critical vulnerabilities)
  - `bandit` for Python security issues (fails on high/critical issues)
  - Dependency review for PR dependency changes
- **Reports**: Security scan reports uploaded as artifacts (retention: 30 days)
- **Dependabot**: Automated dependency updates configured weekly

To view security reports:
1. Go to Actions tab → Security Scanning workflow
2. Select latest run
3. Download artifacts (npm-audit-report.json, bandit-report.json)

### Manual Security Scanning

#### Backend (Python)

```bash
# Install bandit
pip install bandit

# Scan for security issues
bandit -r backend/src/ -f json -o security-report.json

# Fix HIGH and CRITICAL issues immediately
bandit -r backend/src/ -ll
```

#### Frontend (JavaScript)

```bash
# Audit dependencies
npm audit

# Fix automatically fixable issues
npm audit fix

# Force fix (may introduce breaking changes)
npm audit fix --force

# Review audit report
npm audit --json > audit-report.json
```

### Handling Security Vulnerabilities

When CI security scans fail:

1. **Review the artifact report** to identify the vulnerability
2. **Assess severity**: Critical/High must be fixed before merge
3. **Update dependencies**:
   - Frontend: `npm update [package]` or `npm audit fix`
   - Backend: Update version in `requirements.txt`
4. **Re-run tests** to ensure fixes don't break functionality
5. **Document any exceptions** (false positives) in this file

### Dependabot Configuration

Dependabot automatically creates PRs for:
- Frontend npm dependencies (weekly on Mondays)
- Backend pip dependencies (weekly on Mondays)
- GitHub Actions versions (weekly on Mondays)

Configuration: `.github/dependabot.yml`

## Compliance & Standards

- **OWASP Top 10**: Reviewed and mitigated
- **AWS Well-Architected**: Security pillar followed
- **Data Encryption**: At rest (S3 AES256) and in transit (HTTPS)
- **Logging**: CloudWatch logs enabled (7-day retention)

## Security Checklist for Deployment

- [ ] API keys configured and not in code
- [ ] S3 bucket is private
- [ ] CloudFront uses HTTPS
- [ ] Rate limiting configured
- [ ] Content filtering enabled
- [ ] CloudWatch alarms set up
- [ ] Dependencies up to date (`npm audit`, `pip list`)
- [ ] Security scans passed (bandit, npm audit)
- [ ] Error messages don't leak sensitive data
- [ ] Logs don't contain API keys or secrets
- [ ] IAM roles follow least privilege
- [ ] Monitoring and alerting configured

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [AWS Security Best Practices](https://aws.amazon.com/security/best-practices/)
- [React Security Best Practices](https://react.dev/reference/react-dom/server)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

## Contact

For security concerns or questions:
- GitHub Issues: (for non-sensitive topics)
- Email: [repository owner's email]

---

**Last Updated**: 2025-11-15
**Next Review**: 2025-12-15
