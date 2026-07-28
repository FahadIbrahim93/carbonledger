# CarbonLedger: 25 Complex Open-Source Contribution Issues

**Project**: CarbonLedger — A decentralized carbon credit marketplace on Stellar with verified minting, irreversible retirement, and full on-chain provenance. Tech stack: Rust + Soroban contracts, Next.js 14 frontend, NestJS backend, PostgreSQL, Python oracle bridge.

---

## Core Logic / Protocol Correctness (8 issues)

### #1: [Core Logic] Formal Invariant Verification for Serial Number Double-Counting Prevention
- **Work**: Implement property-based fuzzing harness using `proptest` to verify serial overlap detection correctness across 100k+ iterations, including edge cases at u64::MAX and boundary conditions.
- **Scope**: Fuzzing harness, property generation, edge case inventory, correctness proof documentation. Out: changes to serial range storage.
- **Acceptance Criteria**: Fuzzing harness runs 100k+ iterations without counterexample; all edge cases tested; ≥95% line coverage; property invariant documented in FORMAL_SPEC.md
- **Complexity**: Very High
- **Labels**: `security`, `formal-verification`, `help-wanted`, `protocol-correctness`, `rust`
- **Files**: `carbonledger/carbonledger-contract/carbon_credit/src/lib.rs`, new fuzz tests

### #2: [Core Logic] Irreversibility Guarantee & Retirement Immutability Audit
- **Work**: Exhaustive audit of retire_credits() to verify retired credits are burned (not vaulted), no state transition allows reactivation, storage keys cannot be overwritten, and event logs are immutable.
- **Scope**: Code path enumeration, immutability proof, test cases. Out: changing retirement mechanism.
- **Acceptance Criteria**: Document lists ≥20 code paths tested for reversal; zero findings of state reversal; test file with ≥15 negative cases; immutability guarantee formally stated
- **Complexity**: High
- **Labels**: `security`, `protocol-correctness`, `testing`, `help-wanted`, `rust`
- **Files**: `carbonledger/carbonledger-contract/carbon_credit/src/lib.rs`, new audit docs

### #3: [Core Logic] Checked Arithmetic Exhaustive Analysis & Overflow Path Closure
- **Work**: Static analysis of all arithmetic operations in credit and oracle contracts. Verify all use checked variants, locks are released before errors, and composition is safe.
- **Scope**: Static analysis, lock release verification, composition proof. Out: algorithm changes.
- **Acceptance Criteria**: Analysis lists all ≥50 operations; 100% use checked_*; lock released on all error paths; composition proof document; no panics in release build
- **Complexity**: High
- **Labels**: `security`, `protocol-correctness`, `auditing`, `help-wanted`, `rust`
- **Files**: `carbonledger/carbonledger-contract/carbon_credit/src/lib.rs`, `carbon_oracle/src/lib.rs`

### #4: [Core Logic] Cross-Contract Invariant Enforcement: Registry → Credit → Marketplace Lifecycle
- **Work**: Formalize state machine model enumerating all valid state transitions across all four contracts. Prove no valid call sequence violates "only verified projects can mint credits" invariant.
- **Scope**: State machine model, integration tests, invariant proof. Out: changes to contract logic.
- **Acceptance Criteria**: Formal state machine with ≥100 transitions documented; all preserve invariant; integration tests cover ≥100 transitions (pass); ≥90% cross-contract code coverage
- **Complexity**: Very High
- **Labels**: `protocol-correctness`, `testing`, `architecture`, `help-wanted`, `rust`
- **Files**: All four contracts, new integration test suite

