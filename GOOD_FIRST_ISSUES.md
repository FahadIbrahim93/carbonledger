# CarbonLedger: 50 Complex Good-First Issues

---

### [Security] Input Validation on Serial Number Ranges

* **Work:** Add comprehensive validation to prevent edge-case serial number overflows and invalid ranges. Currently, serial numbers are stored as strings but compared numerically without bounds checking. Implement validation that rejects serial ranges where `serialEnd < serialStart`, matches decimal format validation, and prevents uint64 overflow scenarios.
* **Scope:** Add validators to `MintCreditsDto`, database constraints on `CreditBatch` model, and contract-level validation in `carbon_credit` contract. Do not change the serial number storage format.
* **Acceptance Criteria:** 
  - `MintCreditsDto` rejects ranges where serialEnd < serialStart with a clear error
  - Database schema includes check constraints preventing invalid ranges
  - Contract unit tests verify overflow edge cases (u64::MAX boundaries)
  - Backwards compatible with existing batches
* **Complexity:** Medium
* **Suggested Labels:** `security`, `validation`, `backend`
* **Relevant Files/Contracts:** `carbonledger/backend/src/credits/credits.dto.ts`, `carbonledger/backend/prisma/schema.prisma`, `carbonledger/carbonledger-contract/carbon_credit/src/lib.rs`

---

### [Error Handling] Implement Comprehensive Error Recovery in Queue Processor

* **Work:** The queue processor in `queue.processor.ts` lacks error handling for job failures. Implement a dead-letter queue (DLQ), exponential backoff retry logic with maximum attempt limits, and detailed error logging with context preservation for debugging failed jobs (project registration, credit minting, retirement).
* **Scope:** Add error recovery to `QueueProcessor`, implement DLQ pattern using BullMQ, add structured logging. Do not change job payload structure or create new queue tables.
* **Acceptance Criteria:**
  - Failed jobs move to DLQ after 3 failed attempts
  - Each retry uses exponential backoff (5s, 10s, 20s)
  - Failed job records include full error stack trace and input payload
  - DLQ jobs can be manually requeued via admin endpoint
* **Complexity:** Medium
* **Suggested Labels:** `error-handling`, `backend`, `reliability`
* **Relevant Files/Contracts:** `carbonledger/backend/src/queue/queue.processor.ts`, `carbonledger/backend/src/queue/queue.service.ts`

---

### [Testing] Add Unit Tests for Roles Guard Authorization Logic

* **Work:** Write comprehensive unit tests for the `RolesGuard` authorization mechanism. Currently no tests exist. Cover success cases (authorized roles), failure cases (missing role, unauthorized role), edge cases (null user, empty role array), and verify that the Reflector correctly reads metadata from decorated methods.
* **Scope:** Create `carbonledger/backend/src/auth/roles.guard.spec.ts` with Jest tests. Do not modify the guard implementation.
* **Acceptance Criteria:**
  - Tests for authorized and unauthorized role checks
  - Edge case tests for null/undefined user and empty role metadata
  - Tests verify Reflector correctly reads metadata
  - ≥95% line coverage for RolesGuard
* **Complexity:** Medium
* **Suggested Labels:** `testing`, `backend`, `good-first-issue`
* **Relevant Files/Contracts:** `carbonledger/backend/src/auth/roles.guard.ts`

---

### [Testing] Create Integration Tests for Credit Mint → Retire Flow

* **Work:** Implement integration tests for the complete credit lifecycle: project registration → verification → credit minting → marketplace listing → purchase → retirement. Test both success paths and failure scenarios (double counting, over-retirement, invalid state transitions). Use NestJS testing module with an in-memory database or test database.
* **Scope:** Create test file covering flow integration. Use existing Prisma models. Do not modify production code or database schema.
* **Acceptance Criteria:**
  - Tests cover: mint → retire happy path
  - Tests verify state transitions are enforced (can't retire non-existent batch, can't mint duplicate serial)
  - Tests check that retired credits cannot be transferred
  - All tests pass with Prisma test database
* **Complexity:** High
* **Suggested Labels:** `testing`, `backend`
* **Relevant Files/Contracts:** `carbonledger/backend/src/credits/`, `carbonledger/backend/src/retirements/`

---

### [Validation] Add Serial Number Format Validation with Tests

* **Work:** Implement strict validation for serial number format. Currently, serial numbers are stored as strings without format constraints. Add class-validator decorators to enforce format (numeric strings, no leading zeros, consistent length if required by protocol). Add unit tests verifying validation logic.
* **Scope:** Extend `MintCreditsDto`, add custom validator class, create validator unit tests. Do not change serial storage format.
* **Acceptance Criteria:**
  - Custom `@IsValidSerial()` decorator rejects non-numeric strings
  - Rejects numbers with leading zeros (unless "0" itself)
  - Unit tests verify 10+ edge cases (empty string, negative numbers, float, Unicode)
  - Existing batches remain unaffected
