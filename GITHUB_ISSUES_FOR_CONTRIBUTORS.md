# CarbonLedger: 25 Complex Open-Source Contribution Issues

**Project**: CarbonLedger — A decentralized carbon credit marketplace on Stellar with verified minting, irreversible retirement, and full on-chain provenance. Tech stack: Rust + Soroban contracts, Next.js 14 frontend, NestJS backend, PostgreSQL, Python oracle bridge.

---

## Core Logic / Protocol Correctness (8 issues)

### Issue #1: [Core Logic] Formal Invariant Verification for Serial Number Double-Counting Prevention

- **Work**: Serial number uniqueness is the cornerstone preventing double-counting. Implement a formal property-based fuzzing harness using `proptest` or `arbitrary` to exhaustively verify that the serial overlap detection in `carbon_credit::verify_serial_range_internal()` correctly rejects *all* overlapping ranges, including edge cases at `u64::MAX`, ranges that touch at boundaries, and pathological nesting patterns. Document the property as a machine-checked proof or theorem statement.
- **Scope**: In scope: fuzzing harness, property generation, edge case inventory, correctness proof documentation. Out of scope: changes to serial range storage structure; oracle integration testing.
- **Acceptance Criteria**: 
  - Fuzzing harness runs 100k+ iterations without finding a counterexample
  - All edge cases (u64::MAX, single-element ranges, complete overlaps, partial overlaps, boundary-touching ranges) explicitly tested
  - Coverage report shows ≥95% line coverage on `verify_serial_range_internal()`
  - Property invariant formally documented in `FORMAL_SPEC.md`
- **Complexity**: Very High
- **Suggested Labels**: `security`, `formal-verification`, `help-wanted`, `protocol-correctness`, `rust`
- **Relevant Files/Components**: `carbonledger/carbonledger-contract/carbon_credit/src/lib.rs` (serial verification logic)

### Issue #2: [Core Logic] Irreversibility Guarantee & Retirement Immutability Audit

- **Work**: The retirement mechanism is designed to be permanently irreversible — no reversal, no undo, no transfer of retired credits. Conduct an exhaustive audit of `retire_credits()` to verify that: (1) retired credits are burned (not transferred to a vault), (2) no state transition allows a retired batch to become active again, (3) storage keys for retired batches cannot be overwritten, (4) event logs are immutable. Create a document enumerating all code paths that could theoretically circumvent immutability and prove why each is impossible.
- **Scope**: In scope: code path enumeration, proof-of-immutability documentation, test cases for reversal attempts. Out of scope: changing the retirement mechanism itself; oracle integration.
- **Acceptance Criteria**: 
  - Document lists ≥20 distinct code paths tested for reversal capability (all fail as expected)
  - Zero findings where a retired batch status can transition to Active or PartiallyRetired
  - Test file `test_retirement_immutability.rs` with ≥15 negative test cases
  - Immutability guarantee formally stated and linked in `SECURITY.md`
- **Complexity**: High
- **Suggested Labels**: `security`, `protocol-correctness`, `testing`, `help-wanted`, `rust`
- **Relevant Files/Components**: `carbonledger/carbonledger-contract/carbon_credit/src/lib.rs` (retire_credits)

### Issue #3: [Core Logic] Checked Arithmetic Exhaustive Analysis & Overflow Path Closure

- **Work**: Every arithmetic operation in the credit and oracle contracts is wrapped with `checked_add()`, `checked_sub()`, `checked_mul()`. Perform an exhaustive static analysis to identify every arithmetic operation in `carbon_credit/src/lib.rs` and `carbon_oracle/src/lib.rs` and verify that: (1) it uses checked variants, (2) overflow/underflow branches release the reentrancy lock before returning, (3) no operation can panic or trap. Generate a lineage graph showing which operations feed into which others and verify the composition is safe.
- **Scope**: In scope: static analysis of all arithmetic, lock release verification, composition proof. Out of scope: algorithm changes; reformatting code.
- **Acceptance Criteria**: 
  - Static analysis report listing all ≥50 arithmetic operations across both contracts
  - 100% of operations use `checked_*` or `saturating_*` variants
  - Lock is provably released before every error return path
  - Composition proof document showing no sequence of operations can overflow
  - No panics or traps found in release build (`cargo build --release`)
- **Complexity**: High
- **Suggested Labels**: `security`, `protocol-correctness`, `auditing`, `help-wanted`, `rust`
- **Relevant Files/Components**: `carbonledger/carbonledger-contract/carbon_credit/src/lib.rs`, `carbon_oracle/src/lib.rs`

### Issue #4: [Core Logic] Cross-Contract Invariant Enforcement: Registry → Credit → Marketplace Lifecycle

- **Work**: CarbonLedger's core invariant is: *only verified projects can mint credits, and only active credits can be traded or retired*. The contracts are separate (`carbon_registry`, `carbon_credit`, `carbon_marketplace`) but must maintain this invariant across contract calls. Implement a formal state machine model (as a document or test framework) that enumerates all valid state transitions across all four contracts and proves that no sequence of valid calls violates the invariant. Then build an integration test that exercises all transitions and verifies the invariant holds.
- **Scope**: In scope: state machine model, integration tests, invariant proof. Out of scope: changes to contract logic; oracle redesign.
- **Acceptance Criteria**: 
  - Formal state machine with ≥100 state transitions documented
  - All transitions verified to preserve the invariant
  - Integration tests covering all ≥100 transitions (pass)
  - Proof document showing no valid call sequence violates the invariant
  - Test coverage ≥90% of cross-contract code paths
- **Complexity**: Very High
- **Suggested Labels**: `protocol-correctness`, `testing`, `architecture`, `help-wanted`, `rust`
- **Relevant Files/Components**: `carbonledger/carbonledger-contract/carbon_registry/`, `carbon_credit/`, `carbon_marketplace/`, `carbon_oracle/`

### Issue #5: [Core Logic] Reentrancy Guard Correctness & Lock Release Verification

- **Work**: The credit and oracle contracts use instance storage as a simple reentrancy guard (acquire lock, execute, release lock). Conduct a formal verification that: (1) every mutating function acquires the lock, (2) every error path releases the lock, (3) no exception can leave the lock in acquired state, (4) lock semantics are sound under Soroban's parallel execution model. Create a lock audit document and add tests for concurrent calls that verify the lock prevents reentry.
- **Scope**: In scope: lock correctness proof, concurrent test design, lock release path enumeration. Out of scope: changing the lock mechanism itself; upgrading to a more sophisticated guard.
- **Acceptance Criteria**: 
  - Lock audit document with ≥15 distinct error paths, each verified to release lock
  - Concurrent test harness that simulates parallel calls and verifies lock prevents reentry
  - Zero instances of lock acquired without matching release
  - Formal proof that lock semantics are sound under Soroban model (linked in docs)
  - Lock overhead & latency benchmarked (< 100ms per lock cycle)
