# PIPS 2.0 Testing Requirements

## Quality Gates (must pass before merge)
1. `pnpm tsc --noEmit` — zero type errors
2. `pnpm lint` — zero lint errors
3. `pnpm test` — all unit tests pass (1,945+ tests across apps/web + packages/shared)
4. `pnpm exec playwright test` — E2E tests

## Test Coverage Expectations
- Components: render + interaction tests
- API routes: happy path + error cases
- Server Actions: input validation + auth checks
- E2E: real user workflows (login, create project, run PIPS steps)

## Writing Tests
- Use Vitest for unit/integration tests
- Use Playwright for E2E tests
- Co-locate test files next to source: `Component.test.tsx`
- E2E tests go in `tests/e2e/`