* **Complexity:** Medium
* **Suggested Labels:** `validation`, `backend`, `good-first-issue`
* **Relevant Files/Contracts:** `carbonledger/backend/src/credits/credits.dto.ts`

---

### [Database] Add Missing Indexes for Query Performance

* **Work:** Analyze slow queries in production and add database indexes. Candidates: `CarbonProject(status, createdAt)`, `CreditBatch(projectId, status)`, `RetirementRecord(retiredBy, retiredAt)`, `MarketListing(projectId, vintage_year, status)`. Document index rationale and provide migration script.
* **Scope:** Create Prisma migration adding indexes. Do not modify queries or schema structure, only add indexes.
* **Acceptance Criteria:**
  - Migration file created with 4+ indexes
  - Each index includes rationale comment
  - Migration is reversible
  - Documented query patterns that benefit from each index
* **Complexity:** Medium
* **Suggested Labels:** `performance`, `database`, `good-first-issue`
* **Relevant Files/Contracts:** `carbonledger/backend/prisma/schema.prisma`, `.prisma/migrations/`

---

### [Accessibility] Implement WCAG 2.1 AA Compliance Fixes for Public Audit Explorer

* **Work:** Audit the public audit explorer page (no wallet required access) for WCAG 2.1 AA compliance. Common issues: missing alt text on images, insufficient color contrast, missing keyboard navigation, form labels not associated with inputs, missing ARIA roles/descriptions. Document findings and implement fixes.
* **Scope:** Audit and fix audit explorer React components. Do not redesign UI. Use only semantic HTML and standard ARIA attributes.
* **Acceptance Criteria:**
  - Automated accessibility scan (axe DevTools, pa11y) passes AA level
  - Manual keyboard navigation works (tab through all interactive elements)
  - All images have meaningful alt text
  - Form labels correctly associated with inputs
* **Complexity:** Medium
* **Suggested Labels:** `accessibility`, `frontend`, `a11y`
* **Relevant Files/Contracts:** `carbonledger/frontend/app/audit/`

---

### [Smart Contract] Add Overflow/Underflow Protection in Price Calculations

* **Work:** The `carbon_marketplace` contract performs arithmetic on credit amounts and prices without sufficient overflow detection. Add safe math checks when calculating `total_cost = amount * price_per_unit` and `protocol_fee = total_cost * fee_bps / 10000`. Implement checked arithmetic that returns `CarbonError::MathOverflow` instead of panicking.
* **Scope:** Modify `carbon_marketplace/src/lib.rs` purchase logic. Add checked arithmetic using Rust i128 operations or wrapping checks. Add unit tests for overflow scenarios.
* **Acceptance Criteria:**
  - `total_cost` calculation uses checked multiplication
  - Large amount × large price doesn't panic
  - Unit tests verify overflow returns error instead of panic
  - Protocol fee calculation protected
* **Complexity:** Medium
* **Suggested Labels:** `smart-contracts`, `security`, `rust`
* **Relevant Files/Contracts:** `carbonledger/carbonledger-contract/carbon_marketplace/src/lib.rs`

---

### [API Documentation] Write OpenAPI 3.0 Spec for Backend Endpoints

* **Work:** Generate comprehensive OpenAPI 3.0 specification for all ~25 backend API endpoints. Document request/response schemas, authentication, error codes, rate limits, and example payloads for each endpoint. Include all CRUD operations for projects, credits, retirements, marketplace, and oracle.
* **Scope:** Create `openapi.yaml` or `openapi.json` in project root. Do not change backend code. Use `@nestjs/swagger` if available or write manually.
* **Acceptance Criteria:**
  - All 25+ endpoints documented with methods, paths, parameters
  - Request/response schemas match actual DTOs
  - Authentication method documented (JWT)
  - Error responses (400, 401, 403, 404, 500) documented
* **Complexity:** Medium
* **Suggested Labels:** `documentation`, `backend`, `good-first-issue`
* **Relevant Files/Contracts:** `carbonledger/backend/src/**/*.controller.ts`

---

### [Error Handling] Add Validation Error Messages to API Responses

* **Work:** Improve developer experience by providing detailed validation error messages. Currently, validation failures return generic errors without field-level details. Implement a global exception filter in NestJS that catches validation errors and returns structured responses with: field name, error type (isInt, isString, etc.), received value, and expected format.
* **Scope:** Create exception filter in `carbonledger/backend/src/filters/`. Apply globally in main.ts. Do not modify DTOs.
* **Acceptance Criteria:**
  - Validation errors return `{ statusCode: 400, fields: [{field, error, received}] }`
  - All DTO validation failures use new format
  - Maintains backwards-compatibility with error status codes
* **Complexity:** Medium
* **Suggested Labels:** `backend`, `api`, `ux`
* **Relevant Files/Contracts:** `carbonledger/backend/src/main.ts`

---

### [Smart Contract] Implement Timelock for Oracle Price Updates