### #5: [Core Logic] Reentrancy Guard Correctness & Lock Release Verification
- **Work**: Formal verification that every mutating function acquires lock, every error path releases lock, no exception leaves lock acquired, lock semantics sound under Soroban parallel execution.
- **Scope**: Lock correctness proof, concurrent test design, lock release path enumeration. Out: changing lock mechanism.
- **Acceptance Criteria**: Lock audit with ≥15 error paths verified to release; concurrent test harness prevents reentry; zero lock acquired without release; sound under Soroban model; <100ms per lock cycle
- **Complexity**: High
- **Labels**: `security`, `protocol-correctness`, `testing`, `help-wanted`, `rust`
- **Files**: `carbon_credit/src/lib.rs`, `carbon_oracle/src/lib.rs`

### #6: [Core Logic] Time-Lock Governance Contest Mechanism: Formal Analysis of Attack Surface
- **Work**: Identify and formally analyze attack surface of time-lock governance: who can propose/contest, race conditions, time-lock delay manipulation, cascading contests.
- **Scope**: Attack surface enumeration, threat model documentation, adversarial tests. Out: changing governance design.
- **Acceptance Criteria**: Threat model identifies ≥10 attack vectors; proof/test for each showing mitigation; adversarial test suite with ≥20 cases; race condition analysis with atomicity proof; immutable audit trail
- **Complexity**: High
- **Labels**: `security`, `protocol-correctness`, `testing`, `governance`, `help-wanted`, `rust`
- **Files**: `carbon_credit/src/lib.rs`, `carbon_oracle/src/lib.rs`

### #7: [Core Logic] Batch Status State Machine: Proof That Retirement Cannot Reverse
- **Work**: Formalize credit batch status transitions. Prove FullyRetired is absorbing (no transitions out). Implement exhaustive tests verifying all invalid transitions fail.
- **Scope**: State machine formalization, transition proof, exhaustive tests. Out: changing state machine.
- **Acceptance Criteria**: State machine diagram with all transitions; formal proof FullyRetired absorbing; test file with ≥25 invalid transition attempts (all fail); 100% state transition coverage; linked in architecture docs
- **Complexity**: High
- **Labels**: `protocol-correctness`, `testing`, `architecture`, `help-wanted`, `rust`
- **Files**: `carbon_credit/src/lib.rs`

### #8: [Core Logic] Vintage Year & Monitoring Freshness: Boundary Analysis & Edge Case Coverage
- **Work**: Boundary analysis on vintage year ∈ [2000, 2100] and monitoring freshness ≤ 365 days. Test boundary values, edge cases, and off-by-one errors.
- **Scope**: Boundary value analysis, edge case tests, documentation. Out: changing year range or freshness window.
- **Acceptance Criteria**: Boundary test file with ≥20 test cases; all pass correctly; edge case inventory with ≥15 cases; 100% boundary checking coverage; off-by-one error analysis completed
- **Complexity**: Medium
- **Labels**: `testing`, `protocol-correctness`, `quality-assurance`, `help-wanted`, `rust`
- **Files**: `carbon_credit/src/lib.rs`, `carbon_oracle/src/lib.rs`

---

## Data Integrity & External Integrations (6 issues)

### #9: [Data Integrity] Monitoring Data Freshness & Staleness Guarantees: Time-Lock Integration
- **Work**: Integrate freshness check into time-lock price update flow so execution cannot proceed if project monitoring is stale (>365 days).
- **Scope**: Freshness check integration, tests, documentation. Out: changing 365-day threshold.
- **Acceptance Criteria**: Price update execution blocked if monitoring stale; test cases verify fresh/stale behavior; integration documented with diagram; event logs record freshness check; fallback behavior documented
- **Complexity**: Medium
- **Labels**: `data-integrity`, `oracle-integration`, `testing`, `help-wanted`, `rust`
- **Files**: `carbon_oracle/src/lib.rs`

