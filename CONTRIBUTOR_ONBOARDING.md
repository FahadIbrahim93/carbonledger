# CarbonLedger Contributor Onboarding Guide

Welcome to the CarbonLedger open-source project! This guide will help you get started contributing to our decentralized carbon credit marketplace.

## 📖 Table of Contents

1. [Quick Start](#quick-start)
2. [Development Environment Setup](#development-environment-setup)
3. [Finding Issues](#finding-issues)
4. [Contributing Workflow](#contributing-workflow)
5. [Code Standards](#code-standards)
6. [Bounty Program](#bounty-program)
7. [Getting Help](#getting-help)

---

## 🚀 Quick Start

### 1. Fork & Clone Repository
```bash
# Fork on GitHub, then clone
git clone https://github.com/YOUR-USERNAME/carbonledger.git
cd carbonledger
git remote add upstream https://github.com/milah-247/carbonledger.git
```

### 2. Install Dependencies

#### Backend (NestJS)
```bash
cd backend
npm install
```

#### Frontend (Next.js 14)
```bash
cd frontend
npm install
```

#### Smart Contracts (Rust + Soroban)
```bash
cd carbonledger-contract
cargo build --release
```

### 3. Create Feature Branch
```bash
git fetch upstream
git checkout -b feat/issue-123-short-description
```

### 4. Make Changes & Commit
```bash
git add .
git commit -m "feat: short description of changes"
git push origin feat/issue-123-short-description
```

### 5. Create Pull Request
Open PR on GitHub with description linking to the issue.

---

## 🔧 Development Environment Setup

### Prerequisites
- **Node.js** 18+ (for backend & frontend)
- **Rust** 1.70+ (for smart contracts)
- **Docker** (optional, for local database)
- **PostgreSQL** 14+ (or use Docker)

### Backend Setup (NestJS)

```bash
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Set up database
npm run migrate

# Start dev server
npm run start:dev
# Server runs on http://localhost:3001
```

**Environment Variables** (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/carbonledger
STELLAR_NETWORK=TESTNET
STELLAR_SECRET_KEY=your-secret-key
JWT_SECRET=your-jwt-secret
REDIS_URL=redis://localhost:6379
```

### Frontend Setup (Next.js 14)

```bash
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Start dev server
npm run dev
# App runs on http://localhost:3000
```

**Environment Variables** (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STELLAR_NETWORK=TESTNET
NEXT_PUBLIC_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
```

### Smart Contracts Setup (Rust)

```bash
cd carbonledger-contract

# Install Soroban CLI
cargo install stellar-cli

# Build contracts
cargo build --release --target wasm32-unknown-unknown

# Deploy to testnet
stellar contract deploy --network testnet --source-account seed ...
```

### Docker Compose (Local Stack)

```bash
# Run all services locally
docker-compose up -d

# Database: localhost:5432
# Backend: localhost:3001
# Frontend: localhost:3000
# Redis: localhost:6379
```

---

## 🔍 Finding Issues

### 1. Browse GitHub Issues
```bash
# View all open issues
https://github.com/milah-247/carbonledger/issues

# Filter by label
https://github.com/milah-247/carbonledger/issues?labels=good-first-issue
https://github.com/milah-247/carbonledger/issues?labels=help-wanted
```

### 2. Using GitHub CLI
```bash
# List all issues
gh issue list --repo milah-247/carbonledger

# By label
gh issue list --repo milah-247/carbonledger --label "good-first-issue"

# By complexity
gh issue list --repo milah-247/carbonledger | grep "Medium"

# Assigned to you
gh issue list --repo milah-247/carbonledger --assignee "@me"
```

### 3. Issue Labels Explained

| Label | Meaning | Complexity |
|-------|---------|-----------|
| `good-first-issue` | Perfect for beginners | Low (1-3 hours) |
| `help-wanted` | Community contributions welcome | Variable |
| `smart-contracts` | Rust/Soroban contract work | Variable |
| `frontend` | React/Next.js work | Variable |
| `backend` | NestJS/Node.js work | Variable |
| `testing` | Testing & QA work | Variable |
| `devops` | Infrastructure & CI/CD | Variable |
| `security` | Security-focused | High |
| `bug` | Bug fixes | Variable |
| `feature` | New feature | Variable |

### 4. Issue Complexity

- **Low** (🟢) - 1-3 hours, straightforward
- **Medium** (🟡) - 3-8 hours, moderate
- **High** (🔴) - 1-3 days, complex
- **Very High** (⚫) - 3+ days, research needed

**Recommendation**: Start with `good-first-issue` or low-complexity issues

---

## 📋 Contributing Workflow

### Step 1: Choose an Issue
```bash
# Find issue on GitHub
gh issue view 123  # View specific issue

# Or search for issues matching your skills
gh issue list --repo milah-247/carbonledger --label "frontend"
```

### Step 2: Express Interest
Comment on the issue:
```
I'd like to work on this. I have experience with [relevant tech].
Estimated time: ~[days/hours]
```

### Step 3: Create Feature Branch
```bash
git fetch upstream
git checkout upstream/main
git checkout -b feat/issue-123-short-title

# Naming convention:
# feat/issue-123-description     (new feature)
# fix/issue-123-description       (bug fix)
# docs/issue-123-description      (documentation)
# test/issue-123-description      (tests)
# chore/issue-123-description     (maintenance)
```

### Step 4: Make Changes
```bash
# Follow code standards (see section below)
# Write tests for new code
# Update documentation

# Commit often with clear messages
git add .
git commit -m "feat: implement feature X

- Added component Y
- Updated tests
- Closes #123"
```

### Step 5: Run Tests Locally

#### Backend Tests
```bash
cd backend
npm run test              # Unit tests
npm run test:e2e         # E2E tests
npm run lint             # Linting
npm run format           # Code formatting
```

#### Frontend Tests
```bash
cd frontend
npm run test             # Unit tests
npm run test:e2e        # E2E tests
npm run lint            # Linting
npm run format          # Code formatting
```

#### Smart Contract Tests
```bash
cd carbonledger-contract
cargo test              # Unit tests
cargo clippy           # Linting
cargo fmt              # Formatting
```

### Step 6: Push & Create PR

```bash
git push origin feat/issue-123-short-title
```

Then create Pull Request on GitHub with:

```markdown
## Description
Brief description of changes

## Fixes
Closes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Breaking change

## Testing
- [ ] Added tests
- [ ] All tests pass
- [ ] Tested manually

## Checklist
- [ ] Code follows style guide
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No breaking changes
```

### Step 7: Address Review Feedback
```bash
# Make requested changes
git add .
git commit -m "refactor: address review feedback"
git push origin feat/issue-123-short-title

# Maintainer will merge when ready
```

---

## 📐 Code Standards

### General Rules
- ✅ Write clean, readable code
- ✅ Follow language/framework conventions
- ✅ Add comments for complex logic
- ✅ Write tests for new code
- ✅ Update documentation
- ✅ Use meaningful commit messages

### TypeScript/JavaScript (Backend & Frontend)

```typescript
// File naming: camelCase for variables/functions, PascalCase for components
export const getUserByEmail = async (email: string): Promise<User> => {
  // Code here
};

// Clear types
interface UserInput {
  email: string;
  name: string;
}

// Error handling
try {
  const result = await someAsyncOperation();
} catch (error) {
  logger.error('Operation failed', error);
  throw new ApplicationError('User-friendly message');
}

// Logging
logger.info('User registered', { userId, email });
logger.error('Database error', error);
```

### Rust (Smart Contracts)

```rust
// Clear function names and types
pub fn verify_credit_ownership(
    contract: &ContractClient,
    batch_id: u64,
    owner: &Address,
) -> Result<bool, Error> {
    // Implementation
}

// Error handling
if batch_id > MAX_BATCH_ID {
    return Err(Error::InvalidBatchId);
}

// Documentation comments
/// Verifies that credits are not double-spent
/// 
/// # Arguments
/// * `batch_id` - The credit batch identifier
/// * `amount` - Requested retirement amount
///
/// # Returns
/// `Ok(true)` if verified, `Err` if invalid
pub fn verify_no_double_spend(
    batch_id: u64,
    amount: u64,
) -> Result<bool, Error> {
    // Code
}
```

### React Components

```typescript
// Component naming: PascalCase
interface CreditListProps {
  credits: Credit[];
  onSelect: (id: string) => void;
  isLoading?: boolean;
}

export const CreditList: React.FC<CreditListProps> = ({
  credits,
  onSelect,
  isLoading = false,
}) => {
  // Component logic
  
  return (
    <div className="credit-list">
      {/* JSX */}
    </div>
  );
};
```

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: feat, fix, docs, style, refactor, perf, test, chore  
**Scope**: component/module affected  
**Subject**: imperative, lowercase, no period

**Example**:
```
feat(marketplace): add credit filtering by vintage year

Implement filtering UI and backend query optimization
to support filtering credits by vintage year range.

Closes #456
```

---

## 💰 Bounty Program

### How It Works
1. Choose an issue with a bounty label
2. Complete work to acceptance criteria
3. Submit PR with evidence of completion
4. Get approved & receive bounty

### Bounty Levels

| Complexity | Bounty | Examples |
|-----------|--------|----------|
| Low | $300-$800 | Documentation, simple bugs, UI fixes |
| Medium | $1,000-$2,000 | Features, test suites, API endpoints |
| High | $2,000-$5,000 | Complex features, security, architecture |
| Very High | $5,000-$10,000 | Major integrations, formal verification |

### Bounty Payment
- Approved via GitHub issue comment
- Processed via CarbonLedger wallet
- Payment in USDC or CARBON tokens
- Typically within 1-2 weeks of merge

### Tips for Bounty Success
- ✅ Meet ALL acceptance criteria
- ✅ Write comprehensive tests
- ✅ Update documentation
- ✅ Get code review before submitting
- ✅ Link to completed work in PR

---

## 🆘 Getting Help

### Documentation
- 📖 [README](./README.md) - Project overview
- 📚 [Issue Generation Guide](./ISSUE_GENERATION_GUIDE.md) - Issue details
- 🏛️ [Architecture Docs](./carbonledger-contract/docs/) - Contract architecture

### Communication Channels
- 💬 **GitHub Issues** - Ask questions in issue comments
- 🐦 **Twitter** - [@CarbonLedger](https://twitter.com/carbonledger)
- 💻 **Discord** - [Join our community](https://discord.gg/carbonledger)
- 📧 **Email** - contributors@carbonledger.io

### Common Questions

**Q: How do I get assigned to an issue?**
A: Comment expressing interest. Maintainers will assign when ready.

**Q: Can I work on multiple issues?**
A: Yes! Feel free to work on multiple issues in parallel.

**Q: How long does PR review take?**
A: Usually 2-5 business days depending on complexity.

**Q: What if I get stuck?**
A: Ask in the GitHub issue! We're here to help.

**Q: Can I propose new issues?**
A: Yes! Open an issue describing the work needed.

### Before Asking for Help
1. Check existing documentation
2. Search closed GitHub issues
3. Review related code
4. Try to debug yourself
5. Then ask! 🙋

---

## 🎓 Learning Resources

### Smart Contracts (Rust/Soroban)
- [Soroban Documentation](https://soroban.stellar.org/docs)
- [Rust Book](https://doc.rust-lang.org/book/)
- [CarbonLedger Contracts](./carbonledger-contract/)

### Backend (NestJS)
- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prisma ORM](https://www.prisma.io/docs/)

### Frontend (React/Next.js)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)

### DevOps
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes](https://kubernetes.io/docs/)
- [Terraform](https://www.terraform.io/docs/)

---

## ✅ Before Submitting

Checklist before you mark your PR ready for review:

- [ ] Code follows project style guide
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] No console errors/warnings
- [ ] Commits have clear messages
- [ ] PR description is detailed
- [ ] All acceptance criteria met
- [ ] Manual testing completed
- [ ] No unrelated changes included
- [ ] Linked to issue number

---

## 🎉 You're Ready!

You now have everything you need to start contributing. Here's the typical workflow:

1. 🔍 Find an issue with label `good-first-issue`
2. 💬 Comment to express interest
3. 🍴 Fork & create a feature branch
4. ✏️ Make changes following code standards
5. ✅ Write tests and verify they pass
6. 📤 Push & create a Pull Request
7. 🔄 Address review feedback
8. ✨ Get merged & celebrate!

Welcome to the CarbonLedger community! 🌍♻️

---

**Questions?** Open an issue or reach out on our community channels!
**Found a typo?** Fix it and open a PR!
**Have ideas?** We'd love to hear them!

Happy contributing! 🚀
