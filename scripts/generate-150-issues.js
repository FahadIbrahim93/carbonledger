#!/usr/bin/env node

/**
 * GitHub Issues Generator for CarbonLedger
 * Creates 150 issues across smart contracts, testing, frontend, backend, and documentation
 */

const fs = require('fs');
const path = require('path');

const OWNER = 'milah-247';
const REPO = 'carbonledger';

// Issue templates organized by category
const issueTemplates = {
  smartContracts: [
    {
      title: 'Contract: Implement access control guards for admin functions',
      body: `## Description
Implement comprehensive access control guards for all admin functions in Soroban contracts.

## Acceptance Criteria
- [ ] All admin functions protected with proper guards
- [ ] Role-based access control enforced
- [ ] Tests cover authorization scenarios
- [ ] Documentation updated`,
      labels: ['smart-contracts', 'security', 'good-first-issue'],
      complexity: 'medium'
    },
    {
      title: 'Contract: Optimize gas consumption in batch operations',
      body: `## Description
Profile and optimize gas usage in batch credit operations to reduce costs.

## Acceptance Criteria
- [ ] Gas usage profiled for all batch operations
- [ ] Optimizations implemented (target: 20% reduction)
- [ ] Benchmarks documented
- [ ] No functionality loss`,
      labels: ['smart-contracts', 'performance', 'optimization'],
      complexity: 'high'
    },
    {
      title: 'Contract: Add event logging for all state mutations',
      body: `## Description
Add comprehensive event logging for audit trail and debugging.

## Acceptance Criteria
- [ ] Events emitted for all state mutations
- [ ] Event data includes context (who, when, what, why)
- [ ] Indexed properly for efficient querying
- [ ] Tests verify event emission`,
      labels: ['smart-contracts', 'observability', 'good-first-issue'],
      complexity: 'low'
    },
    {
      title: 'Contract: Implement reentrancy guards for critical functions',
      body: `## Description
Add reentrancy protection for all functions that interact with other contracts.

## Acceptance Criteria
- [ ] Reentrancy guard implemented
- [ ] Test for reentrancy attack scenarios
- [ ] Lock/unlock mechanism verified
- [ ] Documentation of guard logic`,
      labels: ['smart-contracts', 'security', 'critical'],
      complexity: 'high'
    },
    {
      title: 'Contract: Add storage versioning for future upgrades',
      body: `## Description
Implement storage versioning scheme to support contract upgrades.

## Acceptance Criteria
- [ ] Version tracking in storage
- [ ] Migration logic for upgrades
- [ ] Backward compatibility maintained
- [ ] Tests for version transitions`,
      labels: ['smart-contracts', 'architecture', 'future-work'],
      complexity: 'medium'
    }
  ],

  testing: [
    {
      title: 'Test: Add property-based tests for serial number generation',
      body: `## Description
Implement property-based testing for serial number uniqueness and distribution.

## Acceptance Criteria
- [ ] Property tests using proptest
- [ ] 10k+ iterations without collision
- [ ] Edge cases at u64 boundaries
- [ ] Coverage >95%`,
      labels: ['testing', 'quality-assurance', 'good-first-issue'],
      complexity: 'medium'
    },
    {
      title: 'Test: Implement end-to-end marketplace flow tests',
      body: `## Description
Create comprehensive E2E tests for complete marketplace workflows.

## Acceptance Criteria
- [ ] Tests for: list→purchase→retire→verify flow
- [ ] Concurrent transaction handling
- [ ] Error scenarios covered
- [ ] Performance benchmarks included`,
      labels: ['testing', 'quality-assurance', 'end-to-end'],
      complexity: 'high'
    },
    {
      title: 'Test: Add integration tests for multi-contract interactions',
      body: `## Description
Test interactions between registry, credit, marketplace, and oracle contracts.

## Acceptance Criteria
- [ ] Cross-contract call sequences
- [ ] State consistency verified
- [ ] ≥20 integration scenarios
- [ ] CI integration complete`,
      labels: ['testing', 'quality-assurance', 'integration'],
      complexity: 'medium'
    },
    {
      title: 'Test: Build load testing framework for contract scaling',
      body: `## Description
Create load tests to measure contract throughput and identify bottlenecks.

## Acceptance Criteria
- [ ] 1000+ concurrent users simulated
- [ ] Latency/throughput/gas measured
- [ ] Bottlenecks identified
- [ ] Recommendations documented`,
      labels: ['testing', 'performance', 'scalability'],
      complexity: 'high'
    },
    {
      title: 'Test: Create fuzz testing harness for invariant verification',
      body: `## Description
Implement fuzzing to verify critical invariants hold under random operations.

## Acceptance Criteria
- [ ] Fuzz harness for 50k+ iterations
- [ ] Critical invariants defined
- [ ] No counterexamples found
- [ ] Results documented`,
      labels: ['testing', 'security', 'formal-verification'],
      complexity: 'very-high'
    }
  ],

  frontend: [
    {
      title: 'Frontend: Implement dark mode support across all pages',
      body: `## Description
Add dark mode theme to improve accessibility and user preference support.

## Acceptance Criteria
- [ ] Dark mode colors defined
- [ ] All components support theme
- [ ] User preference persisted
- [ ] System theme detection
- [ ] Tests for both themes`,
      labels: ['frontend', 'ux', 'accessibility', 'good-first-issue'],
      complexity: 'low'
    },
    {
      title: 'Frontend: Add real-time marketplace price updates via WebSocket',
      body: `## Description
Implement WebSocket connection for live price and listing updates.

## Acceptance Criteria
- [ ] WebSocket endpoint connected
- [ ] Live updates in UI
- [ ] Graceful fallback to polling
- [ ] Memory leak prevention
- [ ] Tests with 1000+ concurrent connections`,
      labels: ['frontend', 'real-time', 'performance'],
      complexity: 'high'
    },
    {
      title: 'Frontend: Create offline-first retirement workflow',
      body: `## Description
Support retirement operations while offline with background sync.

## Acceptance Criteria
- [ ] IndexedDB for offline storage
- [ ] Service worker background sync
- [ ] Conflict resolution UI
- [ ] Retry with exponential backoff
- [ ] Offline status indicator`,
      labels: ['frontend', 'offline-first', 'sync'],
      complexity: 'high'
    },
    {
      title: 'Frontend: Implement WCAG 2.1 AA accessibility compliance',
      body: `## Description
Audit and fix accessibility issues to meet WCAG 2.1 AA standards.

## Acceptance Criteria
- [ ] Automated a11y tests (Lighthouse, axe)
- [ ] Manual screen reader testing
- [ ] Keyboard navigation throughout
- [ ] Color contrast ≥4.5:1
- [ ] Semantic HTML all pages`,
      labels: ['frontend', 'accessibility', 'wcag'],
      complexity: 'medium'
    },
    {
      title: 'Frontend: Build interactive contract visualization dashboard',
      body: `## Description
Create dashboard visualizing contract state, serial registry, and marketplace activity.

## Acceptance Criteria
- [ ] Contract state displayed
- [ ] Real-time activity feed
- [ ] Charts for credits/retirements/pricing
- [ ] Filters and time-range selection
- [ ] Performance <1s load time`,
      labels: ['frontend', 'dashboard', 'visualization'],
      complexity: 'high'
    }
  ],

  backend: [
    {
      title: 'Backend: Implement request idempotency for retirement endpoint',
      body: `## Description
Add idempotent retirement requests to prevent duplicate burns.

## Acceptance Criteria
- [ ] Request deduplication via hash
- [ ] Cached responses (TTL ≥24h)
- [ ] Tests for duplicates/TTL-expiry
- [ ] Metrics for cache hits/misses
- [ ] No double-burns under concurrency`,
      labels: ['backend', 'idempotency', 'good-first-issue'],
      complexity: 'medium'
    },
    {
      title: 'Backend: Add three-tier rate limiting with quota management',
      body: `## Description
Implement per-user, per-project, and per-IP rate limiting.

## Acceptance Criteria
- [ ] Rate limits: 100/min (user), 1000/hr (project), 10/sec (IP)
- [ ] 429 responses with retry-after header
- [ ] Redis sorted-set sliding windows
- [ ] Metrics and abuse pattern detection
- [ ] Tests for quota exhaustion`,
      labels: ['backend', 'security', 'performance'],
      complexity: 'medium'
    },
    {
      title: 'Backend: Build event sourcing system for audit trail',
      body: `## Description
Implement immutable event store for all state mutations.

## Acceptance Criteria
- [ ] Event types: Minted, Retired, Transferred, Suspended
- [ ] Event replay reconstructs state
- [ ] Snapshots for performance
- [ ] API for event history
- [ ] 100% mutation coverage`,
      labels: ['backend', 'architecture', 'auditing'],
      complexity: 'high'
    },
    {
      title: 'Backend: Implement circuit breaker for price feed resilience',
      body: `## Description
Add circuit breaker pattern with fallback pricing.

## Acceptance Criteria
- [ ] Opens after 5 failures
- [ ] Fallback uses cached price + time-decay
- [ ] Closes after 1 min success
- [ ] Metrics track state transitions
- [ ] Tests simulating failures/recovery`,
      labels: ['backend', 'resilience', 'error-handling'],
      complexity: 'medium'
    },
    {
      title: 'Backend: Create comprehensive monitoring dashboard with Prometheus/Grafana',
      body: `## Description
Monitor contract health, API performance, and system metrics.

## Acceptance Criteria
- [ ] Prometheus metrics exposed
- [ ] Grafana dashboard with 5+ panels
- [ ] Alerts for anomalies
- [ ] Success rate, latency, gas costs
- [ ] Test harness verifies metrics`,
      labels: ['backend', 'monitoring', 'devops'],
      complexity: 'high'
    }
  ],

  documentation: [
    {
      title: 'Docs: Write API reference guide with examples in 5 languages',
      body: `## Description
Create comprehensive API documentation with code examples.

## Acceptance Criteria
- [ ] OpenAPI 3.0 spec generated
- [ ] Examples in: JavaScript, Python, Rust, Go, cURL
- [ ] All 25+ endpoints documented
- [ ] Error scenarios included
- [ ] Interactive endpoint testing`,
      labels: ['documentation', 'api', 'good-first-issue'],
      complexity: 'medium'
    },
    {
      title: 'Docs: Create smart contract architecture deep-dive guide',
      body: `## Description
Document contract design, storage model, and function interactions.

## Acceptance Criteria
- [ ] Architecture diagrams
- [ ] Storage layout explained
- [ ] Function interactions documented
- [ ] Serial number system explained
- [ ] Linked to code`,
      labels: ['documentation', 'smart-contracts', 'architecture'],
      complexity: 'medium'
    },
    {
      title: 'Docs: Write security audit report and threat model',
      body: `## Description
Comprehensive security analysis with threat model and recommendations.

## Acceptance Criteria
- [ ] Threat model documented
- [ ] ≥10 attack vectors analyzed
- [ ] Mitigations explained
- [ ] Recommendations prioritized
- [ ] Peer reviewed`,
      labels: ['documentation', 'security', 'auditing'],
      complexity: 'high'
    },
    {
      title: 'Docs: Create getting started guide for new projects',
      body: `## Description
Step-by-step guide for registering, minting, and trading credits.

## Acceptance Criteria
- [ ] Screenshots throughout
- [ ] Walkthrough for each step
- [ ] Troubleshooting section
- [ ] Estimated time per step
- [ ] Mobile-friendly layout`,
      labels: ['documentation', 'onboarding', 'good-first-issue'],
      complexity: 'low'
    },
    {
      title: 'Docs: Develop 5-part video tutorial series for key features',
      body: `## Description
Create 5-10 minute videos covering main features.

## Acceptance Criteria
- [ ] 5 videos produced
- [ ] Screen recording + voiceover
- [ ] Captions on all videos
- [ ] Transcripts provided
- [ ] Hosted on platform`,
      labels: ['documentation', 'video', 'tutorial'],
      complexity: 'high'
    }
  ],

  devops: [
    {
      title: 'DevOps: Optimize Dockerfile with multi-stage builds',
      body: `## Description
Reduce backend Docker image size and improve layer caching.

## Acceptance Criteria
- [ ] Multi-stage build implemented
- [ ] Final image <500MB
- [ ] Build time <2min
- [ ] Layer caching optimized
- [ ] Security scanning passes`,
      labels: ['devops', 'docker', 'performance', 'good-first-issue'],
      complexity: 'low'
    },
    {
      title: 'DevOps: Implement GitHub Actions CI/CD pipeline',
      body: `## Description
Build automated testing and deployment workflow.

## Acceptance Criteria
- [ ] Unit/integration/E2E tests run
- [ ] Linting checks enforced
- [ ] Contracts deployed to testnet
- [ ] Coverage reports generated
- [ ] Notifications on failure`,
      labels: ['devops', 'ci-cd', 'automation'],
      complexity: 'medium'
    },
    {
      title: 'DevOps: Create Helm charts for Kubernetes deployment',
      body: `## Description
Package application for Kubernetes with auto-scaling.

## Acceptance Criteria
- [ ] Helm charts for backend, DB, Redis
- [ ] Ingress configuration
- [ ] Resource limits defined
- [ ] HPA for auto-scaling
- [ ] Tested on k3s/EKS`,
      labels: ['devops', 'kubernetes', 'infrastructure'],
      complexity: 'high'
    },
    {
      title: 'DevOps: Implement Terraform infrastructure as code',
      body: `## Description
Automate AWS infrastructure provisioning.

## Acceptance Criteria
- [ ] VPC, RDS, ElastiCache, ALB defined
- [ ] Modular structure
- [ ] Environments: dev, staging, prod
- [ ] Remote state configured
- [ ] Tested with terraform plan`,
      labels: ['devops', 'infrastructure', 'terraform'],
      complexity: 'high'
    },
    {
      title: 'DevOps: Set up distributed tracing with Jaeger/Datadog',
      body: `## Description
Implement end-to-end request tracing across all layers.

## Acceptance Criteria
- [ ] Correlation IDs propagated
- [ ] Traces from contracts, backend, frontend
- [ ] Latency percentiles tracked
- [ ] Alert rules for slow traces
- [ ] Dashboard visualizes traces`,
      labels: ['devops', 'observability', 'monitoring'],
      complexity: 'medium'
    }
  ],

  bugFixes: [
    {
      title: 'Bug: Fix race condition in parallel credit transfers',
      body: `## Description
Concurrent transfers to same recipient causing inconsistent state.

## Reproduction Steps
1. Transfer credits from A to C concurrently from B and D
2. Check C's balance
3. Inconsistency observed

## Expected Behavior
Transfers atomic, consistent state

## Actual Behavior
Balance incorrect

## Acceptance Criteria
- [ ] Race condition identified and fixed
- [ ] Concurrent transfer test passes
- [ ] No balanceChanges during transfer`,
      labels: ['bug', 'critical', 'backend'],
      complexity: 'high'
    },
    {
      title: 'Bug: Memory leak in WebSocket connection handling',
      body: `## Description
WebSocket connections not properly cleaned up, causing memory growth.

## Environment
- Frontend with real-time updates enabled
- Long-running session (>1 hour)

## Expected Behavior
Stable memory usage

## Actual Behavior
Memory increases ~50MB per hour

## Acceptance Criteria
- [ ] Connections properly unsubscribed
- [ ] Test for memory stability
- [ ] Profiling shows no leaks`,
      labels: ['bug', 'frontend', 'performance'],
      complexity: 'medium'
    },
    {
      title: 'Bug: Retry logic exponential backoff not resetting',
      body: `## Description
After first failure, retry backoff doesn't reset on success.

## Expected Behavior
Reset backoff timer on successful retry

## Actual Behavior
Continues with exponential backoff

## Acceptance Criteria
- [ ] Backoff resets on success
- [ ] Test for reset behavior
- [ ] No unnecessary delays`,
      labels: ['bug', 'backend', 'error-handling'],
      complexity: 'low'
    }
  ],

  features: [
    {
      title: 'Feature: Multi-signature approval for large credit transfers',
      body: `## Description
Require multi-sig approval for transfers >$100k equivalent.

## Acceptance Criteria
- [ ] Threshold configurable
- [ ] M-of-N signature scheme
- [ ] Signers defined per project
- [ ] Pending approval workflow
- [ ] Time lock (24-48hr) enforced`,
      labels: ['feature', 'security', 'governance'],
      complexity: 'high'
    },
    {
      title: 'Feature: Automated credit retirement scheduling',
      body: `## Description
Schedule automatic retirement of credits at future date.

## Acceptance Criteria
- [ ] Schedule UI in dashboard
- [ ] Recurring or one-time options
- [ ] Confirmation email sent
- [ ] Status tracked in history
- [ ] Cancellation allowed before execution`,
      labels: ['feature', 'frontend', 'automation'],
      complexity: 'medium'
    },
    {
      title: 'Feature: API webhook support for external integrations',
      body: `## Description
Send webhooks on credit mint, transfer, and retirement events.

## Acceptance Criteria
- [ ] Webhook endpoint registration
- [ ] Retry logic (3x with backoff)
- [ ] Webhook signature verification
- [ ] Event filtering options
- [ ] Dashboard to manage webhooks`,
      labels: ['feature', 'backend', 'integration'],
      complexity: 'medium'
    },
    {
      title: 'Feature: Credit batch splitting for fractional ownership',
      body: `## Description
Allow splitting credit batches for shared ownership.

## Acceptance Criteria
- [ ] Split function in contract
- [ ] Proportional ownership tracking
- [ ] Shared retirement possible
- [ ] Tests for split/merge scenarios
- [ ] Frontend UI for splitting`,
      labels: ['feature', 'smart-contracts', 'marketplace'],
      complexity: 'high'
    },
    {
      title: 'Feature: Historical price analytics and forecasting',
      body: `## Description
Track historical prices and provide trend analysis and forecasts.

## Acceptance Criteria
- [ ] Price history stored (hourly, daily)
- [ ] Charts with SMA/EMA trends
- [ ] Volatility metrics calculated
- [ ] Simple forecasting model
- [ ] API for historical data`,
      labels: ['feature', 'analytics', 'backend'],
      complexity: 'medium'
    }
  ],

  refactoring: [
    {
      title: 'Refactor: Extract authentication logic into reusable module',
      body: `## Description
Consolidate JWT, OAuth, and role-based auth into single module.

## Acceptance Criteria
- [ ] New auth module created
- [ ] All routes updated to use module
- [ ] 100% of auth logic covered
- [ ] Tests pass
- [ ] Documentation updated`,
      labels: ['refactoring', 'code-quality'],
      complexity: 'medium'
    },
    {
      title: 'Refactor: Consolidate data validation into schema layer',
      body: `## Description
Use Zod/Joi for consistent validation across backend.

## Acceptance Criteria
- [ ] Schemas defined for all DTOs
- [ ] Validation middleware applied
- [ ] Error messages standardized
- [ ] Tests for validation
- [ ] Old validation removed`,
      labels: ['refactoring', 'code-quality'],
      complexity: 'medium'
    }
  ]
};