### #10: [Data Integrity] Serial Number Collision Audit: PostgreSQL Cross-Verification
- **Work**: Build audit tool comparing on-chain serial registry with backend PostgreSQL, identifying discrepancies (on-chain-only, DB-only, range mismatches), logging with severity levels.
- **Scope**: Audit tool, database sync check, discrepancy detection & logging. Out: fixing discrepancies automatically.
- **Acceptance Criteria**: Tool compares on-chain vs DB serials; reports 3+ discrepancy categories; runs hourly (configurable); persistent audit trail; dashboard endpoint; test harness verifies accuracy
- **Complexity**: Medium
- **Labels**: `data-integrity`, `backend`, `database`, `monitoring`, `help-wanted`, `nodejs`, `python`
- **Files**: `carbonledger/backend/src/` (new audit module), PostgreSQL schema

### #11: [Data Integrity] Retirement Certificate Immutability & IPFS Pinning Verification
- **Work**: Verify retirement certificate IPFS CIDs match on-chain hashes, confirm certificates pinned to Pinata, detect unpinning or garbage collection.
- **Scope**: IPFS verification, Pinata API integration, pinning checks. Out: redesigning certificate storage.
- **Acceptance Criteria**: Job validates IPFS CIDs; confirms pinning; alerts if unpinned >5 mins; runs hourly; metrics show pinning status; test simulates pinning failures and recovery
- **Complexity**: High
- **Labels**: `data-integrity`, `ipfs`, `backend`, `monitoring`, `help-wanted`, `nodejs`, `typescript`
- **Files**: `carbonledger/backend/src/retirements/`

### #12: [Data Integrity] Price Feed Manipulation Resistance: Multi-Source Consensus & Deviation Alerts
- **Work**: Implement multi-source price consensus requiring ≥3 independent sources, rejecting submissions >15% from median, committing only after ≥2/3 agreement, logging all submissions.
- **Scope**: Multi-source aggregation, deviation detection, consensus logic, audit logging. Out: building price sources themselves.
- **Acceptance Criteria**: ≥3 signers supported; deviation check rejects >15% deviations; 2/3 consensus required; all submissions logged immutably; test suite covers all/2/3/minority/none scenarios; dashboard shows consensus health
- **Complexity**: High
- **Labels**: `data-integrity`, `oracle`, `security`, `testing`, `help-wanted`, `rust`
- **Files**: `carbon_oracle/src/lib.rs`

### #13: [Data Integrity] Methodology Score Validation & Credit Quality Assurance Framework
- **Work**: Track score distribution per methodology, detect anomalies (>2σ from mean), compute credit quality index from recent scores, surface in frontend.
- **Scope**: Score distribution tracking, anomaly detection, quality index, frontend integration. Out: rejecting low-score data.
- **Acceptance Criteria**: Backend tracks distribution (mean, stddev, percentiles); anomaly detection flags >2σ; quality index = weighted avg of recent ≥10 periods; API endpoint returns index; frontend displays quality badge; test synthetic distributions
- **Complexity**: Medium
- **Labels**: `data-integrity`, `backend`, `frontend`, `monitoring`, `help-wanted`, `typescript`, `nodejs`
- **Files**: `carbonledger/backend/src/oracle/`, frontend component

### #14: [Data Integrity] Satellite Data Provenance & Chain-of-Custody Audit Trail
- **Work**: Record satellite data access with timestamp, accessor, access type, IPFS hash verification. Flag suspicious patterns (>100 accesses/min to same CID). Expose audit trail API and dashboard.
- **Scope**: Audit trail recording, integrity checks, access logging, anomaly detection. Out: changing IPFS provider.
- **Acceptance Criteria**: Audit trail records timestamp/accessor/access-type/hash-check; persistent storage; anomaly detection flags >100/min; API endpoint returns full provenance; dashboard visualizes access patterns; test verifies accuracy
- **Complexity**: Medium
- **Labels**: `data-integrity`, `backend`, `monitoring`, `auditing`, `help-wanted`, `nodejs`, `typescript`
- **Files**: `carbonledger/backend/src/` (new audit module), Prisma schema

---

## Backend & API Engineering (7 issues)

