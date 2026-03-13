import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SortableHeader, nextSortState, sortRows, type SortDirection } from '../sortable-header'

/* ---- nextSortState ---- */

describe('nextSortState', () => {
  it('starts ascending when clicking a new column', () => {
    const result = nextSortState(null, null, 'name')
    expect(result).toEqual({ sortKey: 'name', direction: 'asc' })
  })

  it('switches from asc to desc on same column', () => {
    const result = nextSortState('name', 'asc', 'name')
    expect(result).toEqual({ sortKey: 'name', direction: 'desc' })
  })

  it('clears sort from desc on same column', () => {
    const result = nextSortState('name', 'desc', 'name')
    expect(result).toEqual({ sortKey: null, direction: null })
  })

  it('starts ascending when switching columns', () => {
    const result = nextSortState('name', 'desc', 'age')
    expect(result).toEqual({ sortKey: 'age', direction: 'asc' })
  })
})

/* ---- sortRows ---- */

describe('sortRows', () => {
  const rows = [
    { name: 'Charlie', age: 25, joinedAt: '2025-03-01T00:00:00Z' },
    { name: 'Alice', age: 30, joinedAt: '2025-01-15T00:00:00Z' },
    { name: 'Bob', age: 20, joinedAt: '2025-06-10T00:00:00Z' },
  ]

  it('returns unsorted data when sortKey is null', () => {
    const result = sortRows(rows, null, null)
    expect(result).toEqual(rows)
  })

  it('returns unsorted data when direction is null', () => {
    const result = sortRows(rows, 'name', null)
    expect(result).toEqual(rows)
  })

  it('sorts strings ascending (case-insensitive)', () => {
    const result = sortRows(rows, 'name', 'asc')
    expect(result.map((r) => r.name)).toEqual(['Alice', 'Bob', 'Charlie'])
  })

  it('sorts strings descending', () => {
    const result = sortRows(rows, 'name', 'desc')
    expect(result.map((r) => r.name)).toEqual(['Charlie', 'Bob', 'Alice'])
  })

  it('sorts numbers ascending', () => {
    const result = sortRows(rows, 'age', 'asc')
    expect(result.map((r) => r.age)).toEqual([20, 25, 30])
  })

  it('sorts numbers descending', () => {
    const result = sortRows(rows, 'age', 'desc')
    expect(result.map((r) => r.age)).toEqual([30, 25, 20])
  })

  it('sorts ISO date strings ascending', () => {
    const result = sortRows(rows, 'joinedAt', 'asc')
    expect(result.map((r) => r.name)).toEqual(['Alice', 'Charlie', 'Bob'])
  })

  it('sorts ISO date strings descending', () => {
    const result = sortRows(rows, 'joinedAt', 'desc')
    expect(result.map((r) => r.name)).toEqual(['Bob', 'Charlie', 'Alice'])
  })

  it('handles null values — nulls always go last', () => {
    const rowsWithNull = [
      { name: 'Charlie', value: null },
      { name: 'Alice', value: 10 },
      { name: 'Bob', value: null },
      { name: 'Diana', value: 5 },
    ]
    const ascResult = sortRows(rowsWithNull, 'value', 'asc')
    expect(ascResult.map((r) => r.name)).toEqual(['Diana', 'Alice', 'Charlie', 'Bob'])

    const descResult = sortRows(rowsWithNull, 'value', 'desc')
    expect(descResult.map((r) => r.name)).toEqual(['Alice', 'Diana', 'Charlie', 'Bob'])
  })

  it('does not mutate the original array', () => {
    const original = [...rows]
    sortRows(rows, 'name', 'asc')
    expect(rows).toEqual(original)
  })
})

/* ---- SortableHeader component ---- */

describe('SortableHeader', () => {
  const renderHeader = (props: { currentSort: string | null; currentDirection: SortDirection }) => {
    const onSort = vi.fn()
    render(
      <table>
        <thead>
          <tr>
            <SortableHeader
              label="Name"
              sortKey="name"
              currentSort={props.currentSort}
              currentDirection={props.currentDirection}
              onSort={onSort}
            />
          </tr>
        </thead>
      </table>,
    )
    return { onSort }
  }

  it('renders the label text', () => {
    renderHeader({ currentSort: null, currentDirection: null })
    expect(screen.getByText('Name')).toBeInTheDocument()
  })

  it('has aria-sort="none" when not active', () => {
    renderHeader({ currentSort: null, currentDirection: null })
    const th = screen.getByRole('columnheader')
    expect(th).toHaveAttribute('aria-sort', 'none')
  })

  it('has aria-sort="ascending" when active asc', () => {
    renderHeader({ currentSort: 'name', currentDirection: 'asc' })
    const th = screen.getByRole('columnheader')
    expect(th).toHaveAttribute('aria-sort', 'ascending')
  })

  it('has aria-sort="descending" when active desc', () => {
    renderHeader({ currentSort: 'name', currentDirection: 'desc' })
    const th = screen.getByRole('columnheader')
    expect(th).toHaveAttribute('aria-sort', 'descending')
  })

  it('calls onSort with sortKey when clicked', () => {
    const { onSort } = renderHeader({ currentSort: null, currentDirection: null })
    fireEvent.click(screen.getByRole('columnheader'))
    expect(onSort).toHaveBeenCalledWith('name')
    expect(onSort).toHaveBeenCalledTimes(1)
  })

  it('is clickable and has cursor-pointer class', () => {
    renderHeader({ currentSort: null, currentDirection: null })
    const th = screen.getByRole('columnheader')
    expect(th.className).toContain('cursor-pointer')
  })
})
