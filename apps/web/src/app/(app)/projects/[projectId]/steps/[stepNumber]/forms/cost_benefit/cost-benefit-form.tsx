'use client'

import { useCallback, useState } from 'react'
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormShell } from '@/components/pips/form-shell'
import { useFormViewMode } from '@/components/pips/form-view-context'
import { saveFormData } from '../actions'
import type { CostBenefitData } from '@/lib/form-schemas'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type Props = {
  projectId: string
  initialData: CostBenefitData | null
}

type LineItem = CostBenefitData['costs'][number]

const FREQUENCY_LABELS: Record<LineItem['frequency'], string> = {
  one_time: 'One-time',
  monthly: 'Monthly',
  annual: 'Annual',
}

const createDefaultData = (): CostBenefitData => ({
  solutionName: '',
  costs: [
    { id: crypto.randomUUID(), description: '', amount: 0, frequency: 'one_time', category: '' },
  ],
  benefits: [
    { id: crypto.randomUUID(), description: '', amount: 0, frequency: 'one_time', category: '' },
  ],
  netBenefit: 0,
  paybackPeriod: '',
  recommendation: '',
})

const calcAnnual = (amount: number, frequency: LineItem['frequency']): number => {
  if (frequency === 'monthly') return amount * 12
  return amount
}

const sumAnnual = (items: LineItem[]): number =>
  items.reduce((acc, item) => acc + calcAnnual(item.amount, item.frequency), 0)

const formatCurrency = (n: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)

export const CostBenefitForm = ({ projectId, initialData }: Props) => {
  const [data, setData] = useState<CostBenefitData>(() => {
    const d = initialData ?? createDefaultData()
    return {
      ...d,
      netBenefit: sumAnnual(d.benefits) - sumAnnual(d.costs),
    }
  })
  const [dirty, setDirty] = useState(false)

  const update = useCallback((next: CostBenefitData) => {
    const withNet = {
      ...next,
      netBenefit: sumAnnual(next.benefits) - sumAnnual(next.costs),
    }
    setData(withNet)
    setDirty(true)
  }, [])

  const handleSave = useCallback(async () => {
    const result = await saveFormData(
      projectId,
      4,
      'cost_benefit',
      data as unknown as Record<string, unknown>,
    )
    if (result.error) {
      toast.error(result.error)
      return { error: result.error }
    }
    setDirty(false)
    return { success: true }
  }, [projectId, data])

  /* ---- Cost helpers ---- */
  const addCost = () =>
    update({
      ...data,
      costs: [
        ...data.costs,
        {
          id: crypto.randomUUID(),
          description: '',
          amount: 0,
          frequency: 'one_time',
          category: '',
        },
      ],
    })

  const removeCost = (id: string) =>
    update({ ...data, costs: data.costs.filter((c) => c.id !== id) })

  const updateCost = (id: string, field: string, value: string | number) =>
    update({
      ...data,
      costs: data.costs.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    })

  /* ---- Benefit helpers ---- */
  const addBenefit = () =>
    update({
      ...data,
      benefits: [
        ...data.benefits,
        {
          id: crypto.randomUUID(),
          description: '',
          amount: 0,
          frequency: 'one_time',
          category: '',
        },
      ],
    })

  const removeBenefit = (id: string) =>
    update({ ...data, benefits: data.benefits.filter((b) => b.id !== id) })

  const updateBenefit = (id: string, field: string, value: string | number) =>
    update({
      ...data,
      benefits: data.benefits.map((b) => (b.id === id ? { ...b, [field]: value } : b)),
    })

  return (
    <FormShell
      title="Cost-Benefit Analysis"
      description="Compare the total costs and benefits of a proposed solution to determine financial viability."
      stepNumber={4}
      onSave={handleSave}
      isDirty={dirty}
    >
      <CostBenefitFields
        data={data}
        update={update}
        addCost={addCost}
        removeCost={removeCost}
        updateCost={updateCost}
        addBenefit={addBenefit}
        removeBenefit={removeBenefit}
        updateBenefit={updateBenefit}
      />
    </FormShell>
  )
}

