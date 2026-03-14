import { Globe, DollarSign } from 'lucide-react'
import { clsx } from 'clsx'
import { Section, PropertyList, Property } from '../../ui/drawer-components'

export interface NamespaceCostInfo {
  hourlyCost: number
  cpuCost: number
  memoryCost: number
  storageCost?: number
  gpuCost?: number
  efficiency?: number
}

interface NamespaceRendererProps {
  data: any
  costData?: NamespaceCostInfo
}

const HOURS_PER_DAY = 24

function toDailyCost(hourlyCost: number): number {
  return hourlyCost * HOURS_PER_DAY
}

function formatCost(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`
  if (value >= 1) return `$${value.toFixed(2)}`
  if (value >= 0.01) return `$${value.toFixed(3)}`
  if (value > 0) return `$${value.toFixed(4)}`
  return '$0.00'
}

function efficiencyColor(efficiency: number): string {
  if (efficiency >= 50) return 'text-emerald-400'
  if (efficiency >= 25) return 'text-amber-400'
  return 'text-red-400'
}

export function NamespaceRenderer({ data, costData }: NamespaceRendererProps) {
  const status = data.status || {}
  const phase = status.phase

  // Cost split percentages — computed before render
  const storageCost = costData?.storageCost ?? 0
  const gpuCost = costData?.gpuCost ?? 0
  const costTotal = costData
    ? costData.cpuCost + costData.memoryCost + storageCost + gpuCost
    : 0
  const cpuPct = costTotal > 0 ? (costData!.cpuCost / costTotal) * 100 : 0
  const memPct = costTotal > 0 ? (costData!.memoryCost / costTotal) * 100 : 0
  const storagePct = costTotal > 0 ? (storageCost / costTotal) * 100 : 0
  const gpuPct = costTotal > 0 ? (gpuCost / costTotal) * 100 : 0

  return (
    <>
      {/* Status */}
      <Section title="Status" icon={Globe}>
        <PropertyList>
          <Property
            label="Phase"
            value={
              phase ? (
                <span
                  className={clsx(
                    'px-2 py-0.5 rounded text-xs font-medium',
                    phase === 'Active'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  )}
                >
                  {phase}
                </span>
              ) : (
                '-'
              )
            }
          />
        </PropertyList>
      </Section>

      {/* Cost (from OpenCost) */}
      {costData && (
        <Section title="Cost" icon={DollarSign} defaultExpanded>
          <PropertyList>
            <Property
              label="Daily"
              value={formatCost(toDailyCost(costData.hourlyCost))}
            />
            <Property
              label="Monthly (est.)"
              value={`~${formatCost(costData.hourlyCost * 730)}`}
            />
          </PropertyList>
          <div className="mt-3 pt-3 border-t border-theme-border space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-theme-text-tertiary">CPU</span>
              <span className="text-theme-text-secondary tabular-nums">
                {formatCost(toDailyCost(costData.cpuCost))}/day
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-theme-text-tertiary">Memory</span>
              <span className="text-theme-text-secondary tabular-nums">
                {formatCost(toDailyCost(costData.memoryCost))}/day
              </span>
            </div>
            {storageCost > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-theme-text-tertiary">
                  Storage (PV/PVC)
                </span>
                <span className="text-theme-text-secondary tabular-nums">
                  {formatCost(toDailyCost(storageCost))}/day
                </span>
              </div>
            )}
            {gpuCost > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-theme-text-tertiary">GPU</span>
                <span className="text-theme-text-secondary tabular-nums">
                  {formatCost(toDailyCost(gpuCost))}/day
                </span>
              </div>
            )}
            {/* CPU/Memory/Storage split bar */}
            {costTotal > 0 && (
              <div className="h-1.5 rounded-full overflow-hidden bg-theme-hover flex mt-1">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${cpuPct}%` }}
                />
                <div
                  className="h-full bg-purple-500"
                  style={{ width: `${memPct}%` }}
                />
                {storagePct > 0 && (
                  <div
                    className="h-full bg-teal-500"
                    style={{ width: `${storagePct}%` }}
                  />
                )}
                {gpuPct > 0 && (
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: `${gpuPct}%` }}
                  />
                )}
              </div>
            )}
            {costData.efficiency !== undefined && (
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-theme-text-tertiary">Efficiency</span>
                <span
                  className={clsx(
                    'font-medium tabular-nums',
                    efficiencyColor(costData.efficiency)
                  )}
                >
                  {costData.efficiency.toFixed(0)}%
                </span>
              </div>
            )}
          </div>
          <div className="mt-2 text-[10px] text-theme-text-quaternary">
            Powered by OpenCost
          </div>
        </Section>
      )}
    </>
  )
}