* **Work:** Add a timelock mechanism to the `carbon_oracle` contract that delays price updates by a configurable period (default 1 hour). Prevents oracle from maliciously pushing exploitative prices. Admin proposes price update, must wait timelock, then executes. Community can contest during window.
* **Scope:** Add `propose_price_update()` and `execute_price_update()` functions with timelock delay logic. Add contest mechanism. Existing `update_credit_price()` should be removed or deprecated.
* **Acceptance Criteria:**
  - Price updates are delayed by configurable timelock (default 3600 secs)
  - Execution fails if called before timelock expires
  - Admin can cancel pending updates
  - Community can contest within timelock window
* **Complexity:** High
* **Suggested Labels:** `smart-contracts`, `security`, `rust`
* **Relevant Files/Contracts:** `carbonledger/carbonledger-contract/carbon_oracle/src/lib.rs`

---

### [Database] Create Database Migration for Audit Trail Table

* **Work:** Design and implement an audit trail table that logs all state-changing operations: project registration, credit mints, retirements, purchases, and price updates. Track: user, action, before/after values, timestamp, transaction hash. Implement Prisma model and migration. Add service to query audit logs for compliance.
* **Scope:** Create `AuditLog` model in schema, generate migration, implement `AuditService` with filtering. Do not modify existing models.
* **Acceptance Criteria:**
  - `AuditLog` model with user, action, resourceId, before, after, timestamp fields
  - Indexes on (resourceId, timestamp) and (user, timestamp)
  - `AuditService.queryByResource(id)` returns full history
  - Migration is reversible
* **Complexity:** Medium
* **Suggested Labels:** `database`, `compliance`, `backend`
* **Relevant Files/Contracts:** `carbonledger/backend/prisma/schema.prisma`

---

### [Testing] Add E2E Tests for Marketplace Purchase Flow

* **Work:** Write end-to-end tests for the complete marketplace flow: list credits → browse → purchase → verify balance changes. Use NestJS/Supertest or Playwright. Test both happy paths and error scenarios (insufficient credits, listing delisted during purchase, price changes).
* **Scope:** Create `carbonledger/backend/e2e/marketplace.e2e.spec.ts`. Use test database. Do not modify production code.
* **Acceptance Criteria:**
  - Happy path test: list → purchase → verify seller paid, buyer has credits
  - Test handles concurrent purchases from same listing
  - Tests verify error on insufficient credits
  - Tests run against test database
* **Complexity:** High
* **Suggested Labels:** `testing`, `backend`
* **Relevant Files/Contracts:** `carbonledger/backend/src/marketplace/`

---

### [Performance] Implement Caching Layer for Project Listings

* **Work:** Add Redis caching for expensive queries: `GET /api/projects`, `GET /marketplace/listings`, `GET /oracle/benchmark-price`. Cache with 5-minute TTL, invalidate on writes. Use `ioredis` (already in dependencies). Measure performance improvement (response time, query count).
* **Scope:** Add Redis caching to services, do not modify DTOs or API contracts. Use existing `ioredis` dependency.
* **Acceptance Criteria:**
  - Listings endpoint response time improves by 50%+
  - Cache invalidated on `POST /create`, `PUT /update`, `DELETE /delete`
  - Cache misses are logged
  - Fallback to database if cache unavailable
* **Complexity:** Medium
* **Suggested Labels:** `performance`, `backend`, `caching`
* **Relevant Files/Contracts:** `carbonledger/backend/src/projects/projects.service.ts`, `carbonledger/backend/src/marketplace/marketplace.service.ts`

---

### [CI/CD] Add Contract Size Monitoring to GitHub Actions

* **Work:** Enhance the existing GitHub Actions workflow to report WASM contract sizes. The CI already reports sizes in PR comments, but add: (1) tracking over time (store sizes in repository), (2) warn if size increases >5%, (3) suggest optimization strategies if contract exceeds threshold (e.g., 500KB).
* **Scope:** Modify `.github/workflows/ci.yml` to add size tracking. Create GitHub workflow artifact or commit size history to repo. Do not modify contract code.
* **Acceptance Criteria:**
  - PR comments include size change delta (e.g., "carbon_credit.wasm: 245KB → 248KB (+1.2%)")
  - Warning added if single contract exceeds 500KB
  - Size history logged (e.g., `WASM_SIZES.json`)
* **Complexity:** Medium
* **Suggested Labels:** `devops`, `ci-cd`, `performance`
* **Relevant Files/Contracts:** `.github/workflows/ci.yml`

---

### [API] Implement Pagination for Listing and Project Endpoints

* **Work:** Add pagination support to `GET /api/projects`, `GET /api/marketplace/listings`, and `GET /api/retirements`. Implement limit/offset pagination with cursor-based option. Return metadata: `{ data, total, limit, offset, hasMore }`. Update DTOs with `@IsInt() @Min(1) @Max(100) limit` and similar.
* **Scope:** Update controllers and services. Add pagination DTO. Do not change existing query patterns.
* **Acceptance Criteria:**
  - Endpoints accept `?limit=20&offset=0` query params
  - Responses include `total`, `hasMore`, `nextOffset`
  - Default limit 20, max 100
  - Works with existing filters
