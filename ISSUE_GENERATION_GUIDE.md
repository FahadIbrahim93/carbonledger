# GitHub Issues Generation Guide

## Overview

This guide explains how to generate and upload 150+ GitHub issues across all stacks (smart contracts, testing, frontend, backend, and documentation).

## Generated Issues Breakdown

**Total: 169 issues** (slightly over 150 for optimal variety)

| Category | Count | Focus Areas |
|----------|-------|------------|
| Smart Contracts | 30 | Security, gas optimization, access control, event logging, reentrancy guards |
| Testing | 30 | Property-based tests, E2E flows, integration tests, load testing, fuzzing |
| Frontend | 30 | Dark mode, real-time updates, offline-first, accessibility, visualization |
| Backend | 30 | Idempotency, rate limiting, event sourcing, circuit breaker, monitoring |
| DevOps | 15 | Docker optimization, CI/CD, Kubernetes, Terraform, distributed tracing |
| Bug Fixes | 10 | Race conditions, memory leaks, retry logic, error handling |
| Features | 15 | Multi-sig approval, auto-retirement, webhooks, batch splitting, analytics |
| Refactoring | 10 | Auth consolidation, validation schemas, code quality improvements |

## Files Generated

1. **generated-issues.json** - Complete JSON with all 169 issues and metadata
2. **scripts/generate-150-issues.js** - Node.js script to generate issues
3. **scripts/create-issues.sh** - Bash script to bulk upload to GitHub

## Prerequisites

### Install GitHub CLI

```bash
# macOS
brew install gh

# Ubuntu/Debian
sudo apt-get install gh

# Or download from: https://cli.github.com/
```

### Authenticate

```bash
gh auth login
# Follow prompts to authenticate with GitHub
# Repository access required
```

## Usage

### Option 1: Generate Issues Only (Review First)

```bash
cd carbonledger
node scripts/generate-150-issues.js
```

This generates `generated-issues.json` without uploading to GitHub. Review the file first:

```bash
# View summary
head -100 generated-issues.json

# Pretty print
jq '.[0]' generated-issues.json

# Count issues
jq 'length' generated-issues.json
```

### Option 2: Generate and Upload All Issues

```bash
cd carbonledger

# Step 1: Generate issues (creates JSON)
node scripts/generate-150-issues.js

# Step 2: Make script executable (if not already)
chmod +x scripts/create-issues.sh

# Step 3: Upload all issues to GitHub
./scripts/create-issues.sh
```

The script will:
- Verify GitHub CLI authentication
- Read issues from `generated-issues.json`
- Create each issue on GitHub with labels
- Show progress (current/total)
- Wait 500ms between requests to avoid rate limiting

### Option 3: Selective Upload Using GitHub CLI

Upload specific issues by label:

```bash
# Create issues with smart-contracts label
gh issue create \
  --repo milah-247/carbonledger \
  --title "Contract: Implement access control guards" \
  --body "$(cat body.txt)" \
  --label "smart-contracts,security"

# Or load from template
gh issue create \
  --repo milah-247/carbonledger \
  --title "Testing: Add property-based tests" \
  --body "$(jq -r '.[0].body' generated-issues.json)" \
  --label "$(jq -r '.[0].labels | join(",")'​​​ generated-issues.json)"
```

## Viewing Created Issues

### List all issues

```bash
# All issues (limit 500)
gh issue list --repo milah-247/carbonledger --limit 500

# With specific label
gh issue list --repo milah-247/carbonledger --label "smart-contracts"

# By assignee
gh issue list --repo milah-247/carbonledger --assignee "@me"

# By state (open/closed/all)
gh issue list --repo milah-247/carbonledger --state open
```

### Create issue milestones and labels

Before uploading, set up labels:

```bash
# Create labels
gh label create --repo milah-247/carbonledger "smart-contracts" --color "FF6B6B"
gh label create --repo milah-247/carbonledger "testing" --color "4ECDC4"
gh label create --repo milah-247/carbonledger "frontend" --color "45B7D1"
gh label create --repo milah-247/carbonledger "backend" --color "FFA07A"
gh label create --repo milah-247/carbonledger "devops" --color "98D8C8"
gh label create --repo milah-247/carbonledger "good-first-issue" --color "7057FF"
gh label create --repo milah-247/carbonledger "help-wanted" --color "008672"
gh label create --repo milah-247/carbonledger "critical" --color "B60205"
gh label create --repo milah-247/carbonledger "security" --color "D73A49"
```

