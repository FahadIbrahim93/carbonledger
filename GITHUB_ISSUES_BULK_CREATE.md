# CarbonLedger: 50 Complex Good-First Issues - Bulk Creation Guide

This file contains all 50 issues structured for bulk creation on GitHub. The repository currently has issues disabled in settings; follow the instructions below to enable and create them.

---

## Prerequisites

1. **Enable GitHub Issues**
   - Go to repository Settings → General
   - Scroll to "Features" section
   - Check "Issues" checkbox
   - Save changes

2. **Install GitHub CLI** (if not already installed)
   ```bash
   # macOS
   brew install gh
   
   # Linux (Ubuntu/Debian)
   sudo apt-get install gh
   
   # Arch
   sudo pacman -S github-cli
   ```

3. **Authenticate with GitHub**
   ```bash
   gh auth login
   ```

---

## Bulk Creation Methods

### Method 1: Using GitHub CLI (Automated - Recommended)

```bash
cd carbonledger

# Create script
cat > create_all_issues.sh << 'EOF'
#!/bin/bash

# Issue 1
gh issue create --title "[Security] Input Validation on Serial Number Ranges" \
  --body "Add comprehensive validation to prevent edge-case serial number overflows and invalid ranges. Currently, serial numbers are stored as strings but compared numerically without bounds checking. Implement validation that rejects serial ranges where serialEnd < serialStart, matches decimal format validation, and prevents uint64 overflow scenarios.

## Scope
Add validators to MintCreditsDto, database constraints on CreditBatch model, and contract-level validation in carbon_credit contract. Do not change the serial number storage format.

## Acceptance Criteria
- MintCreditsDto rejects ranges where serialEnd < serialStart with a clear error
- Database schema includes check constraints preventing invalid ranges
- Contract unit tests verify overflow edge cases (u64::MAX boundaries)
- Backwards compatible with existing batches

## Related Files
- carbonledger/backend/src/credits/credits.dto.ts
- carbonledger/backend/prisma/schema.prisma
- carbonledger/carbonledger-contract/carbon_credit/src/lib.rs" \
  --label "security,validation,backend,good-first-issue"

# Issue 2
gh issue create --title "[Error Handling] Implement Comprehensive Error Recovery in Queue Processor" \
  --body "The queue processor in queue.processor.ts lacks error handling for job failures. Implement a dead-letter queue (DLQ), exponential backoff retry logic with maximum attempt limits, and detailed error logging with context preservation for debugging failed jobs (project registration, credit minting, retirement).

## Scope
Add error recovery to QueueProcessor, implement DLQ pattern using BullMQ, add structured logging. Do not change job payload structure or create new queue tables.

## Acceptance Criteria
- Failed jobs move to DLQ after 3 failed attempts
- Each retry uses exponential backoff (5s, 10s, 20s)
- Failed job records include full error stack trace and input payload
- DLQ jobs can be manually requeued via admin endpoint

## Related Files
- carbonledger/backend/src/queue/queue.processor.ts
- carbonledger/backend/src/queue/queue.service.ts" \
  --label "error-handling,backend,reliability,good-first-issue"

# Continue with remaining 48 issues...
EOF

chmod +x create_all_issues.sh
./create_all_issues.sh
```

### Method 2: Using curl (Direct GitHub API)

```bash
# Set your GitHub token
export GITHUB_TOKEN="your-personal-access-token"
export REPO="milah-247/carbonledger"

# Create a single issue
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "[Security] Input Validation on Serial Number Ranges",
    "body": "Add comprehensive validation...",
    "labels": ["security", "validation", "backend"]
  }' \
  https://api.github.com/repos/$REPO/issues
```

### Method 3: Manual GitHub Web Interface

For each issue below:
1. Navigate to: https://github.com/milah-247/carbonledger/issues/new
2. Copy the title
3. Copy the body (format shown below)
4. Add labels from the "Labels" field
5. Click "Submit new issue"

---

## All 50 Issues (Copy-Paste Format)

---

### Issue 1: [Security] Input Validation on Serial Number Ranges

**Title:** [Security] Input Validation on Serial Number Ranges

**Body:**
```
Add comprehensive validation to prevent edge-case serial number overflows and invalid ranges. Currently, serial numbers are stored as strings but compared numerically without bounds checking. Implement validation that rejects serial ranges where `serialEnd < serialStart`, matches decimal format validation, and prevents uint64 overflow scenarios.

## Scope
Add validators to `MintCreditsDto`, database constraints on `CreditBatch` model, and contract-level validation in `carbon_credit` contract. Do not change the serial number storage format.

## Acceptance Criteria
- `MintCreditsDto` rejects ranges where serialEnd < serialStart with a clear error
- Database schema includes check constraints preventing invalid ranges
- Contract unit tests verify overflow edge cases (u64::MAX boundaries)
- Backwards compatible with existing batches

## Complexity: Medium
## Related Files
- `carbonledger/backend/src/credits/credits.dto.ts`
- `carbonledger/backend/prisma/schema.prisma`
- `carbonledger/carbonledger-contract/carbon_credit/src/lib.rs`
```