* **Complexity:** Medium
* **Suggested Labels:** `api`, `backend`, `ux`
* **Relevant Files/Contracts:** `carbonledger/backend/src/projects/projects.controller.ts`, `carbonledger/backend/src/marketplace/marketplace.controller.ts`

---

### [Security] Implement Rate Limiting on Authentication Endpoints

* **Work:** Add rate limiting to prevent brute-force attacks on login endpoints. Use `@nestjs/throttler` to limit login attempts to 5 per minute per IP. Implement sliding window rate limiting with exponential backoff after repeated failures. Lock account temporarily after 10 failed attempts.
* **Scope:** Add `@Throttle()` decorators, implement exception filter for rate limit responses. Do not modify auth logic.
* **Acceptance Criteria:**
  - `POST /api/auth/login` limited to 5 requests/minute per IP
  - 6th request returns 429 with `Retry-After` header
  - Account locks after 10 failed attempts (30-minute lockout)
  - Admin can manually unlock accounts
* **Complexity:** Medium
* **Suggested Labels:** `security`, `backend`, `auth`
* **Relevant Files/Contracts:** `carbonledger/backend/src/auth/auth.controller.ts`

---

### [Smart Contract] Add Comprehensive Input Validation for Project Registration

* **Work:** Harden `carbon_registry` contract by validating all inputs during project registration. Check: project ID is not empty, name length 1-256 chars, country code is valid 2-letter ISO, methodology is supported, vintage year is within reasonable bounds (1990-2100), coordinates are valid latitude/longitude if provided.
* **Scope:** Add validation in `register_project()` function. Implement helper functions for each validation. Add 8+ unit tests. Return specific `CarbonError` for each validation failure.
* **Acceptance Criteria:**
  - Empty project ID rejected with `InvalidProjectId` error
  - Name length validation (min 1, max 256 chars)
  - Country code must be 2-letter ISO 3166-1 alpha-2
  - Coordinates must be valid lat/lon (-90 to 90, -180 to 180)
* **Complexity:** Medium
* **Suggested Labels:** `smart-contracts`, `validation`, `rust`
* **Relevant Files/Contracts:** `carbonledger/carbonledger-contract/carbon_registry/src/lib.rs`

---

### [Logging] Implement Structured Logging for Backend API

* **Work:** Add structured logging throughout backend using `winston` or `bunyan` for better observability. Log: all API requests (method, path, params), responses (status, duration), database queries (query, duration), errors (stack trace, context). Output JSON format for log aggregation systems. Do not log sensitive data (private keys, passwords).
* **Scope:** Add logging library, create logger service, implement logging middleware. Do not modify business logic.
* **Acceptance Criteria:**
  - All HTTP requests logged with duration
  - Database operations logged with query type and duration
  - Error logs include stack trace and request context
  - No sensitive data in logs
* **Complexity:** Medium
* **Suggested Labels:** `logging`, `backend`, `observability`
* **Relevant Files/Contracts:** `carbonledger/backend/src/main.ts`

---

### [Testing] Write Snapshot Tests for Credit Batch Serialization

* **Work:** Create Jest snapshot tests for `CreditBatch` and `RetirementRecord` serialization/deserialization. Ensures future changes to these models don't accidentally break API contracts. Test edge cases: large serial numbers, special characters in metadata, timestamp handling.
* **Scope:** Create snapshot test file for credit models. Use Jest snapshots. Do not modify models.
* **Acceptance Criteria:**
  - Snapshots for typical batch and retirement data
  - Tests verify serialization matches expected format
  - Snapshots for edge cases (max int serial numbers)
  - Tests pass with existing data
* **Complexity:** Medium
* **Suggested Labels:** `testing`, `backend`, `good-first-issue`
* **Relevant Files/Contracts:** `carbonledger/backend/src/credits/credits.dto.ts`

---

### [Documentation] Create API Integration Guide for Third-Party Developers

* **Work:** Write comprehensive guide for third-party developers to integrate with CarbonLedger API. Cover: authentication (JWT + keypair), common workflows (lookup project by ID, check credit availability, track retirement), error handling, rate limits, pagination. Include code examples in JavaScript, Python, and cURL.
* **Scope:** Create `docs/API_INTEGRATION_GUIDE.md`. Provide runnable examples. Do not modify API endpoints.
* **Acceptance Criteria:**
  - Guide covers authentication flow with code examples
  - 5+ example workflows (look up project, check retirement, etc.)
  - Error codes documented with recovery strategies
  - Code examples are runnable (can be tested)
* **Complexity:** Medium
* **Suggested Labels:** `documentation`, `api`, `good-first-issue`
* **Relevant Files/Contracts:** `carbonledger/`

---

### [Security] Add CSRF Protection to State-Changing Endpoints

