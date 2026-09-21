# Playwright UI & API Test Automation Framework

An enterprise-grade, full-stack test automation framework built with **Playwright**, **TypeScript**, and modern testing engineering patterns. Designed to support **UI**, **API**, **Database (PostgreSQL)**, and **Hybrid E2E** test suites with comprehensive reporting and strict type safety.

---

## 🌟 Key Features

- **Multi-Layer Automation**: Full test coverage across UI (Page Object Model & Component pattern), REST API (Zod validation), Database (PostgreSQL / Neon), and Hybrid workflows.
- **Strict Type Safety**: Strict TypeScript compiler configuration (`isolatedModules`, `verbatimModuleSyntax`, `noUncheckedIndexedAccess`) with clean path aliases.
- **Environment & Config Management**: Runtime environment validation via **Zod** (`src/config/env.schema.ts`), immutable config exports, and profile-based browser definitions.
- **Session Authentication**: Storage state reuse (`.auth/admin.json`) preventing redundant logins across test runs.
- **Allure & HTML Reporting**: Built-in Allure reporting with steps, attachments, execution metrics, and Playwright HTML reports.
- **Database Utilities**: Connection pool lifecycle management and repository pattern for DB assertions and data seeding.
- **Network & Mocking**: Network interceptors, route mocks, and API client wrappers.
- **Observability**: Structured logging using **Winston** and execution metrics tracking.
- **Code Quality & Git Hooks**: ESLint 10 with Playwright plugin, Prettier, and Husky + lint-staged pre-commit quality gates.
- **CI/CD Ready**: Fully configured GitHub Actions workflow (`.github/workflows/playwright.yml`) with automated quality checks, test matrix execution, and report artifact uploads.

---

## 📁 Project Structure

```text
pw-ui-api-framework/
├── .auth/                     # Cached authentication storage states (gitignored)
├── .github/
│   └── workflows/
│       └── playwright.yml     # GitHub Actions CI pipeline
├── guide/                     # Stage-by-stage implementation guides (01-09)
├── docs/                      # Architectural reports and authoring workflows
├── reports/                   # Allure results/reports, HTML reports, logs
├── src/
│   ├── config/                # Environment validation (Zod), BrowserProfiles, setup/teardown
│   ├── data/                  # Test data fixtures and builders
│   ├── database/              # PostgreSQL client, pool lifecycle, and repositories
│   ├── fixtures/              # Custom Playwright fixtures (pages, API, DB)
│   ├── network/               # Route interception and mock handlers
│   ├── observability/         # Winston logger, performance metrics, and listeners
│   ├── pages/                 # Page Object Models and reusable UI components
│   ├── schemas/               # Zod validation schemas for API contracts
│   ├── services/              # API clients and service layer abstractions
│   └── utils/                 # General helper functions and formatters
├── tests/
│   ├── api/                   # API test suites
│   ├── database/              # DB direct query and verification tests
│   ├── hybrid/                # End-to-end multi-layer tests (UI + API + DB)
│   ├── observability/         # Framework logging and metric tests
│   ├── ui/                    # UI functional test suites
│   └── auth.setup.ts          # Global authentication setup test
├── .env.example               # Template environment configuration
├── eslint.config.js           # ESLint configuration
├── package.json               # Dependencies and scripts
├── playwright.config.ts       # Modular Playwright configuration
└── tsconfig.json              # TypeScript configuration & path aliases
```

---

## 🚀 Prerequisites