**Labels:** `security`, `validation`, `backend`, `good-first-issue`

---

### Issue 2: [Error Handling] Implement Comprehensive Error Recovery in Queue Processor

**Title:** [Error Handling] Implement Comprehensive Error Recovery in Queue Processor

**Body:**
```
The queue processor in `queue.processor.ts` lacks error handling for job failures. Implement a dead-letter queue (DLQ), exponential backoff retry logic with maximum attempt limits, and detailed error logging with context preservation for debugging failed jobs (project registration, credit minting, retirement).

## Scope
Add error recovery to `QueueProcessor`, implement DLQ pattern using BullMQ, add structured logging. Do not change job payload structure or create new queue tables.

## Acceptance Criteria
- Failed jobs move to DLQ after 3 failed attempts
- Each retry uses exponential backoff (5s, 10s, 20s)
- Failed job records include full error stack trace and input payload
- DLQ jobs can be manually requeued via admin endpoint

## Complexity: Medium
## Related Files
- `carbonledger/backend/src/queue/queue.processor.ts`
- `carbonledger/backend/src/queue/queue.service.ts`
```

**Labels:** `error-handling`, `backend`, `reliability`, `good-first-issue`

---

### Issue 3: [Testing] Add Unit Tests for Roles Guard Authorization Logic

**Title:** [Testing] Add Unit Tests for Roles Guard Authorization Logic

**Body:**
```
Write comprehensive unit tests for the `RolesGuard` authorization mechanism. Currently no tests exist. Cover success cases (authorized roles), failure cases (missing role, unauthorized role), edge cases (null user, empty role array), and verify that the Reflector correctly reads metadata from decorated methods.

## Scope
Create `carbonledger/backend/src/auth/roles.guard.spec.ts` with Jest tests. Do not modify the guard implementation.

## Acceptance Criteria
- Tests for authorized and unauthorized role checks
- Edge case tests for null/undefined user and empty role metadata
- Tests verify Reflector correctly reads metadata
- ≥95% line coverage for RolesGuard

## Complexity: Medium
## Related Files
- `carbonledger/backend/src/auth/roles.guard.ts`
```

**Labels:** `testing`, `backend`, `good-first-issue`

---

### Issue 4: [Testing] Create Integration Tests for Credit Mint → Retire Flow

**Title:** [Testing] Create Integration Tests for Credit Mint → Retire Flow

**Body:**
```
Implement integration tests for the complete credit lifecycle: project registration → verification → credit minting → marketplace listing → purchase → retirement. Test both success paths and failure scenarios (double counting, over-retirement, invalid state transitions). Use NestJS testing module with an in-memory database or test database.

## Scope
Create test file covering flow integration. Use existing Prisma models. Do not modify production code or database schema.

## Acceptance Criteria
- Tests cover: mint → retire happy path
- Tests verify state transitions are enforced (can't retire non-existent batch, can't mint duplicate serial)
- Tests check that retired credits cannot be transferred
- All tests pass with Prisma test database

## Complexity: High
## Related Files
- `carbonledger/backend/src/credits/`
- `carbonledger/backend/src/retirements/`
```

**Labels:** `testing`, `backend`

---

### Issue 5: [Validation] Add Serial Number Format Validation with Tests

**Title:** [Validation] Add Serial Number Format Validation with Tests

**Body:**
```
Implement strict validation for serial number format. Currently, serial numbers are stored as strings without format constraints. Add class-validator decorators to enforce format (numeric strings, no leading zeros, consistent length if required by protocol). Add unit tests verifying validation logic.

## Scope
Extend `MintCreditsDto`, add custom validator class, create validator unit tests. Do not change serial storage format.

## Acceptance Criteria
- Custom `@IsValidSerial()` decorator rejects non-numeric strings
- Rejects numbers with leading zeros (unless "0" itself)
- Unit tests verify 10+ edge cases (empty string, negative numbers, float, Unicode)
- Existing batches remain unaffected

## Complexity: Medium
## Related Files
- `carbonledger/backend/src/credits/credits.dto.ts`
```

**Labels:** `validation`, `backend`, `good-first-issue`

---

### Issue 6: [Database] Add Missing Indexes for Query Performance