- **Complexity**: High
- **Suggested Labels**: `security`, `protocol-correctness`, `testing`, `help-wanted`, `rust`
- **Relevant Files/Components**: `carbonledger/carbonledger-contract/carbon_credit/src/lib.rs`, `carbon_oracle/src/lib.rs`

### Issue #6: [Core Logic] Time-Lock Governance Contest Mechanism: Formal Analysis of Attack Surface

- **Work**: Both `carbon_credit` and `carbon_oracle` implement a time-lock governance system allowing operations to be proposed, delayed, and contested before execution. Identify and formally analyze the attack surface: (1) who can propose/contest operations, (2) race conditions between contest and execute, (3) time-lock delay manipulation, (4) cascading contests. Build a comprehensive threat model document and implement tests for each identified attack.
- **Scope**: In scope: attack surface enumeration, threat model documentation, adversarial test cases. Out of scope: changing the governance design; introducing new governance mechanisms.
- **Acceptance Criteria**: 
  - Threat model document identifying ≥10 distinct attack vectors
  - Proof or test for each attack showing it is mitigated or impossible
  - Adversarial test suite with ≥20 test cases (each tests one attack scenario)
  - Race condition analysis between contest/execute/rollback with formal proof of atomicity
  - Governance operation audit trail logged immutably
- **Complexity**: High
- **Suggested Labels**: `security`, `protocol-correctness`, `testing`, `governance`, `help-wanted`, `rust`
- **Relevant Files/Components**: `carbonledger/carbonledger-contract/carbon_credit/src/lib.rs`, `carbon_oracle/src/lib.rs`

### Issue #7: [Core Logic] Batch Status State Machine: Proof That Retirement Cannot Reverse

- **Work**: Credit batches transition through states: `Active` → `PartiallyRetired` → `FullyRetired` (or directly to `FullyRetired`). Suspended batches can exist in any state. Formalize the state machine transitions, prove that no sequence of valid contract calls can transition a fully-retired batch back to any other state, and implement exhaustive tests verifying all invalid transitions return an error. Create a state machine diagram for documentation.
- **Scope**: In scope: state machine formalization, transition proof, exhaustive transition tests. Out of scope: changing the state machine; adding new states.
- **Acceptance Criteria**: 
  - State machine diagram with all transitions documented (UML or similar)
  - Formal proof that `FullyRetired` is absorbing (no transitions out)
  - Test file with ≥25 test cases, each attempting an invalid transition (all fail correctly)
  - 100% coverage of state transition logic
  - State machine linked in architecture documentation
- **Complexity**: High
- **Suggested Labels**: `protocol-correctness`, `testing`, `architecture`, `help-wanted`, `rust`
- **Relevant Files/Components**: `carbonledger/carbonledger-contract/carbon_credit/src/lib.rs`

### Issue #8: [Core Logic] Vintage Year & Monitoring Freshness: Boundary Analysis & Edge Case Coverage

- **Work**: The contracts enforce vintage year ∈ [2000, 2100] and monitoring freshness ≤ 365 days. Conduct a boundary analysis on both constraints: test values at and around boundaries (1999, 2000, 2100, 2101; 364 days, 365 days, 366 days). Verify the logic correctly accepts valid and rejects invalid values. Create a boundary test suite and a document enumerating all edge cases and why each is handled correctly.
- **Scope**: In scope: boundary value analysis, edge case tests, documentation. Out of scope: changing the year range or freshness window.
- **Acceptance Criteria**: 
  - Boundary test file with ≥20 test cases (year boundaries, freshness boundaries, combinations)
  - All boundary tests pass; all invalid edge cases correctly rejected
  - Edge case inventory document with ≥15 cases and mitigation proof for each
  - 100% coverage of boundary checking logic
  - Off-by-one error analysis completed
- **Complexity**: Medium
- **Suggested Labels**: `testing`, `protocol-correctness`, `quality-assurance`, `help-wanted`, `rust`
- **Relevant Files/Components**: `carbonledger/carbonledger-contract/carbon_credit/src/lib.rs`, `carbon_oracle/src/lib.rs`

## Data Integrity & External Integrations (6 issues)

### Issue #9: [Data Integrity] Monitoring Data Freshness & Staleness Guarantees: Time-Lock Integration

- **Work**: The oracle's `is_monitoring_current()` checks if monitoring data exists and is ≤365 days old. Integrate this freshness check into the time-lock flow so that *execution of a price update cannot proceed if project monitoring is stale*. This prevents outdated satellite data from driving incorrect prices. Implement the integration, document the interaction, and add tests verifying stale monitoring blocks execution.
- **Scope**: In scope: freshness check integration into time-lock, tests, documentation. Out of scope: changing the 365-day threshold; redesigning monitoring submission flow.
- **Acceptance Criteria**: 
  - Price update execution blocked if project monitoring is stale (>365 days old)
  - Test cases verify: fresh monitoring allows execution, stale monitoring blocks execution
  - Integration documented with interaction diagram
  - Event logs record freshness check result for each price update
  - Fallback behavior defined if monitoring goes stale mid-proposal (documented)
- **Complexity**: Medium
- **Suggested Labels**: `data-integrity`, `oracle-integration`, `testing`, `help-wanted`, `rust`
- **Relevant Files/Components**: `carbonledger/carbonledger-contract/carbon_oracle/src/lib.rs`

### Issue #10: [Data Integrity] Serial Number Collision Audit: PostgreSQL Cross-Verification

- **Work**: The on-chain serial registry tracks issued serial ranges. The backend database (PostgreSQL) maintains a redundant copy for indexing and queries. Build an audit tool that periodically compares the on-chain serial registry with the backend database, identifies discrepancies, and logs them with severity levels. Implement the tool in Python/async or Node.js and add it to the backend's health-check or as a scheduled job (BullMQ).
- **Scope**: In scope: audit tool implementation, database sync check, discrepancy detection & logging. Out of scope: fixing discrepancies automatically; redesigning the serial registry.
- **Acceptance Criteria**: 
  - Audit tool compares on-chain serials with PostgreSQL records
  - Reports ≥3 categories of discrepancies: (1) serials on-chain but not in DB, (2) serials in DB but not on-chain, (3) range mismatches
  - Tool runs as scheduled job (default: hourly) with configurable cadence
  - Discrepancies logged to persistent audit trail with timestamp, severity, context
  - Dashboard endpoint exposes discrepancy count and recent incidents
- **Complexity**: Medium
- **Suggested Labels**: `data-integrity`, `backend`, `database`, `monitoring`, `help-wanted`, `nodejs`, `python`
- **Relevant Files/Components**: `carbonledger/backend/src/`, PostgreSQL schema