* **Work:** Implement CSRF (Cross-Site Request Forgery) protection for state-changing operations (POST, PUT, DELETE). Use double-submit cookie pattern or synchronizer token. Add CSRF token to responses, validate on requests. Exclude GET requests and authenticated API calls with proper headers.
* **Scope:** Add CSRF middleware to NestJS app. Do not modify existing endpoints.
* **Acceptance Criteria:**
  - CSRF tokens generated for all state-changing requests
  - Missing/invalid token returns 403 Forbidden
  - GET requests not protected
  - API requests with Authorization header exempt
* **Complexity:** Medium
* **Suggested Labels:** `security`, `backend`
* **Relevant Files/Contracts:** `carbonledger/backend/src/main.ts`

---

### [Frontend] Implement Loading Skeletons for Marketplace Listings

* **Work:** Improve perceived performance of marketplace page by adding loading skeleton components while data is being fetched. Replace actual content with shimmer-animated placeholders. Use existing `LoadingSkeleton` component or create new ones for credit cards, listing filters, and pricing tables.
* **Scope:** Create skeleton components, integrate into marketplace page. Do not modify API or data fetching logic.
* **Acceptance Criteria:**
  - Skeletons display while listings are loading
  - Skeletons match final layout (same dimensions, spacing)
  - Smooth transition from skeleton to actual content
  - Works on mobile and desktop
* **Complexity:** Medium
* **Suggested Labels:** `frontend`, `ux`, `performance`, `good-first-issue`
* **Relevant Files/Contracts:** `carbonledger/frontend/components/LoadingSkeleton.tsx`

---

### [Smart Contract] Add Event Emission for State Changes

* **Work:** Implement event emission in all 4 Soroban contracts for state-changing operations. Events aid with indexing, notifications, and debugging. Emit events for: `ProjectRegistered`, `ProjectVerified`, `CreditsIssued`, `CreditsRetired`, `CreditsTransferred`, `CreditsListed`, `CreditsPurchased`, `PriceUpdated`. Provide event payload examples.
* **Scope:** Add event emission to contracts using Soroban SDK event mechanisms. Add unit tests verifying events are emitted. Do not change contract state or logic.
* **Acceptance Criteria:**
  - Events emitted for all major state changes
  - Event payloads include relevant data (project_id, amount, actor)
  - Unit tests verify event emission with correct data
  - Events follow Soroban conventions
* **Complexity:** High
* **Suggested Labels:** `smart-contracts`, `rust`, `observability`
* **Relevant Files/Contracts:** `carbonledger/carbonledger-contract/carbon_*/src/lib.rs`

---

### [Database] Implement Soft Deletes for Compliance

* **Work:** Replace hard deletes with soft deletes for regulatory compliance and audit trails. Add `deletedAt` timestamp field to `CarbonProject`, `CreditBatch`, `MarketListing`, `RetirementRecord`. Update all queries to exclude soft-deleted records by default. Provide admin endpoint to permanently purge records after retention period.
* **Scope:** Add `deletedAt` nullable DateTime field to relevant models in Prisma. Create migration. Update queries using Prisma middleware. Do not restore deleted records.
* **Acceptance Criteria:**
  - `deletedAt` field added to all models
  - Default queries exclude deleted records
  - Admin can view deleted records with `?includeDeleted=true`
  - Audit logs preserved after deletion
* **Complexity:** Medium
* **Suggested Labels:** `database`, `compliance`, `backend`
* **Relevant Files/Contracts:** `carbonledger/backend/prisma/schema.prisma`

---

### [Testing] Add Fuzz Testing for Serial Number Validation

* **Work:** Implement property-based fuzz testing for serial number validation using `fast-check` or `hypothesis`. Generate random serial number strings and ranges, verify that validation behaves consistently: rejects invalid formats, detects overlaps, prevents overflow. Target 100+ generated test cases per run.
* **Scope:** Create fuzz test file for serial number validation. Use property-based testing library. Do not modify validation logic.
* **Acceptance Criteria:**
  - Fuzz test generates 100+ random inputs per run
  - Verification logic passes all generated cases
  - Overlap detection works on random ranges
  - Tests identify any edge cases in validation
* **Complexity:** High
* **Suggested Labels:** `testing`, `backend`
* **Relevant Files/Contracts:** `carbonledger/backend/src/credits/`

---

### [API] Add Search Functionality for Projects and Credits

* **Work:** Implement full-text search for projects and credits. Allow searching by: project name, methodology, country, credit batch ID, vintage year. Use PostgreSQL full-text search capabilities through Prisma's raw queries. Implement pagination of search results.
* **Scope:** Add search endpoint `/api/search` with query parameter. Integrate with existing Prisma queries. Do not create new data structures.
* **Acceptance Criteria:**
  - Search endpoint accepts `?q=query_string`
  - Results include projects and credits matching query
  - Search is case-insensitive
  - Results paginated with limit/offset
* **Complexity:** Medium
* **Suggested Labels:** `api`, `backend`, `search`, `ux`
* **Relevant Files/Contracts:** `carbonledger/backend/src/projects/projects.service.ts`