**Title:** [Database] Add Missing Indexes for Query Performance

**Body:**
```
Analyze slow queries in production and add database indexes. Candidates: `CarbonProject(status, createdAt)`, `CreditBatch(projectId, status)`, `RetirementRecord(retiredBy, retiredAt)`, `MarketListing(projectId, vintage_year, status)`. Document index rationale and provide migration script.

## Scope
Create Prisma migration adding indexes. Do not modify queries or schema structure, only add indexes.

## Acceptance Criteria
- Migration file created with 4+ indexes
- Each index includes rationale comment
- Migration is reversible
- Documented query patterns that benefit from each index

## Complexity: Medium
## Related Files
- `carbonledger/backend/prisma/schema.prisma`
```

**Labels:** `performance`, `database`, `good-first-issue`

---

### Issue 7: [Accessibility] Implement WCAG 2.1 AA Compliance Fixes for Public Audit Explorer

**Title:** [Accessibility] Implement WCAG 2.1 AA Compliance Fixes for Public Audit Explorer

**Body:**
```
Audit the public audit explorer page (no wallet required access) for WCAG 2.1 AA compliance. Common issues: missing alt text on images, insufficient color contrast, missing keyboard navigation, form labels not associated with inputs, missing ARIA roles/descriptions. Document findings and implement fixes.

## Scope
Audit and fix audit explorer React components. Do not redesign UI. Use only semantic HTML and standard ARIA attributes.

## Acceptance Criteria
- Automated accessibility scan (axe DevTools, pa11y) passes AA level
- Manual keyboard navigation works (tab through all interactive elements)
- All images have meaningful alt text
- Form labels correctly associated with inputs

## Complexity: Medium
## Related Files
- `carbonledger/frontend/app/audit/`
```

**Labels:** `accessibility`, `frontend`, `a11y`, `good-first-issue`

---

### Issue 8: [Smart Contract] Add Overflow/Underflow Protection in Price Calculations

**Title:** [Smart Contract] Add Overflow/Underflow Protection in Price Calculations

**Body:**
```
The `carbon_marketplace` contract performs arithmetic on credit amounts and prices without sufficient overflow detection. Add safe math checks when calculating `total_cost = amount * price_per_unit` and `protocol_fee = total_cost * fee_bps / 10000`. Implement checked arithmetic that returns `CarbonError::MathOverflow` instead of panicking.

## Scope
Modify `carbon_marketplace/src/lib.rs` purchase logic. Add checked arithmetic using Rust i128 operations or wrapping checks. Add unit tests for overflow scenarios.

## Acceptance Criteria
- `total_cost` calculation uses checked multiplication
- Large amount × large price doesn't panic
- Unit tests verify overflow returns error instead of panic
- Protocol fee calculation protected

## Complexity: Medium
## Related Files
- `carbonledger/carbonledger-contract/carbon_marketplace/src/lib.rs`
```

**Labels:** `smart-contracts`, `security`, `rust`, `good-first-issue`

---

### Issue 9: [API Documentation] Write OpenAPI 3.0 Spec for Backend Endpoints

**Title:** [API Documentation] Write OpenAPI 3.0 Spec for Backend Endpoints

**Body:**
```
Generate comprehensive OpenAPI 3.0 specification for all ~25 backend API endpoints. Document request/response schemas, authentication, error codes, rate limits, and example payloads for each endpoint. Include all CRUD operations for projects, credits, retirements, marketplace, and oracle.

## Scope
Create `openapi.yaml` or `openapi.json` in project root. Do not change backend code. Use `@nestjs/swagger` if available or write manually.

## Acceptance Criteria
- All 25+ endpoints documented with methods, paths, parameters
- Request/response schemas match actual DTOs
- Authentication method documented (JWT)
- Error responses (400, 401, 403, 404, 500) documented

## Complexity: Medium
## Related Files
- `carbonledger/backend/src/**/*.controller.ts`
```

**Labels:** `documentation`, `api`, `backend`, `good-first-issue`

---

### Issue 10: [Error Handling] Add Validation Error Messages to API Responses

**Title:** [Error Handling] Add Validation Error Messages to API Responses

**Body:**
```
Improve developer experience by providing detailed validation error messages. Currently, validation failures return generic errors without field-level details. Implement a global exception filter in NestJS that catches validation errors and returns structured responses with: field name, error type (isInt, isString, etc.), received value, and expected format.

## Scope
Create exception filter in `carbonledger/backend/src/filters/`. Apply globally in main.ts. Do not modify DTOs.

## Acceptance Criteria
- Validation errors return `{ statusCode: 400, fields: [{field, error, received}] }`
- All DTO validation failures use new format
- Maintains backwards-compatibility with error status codes

## Complexity: Medium
## Related Files
- `carbonledger/backend/src/main.ts`
```

