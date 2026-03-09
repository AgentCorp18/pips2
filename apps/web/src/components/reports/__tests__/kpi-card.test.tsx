import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KpiCard } from '../kpi-card'
import { Activity, TrendingUp, Users, BarChart3 } from 'lucide-react'

describe('KpiCard', () => {
  it('renders with title and string value', () => {
    render(<KpiCard title="Total Projects" value="12" icon={Activity} />)
    expect(screen.getByText('Total Projects')).toBeTruthy()
    expect(screen.getByText('12')).toBeTruthy()
  })

  it('renders with numeric value', () => {
    render(<KpiCard title="Active Users" value={42} icon={Users} />)
    expect(screen.getByText('Active Users')).toBeTruthy()
    expect(screen.getByText('42')).toBeTruthy()
  })

  it('handles zero value', () => {
    render(<KpiCard title="Open Tickets" value={0} icon={BarChart3} />)
    expect(screen.getByText('Open Tickets')).toBeTruthy()
    expect(screen.getByText('0')).toBeTruthy()
  })

  it('renders subtitle when provided', () => {
    render(
      <KpiCard
        title="Completion Rate"
        value="85%"
        icon={TrendingUp}
        subtitle="+5% from last month"
      />,
    )
    expect(screen.getByText('Completion Rate')).toBeTruthy()
    expect(screen.getByText('85%')).toBeTruthy()
    expect(screen.getByText('+5% from last month')).toBeTruthy()
  })

  it('does not render subtitle when not provided', () => {
    render(<KpiCard title="Projects" value="7" icon={Activity} />)
    expect(screen.queryByText('+5% from last month')).toBeNull()
  })

  it('renders the icon element', () => {
    const { container } = render(<KpiCard title="Test" value="1" icon={Activity} />)
    const svg = container.querySelector('svg')
    expect(svg).toBeTruthy()
  })

  it('applies custom color to the icon', () => {
    const { container } = render(
      <KpiCard title="Colored" value="99" icon={TrendingUp} color="#FF0000" />,
    )
    // The color is set via inline style - jsdom converts hex to rgb
    const svg = container.querySelector('svg')
    expect(svg).toBeTruthy()
    const wrapper = svg!.closest('[style]')
    expect(wrapper).toBeTruthy()
    expect(wrapper!.getAttribute('style')).toContain('rgb(255, 0, 0)')
  })

  it('renders with percentage string value', () => {
    render(<KpiCard title="Success Rate" value="92.5%" icon={TrendingUp} />)
    expect(screen.getByText('92.5%')).toBeTruthy()
  })

  it('renders value in a bold element', () => {
    render(<KpiCard title="Bold Value" value="123" icon={Activity} />)
    const valueEl = screen.getByText('123')
    expect(valueEl.className).toContain('font-bold')
  })
})