### Issue #11: [Data Integrity] Retirement Certificate Immutability & IPFS Pinning Verification

- **Work**: When a credit is retired, a `RetirementCertificate` is created and stored on-chain. The certificate metadata (satellite data, verification proofs) is typically pinned to IPFS via Pinata. Implement a verification system that: (1) cryptographically verifies the certificate's IPFS CID matches the on-chain hash, (2) pings Pinata to confirm the certificate is pinned and accessible, (3) detects if a certificate has been unpinned or garbage collected. Build this as a background job and integrate health checks.
- **Scope**: In scope: IPFS verification, Pinata API integration, pinning status checks. Out of scope: redesigning the certificate storage; changing IPFS providers.
- **Acceptance Criteria**: 
  - Verification job queries on-chain certificates and validates IPFS CIDs
  - Pinata API integration confirms certificates are pinned
  - Alerts triggered if certificate unpinned or inaccessible (> 5 mins)
  - Background job runs hourly with configurable retry logic
  - Metrics dashboard shows pinning status for last 100 certificates
  - Test harness simulates certificate pinning failures and verifies recovery
- **Complexity**: High
- **Suggested Labels**: `data-integrity`, `ipfs`, `backend`, `monitoring`, `help-wanted`, `nodejs`, `typescript`
- **Relevant Files/Components**: `carbonledger/backend/src/retirements/`

### Issue #12: [Data Integrity] Price Feed Manipulation Resistance: Multi-Source Consensus & Deviation Alerts

- **Work**: The oracle currently accepts price updates from a single oracle signer. Design and implement a multi-source consensus mechanism that: (1) accepts price submissions from ≥3 independent data sources (e.g., Xpansiv CBL, Toucan Protocol, internal model), (2) rejects any submission that deviates >15% from the median, (3) only commits consensus price on-chain after ≥2/3 agreement, (4) logs all submissions and deviations for audit. Integrate into `carbon_oracle::update_credit_price()`.
- **Scope**: In scope: multi-source price aggregation, deviation detection, consensus logic, audit logging. Out of scope: building the price sources themselves; changing the 15% threshold (configurable).
- **Acceptance Criteria**: 
  - Price contract accepts submissions from ≥3 independent signers (configurable)
  - Deviation check rejects submissions >15% from rolling median
  - Consensus rule: 2/3 agreement required before on-chain commit
  - All submissions logged immutably with timestamp, source, value, deviation
  - Test harness covers: all agree, 2/3 agree, minority outlier, complete disagreement
  - Dashboard shows price consensus health and recent deviations
- **Complexity**: High
- **Suggested Labels**: `data-integrity`, `oracle`, `security`, `testing`, `help-wanted`, `rust`
- **Relevant Files/Components**: `carbonledger/carbonledger-contract/carbon_oracle/src/lib.rs`

### Issue #13: [Data Integrity] Methodology Score Validation & Credit Quality Assurance Framework

- **Work**: The oracle submits monitoring data with a methodology score (0-100). Scores <70 trigger a warning but the data is still accepted. Implement a quality assurance framework that: (1) maintains a historical distribution of scores per methodology, (2) flags unusual score patterns (sudden drops, outliers), (3) computes a "credit quality index" per project based on recent scores, (4) surfaces quality indices in the frontend to buyers. Add tests verifying score anomaly detection.
- **Scope**: In scope: score distribution tracking, anomaly detection, quality index computation, frontend integration. Out of scope: rejecting low-score data; changing score thresholds.
- **Acceptance Criteria**: 
  - Backend tracks score distribution per methodology (mean, stddev, percentiles)
  - Anomaly detection flags scores >2 stddev from mean
  - Quality index computed as weighted average of recent ≥10 monitoring periods
  - Quality index available via API endpoint: `GET /projects/:id/quality-index`
  - Frontend displays quality badge (Excellent/Good/Fair/Poor) on project cards
  - Test cases verify anomaly detection on synthetic score distributions
- **Complexity**: Medium
- **Suggested Labels**: `data-integrity`, `backend`, `frontend`, `monitoring`, `help-wanted`, `typescript`, `nodejs`
- **Relevant Files/Components**: `carbonledger/backend/src/oracle/`, frontend components

### Issue #14: [Data Integrity] Satellite Data Provenance & Chain-of-Custody Audit Trail

- **Work**: Monitoring data includes `satellite_cid` — a reference to satellite imagery stored on IPFS. Implement a chain-of-custody audit trail that: (1) records when satellite data is submitted, (2) tracks who requested it, (3) verifies data integrity by checking IPFS hash on each retrieval, (4) logs all accesses (read audit trail), (5) flags suspicious access patterns (same file accessed 1000 times in 1 second). Build an API endpoint exposing the audit trail and a dashboard visualizing access patterns.
- **Scope**: In scope: audit trail recording, integrity checks, access logging, suspicious pattern detection. Out of scope: changing IPFS provider; redesigning satellite data submission.
- **Acceptance Criteria**: 
  - Audit trail records: timestamp, accessor, satellite_cid, access type (read/verify), IPFS hash check result
  - All accesses logged in persistent audit table
  - Suspicious pattern detection flags >100 accesses per minute to same satellite_cid
  - API endpoint `GET /satellite/:cid/audit-trail` returns full provenance
  - Dashboard visualizes access frequency, temporal patterns, and flagged anomalies
  - Test cases verify audit trail accuracy and anomaly detection
- **Complexity**: Medium
- **Suggested Labels**: `data-integrity`, `backend`, `monitoring`, `auditing`, `help-wanted`, `nodejs`, `typescript`
- **Relevant Files/Components**: `carbonledger/backend/src/`

## Backend & API Engineering (7 issues)

### Issue #15: [Backend] Idempotent Credit Retirement API: Duplicate Request Detection & Recovery

- **Work**: The retire endpoint must be idempotent: if a retirement request is submitted twice (network retry, client retransmit), only one retirement is recorded, no double-burn. Implement duplicate detection by hashing request parameters (batch_id, amount, beneficiary, reason) and checking against a recent request cache (Redis). If a duplicate is detected, return the original response without re-executing. Add comprehensive tests for idempotency including network failures and client retries.
- **Scope**: In scope: request deduplication, idempotence guarantees, cache design, tests. Out of scope: changing the retirement contract; redesigning the API schema.
- **Acceptance Criteria**: 
  - Retirement request deduplicated using hash(batch_id, amount, beneficiary, reason)
  - Duplicate requests return original response within 100ms (cache hit)
  - Dedup cache TTL ≥24 hours (configurable)
  - Test suite covers: first request succeeds, duplicate returns same response, cache miss after TTL expires
  - Metrics logged for dedup cache hits/misses
  - Race condition tests verify no double-burns under concurrent requests
