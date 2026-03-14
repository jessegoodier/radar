# OpenCost UI Surfaces

This document maps every place in the Radar frontend where OpenCost cost data is displayed, and identifies where cost data could be surfaced in the future.

---

## Current UI Surfaces

### 1. API Hooks & Types (`web/src/api/client.ts`)

| Hook | Endpoint | Refresh |
|------|----------|---------|
| `useOpenCostSummary()` | `GET /api/opencost/summary` | 60s |
| `useOpenCostWorkloads(namespace)` | `GET /api/opencost/workloads?namespace=X` | on-demand |
| `useOpenCostTrend(range)` | `GET /api/opencost/trend?range=6h\|24h\|7d` | 120s |
| `useOpenCostNodes()` | `GET /api/opencost/nodes` | 120s |

Key types: `OpenCostSummary`, `OpenCostNamespaceCost`, `OpenCostWorkloadCost`, `OpenCostTrendSeries`, `OpenCostNodeCost`, `CostUnavailableReason`.

---

### 2. Dashboard Cost Card (`web/src/components/home/CostCard.tsx`)

**Location:** Home/dashboard view, rendered inside `HomeView` in a 2-column grid alongside the Topology, Helm, Activity, Traffic, and Certificate cards.

**Data shown:**
- Total cluster hourly cost and projected monthly cost
- Top 5 namespaces with horizontal cost bars
- Currency and "1h window" label
- "+N more namespaces" count if > 5

**Behavior:**
- Hidden entirely when `data.available` is false (no empty placeholder)
- Clicking the card navigates to the full Cost Insights view (`/cost`)

---

### 3. Cost Insights View (`web/src/components/cost/CostView.tsx`)

**Location:** Full-page view at `/cost`, accessible only via the dashboard card or direct URL. Not included in the main navigation tabs.

#### Header
- Cluster efficiency percentage and estimated idle cost
- Total hourly cost and projected monthly cost
- "Based on last 1h average" note

#### Resource Cost Split Bar
- Stacked horizontal bar: CPU (blue), Memory (purple), Storage (teal, if present)
- Legend with per-resource-type cost amounts

#### Cost Trend Chart (`web/src/components/cost/CostTrendChart.tsx`)
- SVG stacked area chart; 9-color palette
- Time range selector: 6h / 24h (default) / 7d
- X-axis: timestamps (date label for points > 36h ago, time otherwise)
- Interactive hover: vertical crosshair + tooltip showing per-namespace breakdown and total

#### Namespace Breakdown Table
- Columns: Namespace, Hourly, Monthly, Efficiency, CPU/Memory split bar, Cost Split
- Sortable; efficiency color-coded: green ≥ 50%, amber 25–50%, red < 25%
- Expandable rows load per-workload costs on demand (`useOpenCostWorkloads`)

#### Workload Rows (nested under namespaces)
- Columns: Kind badge, Name, Hourly, Monthly, Efficiency, CPU/Memory bar
- Replica count indicator
- Warning highlight for efficiency < 25%

#### Node Costs Table
- Columns: Node name, Instance Type, Region, Hourly, Monthly, CPU cost, Memory cost
- Sorted by hourly cost descending

#### Help Dialog
- Explains allocation vs. usage, efficiency thresholds, time context, and node pricing

#### Footer
- Currency, "based on last 1h average", "730 hrs/mo" projection disclaimer, "Powered by OpenCost" attribution

---

### 4. Routing (`web/src/App.tsx`)

- `'cost'` is a member of the `ExtendedMainView` union type
- Path `/cost` maps `mainView` to `'cost'` and renders `<CostView>`
- **Not** a main navigation tab — entry point is only the dashboard card or a direct URL

---

## Where Cost Could Be Added

These are integration points where cost data would be a natural fit, roughly ordered by value vs. effort:

2. **Namespace resource drawer / detail view** — When a user opens a Namespace resource, show that namespace's hourly cost and efficiency pulled from the summary response.

3. **Node detail view** — Embed the node's hourly cost, instance type, and CPU/memory pricing from `useOpenCostNodes` in the node resource detail view.

4. **Workload / Deployment detail view** — Surface a per-workload cost row (hourly cost, efficiency, replica count) from `useOpenCostWorkloads` inside the deployment or statefulset detail drawer.

5. **Topology node overlays** — Cost badges or efficiency-based color coding on namespace and workload nodes in the topology graph, so cost is visible without leaving the topology view.

6. **Resources list smart column** — Add an optional "Hourly Cost" smart column to the Namespace resource browser, similar to how other integrations add contextual columns (e.g., Karpenter limits, cert expiry).

7. **Timeline events** — Surface cost anomalies (sudden spikes, efficiency drops below threshold) as timeline entries, correlating cost changes with resource events.