---

### [Monitoring] Implement Health Check Endpoint

* **Work:** Create comprehensive health check endpoint that monitors: database connectivity, Redis connectivity, contract availability on Stellar, API readiness. Return structured response: `{ status: 'healthy'|'degraded'|'unhealthy', services: {db, redis, stellar, api} }`. Use this for Kubernetes liveness/readiness probes.
* **Scope:** Create health check controller and service. Do not modify existing endpoints.
* **Acceptance Criteria:**
  - `GET /health` returns structured status
  - Checks database connectivity
  - Checks Stellar RPC availability
  - Returns 200 if healthy, 503 if degraded
* **Complexity:** Medium
* **Suggested Labels:** `devops`, `monitoring`, `backend`
* **Relevant Files/Contracts:** `carbonledger/backend/src/app.module.ts`

---

### [Security] Validate JWT Expiration and Refresh Tokens

* **Work:** Enhance JWT authentication to include refresh token mechanism. Issue short-lived access tokens (15 min) and long-lived refresh tokens (7 days). Implement refresh endpoint that validates refresh token and returns new access token. Add revocation list for logout.
* **Scope:** Update `AuthService`, add refresh token endpoint, implement token revocation service. Update JWT strategy and middleware.
* **Acceptance Criteria:**
  - Access tokens expire in 15 minutes
  - Refresh tokens expire in 7 days
  - `POST /api/auth/refresh` returns new access token
  - Logout invalidates refresh token
* **Complexity:** High
* **Suggested Labels:** `security`, `auth`, `backend`
* **Relevant Files/Contracts:** `carbonledger/backend/src/auth/auth.service.ts`

---

### [Smart Contract] Implement Access Control Lists (ACLs) for Roles

* **Work:** Add fine-grained access control to contracts. Create ACL system where admin can grant/revoke specific roles: `VERIFIER`, `ORACLE`, `MARKETPLACE_ADMIN`. Use Soroban's authorization framework. Verify caller against ACL before allowing operations.
* **Scope:** Add ACL data structures to contracts, implement role-based access checks. Do not change existing function signatures.
* **Acceptance Criteria:**
  - Verifier role can call `verify_project()` only
  - Oracle role can call `submit_monitoring_data()` and `update_price()`
  - Admin can grant/revoke roles
  - Unauthorized calls rejected with clear error
* **Complexity:** High
* **Suggested Labels:** `smart-contracts`, `security`, `rust`
* **Relevant Files/Contracts:** `carbonledger/carbonledger-contract/carbon_registry/src/lib.rs`

---

### [Frontend] Implement Form Validation with Real-Time Error Messages

* **Work:** Add client-side form validation for project registration and credit purchase forms. Validate: required fields, email format (if used), numeric fields, URL format for metadata. Show error messages inline as user types (debounced). Prevent submission with invalid data.
* **Scope:** Create form validation utility hook, integrate into project and purchase forms. Do not modify backend.
* **Acceptance Criteria:**
  - Form fields validate on blur and change events
  - Error messages appear below invalid fields
  - Submit button disabled if form invalid
  - Clear error messages guide user to fix issues
* **Complexity:** Medium
* **Suggested Labels:** `frontend`, `ux`, `validation`, `good-first-issue`
* **Relevant Files/Contracts:** `carbonledger/frontend/app/projects/register/page.tsx`

---

### [Docker] Optimize Multi-Stage Docker Build for Frontend

* **Work:** Improve frontend Dockerfile to reduce image size and build time. Implement multi-stage build: build stage installs dependencies and builds Next.js, runtime stage only includes production artifacts and runtime dependencies. Add build cache optimization by layering Dockerfile effectively.
* **Scope:** Update `carbonledger/frontend/Dockerfile`. Do not change Next.js build process.
* **Acceptance Criteria:**
  - Final image size reduced by 30%+
  - Build time improves with proper layer ordering
  - Only production dependencies in final image
  - Health check added to image
* **Complexity:** Medium
* **Suggested Labels:** `devops`, `docker`, `performance`
* **Relevant Files/Contracts:** `carbonledger/frontend/Dockerfile`

---

### [API] Implement Batch Operations for Efficiency

* **Work:** Add batch endpoints for common operations: bulk listing, bulk retirement tracking, bulk price updates. Accept arrays of inputs, process in transaction, return array of results with status per item. Useful for projects issuing 1000+ credits monthly.
* **Scope:** Create batch endpoints in projects, credits, and oracle services. Use database transactions. Do not modify individual operation endpoints.
* **Acceptance Criteria:**
  - `POST /api/credits/batch-mint` accepts array of MintCreditsDto
  - Returns array with status per item (success/error)
  - Atomic transaction (all or nothing)
  - Performance improved for large operations
* **Complexity:** High
* **Suggested Labels:** `api`, `backend`, `performance`
* **Relevant Files/Contracts:** `carbonledger/backend/src/credits/credits.controller.ts`