- **Complexity**: Medium
- **Suggested Labels**: `backend`, `idempotency`, `api-design`, `testing`, `help-wanted`, `nodejs`, `typescript`
- **Relevant Files/Components**: `carbonledger/backend/src/retirements/retirements.controller.ts`

### Issue #16: [Backend] Rate Limiting & Abuse Resilience: Per-Project & Per-User Quotas

- **Work**: The marketplace and retirement endpoints must be rate-limited to prevent abuse (spam purchases, certificate generation DoS). Implement multi-tier rate limiting: (1) per-user limit (100 requests/min), (2) per-project limit (1000 credits/hour), (3) per-IP burst limit (10 requests/second). Use Redis sorted sets for sliding-window counters. Return 429 with retry-after header. Add metrics for quota utilization and abuse patterns.
- **Scope**: In scope: rate limiting implementation, quota enforcement, metrics & alerting. Out of scope: IP geofencing; user-agent filtering.
- **Acceptance Criteria**: 
  - Three-tier rate limiting: per-user (100/min), per-project (1000/hr), per-IP (10/sec)
  - 429 responses include `retry-after` header with seconds-to-reset
  - Quota limits configurable via environment variables
  - Metrics track: quota hits, quota misses, average utilization per tier
  - Abuse patterns detected (>50% quota utilization) and logged
  - Test suite verifies: normal requests pass, quota exhaustion returns 429, retry-after accurate
- **Complexity**: Medium
- **Suggested Labels**: `backend`, `security`, `performance`, `monitoring`, `help-wanted`, `nodejs`, `typescript`
- **Relevant Files/Components**: `carbonledger/backend/src/`

### Issue #17: [Backend] Event Sourcing & Immutable Audit Trail: Credit Lifecycle Replay

- **Work**: Currently, credit state is stored directly in the database. Implement event sourcing so that every state mutation (mint, retire, transfer) is recorded as an immutable event in an `events` table. The current state is derived by replaying events. This enables: (1) complete audit trail of all operations, (2) ability to replay history to any point in time, (3) forensic investigation of suspicious activity. Implement event handlers for credit lifecycle and add tests verifying replayed state matches current state.
- **Scope**: In scope: event sourcing architecture, event store design, replay mechanism, audit trail. Out of scope: changing the contract logic; migrating historical data.
- **Acceptance Criteria**: 
  - Event store schema with: event_id, event_type, aggregate_id, timestamp, data, created_at
  - Event types: CreditMinted, CreditRetired, CreditTransferred, CreditSuspended
  - Replay mechanism reconstructs state by applying events in order
  - Replay test: snapshot state at T1, advance to T2, replay from T1, verify state matches
  - Audit trail endpoint `GET /credits/:id/events` returns immutable event log
  - 100% of credit mutations generate events
- **Complexity**: High
- **Suggested Labels**: `backend`, `architecture`, `auditing`, `help-wanted`, `nodejs`, `typescript`
- **Relevant Files/Components**: `carbonledger/backend/prisma/schema.prisma`, `carbonledger/backend/src/credits/`

### Issue #18: [Backend] Zero-Downtime Migration Strategy: Contract Upgrade with Fallback Routing

- **Work**: The contracts and backend must be upgradeable without downtime. Design and implement a blue-green deployment strategy where: (1) new contract version is deployed to a separate address, (2) a router contract acts as a proxy routing calls to either blue (current) or green (new) based on admin flag, (3) during migration, traffic is gradually shifted to green with automatic rollback if error rate exceeds threshold. Implement the router and migration playbook.
- **Scope**: In scope: router contract design, traffic shifting logic, rollback automation, playbook documentation. Out of scope: breaking changes to contract interfaces; rewriting contracts.
- **Acceptance Criteria**: 
  - Router contract deployed that dispatches calls to active version (blue or green)
  - Admin can flip router to target new version
  - Automatic rollback if error rate on new version >1% for >60 seconds
  - Migration playbook documents: pre-migration checks, gradual traffic shift schedule, rollback procedure
  - End-to-end test simulates successful migration and rollback scenarios
  - Zero downtime verified in staging environment
- **Complexity**: Very High
- **Suggested Labels**: `backend`, `infrastructure`, `deployment`, `help-wanted`, `rust`, `typescript`
- **Relevant Files/Components**: `carbonledger/carbonledger-contract/`

### Issue #19: [Backend] Monitoring & Alerting Framework: Contract State Health Dashboard

- **Work**: Monitor the health of all four contracts in real-time: (1) transaction success rate per contract, (2) average gas cost per operation, (3) time-lock operation queue depth, (4) serial registry fragmentation, (5) price cache freshness. Build a backend monitoring service that polls contracts and logs metrics to a time-series database (or CloudWatch/Datadog). Expose metrics via Prometheus endpoint and build a Grafana dashboard.
- **Scope**: In scope: metrics collection, alerting rules, dashboard design, Prometheus integration. Out of scope: infrastructure provisioning; changes to contract logic.
- **Acceptance Criteria**: 
  - Metrics collected: tx success rate, avg gas, time-lock queue, serial fragmentation, price freshness
  - Alerts configured for: success rate <95%, avg gas >2x baseline, queue depth >10, price stale >24hrs
  - Prometheus endpoint `/metrics` exposed with all metrics
  - Grafana dashboard with 5+ panels visualizing contract health
  - Test harness simulates contract state changes and verifies metrics update correctly
- **Complexity**: High
- **Suggested Labels**: `backend`, `monitoring`, `observability`, `devops`, `help-wanted`, `nodejs`, `typescript`
- **Relevant Files/Components**: `carbonledger/backend/src/`

### Issue #20: [Backend] Graceful Degradation: Fallback Price Feed & Circuit Breaker Pattern

- **Work**: If the oracle price feed becomes unavailable or returns stale prices, purchases should not fail — instead, use a cached price or fallback to a secondary data source. Implement a circuit breaker pattern: after 5 consecutive price fetch failures, the circuit opens; subsequent requests use fallback (cache + time decay adjustment). When failures stop, circuit closes after 1 minute. Add metrics tracking circuit state transitions.
- **Scope**: In scope: circuit breaker implementation, fallback price logic, cache management, metrics. Out of scope: adding new price sources; changing pricing algorithm.
- **Acceptance Criteria**: 
  - Circuit breaker opens after 5 consecutive failures
  - Fallback uses cached price with time-decay adjustment (discount increases with cache age)
  - Circuit closes after 1 minute of successful fetches
  - Metrics: circuit state transitions, fallback usage count, fallback price discounts applied
  - Test harness: simulates price feed failures, verifies fallback kicks in, verifies circuit recovery
  - Documentation explains fallback behavior to end users
- **Complexity**: Medium
- **Suggested Labels**: `backend`, `resilience`, `error-handling`, `help-wanted`, `nodejs`, `typescript`
- **Relevant Files/Components**: `carbonledger/backend/src/oracle/oracle.service.ts`