### #15: [Backend] Idempotent Credit Retirement API: Duplicate Request Detection & Recovery
- **Work**: Implement idempotent retirement using request deduplication via hash(batch_id, amount, beneficiary, reason). Duplicate requests return original response from cache (Redis, TTL ≥24hr).
- **Scope**: Request deduplication, idempotence, cache design, tests. Out: changing retirement contract.
- **Acceptance Criteria**: Duplicates deduplicated via hash; duplicates return cached response <100ms; TTL ≥24hr (configurable); test first/duplicate/expired-TTL scenarios; metrics track cache hits/misses; no double-burns under concurrency
- **Complexity**: Medium
- **Labels**: `backend`, `idempotency`, `api-design`, `testing`, `help-wanted`, `nodejs`, `typescript`
- **Files**: `carbonledger/backend/src/retirements/`

### #16: [Backend] Rate Limiting & Abuse Resilience: Per-Project & Per-User Quotas
- **Work**: Implement three-tier rate limiting: per-user (100/min), per-project (1000/hr), per-IP (10/sec) using Redis sorted-set sliding windows. Return 429 with retry-after header.
- **Scope**: Rate limiting, quota enforcement, metrics & alerting. Out: IP geofencing.
- **Acceptance Criteria**: Three tiers enforced; 429 responses include retry-after; limits configurable; metrics track hits/misses/utilization; abuse pattern detection (>50% quota); test quota exhaustion/retry-after accuracy
- **Complexity**: Medium
- **Labels**: `backend`, `security`, `performance`, `monitoring`, `help-wanted`, `nodejs`, `typescript`
- **Files**: `carbonledger/backend/src/`

### #17: [Backend] Event Sourcing & Immutable Audit Trail: Credit Lifecycle Replay
- **Work**: Implement event sourcing where every state mutation (mint, retire, transfer) is recorded as immutable event. Current state derived by replaying events. Enable replay to any point in time.
- **Scope**: Event sourcing, event store design, replay mechanism, audit trail. Out: changing contract logic.
- **Acceptance Criteria**: Event store schema with event_id/type/aggregate_id/timestamp/data; event types (Minted, Retired, Transferred, Suspended); replay reconstructs state; snapshot+replay test verifies state match; API endpoint returns events; 100% of mutations generate events
- **Complexity**: High
- **Labels**: `backend`, `architecture`, `auditing`, `help-wanted`, `nodejs`, `typescript`
- **Files**: `carbonledger/backend/prisma/schema.prisma`, `backend/src/credits/`

### #18: [Backend] Zero-Downtime Migration Strategy: Contract Upgrade with Fallback Routing
- **Work**: Design blue-green deployment with router contract dispatching to current/new version. Automatic rollback if new version error rate >1% for >60 secs. Document migration playbook.
- **Scope**: Router contract design, traffic shifting, automatic rollback, playbook. Out: breaking contract changes.
- **Acceptance Criteria**: Router deployed; admin flips active version; auto-rollback on error rate >1%; migration playbook documents pre/shift/rollback; end-to-end test simulates migration + rollback; zero downtime verified in staging
- **Complexity**: Very High
- **Labels**: `backend`, `infrastructure`, `deployment`, `help-wanted`, `rust`, `typescript`
- **Files**: New router contract, deployment scripts

### #19: [Backend] Monitoring & Alerting Framework: Contract State Health Dashboard
- **Work**: Monitor contract health: tx success rate, avg gas, time-lock queue depth, serial fragmentation, price cache freshness. Collect metrics, expose Prometheus endpoint, build Grafana dashboard.
- **Scope**: Metrics collection, alerting rules, dashboard design, Prometheus. Out: infrastructure provisioning.
- **Acceptance Criteria**: Metrics collected (success rate, gas, queue, fragmentation, freshness); alerts for success <95%, gas >2x, queue >10, stale >24h; Prometheus `/metrics` endpoint; Grafana dashboard with 5+ panels; test harness verifies metrics update
- **Complexity**: High
- **Labels**: `backend`, `monitoring`, `observability`, `devops`, `help-wanted`, `nodejs`, `typescript`
- **Files**: `carbonledger/backend/src/` (new monitoring module)