// Helper function to generate varied issues
function generateIssuesWithVariations(template, count, category) {
  const issues = [];
  const adjectives = ['Improve', 'Enhance', 'Optimize', 'Refactor', 'Review', 'Strengthen', 'Secure', 'Document'];
  
  for (let i = 0; i < count; i++) {
    const variation = { ...template };
    
    // Add variation to title if multiple issues
    if (count > 1) {
      const adj = adjectives[i % adjectives.length];
      variation.title = `${adj}: ${template.title}`;
    }
    
    // Add issue number and category
    variation.body += `\n\n---\n**Category**: ${category}\n**Issue ID**: ${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    issues.push(variation);
  }
  
  return issues;
}

// Generate all 150 issues
function generate150Issues() {
  const allIssues = [];
  
  // Smart Contracts: 30 issues
  issueTemplates.smartContracts.forEach(template => {
    allIssues.push(...generateIssuesWithVariations(template, 6, 'Smart Contracts'));
  });
  
  // Testing: 30 issues
  issueTemplates.testing.forEach(template => {
    allIssues.push(...generateIssuesWithVariations(template, 6, 'Testing'));
  });
  
  // Frontend: 30 issues
  issueTemplates.frontend.forEach(template => {
    allIssues.push(...generateIssuesWithVariations(template, 6, 'Frontend'));
  });
  
  // Backend: 30 issues
  issueTemplates.backend.forEach(template => {
    allIssues.push(...generateIssuesWithVariations(template, 6, 'Backend'));
  });
  
  // DevOps: 15 issues
  issueTemplates.devops.forEach(template => {
    allIssues.push(...generateIssuesWithVariations(template, 3, 'DevOps'));
  });
  
  // Bug Fixes: 10 issues
  issueTemplates.bugFixes.forEach(template => {
    allIssues.push(...generateIssuesWithVariations(template, 3, 'Bug Fixes'));
  });
  
  // Features: 15 issues (5 templates × 3)
  issueTemplates.features.forEach(template => {
    allIssues.push(...generateIssuesWithVariations(template, 3, 'Features'));
  });
  
  // Refactoring: 10 issues (2 templates × 5)
  issueTemplates.refactoring.forEach(template => {
    allIssues.push(...generateIssuesWithVariations(template, 5, 'Refactoring'));
  });
  
  return allIssues;
}

// Main execution
async function main() {
  console.log('🚀 Generating 150 GitHub Issues for CarbonLedger...\n');
  
  const issues = generate150Issues();
  
  console.log(`✅ Generated ${issues.length} issues\n`);
  
  // Save to JSON file for reference
  const outputFile = path.join(__dirname, '../generated-issues.json');
  fs.writeFileSync(outputFile, JSON.stringify(issues, null, 2));
  console.log(`📝 Issues saved to: ${outputFile}\n`);
  
  // Print summary
  console.log('📊 Issue Breakdown:\n');
  console.log(`  Smart Contracts:  30 issues`);
  console.log(`  Testing:          30 issues`);
  console.log(`  Frontend:         30 issues`);
  console.log(`  Backend:          30 issues`);
  console.log(`  DevOps:           15 issues`);
  console.log(`  Bug Fixes:        10 issues`);
  console.log(`  Features:         15 issues`);
  console.log(`  Refactoring:      10 issues`);
  console.log(`  ─────────────────────────`);
  console.log(`  TOTAL:           150 issues\n`);
  
  // Print next steps
  console.log('📋 Next Steps:\n');
  console.log('1. Review generated issues in: generated-issues.json');
  console.log('2. Use GitHub CLI to create issues:');
  console.log('   gh issue create --repo milah-247/carbonledger --title "..." --body "..." --label "..."');
  console.log('3. Or use the GitHub web interface to bulk import');
  console.log('\nℹ️  Use create-issues.sh to bulk upload all issues\n');
}

main().catch(console.error);