### Issue #21: [Backend] NestJS Request Context Propagation: Distributed Tracing for Multi-Step Transactions

- **Work**: When a user retires credits, the flow spans multiple contracts and backend services (registry verification, credit check, retirement execution, certificate generation). Implement distributed tracing using OpenTelemetry or similar so that: (1) each request gets a unique trace ID, (2) all sub-calls (contract invocations, DB queries, external APIs) are tagged with the same trace ID, (3) errors can be traced end-to-end, (4) latency per component is measurable. Integrate into NestJS middleware and expose traces via Jaeger or Datadog.
- **Scope**: In scope: distributed tracing setup, context propagation, instrumentation of key paths. Out of scope: infrastructure provisioning; changes to business logic.
- **Acceptance Criteria**: 
  - All requests assigned unique trace ID in middleware
  - Trace ID propagated to all downstream calls (DB, contracts, external APIs)
  - Contract calls instrumented with timing and error logging
  - Jaeger or Datadog integration with sample dashboard
  - Test harness traces a full retirement flow and verifies trace completeness
  - Documentation links trace IDs to log entries for troubleshooting
- **Complexity**: Medium
- **Suggested Labels**: `backend`, `observability`, `testing`, `help-wanted`, `nodejs`, `typescript`
- **Relevant Files/Components**: `carbonledger/backend/src/app.module.ts`

## Frontend & UX Engineering (5 issues)

### Issue #22: [Frontend] Offline-First Retirement Flow: Progressive Enhancement & Sync Recovery

- **Work**: Retiring credits is a critical user action — the frontend should support offline retirement where the user can initiate retirement without a network connection, store the intent locally (IndexedDB), and sync when reconnected. Implement: (1) offline retirement form with local persistence, (2) background sync worker that retries on reconnect, (3) conflict resolution if another user retires the same credits while offline, (4) user notification of sync status. Use service workers for offline detection and sync.
- **Scope**: In scope: offline form persistence, background sync, conflict detection, notifications. Out of scope: changing contract retirement flow; full offline blockchain.
- **Acceptance Criteria**: 
  - Retirement form works offline; persists to IndexedDB
  - Service worker detects reconnection and triggers background sync
  - Background sync retries retirement up to 3 times with exponential backoff
  - Conflict resolution: if batch fully retired by another user, user is notified with option to choose new batch
  - Sync status indicator shows: pending, syncing, synced, failed
  - Test suite covers: offline retirement, reconnection sync, conflicts, retry exhaustion
- **Complexity**: High
- **Suggested Labels**: `frontend`, `ux`, `offline-first`, `testing`, `help-wanted`, `typescript`, `react`
- **Relevant Files/Components**: `carbonledger/frontend/app/retire/`, service worker implementation

### Issue #23: [Frontend] State Management Resilience: Atomic Wallet & Contract State Sync

- **Work**: The frontend needs to sync three sources of truth: Freighter wallet state, on-chain contract state, and backend database state. Design and implement a state reconciliation mechanism using a state machine (e.g., XState) that: (1) defines allowed state transitions, (2) validates consistency between sources, (3) detects conflicts (e.g., wallet shows credit balance but contract shows credit retired), (4) provides recovery actions. Add tests for all conflict scenarios.
- **Scope**: In scope: state machine design, reconciliation logic, conflict detection, recovery actions. Out of scope: changes to wallet, contract, or backend schemas.
- **Acceptance Criteria**: 
  - XState machine defines ≥20 valid states and transitions
  - Consistency checks run on every user action (purchase, retire, transfer)
  - Conflict detection for: balance mismatch, retired-but-visible credits, double-spend
  - Recovery actions: refresh from chain, invalidate stale cache, prompt user
  - Test harness simulates all ≥5 conflict scenarios and verifies recovery
  - Documentation shows state machine diagram and conflict resolution flowchart
- **Complexity**: High
- **Suggested Labels**: `frontend`, `state-management`, `testing`, `help-wanted`, `typescript`, `react`
- **Relevant Files/Components**: `carbonledger/frontend/lib/`, state management layer

### Issue #24: [Frontend] Accessibility & WCAG 2.1 AA Compliance: Carbon Credit Market for All

- **Work**: The marketplace and retirement flows must be accessible to users with disabilities. Conduct a comprehensive accessibility audit and implement WCAG 2.1 AA compliance: (1) keyboard navigation for all interactions, (2) screen reader support with proper ARIA labels, (3) color contrast ratios ≥7:1 for critical elements, (4) captions/transcripts for any videos, (5) testing with assistive technologies (NVDA, JAWS). Document accessibility features and create an accessibility statement.
- **Scope**: In scope: WCAG audit, ARIA implementation, keyboard navigation, contrast fixes, assistive tech testing. Out of scope: changes to design system colors (only fixes for contrast); full redesign.
- **Acceptance Criteria**: 
  - Automated WCAG scan (axe, Lighthouse) shows 0 failures, ≤10 warnings
  - Manual testing with ≥2 screen readers (NVDA, JAWS) successful for critical paths
  - Keyboard navigation works for all interactive elements (tab order logical, no traps)
  - Color contrast ≥7:1 for text, ≥4.5:1 for large text
  - Accessibility statement published with contact for accessibility issues
  - Test coverage: ≥15 accessibility-specific tests
- **Complexity**: High
- **Suggested Labels**: `frontend`, `accessibility`, `wcag`, `ux`, `help-wanted`, `typescript`, `react`
- **Relevant Files/Components**: `carbonledger/frontend/components/`, `carbonledger/frontend/app/`

### Issue #25: [Frontend] Multi-Language Support & i18n Infrastructure

- **Work**: CarbonLedger operates globally. Implement internationalization (i18n) infrastructure for the frontend supporting ≥5 languages (English, Spanish, Mandarin, Portuguese, French) with: (1) message extraction and key management, (2) language selection UI, (3) date/time/number localization per locale, (4) RTL support for Arabic/Hebrew, (5) translation workflow integration. Use i18n-next or similar and integrate with translation management platform (Crowdin/Lokalise).
- **Scope**: In scope: i18n setup, key extraction, locale switching, RTL support, translation platform integration. Out of scope: providing translations (sourced externally); full visual design for RTL.
- **Acceptance Criteria**: 
  - i18n library configured with message key namespacing
  - ≥300 keys extracted from frontend (all user-facing strings)
  - Language selector in header; selection persisted to localStorage
  - Dates/times/numbers formatted per locale (e.g., 1,000.50 vs 1.000,50)
  - RTL detection and CSS applied for Hebrew/Arabic
  - Translation platform (Crowdin) integrated with CI/CD
  - Test suite verifies: all keys present in ≥3 languages, date formatting per locale, RTL display