### #20: [Backend] Graceful Degradation: Fallback Price Feed & Circuit Breaker Pattern
- **Work**: Implement circuit breaker: after 5 failures, open circuit; use cached price with time-decay discount. Close after 1 min of success. Track circuit state transitions and fallback usage.
- **Scope**: Circuit breaker, fallback price logic, cache, metrics. Out: adding price sources.
- **Acceptance Criteria**: Circuit opens after 5 failures; fallback uses cached + time-decay; circuit closes after 1 min success; metrics track transitions/usage/discounts; test harness simulates failures/recovery; documentation explains fallback behavior
- **Complexity**: Medium
- **Labels**: `backend`, `resilience`, `error-handling`, `help-wanted`, `nodejs`, `typescript`
- **Files**: `carbonledger/backend/src/oracle/oracle.service.ts`

---

## Frontend & UX Engineering (6 issues)

### #21: [Frontend] Offline-First Retirement Flow: Progressive Enhancement & Sync Recovery
- **Work**: Support offline retirement: form works without network, persists to IndexedDB, syncs on reconnect with background service worker. Handle conflicts if batch retired while offline.
- **Scope**: Offline persistence, background sync, conflict resolution, notifications. Out: changing contract retirement.
- **Acceptance Criteria**: Form works offline; persists to IndexedDB; service worker detects reconnection; background sync retries 3x with exponential backoff; conflict resolution with user notification; sync status indicator; test offline/reconnect/conflicts/retry-exhaustion scenarios
- **Complexity**: High
- **Labels**: `frontend`, `ux`, `offline-first`, `testing`, `help-wanted`, `typescript`, `react`
- **Files**: `carbonledger/frontend/app/retire/`

### #22: [Frontend] State Management Resilience: Atomic Wallet & Contract State Sync
- **Work**: Design state machine (XState) defining allowed transitions, validating Freighter/contract/backend state consistency, detecting conflicts (e.g., wallet shows balance but contract shows retired), providing recovery.
- **Scope**: State machine design, reconciliation, conflict detection, recovery. Out: wallet/contract/backend schema changes.
- **Acceptance Criteria**: XState machine defines ≥20 states/transitions; consistency checks on every action; conflict detection (wallet/contract/backend mismatch); recovery actions; test all conflict scenarios; ≥80% state machine coverage
- **Complexity**: High
- **Labels**: `frontend`, `state-management`, `testing`, `help-wanted`, `typescript`, `react`
- **Files**: `carbonledger/frontend/lib/stellar.ts`

### #23: [Frontend] Multi-Client Consistency & Concurrent Purchase Prevention: Optimistic Locking
- **Work**: Prevent two clients purchasing the same credits simultaneously. Implement optimistic locking using version numbers: client includes version on purchase, server rejects if stale. Provide conflict UI allowing retry/fallback.
- **Scope**: Optimistic locking, version tracking, conflict UI. Out: changing contract.
- **Acceptance Criteria**: Purchase includes credit batch version number; server rejects stale versions; conflict UI displays availability, offers retry or alternative batches; test concurrent purchases on same batch (one succeeds, one gets conflict); version increments on mutation
- **Complexity**: Medium
- **Labels**: `frontend`, `concurrency`, `api-design`, `testing`, `help-wanted`, `typescript`, `react`
- **Files**: `carbonledger/frontend/`, `carbonledger/backend/src/marketplace/`