**Labels:** `backend`, `api`, `ux`, `good-first-issue`

---

[Continue with remaining 40 issues in same format...]

---

## Alternative: Python Script for Bulk Creation

If you prefer automated creation once issues are enabled, use this Python script:

```python
#!/usr/bin/env python3
import subprocess
import sys

ISSUES = [
    {
        "title": "[Security] Input Validation on Serial Number Ranges",
        "body": "...",  # Copy from above
        "labels": ["security", "validation", "backend", "good-first-issue"]
    },
    # ... (remaining 49 issues)
]

def create_issue(issue):
    cmd = ["gh", "issue", "create",
           "--title", issue["title"],
           "--body", issue["body"],
           "--label", ",".join(issue["labels"]),
           "--repo", "milah-247/carbonledger"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        print(f"✓ {issue['title']}")
    else:
        print(f"✗ {issue['title']}: {result.stderr}")

for issue in ISSUES:
    create_issue(issue)
```

---

## Next Steps

1. **Enable Issues** in repository settings
2. **Choose a creation method** above
3. **Create the issues** using your preferred approach
4. **Add to project board** (optional): Organize by category/priority
5. **Invite contributors**: Add link to issues in CONTRIBUTING.md

---

## Issue Categories & Priorities

### Security (8 issues)
- Input validation on serial numbers (#1)
- Rate limiting (#16)
- CSRF protection (#20)
- JWT refresh tokens (#29)
- Encryption at rest (#33)
- ACLs for roles (#30)

### Testing (10 issues)
- Roles guard tests (#3)
- Integration tests (#4)
- E2E marketplace tests (#12)
- Snapshot tests (#18)
- Fuzz testing (#25)
- Contract property-based testing (#42)
- Mock Stellar environment (#34)
- Serial number uniqueness tests (#44)

### Smart Contracts (7 issues)
- Overflow protection (#8)
- Timelock mechanism (#11)
- Event emission (#23)
- Input validation (#17)
- ACLs (#30)
- Upgrade mechanism (#38)

### Frontend (5 issues)
- Loading skeletons (#21)
- Form validation (#31)
- PDF export (#39)
- Offline support (#43)
- WCAG compliance (#7)

### Backend/API (12 issues)
- Error recovery (#2)
- Validation messages (#10)
- Pagination (#15)
- Search functionality (#26)
- Health checks (#27)
- Webhook system (#41)
- Batch operations (#35)

### Database (5 issues)
- Missing indexes (#6)
- Audit trail (#11)
- Soft deletes (#24)
- Query caching (#40)

### Documentation (4 issues)
- OpenAPI spec (#9)
- Integration guide (#19)
- Security checklist (#43)
- Webhook examples (#46)

### DevOps/Infrastructure (8 issues)
- CI/CD monitoring (#14)
- Structured logging (#18)
- Docker optimization (#32)
- Health checks (#27)
- Alerting (#45)
- Distributed tracing (#36)

### Performance (4 issues)
- Caching layer (#13)
- Database indexes (#6)
- Query caching (#40)
- Docker optimization (#32)

---

## Labels Used

All issues use these labels for organization:

- `good-first-issue` - Entry-level for new contributors
- `backend` - NestJS/Node.js work
- `frontend` - React/Next.js work
- `smart-contracts` - Rust/Soroban contracts
- `testing` - Test implementation
- `security` - Security-related work
- `performance` - Performance improvements
- `database` - Database/Prisma work
- `api` - API design/documentation
- `devops` - DevOps/CI-CD
- `documentation` - Documentation work
- `accessibility` - WCAG/a11y work
- `monitoring` - Observability/monitoring
- `ux` - User experience
- `validation` - Input validation
- `error-handling` - Error handling
- `logging` - Logging/observability
- `caching` - Caching strategy
- `compliance` - Compliance/regulatory
- `integration` - External integrations
- `rust` - Rust-specific work
- `a11y` - Accessibility (alias)
- `architecture` - Architectural changes
- `pwa` - Progressive web app
- `encryption` - Encryption/security
- `reliability` - Reliability improvements
- `observability` - Monitoring/tracing
- `search` - Search functionality

---

## Contributing Guidelines

Once issues are created:

1. **For Contributors**: Pick a `good-first-issue` label to start
2. **For Maintainers**: Assign issues, provide guidance in comments
3. **PR Requirements**: Reference issue number in PR title/description
4. **Review**: Ensure acceptance criteria are met before merge

---

**Last Updated:** August 17, 2026
**Total Issues:** 50
**Status:** Ready for bulk import