- **Complexity**: Medium
- **Suggested Labels**: `frontend`, `i18n`, `localization`, `globalization`, `help-wanted`, `typescript`, `react`
- **Relevant Files/Components**: `carbonledger/frontend/`, i18n configuration

### Issue #26: [Frontend] Real-Time Marketplace Dashboard: Bid/Ask Feed & Order Book

- **Work**: The marketplace currently shows static listings. Implement a real-time bid/ask feed and order book visualization using WebSockets: (1) connect to backend WebSocket endpoint for live listing updates, (2) display top bids/asks with price levels, (3) show recent trade history with prices, (4) implement a simple order book widget showing depth (5 levels on each side), (5) graceful degradation if WebSocket connection drops. Use TradingView Lightweight Charts or similar for visualization.
- **Scope**: In scope: WebSocket integration, live feed display, order book visualization, connection fallback. Out of scope: implementing actual trading logic; margin trading.
- **Acceptance Criteria**: 
  - WebSocket endpoint broadcasts listing updates (new listing, price change, filled)
  - Bid/ask feed updates in <100ms of contract change
  - Order book renders top 5 bid/ask levels with cumulative volume
  - Recent trades shown with timestamp, price, quantity
  - WebSocket disconnect triggers visual warning; reconnection automatic
  - Graceful degradation: if WebSocket unavailable, fall back to polling every 5s
  - Test harness simulates market scenarios (rapid price changes, disconnects)
- **Complexity**: High
- **Suggested Labels**: `frontend`, `marketplace`, `real-time`, `websockets`, `ux`, `help-wanted`, `typescript`, `react`
- **Relevant Files/Components**: `carbonledger/frontend/components/MarketplaceDashboard.tsx`, WebSocket client

## Testing & QA Infrastructure (4 issues)

### Issue #27: [Testing] Formal Verification Suite: Property-Based Contract Testing with Symbolic Execution

- **Work**: Move beyond unit tests to formal verification. Build a comprehensive property-based testing suite using `proptest` that generates arbitrary valid and invalid contract calls and verifies protocol properties: (1) retirement is idempotent (retiring twice fails), (2) serial numbers never overlap, (3) credit supply is conserved, (4) verified projects never become unverified. Add symbolic execution tools (e.g., from Certora) to prove properties statically without running tests.
- **Scope**: In scope: property-based test framework, symbolic execution setup, property formalization. Out of scope: building custom formal verification tools; formal proof checkers.
- **Acceptance Criteria**: 
  - ≥15 protocol properties formalized and tested
  - Proptest harness generates 100k+ test cases per property
  - Zero counterexamples found (all properties hold)
  - Symbolic execution covers critical paths (serialize, retire, transfer)
  - Coverage report shows ≥98% of critical code paths
  - Documentation explains each property and why it matters
- **Complexity**: Very High
- **Suggested Labels**: `testing`, `formal-verification`, `protocol`, `security`, `help-wanted`, `rust`
- **Relevant Files/Components**: New test directory with property-based tests

### Issue #28: [Testing] End-to-End User Flow Automation: Critical Path Coverage

- **Work**: Automate end-to-end tests for all critical user paths: (1) project developer registers project, (2) verifier approves project, (3) oracle submits monitoring, (4) developer mints credits, (5) corporation browses marketplace, (6) corporation purchases credits, (7) corporation retires credits, (8) corporation views retirement certificate. Use Playwright or Cypress with headless browser, connected to testnet. Tests should interact with real contracts and verify on-chain state.
- **Scope**: In scope: E2E test automation, testnet deployment, on-chain verification. Out of scope: load testing; UI visual regression testing.
- **Acceptance Criteria**: 
  - E2E test suite covers all 8 critical paths
  - Tests run against Stellar testnet with real contract deployment
  - Each test verifies: frontend state after action AND on-chain state change
  - Entire flow (register → mint → buy → retire) takes <5 minutes
  - Tests run in CI/CD on every commit (parallel, <10 min total)
  - Failure logs include: browser console, network requests, contract calls
- **Complexity**: High
- **Suggested Labels**: `testing`, `e2e`, `automation`, `qa`, `help-wanted`, `typescript`
- **Relevant Files/Components**: New `e2e/` directory with Playwright/Cypress tests

### Issue #29: [Testing] Adversarial Test Suite: Red-Team Contract Scenarios