### #24: [Frontend] Accessible Retirement Certificate & Provenance Trail: WCAG 2.1 AA Compliance
- **Work**: Build retirement certificate viewer and provenance trail UI meeting WCAG 2.1 AA accessibility standards. Support screen readers, keyboard navigation, semantic HTML, color contrast, focus indicators.
- **Scope**: Accessibility implementation, WCAG testing, keyboard/screen-reader support. Out: manual accessibility audits beyond testing.
- **Acceptance Criteria**: Certificate viewer semantic HTML; all interactive elements keyboard-accessible; focus indicators visible; color contrast ≥4.5:1; screen reader tested (NVDA/JAWS); automated a11y tests (axe, lighthouse); manual testing on ≥2 screen readers; WCAG 2.1 AA self-assessment completed
- **Complexity**: Medium
- **Labels**: `frontend`, `accessibility`, `wcag`, `testing`, `help-wanted`, `typescript`, `react`
- **Files**: `carbonledger/frontend/components/RetirementCertificate.tsx`, `ProvenanceTrail.tsx`

### #25: [Frontend] Real-Time Marketplace Feed & Live Price Updates: WebSocket Integration
- **Work**: Implement real-time marketplace updates using WebSocket: live credit listings, price changes, new retirements. Frontend subscribes to changes, optimistic UI updates, server-authoritative reconciliation on conflict.
- **Scope**: WebSocket integration, real-time UI, optimistic updates, reconciliation. Out: building new marketplace features.
- **Acceptance Criteria**: WebSocket endpoint broadcasts listings/prices/retirements; frontend subscribes on mount; UI updates optimistically; server-authoritative reconciliation; test 1000+ concurrent connections; latency <500ms; fallback to polling if WebSocket fails; unsubscribe on unmount prevents memory leaks
- **Complexity**: High
- **Labels**: `frontend`, `real-time`, `performance`, `testing`, `help-wanted`, `typescript`, `react`, `websockets`
- **Files**: `carbonledger/frontend/lib/`, real-time hook components

---

## Testing & QA Infrastructure (4 issues)

### #26: [Testing] Formal Verification Suite: Soroban Contract Proof Checker
- **Work**: Build formal verification framework for Soroban contracts using SMT solvers (Z3 via Rust bindings). Create proofs for critical invariants: serial uniqueness, retirement irreversibility, state machine correctness.
- **Scope**: SMT solver integration, formal proof generation, invariant specification. Out: contract logic changes.
- **Acceptance Criteria**: SMT solver integration working; ≥5 critical invariants formally proven; proof checker runs in CI; generates human-readable proof summaries; documentation links proofs to contract code
- **Complexity**: Very High
- **Labels**: `testing`, `formal-verification`, `security`, `help-wanted`, `rust`
- **Files**: New formal verification module, CI integration

### #27: [Testing] End-to-End Adversarial Test Scenarios: Red-Team Harness
- **Work**: Build comprehensive adversarial test harness simulating attacker scenarios: double-count attempts, retirement reversal attacks, oracle manipulation, reentrancy exploits, front-running on marketplace.
- **Scope**: Adversarial test design, attack simulation, exploitation proof. Out: contract logic changes.
- **Acceptance Criteria**: ≥15 distinct attack scenarios tested; each attack repelled or mitigated; test results documented with attack description/mitigation; runs in CI; coverage report shows critical paths exercised
- **Complexity**: High
- **Labels**: `testing`, `security`, `red-team`, `help-wanted`, `rust`
- **Files**: New adversarial test suite

### #28: [Testing] Load & Stress Testing: Contract Scaling Analysis
- **Work**: Design load test simulating high-volume minting, trading, retirement. Measure: tx throughput, gas costs, storage growth, state bloat. Identify scaling bottlenecks and document limits.
- **Scope**: Load testing, performance analysis, bottleneck identification. Out: contract optimizations.
- **Acceptance Criteria**: Load test with 10k+ concurrent users; measures throughput/latency/gas; identifies bottlenecks; documents max throughput; storage growth tracked; scaling limits documented; recommendations for optimization
- **Complexity**: High
- **Labels**: `testing`, `performance`, `scalability`, `help-wanted`, `rust`, `nodejs`
- **Files**: New load test harness

