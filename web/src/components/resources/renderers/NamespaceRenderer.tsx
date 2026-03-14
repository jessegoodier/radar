import { NamespaceRenderer as BaseNamespaceRenderer } from '@skyhook-io/k8s-ui/components/resources/renderers/NamespaceRenderer'
import { useOpenCostSummary } from '../../../api/client'

interface NamespaceRendererProps {
  data: any
}

export function NamespaceRenderer({ data }: NamespaceRendererProps) {
  const namespaceName = data.metadata?.name
  const { data: summary } = useOpenCostSummary()
  const costData = summary?.namespaces?.find(n => n.name === namespaceName)

  return <BaseNamespaceRenderer data={data} costData={costData} />
}
