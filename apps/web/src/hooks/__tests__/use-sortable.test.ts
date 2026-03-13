import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSortable } from '../use-sortable'

type TestRow = {
  name: string
  age: number
  joinedAt: string | null
}

const testData: TestRow[] = [
  { name: 'Charlie', age: 25, joinedAt: '2025-03-01T00:00:00Z' },
  { name: 'Alice', age: 30, joinedAt: '2025-01-15T00:00:00Z' },
  { name: 'Bob', age: 20, joinedAt: null },
]

describe('useSortable', () => {
  it('returns unsorted data initially when no default sort', () => {
    const { result } = renderHook(() => useSortable(testData))
    expect(result.current.sortedData).toEqual(testData)
    expect(result.current.sortKey).toBeNull()
    expect(result.current.sortDirection).toBeNull()
  })

  it('accepts a default sort option', () => {
    const { result } = renderHook(() => useSortable(testData, { key: 'name', direction: 'asc' }))
    expect(result.current.sortKey).toBe('name')
    expect(result.current.sortDirection).toBe('asc')
    expect(result.current.sortedData.map((r) => r.name)).toEqual(['Alice', 'Bob', 'Charlie'])
  })

  it('sorts ascending on first click', () => {
    const { result } = renderHook(() => useSortable(testData))

    act(() => {
      result.current.handleSort('name')
    })

    expect(result.current.sortKey).toBe('name')
    expect(result.current.sortDirection).toBe('asc')
    expect(result.current.sortedData.map((r) => r.name)).toEqual(['Alice', 'Bob', 'Charlie'])
  })

  it('sorts descending on second click', () => {
    const { result } = renderHook(() => useSortable(testData))

    act(() => {
      result.current.handleSort('name')
    })
    act(() => {
      result.current.handleSort('name')
    })

    expect(result.current.sortDirection).toBe('desc')
    expect(result.current.sortedData.map((r) => r.name)).toEqual(['Charlie', 'Bob', 'Alice'])
  })

  it('clears sort on third click (cycle back to unsorted)', () => {
    const { result } = renderHook(() => useSortable(testData))

    act(() => {
      result.current.handleSort('name')
    })
    act(() => {
      result.current.handleSort('name')
    })
    act(() => {
      result.current.handleSort('name')
    })

    expect(result.current.sortKey).toBeNull()
    expect(result.current.sortDirection).toBeNull()
    expect(result.current.sortedData).toEqual(testData)
  })

  it('starts ascending when switching to a different column', () => {
    const { result } = renderHook(() => useSortable(testData))

    act(() => {
      result.current.handleSort('name')
    })
    act(() => {
      result.current.handleSort('age')
    })

    expect(result.current.sortKey).toBe('age')
    expect(result.current.sortDirection).toBe('asc')
    expect(result.current.sortedData.map((r) => r.age)).toEqual([20, 25, 30])
  })

  it('sorts numbers correctly', () => {
    const { result } = renderHook(() => useSortable(testData, { key: 'age', direction: 'desc' }))
    expect(result.current.sortedData.map((r) => r.age)).toEqual([30, 25, 20])
  })

  it('sorts date strings correctly', () => {
    const { result } = renderHook(() =>
      useSortable(testData, { key: 'joinedAt', direction: 'asc' }),
    )
    // Alice (Jan 15) < Charlie (Mar 1), Bob (null) goes last
    expect(result.current.sortedData.map((r) => r.name)).toEqual(['Alice', 'Charlie', 'Bob'])
  })

  it('puts null values last regardless of direction', () => {
    const { result } = renderHook(() =>
      useSortable(testData, { key: 'joinedAt', direction: 'desc' }),
    )
    // Charlie (Mar 1) > Alice (Jan 15), Bob (null) goes last
    expect(result.current.sortedData.map((r) => r.name)).toEqual(['Charlie', 'Alice', 'Bob'])
  })

  it('handles empty data', () => {
    const { result } = renderHook(() => useSortable<TestRow>([]))
    expect(result.current.sortedData).toEqual([])

    act(() => {
      result.current.handleSort('name')
    })

    expect(result.current.sortedData).toEqual([])
  })

  it('updates sorted data when input data changes', () => {
    const { result, rerender } = renderHook(
      ({ data }) => useSortable(data, { key: 'age', direction: 'asc' }),
      { initialProps: { data: testData } },
    )

    expect(result.current.sortedData.map((r) => r.age)).toEqual([20, 25, 30])

    const newData: TestRow[] = [
      ...testData,
      { name: 'Diana', age: 15, joinedAt: '2025-12-01T00:00:00Z' },
    ]

    rerender({ data: newData })

    expect(result.current.sortedData.map((r) => r.age)).toEqual([15, 20, 25, 30])
  })
})