/* ---- Inner fields component ---- */

type FieldsProps = {
  data: CostBenefitData
  update: (next: CostBenefitData) => void
  addCost: () => void
  removeCost: (id: string) => void
  updateCost: (id: string, field: string, value: string | number) => void
  addBenefit: () => void
  removeBenefit: (id: string) => void
  updateBenefit: (id: string, field: string, value: string | number) => void
}

const CostBenefitFields = ({
  data,
  update,
  addCost,
  removeCost,
  updateCost,
  addBenefit,
  removeBenefit,
  updateBenefit,
}: FieldsProps) => {
  const mode = useFormViewMode()
  const isView = mode === 'view'

  const totalCosts = sumAnnual(data.costs)
  const totalBenefits = sumAnnual(data.benefits)
  const net = totalBenefits - totalCosts
  const netPositive = net >= 0

  if (isView) {
    return (
      <div className="space-y-8">
        {/* Solution name */}
        <div className="space-y-1">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            Solution Name
          </span>
          {data.solutionName ? (
            <p className="text-sm text-[var(--color-text-secondary)]">{data.solutionName}</p>
          ) : (
            <p className="text-sm italic text-[var(--color-text-tertiary)]">Not provided</p>
          )}
        </div>

        {/* Costs table */}
        <ViewSection
          title="Costs"
          accentClass="border-l-red-500 bg-red-50/50 dark:bg-red-950/20"
          icon={<TrendingDown className="size-5" />}
          iconClass="text-red-600 dark:text-red-400"
        >
          <LineItemTable items={data.costs} totalLabel="Total Annual Costs" total={totalCosts} />
        </ViewSection>

        {/* Benefits table */}
        <ViewSection
          title="Benefits"
          accentClass="border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
          icon={<TrendingUp className="size-5" />}
          iconClass="text-emerald-600 dark:text-emerald-400"
        >
          <LineItemTable
            items={data.benefits}
            totalLabel="Total Annual Benefits"
            total={totalBenefits}
          />
        </ViewSection>

        {/* Net benefit */}
        <NetBenefitDisplay net={net} positive={netPositive} />

        {/* Payback period */}
        <div className="space-y-1">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            Payback Period
          </span>
          {data.paybackPeriod ? (
            <p className="text-sm text-[var(--color-text-secondary)]">{data.paybackPeriod}</p>
          ) : (
            <p className="text-sm italic text-[var(--color-text-tertiary)]">Not provided</p>
          )}
        </div>

        {/* Recommendation */}
        <div className="space-y-1">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            Recommendation
          </span>
          {data.recommendation ? (
            <p className="whitespace-pre-wrap text-sm text-[var(--color-text-secondary)]">
              {data.recommendation}
            </p>
          ) : (
            <p className="text-sm italic text-[var(--color-text-tertiary)]">Not provided</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-foreground">
        List all costs and benefits associated with the proposed solution. Amounts are normalized to
        annual values for comparison.
      </p>

      {/* Solution name */}
      <div className="space-y-1.5">
        <Label htmlFor="solutionName">Solution Name</Label>
        <Input
          id="solutionName"
          value={data.solutionName}
          onChange={(e) => update({ ...data, solutionName: e.target.value })}
          placeholder="e.g. Automated Invoice Processing System"
        />
      </div>

      {/* ---- Costs Section ---- */}
      <EditSection
        title="Costs"
        subtitle="All costs associated with implementing this solution"
        accentClass="border-l-red-500 bg-red-50/50 dark:bg-red-950/20"
        icon={<TrendingDown className="size-5" />}
        iconClass="text-red-600 dark:text-red-400"
      >
        <div className="space-y-3">
          {data.costs.map((item) => (
            <LineItemRow
              key={item.id}
              item={item}
              onUpdate={(field, value) => updateCost(item.id, field, value)}
              onRemove={() => removeCost(item.id)}
              canRemove={data.costs.length > 1}
            />
          ))}
          <Button variant="outline" size="sm" onClick={addCost} className="gap-1.5">
            <Plus className="size-4" />
            Add Cost
          </Button>
        </div>
      </EditSection>

      {/* ---- Benefits Section ---- */}
      <EditSection
        title="Benefits"
        subtitle="All quantifiable benefits from this solution"
        accentClass="border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
        icon={<TrendingUp className="size-5" />}
        iconClass="text-emerald-600 dark:text-emerald-400"
      >
        <div className="space-y-3">
          {data.benefits.map((item) => (
            <LineItemRow
              key={item.id}
              item={item}
              onUpdate={(field, value) => updateBenefit(item.id, field, value)}
              onRemove={() => removeBenefit(item.id)}
              canRemove={data.benefits.length > 1}
            />
          ))}
          <Button variant="outline" size="sm" onClick={addBenefit} className="gap-1.5">
            <Plus className="size-4" />
            Add Benefit
          </Button>
        </div>
      </EditSection>

      {/* Net benefit */}
      <NetBenefitDisplay net={net} positive={netPositive} />

      {/* Payback period */}
      <div className="space-y-1.5">
        <Label htmlFor="paybackPeriod">Payback Period</Label>
        <p className="text-xs text-muted-foreground">
          How long until benefits exceed costs? (e.g. "14 months", "2 years")
        </p>
        <Input
          id="paybackPeriod"
          value={data.paybackPeriod}
          onChange={(e) => update({ ...data, paybackPeriod: e.target.value })}
          placeholder="e.g. 18 months"
        />
      </div>

      {/* Recommendation */}
      <div className="space-y-1.5">
        <Label htmlFor="recommendation">Recommendation</Label>
        <p className="text-xs text-muted-foreground">
          Based on this analysis, what do you recommend?
        </p>
        <textarea
          id="recommendation"
          value={data.recommendation}
          onChange={(e) => update({ ...data, recommendation: e.target.value })}
          placeholder="e.g. Proceed with implementation. The 3:1 benefit-to-cost ratio and 18-month payback period make this solution financially viable..."
          rows={3}
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      </div>
    </div>
  )
}

/* ---- Sub-components ---- */

type EditSectionProps = {
  title: string
  subtitle: string
  icon: React.ReactNode
  accentClass: string
  iconClass: string
  children: React.ReactNode
}

const EditSection = ({
  title,
  subtitle,
  icon,
  accentClass,
  iconClass,
  children,
}: EditSectionProps) => (
  <div className={cn('rounded-[var(--radius-md)] border-l-4 p-5', accentClass)}>
    <div className="mb-4 flex items-center gap-2">
      <span className={iconClass}>{icon}</span>
      <div>
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h3>
        <p className="text-xs text-[var(--color-text-tertiary)]">{subtitle}</p>
      </div>
    </div>
    {children}
  </div>
)

type ViewSectionProps = {
  title: string
  accentClass: string
  icon: React.ReactNode
  iconClass: string
  children: React.ReactNode
}

const ViewSection = ({ title, accentClass, icon, iconClass, children }: ViewSectionProps) => (
  <div className={cn('rounded-[var(--radius-md)] border-l-4 p-5', accentClass)}>
    <div className="mb-3 flex items-center gap-2">
      <span className={iconClass}>{icon}</span>
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</h3>
    </div>
    {children}
  </div>
)

type LineItemRowProps = {
  item: LineItem
  onUpdate: (field: string, value: string | number) => void
  onRemove: () => void
  canRemove: boolean
}

const LineItemRow = ({ item, onUpdate, onRemove, canRemove }: LineItemRowProps) => (
  <div className="flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-3 dark:bg-transparent">
    <div className="flex-1 space-y-2">
      <Input
        value={item.description}
        onChange={(e) => onUpdate('description', e.target.value)}
        placeholder="Description..."
        className="text-sm"
      />
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            $
          </span>
          <Input
            type="number"
            min={0}
            value={item.amount}
            onChange={(e) => onUpdate('amount', parseFloat(e.target.value) || 0)}
            className="pl-6 text-sm"
            placeholder="0"
          />
        </div>
        <Select value={item.frequency} onValueChange={(v) => onUpdate('frequency', v)}>
          <SelectTrigger size="sm" className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="one_time">One-time</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="annual">Annual</SelectItem>
          </SelectContent>
        </Select>
        <Input
          value={item.category}
          onChange={(e) => onUpdate('category', e.target.value)}
          placeholder="Category..."
          className="w-[120px] text-sm"
        />
      </div>
    </div>
    {canRemove && (
      <Button variant="ghost" size="icon-xs" onClick={onRemove}>
        <Trash2 className="size-3 text-muted-foreground" />
      </Button>
    )}
  </div>
)

type LineItemTableProps = {
  items: LineItem[]
  totalLabel: string
  total: number
}

const LineItemTable = ({ items, totalLabel, total }: LineItemTableProps) => {
  const hasItems = items.some((i) => i.description || i.amount > 0)
  if (!hasItems) {
    return <p className="text-sm italic text-[var(--color-text-tertiary)]">No items listed.</p>
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-secondary)]">
            <th className="px-3 py-2 text-left font-medium text-[var(--color-text-primary)]">
              Description
            </th>
            <th className="px-3 py-2 text-left font-medium text-[var(--color-text-primary)]">
              Amount
            </th>
            <th className="px-3 py-2 text-left font-medium text-[var(--color-text-primary)]">
              Frequency
            </th>
            <th className="px-3 py-2 text-left font-medium text-[var(--color-text-primary)]">
              Category
            </th>
            <th className="px-3 py-2 text-right font-medium text-[var(--color-text-primary)]">
              Annual Value
            </th>
          </tr>
        </thead>
        <tbody>
          {items
            .filter((i) => i.description || i.amount > 0)
            .map((item) => (
              <tr key={item.id} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-3 py-2 text-[var(--color-text-secondary)]">
                  {item.description || '—'}
                </td>
                <td className="px-3 py-2 text-[var(--color-text-secondary)]">
                  {formatCurrency(item.amount)}
                </td>
                <td className="px-3 py-2 text-[var(--color-text-tertiary)]">
                  {FREQUENCY_LABELS[item.frequency]}
                </td>
                <td className="px-3 py-2 text-[var(--color-text-tertiary)]">
                  {item.category || '—'}
                </td>
                <td className="px-3 py-2 text-right font-medium text-[var(--color-text-primary)]">
                  {formatCurrency(calcAnnual(item.amount, item.frequency))}
                </td>
              </tr>
            ))}
        </tbody>
        <tfoot>
          <tr className="bg-[var(--color-surface-secondary)]">
            <td
              colSpan={4}
              className="px-3 py-2 text-sm font-semibold text-[var(--color-text-primary)]"
            >
              {totalLabel}
            </td>
            <td className="px-3 py-2 text-right text-sm font-bold text-[var(--color-text-primary)]">
              {formatCurrency(total)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

type NetBenefitDisplayProps = {
  net: number
  positive: boolean
}

const NetBenefitDisplay = ({ net, positive }: NetBenefitDisplayProps) => (
  <div
    className={cn(
      'flex items-center justify-between rounded-[var(--radius-md)] border px-5 py-4',
      positive
        ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30'
        : 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30',
    )}
  >
    <div>
      <p className="text-sm font-semibold text-[var(--color-text-primary)]">Net Annual Benefit</p>
      <p className="text-xs text-[var(--color-text-tertiary)]">
        Total Benefits − Total Costs (annualized)
      </p>
    </div>
    <span
      className={cn(
        'text-2xl font-bold',
        positive ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400',
      )}
    >
      {positive ? '+' : ''}
      {formatCurrency(net)}
    </span>
  </div>
)
