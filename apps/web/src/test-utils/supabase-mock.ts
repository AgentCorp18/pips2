/**
 * Shared Supabase query-chain mock for Vitest test files.
 *
 * The mock simulates the Supabase fluent query builder. Each call to
 * `supabase.from()` consumes the next entry in `results`, so tests can
 * pre-populate expected responses without wiring up a real database.
 *
 * Usage
 * -----
 * Place this block near the top of a test file (before any imports of
 * the module under test, because vi.mock is hoisted):
 *
 *   import { makeSupabaseMock } from '@/test-utils/supabase-mock'
 *
 *   const supabaseMock = makeSupabaseMock()
 *
 *   vi.mock('@/lib/supabase/server', () => ({
 *     createClient: vi.fn().mockResolvedValue({
 *       from: () => supabaseMock.next(),
 *     }),
 *   }))
 *
 *   beforeEach(() => {
 *     supabaseMock.reset()
 *     vi.clearAllMocks()
 *   })
 *
 * Then in each test, push the expected responses:
 *
 *   supabaseMock.results.push({ data: [...] })
 *   supabaseMock.results.push({ data: null, error: { message: 'oops' } })
 */

export type SupabaseMockResult = {
  data?: unknown
  count?: number | null
  error?: unknown
}

export type SupabaseMock = {
  /** Pre-populate this array before each test. */
  results: SupabaseMockResult[]
  /** Returns the next Proxy chain and advances the internal counter. */
  next: () => Record<string, unknown>
  /** Resets the counter and clears results — call in beforeEach. */
  reset: () => void
}

/**
 * Creates a fresh, isolated Supabase mock instance.
 * Call once at module scope and reuse across tests via `reset()`.
 */
export const makeSupabaseMock = (): SupabaseMock => {
  let callIndex = 0
  const results: SupabaseMockResult[] = []

  const createChainForIndex = (idx: number): Record<string, unknown> => {
    const terminal = () => {
      const result = results[idx] ?? { data: null, error: null }
      return Promise.resolve(result)
    }

    const chain: Record<string, unknown> = {}
    const proxy = new Proxy(chain, {
      get(_target, prop) {
        if (prop === 'then') {
          const p = terminal()
          return p.then.bind(p)
        }
        return (..._args: unknown[]) => proxy
      },
    })

    return proxy
  }

  const next = (): Record<string, unknown> => {
    const idx = callIndex++
    return createChainForIndex(idx)
  }

  const reset = (): void => {
    callIndex = 0
    results.length = 0
  }

  return { results, next, reset }
}