- **Node.js**: v20+ or matching [`.nvmrc`](file:///.nvmrc)
- **npm**: v10+
- **PostgreSQL**: (Optional for local DB testing) or hosted instance (e.g., Neon / Supabase)

---

## 🛠️ Getting Started

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd pw-ui-api-framework
npm ci
```

### 2. Install Playwright Browsers

```bash
npx playwright install --with-deps chromium
```

_(Or install all browsers with `npx playwright install --with-deps`)_

### 3. Configure Environment Variables

Create your local `.env` file from the provided example template:

```bash
cp .env.example .env
```

Update `.env` with your target environment settings:

```env
# Target Application URLs
APP_URL=https://aura-eyecare.vercel.app
API_URL=https://aura-eyecare.vercel.app/api

# Environment & CI Controls
NODE_ENV=qa
CI=false

# Admin Authentication
ADMIN_EMAIL=admin@eyecare.com
ADMIN_PASSWORD=secret123

# Database Connection (PostgreSQL / Neon)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aura_eyecare_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_SSL=false

# Test Execution & Timeouts
TIMEOUT_TEST_MS=30000
TIMEOUT_ACTION_MS=15000
TIMEOUT_NAVIGATION_MS=30000
WORKERS=4
RETRIES=0
LOG_LEVEL=info
```

---

## 🧪 Running Tests

### Execute All Tests

```bash
npm test
```

### Targeted Test Suites

```bash
# Run UI Tests only
npm run test:ui

# Run API Tests only
npm run test:api

# Run Hybrid (UI + API + DB) Tests
npm run test:hybrid

# Run Smoke Tests (filtered by tag)
npm run test:smoke

# Run Regression Tests (filtered by tag)
npm run test:regression
```

### Interactive UI / Debugging

```bash
# Run tests in UI mode
npx playwright test --ui

# Run tests in headed browser
npx playwright test --headed

# Run tests in debug mode (Playwright Inspector)
npx playwright test --debug
```

---

## 📊 Reporting

### Playwright HTML Report

```bash
npx playwright show-report reports/html
```

### Allure Report

```bash
# Generate Allure report from results
npm run allure:generate

# Open the generated Allure report
npm run allure:open

# Or serve directly in a temporary web server
npm run allure:serve
```

---

## 🧹 Code Quality & Formatting

To ensure consistent code quality across the team, the framework includes strict linting, type-checking, and formatting checks:

```bash
# Run all quality checks (Typecheck + ESLint + Prettier)
npm run quality

# Run TypeScript typecheck without emitting output
npm run typecheck

# Lint files with ESLint
npm run lint
npm run lint:fix

# Format files with Prettier
npm run format
npm run format:check
```

_Pre-commit hooks are automatically configured via **Husky** and **lint-staged** to run ESLint and Prettier on staged files._

---

## 🏷️ Path Aliases Reference

Clean import paths configured in [`tsconfig.json`](file:///tsconfig.json):

| Alias                                 | Target Directory              |
| :------------------------------------ | :---------------------------- |
| `@config` / `@config/*`               | `src/config/*`                |
| `@pages` / `@pages/*`                 | `src/pages/*`                 |
| `@components` / `@components/*`       | `src/pages/components/*`      |
| `@services` / `@services/*`           | `src/services/*`              |
| `@schemas` / `@schemas/*`             | `src/schemas/*`               |
| `@network` / `@network/*`             | `src/network/*`               |
| `@database` / `@database/*`           | `src/database/*`              |
| `@repositories` / `@repositories/*`   | `src/database/repositories/*` |
| `@fixtures` / `@fixtures/*`           | `src/fixtures/*`              |
| `@observability` / `@observability/*` | `src/observability/*`         |
| `@data` / `@data/*`                   | `src/data/*`                  |
| `@utils` / `@utils/*`                 | `src/utils/*`                 |

---

## 🔄 CI/CD Pipeline

The framework uses GitHub Actions (`.github/workflows/playwright.yml`) triggered on `push` and `pull_request` to `main`/`master`:

1. Checks out code and sets up Node.js with caching.
2. Runs the strict Quality Gate (`npm run quality`).
3. Installs Chromium and OS dependencies.
4. Executes the test suite with CI configurations.
5. Generates Allure reports.
6. Uploads Playwright HTML reports, Allure reports, and execution summary metrics as workflow artifacts.