- **Work**: Create a red-team test suite that attempts to break the contracts through adversarial scenarios: (1) double-counting attacks (mint same serial twice), (2) double-spending attacks (retire same credits twice), (3) reentrancy attacks (call retire from within retire), (4) integer overflow attacks (mint with amount near i128::MAX), (5) authorization bypass (call functions as unauthorized user). Each attack should be tested and proven to fail. Document why each attack is prevented.
- **Scope**: In scope: adversarial test cases, attack scenarios, security analysis. Out of scope: actually exploiting vulnerabilities (we're testing prevention).
- **Acceptance Criteria**: 
  - ≥20 distinct attack scenarios formalized as test cases
  - All attacks successfully prevented (tests verify rejection)
  - Each attack documented with: threat description, prevention mechanism, test case
  - Proof document links each attack to the code that prevents it
  - Coverage: ≥99% of protocol-critical code paths exercised by attacks
  - Red-team tests run in CI/CD as security gate
- **Complexity**: Very High
- **Suggested Labels**: `testing`, `security`, `red-team`, `adversarial`, `help-wanted`, `rust`
- **Relevant Files/Components**: New `tests/adversarial/` directory

### Issue #30: [Testing] Load & Stress Testing: Contract Performance Under Scale

- **Work**: Test how contracts perform under high load: simulate 1000 concurrent users minting, buying, retiring credits. Measure: (1) transaction success rate under load, (2) p50/p99 latencies, (3) gas costs under contention, (4) state consistency (no credits lost). Use a load testing framework (e.g., Rust benchmark, Python Locust) to generate load against testnet contracts and measure metrics. Document performance baselines and alert if performance degrades >20%.
- **Scope**: In scope: load testing harness, stress scenarios, baseline metrics, performance regression detection. Out of scope: performance optimization; infrastructure scaling.
- **Acceptance Criteria**: 
  - Load test simulates ≥1000 concurrent users
  - Measures: success rate, p50/p99 latency, gas cost, memory usage
  - Baseline metrics recorded: e.g., p99 latency <500ms, success rate >99%
  - Stress test identifies degradation point (e.g., fails when user count > 5000)
  - Performance regression detected if p99 latency increases >20% vs baseline
  - Load test runs monthly with results published
  - Documentation includes: test methodology, baseline values, degradation analysis
- **Complexity**: High
- **Suggested Labels**: `testing`, `performance`, `load-testing`, `infrastructure`, `help-wanted`, `rust`
- **Relevant Files/Components**: New `benchmarks/` directory

## DevOps & Infrastructure (4 issues)

### Issue #31: [DevOps] Deployment Pipeline with Automated Rollback: Multi-Stage CI/CD

- **Work**: Build a production-grade CI/CD pipeline: (1) on every commit: run tests, linting, security scan, (2) on merge to main: build contracts, deploy to staging, run E2E tests, (3) on release tag: deploy to mainnet with gradual canary rollout, (4) if metrics degrade, auto-rollback to previous version. Use GitHub Actions or similar, terraform for infrastructure, Stellar CLI for contract deployment.
- **Scope**: In scope: pipeline design, multi-stage deployment, automated rollback, metrics-driven decisions. Out of scope: infrastructure provisioning (outside CI/CD).
- **Acceptance Criteria**: 
  - CI runs on every commit (lint, unit tests, security scan) in <10 minutes
  - Staging deployment on every merge to main
  - E2E tests run against staging; blocks production deployment if ≥1 failure
  - Mainnet deployment uses canary: 10% traffic, then 50%, then 100%
  - Automatic rollback if error rate >1% or latency >2x baseline for >60 seconds
  - Deployment history and rollbacks logged with audit trail
  - Documentation includes: pipeline diagram, rollback procedure, deployment checklist
- **Complexity**: Very High
- **Suggested Labels**: `devops`, `ci-cd`, `infrastructure`, `deployment`, `help-wanted`, `github-actions`, `terraform`
- **Relevant Files/Components**: `.github/workflows/`, terraform files, deployment scripts

### Issue #32: [DevOps] Observability Stack: Structured Logging, Metrics, Tracing Integration

- **Work**: Implement a comprehensive observability stack for production: (1) centralized logging (ELK or Grafana Loki) capturing all backend, contract, and oracle logs with structured format, (2) metrics collection (Prometheus) for all components, (3) distributed tracing (Jaeger/Tempo) tracking requests across services, (4) alerting rules for anomalies, (5) dashboards for operators. Ensure logs contain: timestamp, trace ID, user ID (redacted), operation, result, latency.
- **Scope**: In scope: logging infrastructure, metrics collection, tracing setup, alerting rules, dashboards. Out of scope: infrastructure provisioning; changes to business logic.
- **Acceptance Criteria**: 
  - All backend logs sent to centralized logger (ELK/Loki) in structured format
  - Key metrics exposed: request latency, error rate, contract gas usage, DB query time
  - Distributed trace shows full flow of user action (API → contract → DB)
  - ≥10 alert rules configured (success rate drop, latency spike, contract errors, etc.)
  - Grafana dashboards: system health, contract metrics, error rates, user flows
  - Logs include trace ID linking to traces; queries show full context
  - Test harness simulates error scenarios; verifies alerts fire correctly
- **Complexity**: High
- **Suggested Labels**: `devops`, `observability`, `monitoring`, `logging`, `help-wanted`, `nodejs`, `typescript`, `rust`
- **Relevant Files/Components**: Backend instrumentation, contract event logging, oracle logging

### Issue #33: [DevOps] Disaster Recovery Plan: Backup & Restore Procedure for PostgreSQL & IPFS

- **Work**: Design and implement a disaster recovery (DR) plan: (1) automated PostgreSQL backups (daily, weekly, monthly) stored in S3 with encryption, (2) IPFS pinning redundancy (pins critical data on ≥2 providers), (3) point-in-time recovery procedure documented, (4) regular DR drills (monthly restore from backup to staging, verify consistency), (5) RTO/RPO targets: RTO <2 hours, RPO <1 hour. Build automation and document procedures.
- **Scope**: In scope: backup automation, multi-provider pinning, recovery procedures, DR drills, documentation. Out of scope: geographic failover; multi-region deployment.
- **Acceptance Criteria**: 
  - PostgreSQL backups automated (daily full, hourly incremental) to S3 with encryption
  - IPFS data pinned to ≥2 providers (Pinata + Estuary or similar)
  - Point-in-time recovery procedure documented with estimated recovery time
  - Monthly DR drill: restore latest backup to staging, run consistency checks, document issues
  - RTO <2 hours, RPO <1 hour demonstrated in DR drill
  - Backup retention policy documented (7 days recent, 4 weeks older, 12 months archived)
  - Alert if backup is missing or >24 hours old
- **Complexity**: High
- **Suggested Labels**: `devops`, `disaster-recovery`, `backup`, `infrastructure`, `help-wanted`, `terraform`, `bash`
- **Relevant Files/Components**: Backup scripts, disaster recovery runbook, test procedures

### Issue #34: [DevOps] Infrastructure-as-Code Audit & Security Hardening

- **Work**: Review all infrastructure-as-code (Terraform, Docker Compose, K8s manifests) for security vulnerabilities and misconfigurations: (1) exposed secrets (API keys in code), (2) overly permissive IAM policies, (3) missing encryption (TLS, at-rest), (4) unencrypted database passwords, (5) publicly accessible databases. Create a hardening checklist and implement fixes. Use tools like Checkov or TFLint to automate scanning.
- **Scope**: In scope: IaC security audit, hardening, secret management, compliance checking. Out of scope: infrastructure provisioning; changes to application code.
- **Acceptance Criteria**: 
  - Terraform scanned with Checkov; ≥20 security checks passing
  - All secrets stored in secret manager (AWS Secrets, HashiCorp Vault); no secrets in code
  - IAM policies follow least-privilege principle
  - RDS encryption enabled (at-rest and in-transit)
  - Database accessible only from approved subnets/IPs
  - TLS 1.2+ enforced for all external APIs
  - Security audit checklist completed with sign-off
  - Documentation: infrastructure threat model, mitigations, audit evidence
- **Complexity**: High
- **Suggested Labels**: `devops`, `security`, `infrastructure`, `compliance`, `help-wanted`, `terraform`, `docker`
- **Relevant Files/Components**: `terraform/`, `docker-compose.yml`, Kubernetes manifests (if applicable)

## Documentation & Design (3 issues)

### Issue #35: [Documentation] Formal Specification Document: Protocol Definition & Invariants

- **Work**: Create a comprehensive formal specification document (Markdown + optional formal notation) that defines: (1) protocol invariants (e.g., "retired credits can never be transferred"), (2) state machine for credits and projects, (3) contract APIs with pre/post-conditions, (4) cryptographic assumptions, (5) threat model and security guarantees. Target audience: auditors, regulators, developers. Link to code implementations. This becomes the source of truth for protocol behavior.
- **Scope**: In scope: formal spec document, invariant definitions, state machines, threat model, security claims. Out of scope: executable formal proofs (though spec should be provable).
- **Acceptance Criteria**: 
  - Specification document ≥50 pages covering all 4 contracts
  - All protocol invariants formally stated
  - State machines defined for projects and credits (UML or text)
  - Each contract function documented with pre/post-conditions
  - Threat model identifies ≥10 attack vectors and mitigations
  - Security guarantees explicitly stated (e.g., "retirement is irreversible")
  - Cryptographic assumptions listed (e.g., "SHA-256 preimage resistance")
  - Version control and change history maintained
- **Complexity**: High
- **Suggested Labels**: `documentation`, `specification`, `architecture`, `security`, `help-wanted`
- **Relevant Files/Components**: New `FORMAL_SPEC.md` document

### Issue #36: [Documentation] Architecture Decision Records (ADRs) for Major Design Choices

- **Work**: Document major architectural decisions as Architecture Decision Records (ADRs) using the MADR format. Decisions include: (1) why Soroban over other blockchains, (2) why retirement is irreversible, (3) reentrancy guard design, (4) time-lock governance, (5) price oracle consensus. For each ADR: status (decided/proposed/rejected), context, decision, consequences, alternatives considered. Build an ADR index and link from README.
- **Scope**: In scope: ADR creation for all major decisions, documenting rationale and tradeoffs. Out of scope: retroactive changes based on ADRs.
- **Acceptance Criteria**: 
  - ≥10 ADRs written covering core decisions
  - ADR format: status, context, decision, consequences, alternatives
  - Each ADR includes: rationale (why), tradeoffs, alternative options considered
  - ADRs indexed in `docs/adr/` with README listing all ADRs
  - ADRs linked from relevant code and documentation
  - Decisions linked to code (e.g., ADR-003 links to reentrancy guard implementation)
  - Team reviews and signs off on ADRs before implementation
- **Complexity**: Medium
- **Suggested Labels**: `documentation`, `architecture`, `process`, `help-wanted`
- **Relevant Files/Components**: New `docs/adr/` directory

### Issue #37: [Documentation] Threat Model & Security Analysis Report

- **Work**: Conduct a thorough security analysis and document a threat model covering: (1) asset identification (credits, prices, retirement certificates), (2) attack surface (contracts, oracle, API, frontend), (3) threat scenarios (double-counting, price manipulation, replay attacks), (4) security controls (e.g., reentrancy guard, serial validation), (5) residual risks. Produce a formal security report suitable for sharing with auditors and regulators.
- **Scope**: In scope: threat model definition, attack scenario analysis, security control mapping, risk assessment. Out of scope: conducting actual penetration testing; fixing vulnerabilities.
- **Acceptance Criteria**: 
  - Threat model identifies ≥20 distinct threats
  - Each threat: description, likelihood, impact, existing mitigations, residual risk
  - Attack scenarios (double-counting, replay, price manip, etc.) analyzed
  - Security controls mapped to threats they mitigate
  - Risk register with ≥15 identified risks prioritized by severity
  - Recommendations for residual risk reduction
  - Report suitable for auditors/regulators (professional format, references)
  - Signed off by security team
- **Complexity**: High
- **Suggested Labels**: `documentation`, `security`, `threat-model`, `compliance`, `help-wanted`
- **Relevant Files/Components**: New `THREAT_MODEL.md` document

## Compliance & Standards (2 issues)

### Issue #38: [Compliance] Verra VCS & Gold Standard Methodology Alignment & Validation

- **Work**: CarbonLedger issues verified carbon credits. Validate that the protocol correctly implements Verra VCS and Gold Standard methodologies: (1) review protocol against Verra VCS methodological guidelines, (2) verify monitoring data requirements align with standards, (3) document which projects can be verified under which standards, (4) implement validation rules in oracle (e.g., reject projects not using approved methodologies). Create a methodology validation document and compliance checklist.
- **Scope**: In scope: standard review, protocol alignment analysis, validation rules, compliance documentation. Out of scope: building satellite monitoring tools; claiming certification.
- **Acceptance Criteria**: 
  - Protocol reviewed against Verra VCS and Gold Standard standards
  - Alignment document shows: protocol requirements vs. standard requirements, gaps identified
  - Monitoring data schema validated against standard requirements
  - Oracle rejects projects using non-approved methodologies
  - Compliance checklist with ≥20 items (all passing)
  - Methodology validation rules documented and tested
  - Legal review confirms compliance with regulatory claims
- **Complexity**: High
- **Suggested Labels**: `compliance`, `standards`, `carbon-credits`, `regulatory`, `help-wanted`
- **Relevant Files/Components**: New `METHODOLOGY_COMPLIANCE.md`, oracle validation rules

### Issue #39: [Compliance] Data Privacy & GDPR Compliance: Personal Data Handling

- **Work**: CarbonLedger collects user data (wallet address, email, organization name). Ensure GDPR compliance: (1) privacy policy clearly stating data collection, (2) consent mechanism for data processing, (3) data retention policy (delete after X days if inactive), (4) right to deletion (user can request account + data deletion), (5) data breach notification process. Implement privacy controls in backend and frontend. Conduct a Data Protection Impact Assessment (DPIA).
- **Scope**: In scope: privacy policy, consent mechanism, data retention, deletion rights, DPIA. Out of scope: legal counsel (external); full compliance audit.
- **Acceptance Criteria**: 
  - Privacy policy published and linked from website
  - Consent mechanism: users explicitly opt-in to data processing
  - Data retention policy: ≤90 days for inactive accounts (configurable)
  - Delete account endpoint: user can request full deletion; data purged from DB + backups
  - Audit log of all data access (who accessed what, when)
  - DPIA completed and documented
  - Breach notification plan: procedures and templates
  - Legal review confirms GDPR compliance
- **Complexity**: Medium
- **Suggested Labels**: `compliance`, `privacy`, `gdpr`, `legal`, `help-wanted`, `typescript`, `nodejs`
- **Relevant Files/Components**: `carbonledger/backend/src/` (privacy endpoints), privacy policy document

---

## Summary

These 25 issues span critical architecture, security, scalability, and compliance work suitable for experienced open-source contributors. Together, they represent **500+ person-hours** of focused engineering effort across:

- **Core Protocol (Issues #1-8)**: Formal verification, security audits, protocol correctness
- **Data Integrity (Issues #9-14)**: Monitoring integration, price feed robustness, audit trails
- **Backend Engineering (Issues #15-21)**: Idempotency, rate-limiting, event sourcing, monitoring
- **Frontend Engineering (Issues #22-26)**: Offline support, state management, accessibility, real-time UX
- **Testing & QA (Issues #27-30)**: Formal verification, E2E automation, red-team testing, load testing
- **DevOps (Issues #31-34)**: CI/CD pipelines, observability, DR planning, security hardening
- **Documentation (Issues #35-37)**: Formal specs, ADRs, threat models
- **Compliance (Issues #38-39)**: Standards alignment, privacy & GDPR

Each issue is independently completable, clearly scoped, and produces durable artifacts (tests, docs, monitoring, audit trails).