## Customization

### Modify issue templates

Edit `scripts/generate-150-issues.js`:

```javascript
const issueTemplates = {
  smartContracts: [
    {
      title: 'Your custom title',
      body: `Your custom description`,
      labels: ['label1', 'label2'],
      complexity: 'medium'
    },
    // ... more templates
  ]
};
```

### Adjust distribution

Modify the count in `generate150Issues()`:

```javascript
// Change from 6 issues per template to 10
issueTemplates.smartContracts.forEach(template => {
  allIssues.push(...generateIssuesWithVariations(template, 10, 'Smart Contracts'));
});
```

### Add new categories

```javascript
// In issueTemplates object
documentation: [
  {
    title: 'Docs: Create API reference',
    body: '...',
    labels: ['documentation'],
    complexity: 'medium'
  }
],

// In generate150Issues()
issueTemplates.documentation.forEach(template => {
  allIssues.push(...generateIssuesWithVariations(template, 5, 'Documentation'));
});
```

## Issue Labels Reference

| Label | Color | Usage |
|-------|-------|-------|
| `smart-contracts` | Red | Smart contract work |
| `testing` | Teal | Testing & QA |
| `frontend` | Blue | Frontend/UI work |
| `backend` | Orange | Backend/API work |
| `devops` | Green | DevOps/Infrastructure |
| `security` | Red | Security-related |
| `performance` | Yellow | Performance work |
| `good-first-issue` | Purple | Beginner-friendly |
| `help-wanted` | Blue | Community contribution |
| `bug` | Red | Bug reports |
| `feature` | Green | Feature requests |
| `refactoring` | Gray | Code cleanup |
| `documentation` | Blue | Docs work |

## Complexity Levels

Issues are tagged with complexity:

- **Low** - 1-3 hours, straightforward implementation
- **Medium** - 3-8 hours, moderate complexity
- **High** - 1-3 days, significant implementation
- **Very High** - 3+ days, complex work or research needed

## Rate Limiting

- GitHub API: 5,000 requests/hour per authenticated user
- `create-issues.sh` waits 500ms between requests = ~2 issues/second = ~7,200 issues/hour
- Safe for 150-169 issues

## Troubleshooting

### "gh: not found"
Install GitHub CLI: https://cli.github.com/

### "Authentication failed"
```bash
gh auth status
gh auth login
```

### "Repository not found"
```bash
# Verify repository access
gh repo view milah-247/carbonledger

# Check authentication
gh auth status
```

### "Rate limit exceeded"
Increase sleep delay in `create-issues.sh`:

```bash
# Change from 0.5s to 2s between issues
sleep 2
```

### JSON parsing error
Verify `generated-issues.json` format:

```bash
jq empty generated-issues.json
# If valid, no output; if invalid, error message
```

## Advanced: Batch Operations

### Close all issues with label

```bash
gh issue list --repo milah-247/carbonledger --label "wontfix" --state open | \
  awk '{print $1}' | \
  xargs -I {} gh issue close {} --repo milah-247/carbonledger
```

### Add label to all open issues

```bash
gh issue list --repo milah-247/carbonledger --state open | \
  awk '{print $1}' | \
  xargs -I {} gh issue edit {} --repo milah-247/carbonledger --add-label "reviewed"
```

### Export issues to CSV

```bash
gh issue list --repo milah-247/carbonledger --limit 500 --json number,title,labels,state
```

## Next Steps

1. ✅ Run `node scripts/generate-150-issues.js`
2. ✅ Review `generated-issues.json`
3. ✅ Create labels on GitHub (optional)
4. ✅ Run `./scripts/create-issues.sh` to upload all
5. ✅ Verify on GitHub: `gh issue list --repo milah-247/carbonledger`
6. 📝 Update README with contributor guidelines
7. 🏷️ Add issue templates for future contributions

## Support

For issues or questions:
- Check GitHub CLI docs: https://cli.github.com/manual/
- Review generated-issues.json for format
- Test with single issue first: `gh issue create --repo milah-247/carbonledger --title "Test" --body "Test issue"`

---

**Created**: July 2026
**Total Issues**: 169
**Estimated Effort**: 150+ developer-weeks
**Bounty Potential**: $100k+