---

### [Testing] Create Mock Stellar/Soroban Environment for Tests

* **Work:** Set up a mock Stellar/Soroban environment for integration tests that doesn't require testnet access. Use `soroban-sdk` testing utilities or create mock implementations of contract interactions. Allows tests to run in CI/CD without network dependency.
* **Scope:** Create mock environment in `carbonledger/backend/src/__mocks__/`. Implement mock contract client. Update integration tests to use mocks.
* **Acceptance Criteria:**
  - Mock contracts respond to contract calls predictably
  - Tests don't require network access
  - Mock environment supports all 4 contract types
  - CI/CD tests run faster
* **Complexity:** High
* **Suggested Labels:** `testing`, `backend`
* **Relevant Files/Contracts:** `carbonledger/backend/src/`

---

### [Security] Add Encryption for Sensitive Data at Rest

* **Work:** Implement encryption for sensitive project metadata and retirement records stored in database. Use `node-crypto` with AES-256-GCM. Store encryption keys in environment variables or Vault. Implement transparent encryption/decryption in Prisma middleware.
* **Scope:** Add encryption middleware to Prisma, select sensitive fields (projectMetadata, certificateData) for encryption. Do not encrypt public data like project names, vintage years.
* **Acceptance Criteria:**
  - Metadata fields encrypted at rest
  - Encryption keys rotated without re-encrypting all data
  - Queries work transparently (automatic decryption)
  - No sensitive data in raw database access
* **Complexity:** High
* **Suggested Labels:** `security`, `database`, `encryption`
* **Relevant Files/Contracts:** `carbonledger/backend/src/prisma.service.ts`

---

### [Observability] Implement Distributed Tracing

* **Work:** Add distributed tracing to track requests across backend services and contracts. Use `@opentelemetry/sdk-node` with Jaeger exporter. Generate trace IDs for each request, propagate through service calls and async jobs. Enables debugging performance issues and request flows.
* **Scope:** Add OpenTelemetry instrumentation to NestJS. Do not modify business logic or endpoints.
* **Acceptance Criteria:**
  - Trace IDs propagated through all requests
  - Jaeger can visualize request flows
  - Database and async calls included in traces
  - Reduced span count through intelligent sampling
* **Complexity:** High
* **Suggested Labels:** `observability`, `backend`, `devops`
* **Relevant Files/Contracts:** `carbonledger/backend/src/main.ts`

---

### [Smart Contract] Implement Contract Upgrade Mechanism

* **Work:** Design and implement a mechanism to upgrade smart contracts without losing state. Use Stellar's contract upgrade features or implement a proxy pattern. Document upgrade process, testing requirements, and rollback procedure.
* **Scope:** Design upgrade architecture, implement in all 4 contracts, create upgrade playbook documentation. Do not change existing functionality.
* **Acceptance Criteria:**
  - Contracts can be upgraded without data loss
  - Backwards-compatible storage layout
  - Upgrade process documented
  - Rollback strategy defined
* **Complexity:** Very High
* **Suggested Labels:** `smart-contracts`, `architecture`, `rust`
* **Relevant Files/Contracts:** `carbonledger/carbonledger-contract/`

---

### [Frontend] Add Certificate Export to PDF

* **Work:** Implement PDF export for retirement certificates. Create React component that generates attractive, verifiable PDF with: project info, credits retired, retirement date, beneficiary, certificate URL, QR code linking to audit trail. Use existing `jspdf` dependency.
* **Scope:** Create CertificatePDF component, integrate into retirement details page. Do not modify certificate data model.
* **Acceptance Criteria:**
  - PDF includes all certificate information
  - QR code links to verifiable public audit trail
  - Certificate URL permanent and tamper-proof
  - Downloads work on mobile and desktop
* **Complexity:** Medium
* **Suggested Labels:** `frontend`, `ux`, `good-first-issue`
* **Relevant Files/Contracts:** `carbonledger/frontend/components/RetirementCertificate.tsx`

---

### [Database] Implement Query Result Caching at ORM Level

* **Work:** Add automatic query result caching in Prisma using middleware. Cache frequently accessed queries (projects, listings, prices) with 5-minute TTL. Invalidate cache on mutations. Provides automatic performance improvement without code changes.
* **Scope:** Create Prisma middleware for caching, implement cache invalidation on mutations. Use Redis backend. Do not modify service methods.
* **Acceptance Criteria:**
  - Repeated queries served from cache
  - Cache invalidated on CREATE/UPDATE/DELETE
  - Performance improved 40%+
  - Cache misses logged for monitoring
* **Complexity:** Medium
* **Suggested Labels:** `database`, `performance`, `backend`
* **Relevant Files/Contracts:** `carbonledger/backend/src/prisma.service.ts`

---

### [Testing] Implement Contract Property-Based Testing

