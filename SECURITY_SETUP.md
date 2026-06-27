# Security Setup Guide

This document provides instructions for setting up security tools for the Boss Seth Kusina project.

## GitHub Secrets Setup

### SNYK_TOKEN Setup

To enable Snyk security scanning in GitHub Actions:

1. **Create a Snyk Account** (if you don't have one):
   - Go to https://snyk.io/
   - Sign up for a free account
   - Verify your email

2. **Get your Snyk API Token**:
   - Log in to https://app.snyk.io/
   - Go to Settings → General
   - Copy your API token

3. **Add SNYK_TOKEN to GitHub Secrets**:
   - Go to your GitHub repository
   - Navigate to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `SNYK_TOKEN`
   - Value: [paste your Snyk API token]
   - Click "Add secret"

## GitHub Security Features Setup

### GitHub Secret Scanning

GitHub Secret Scanning automatically scans repositories for secrets and alerts you if any are found.

**For Public Repositories** (Free):
- Secret Scanning is automatically enabled
- Go to repository Settings → Security → Code security and analysis
- Ensure "Secret scanning" is enabled

**For Private Repositories** (GitHub Advanced Security):
- Requires GitHub Advanced Security license
- Enable in Settings → Security → Code security and analysis

### GitHub Dependabot

Dependabot automatically creates pull requests to update dependencies with security fixes.

**Setup Steps**:
1. Go to repository Settings → Security → Code security and analysis
2. Enable "Dependabot alerts" (free for all repos)
3. Enable "Dependabot security updates" (free for all repos)

**Optional: Configure Dependabot for version updates**:
Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  # Enable version updates for npm
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    # Allow direct updates to production dependencies
    allow:
      - dependency-type: "direct"
    # Ignore specific versions if needed
    ignore:
      - dependency-name: "vite"
        update-types: ["version-update:semver-major"]
```

## Security Workflow Information

The `.github/workflows/security.yml` file contains automated security scans that run:

- **On every push** to main/master/develop branches
- **On every pull request** to main/master/develop branches  
- **Daily at 2 AM UTC** (scheduled scan)

### Workflow Jobs

1. **npm audit** - Scans for dependency vulnerabilities
2. **Semgrep SAST** - Static analysis for code vulnerabilities
3. **Snyk Security Scan** - Advanced dependency and code security scanning
4. **CodeQL Analysis** - GitHub's advanced code analysis
5. **Dependency Review** - Reviews dependency changes in PRs
6. **Build Scan** - Scans build artifacts for leaked secrets

### Viewing Results

After pushing code, view security scan results:
1. Go to repository Actions tab
2. Click on the "Security Scanning" workflow run
3. Review results for each job
4. Fix any issues found

## Manual Security Scans

You can also run security scans locally:

```bash
# npm audit
npm audit

# Semgrep
semgrep --config=auto src/

# Snyk (requires authentication)
snyk auth
snyk test
```

## Important Notes

- **SNYK_TOKEN is required** for the Snyk job to work in CI/CD
- **npm audit fix --force** may cause breaking changes - always test thoroughly
- **Secrets in git history** should be rotated (EmailJS credentials found in history)
- **Client-side rate limiting** is not sufficient for DDoS protection
- **Monitor security alerts** in GitHub Security tab regularly