### #29: [Testing] Continuous Deployment Gates: Regression & Compliance Automation
- **Work**: Build CI pipeline gates preventing deployment if: test coverage <90%, mutation score <75%, security scanners find issues, linting fails. Gate logic documented, configurable per environment.
- **Scope**: CI gate design, automation, policy documentation. Out: changing deployment infrastructure.
- **Acceptance Criteria**: Gates enforce: coverage ≥90%, mutations ≥75%, no security issues, lint passes; gate logic documented; configurable per environment; CI logs gate results; documented bypass procedure for emergencies
- **Complexity**: Medium
- **Labels**: `testing`, `ci-cd`, `devops`, `quality-assurance`, `help-wanted`, `nodejs`
- **Files**: CI configuration, gate policy documentation

---

## DevOps & Infrastructure (3 issues)

### #30: [DevOps] Disaster Recovery Plan & Multi-Region Failover Strategy
- **Work**: Design & document disaster recovery: regular backups (contracts, database), failover procedures, multi-region deployment strategy. Test recovery in staging monthly.
- **Scope**: DR plan design, failover procedures, backup strategy, testing framework. Out: infrastructure provisioning.
- **Acceptance Criteria**: DR plan documents: RTO/RPO targets, backup frequency, failover triggers; monthly recovery drills scheduled; failover tested in staging; MTTR metrics tracked; runbook for common incident scenarios
- **Complexity**: High
- **Labels**: `devops`, `infrastructure`, `disaster-recovery`, `help-wanted`, `typescript`, `aws`
- **Files**: DR documentation, backup/failover scripts

### #31: [DevOps] Observability Stack Integration: Distributed Tracing & Correlation IDs
- **Work**: Integrate distributed tracing (Jaeger/Datadog) across contracts (via events), backend (NestJS middleware), and frontend (error tracking). Implement correlation IDs propagating through all layers.
- **Scope**: Distributed tracing setup, correlation ID propagation, observability dashboard. Out: infrastructure provisioning.
- **Acceptance Criteria**: Traces collected from all layers; correlation IDs propagate end-to-end; dashboard visualizes trace waterfall; latency percentiles tracked (p50/p95/p99); alerts configured for slow traces (>5s)
- **Complexity**: Medium
- **Labels**: `devops`, `observability`, `monitoring`, `help-wanted`, `typescript`, `nodejs`
- **Files**: Backend middleware, frontend error tracking

---

## Documentation & Design (2 issues)

### #32: [Documentation] Formal Specification Document: Protocol & Security Model
- **Work**: Write comprehensive formal specification covering: protocol guarantees (serial uniqueness, retirement irreversibility, state machine correctness), security assumptions, threat model, proof sketches for critical properties.
- **Scope**: Formal specification, security model, threat documentation. Out: contract logic changes.
- **Acceptance Criteria**: Specification covers protocol, security model, threat model; includes proof sketches for ≥10 properties; linked to contract code; reviewed by ≥2 domain experts; published as reference document
- **Complexity**: High
- **Labels**: `documentation`, `security`, `specification`, `help-wanted`
- **Files**: New `docs/FORMAL_SPEC.md`

### #33: [Documentation] Architecture Decision Records & Design Rationale
- **Work**: Document key architectural decisions: why Soroban on Stellar, why separate contracts, choice of storage model, time-lock governance design. Include rationale, alternatives considered, tradeoffs.
- **Scope**: ADR documentation, design rationale, alternatives analysis. Out: changing architecture.
- **Acceptance Criteria**: ≥10 ADRs documented; each includes decision/rationale/alternatives/tradeoffs; linked in README; reviewed by ≥1 maintainer; clear decision dates
- **Complexity**: Medium
- **Labels**: `documentation`, `architecture`, `help-wanted`
- **Files**: `docs/adr/` directory

---

**Total: 25 issues (8+6+7+4+2) grouped across 6 categories, each representing 1-2+ weeks of focused work for experienced contributors.**