* **Work:** Use `proptest` or similar for property-based testing of contracts. Verify invariants: "credits never increase without explicit mint", "retired credits never trade", "serial numbers never duplicate". Generate random inputs and verify properties hold across all executions.
* **Scope:** Create property test suite for each contract. Do not modify contract code.
* **Acceptance Criteria:**
  - Property tests for all 4 contracts
  - Tests verify critical invariants (no double counting, no double retirement)
  - 1000+ generated test cases per property
  - All properties pass
* **Complexity:** Very High
* **Suggested Labels:** `testing`, `smart-contracts`, `rust`
* **Relevant Files/Contracts:** `carbonledger/carbonledger-contract/`

---

### [API] Implement Webhook System for Event Notifications

* **Work:** Create webhook system that notifies external systems of state changes: project verified, credits minted, credits purchased, credits retired. Clients register webhook URLs, receive POST requests with event data. Include retry logic, signature verification, and delivery tracking.
* **Scope:** Create webhook tables, service, and delivery mechanism. Do not modify event sources.
* **Acceptance Criteria:**
  - Webhook registration endpoint
  - Webhooks delivered on events with 3 retries
  - Signature verification using HMAC-SHA256
  - Webhook delivery logs for debugging
* **Complexity:** High
* **Suggested Labels:** `api`, `backend`, `integration`
* **Relevant Files/Contracts:** `carbonledger/backend/src/webhooks/`

---

### [Frontend] Implement Offline Support with Service Workers

* **Work:** Add offline support to frontend using service workers. Cache critical pages and data, allow viewing previously loaded projects/credits while offline, queue actions for sync when reconnected. Use Workbox library.
* **Scope:** Create service worker configuration, implement offline fallback pages. Do not modify API client.
* **Acceptance Criteria:**
  - Critical pages work offline
  - Cached data can be viewed
  - Actions queued for sync on reconnection
  - Offline indicator shown to user
* **Complexity:** High
* **Suggested Labels:** `frontend`, `pwa`, `ux`
* **Relevant Files/Contracts:** `carbonledger/frontend/`

---

### [Documentation] Create Contract Security Audit Checklist

* **Work:** Develop comprehensive security audit checklist for Soroban contracts covering: reentrancy risks, integer overflow/underflow, authorization checks, state consistency, error handling. Include specific test cases and code examples demonstrating vulnerabilities.
* **Scope:** Create `docs/SECURITY_AUDIT_CHECKLIST.md` with detailed guidance. Do not modify contracts.
* **Acceptance Criteria:**
  - Checklist covers 15+ security categories
  - Examples of vulnerable and secure code patterns
  - Test cases for each category
  - Approved by security reviewer
* **Complexity:** Medium
* **Suggested Labels:** `documentation`, `security`, `smart-contracts`
* **Relevant Files/Contracts:** `docs/`

---

### [Monitoring] Implement Alerting for Critical Events

* **Work:** Set up monitoring and alerting for critical events: failed retirement (indicates stuck transaction), oracle staleness (>365 days without data), market price anomalies (>15% deviation), database connectivity loss. Use CloudWatch, Datadog, or PagerDuty. Include runbooks for incident response.
* **Scope:** Create alerting rules, incident response documentation. Do not modify application code.
* **Acceptance Criteria:**
  - Alerts configured for 5+ critical scenarios
  - Alerts include severity level and remediation steps
  - Incident runbooks provided
  - Alert channels tested
* **Complexity:** Medium
* **Suggested Labels:** `monitoring`, `devops`, `reliability`
* **Relevant Files/Contracts:** `docs/INCIDENT_RESPONSE.md`

---

### [Testing] Write Integration Tests for Serial Number Uniqueness Across Contracts

* **Work:** Implement integration tests verifying serial number uniqueness is enforced across both backend and smart contracts. Test: backend prevents duplicate batches, contract rejects mints that overlap existing ranges, retirement properly tracks serial ownership.
* **Scope:** Create integration test file testing backend + contract interactions. Use test database and mock contract environment.
* **Acceptance Criteria:**
  - Tests verify backend overlap detection works
  - Tests verify contract rejects duplicate serials
  - Tests verify serial tracking through retirement
  - All tests pass
* **Complexity:** High
* **Suggested Labels:** `testing`, `backend`, `smart-contracts`
* **Relevant Files/Contracts:** `carbonledger/backend/e2e/`

---

### [API] Add Webhook Signature Verification Example

* **Work:** Provide developers with example code for verifying webhook signatures. Create code snippets in JavaScript, Python, and Go that demonstrate: HMAC-SHA256 signature verification, replay attack prevention using timestamps, handling out-of-order webhook delivery.
* **Scope:** Create `docs/WEBHOOK_VERIFICATION_EXAMPLES.md` with code examples. Do not implement in main codebase.
* **Acceptance Criteria:**
  - Examples in 3+ languages
  - Covers signature verification and replay protection
  - Runnable examples developers can test
  - Explains security implications
* **Complexity:** Medium
* **Suggested Labels:** `documentation`, `api`, `security`, `good-first-issue`
* **Relevant Files/Contracts:** `docs/`

---

