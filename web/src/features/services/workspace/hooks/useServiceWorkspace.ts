import { useEffect, useMemo, useState } from "react"
import { getServiceList } from "../../base/api/service.api"
import { getServices } from "../../base/registry"
import type {
  ServiceItem,
  ServiceListResponse,
  ServiceStatus,
} from "../../base/types/service.types"

export type WorkspaceServiceItem = ServiceItem & {
  serviceKey: string
  serviceName: string
  pegawaiId?: string
}

export function useServiceWorkspace() {
  const [data, setData] = useState<WorkspaceServiceItem[]>([])
  const [loading, setLoading] = useState(false)

  async function fetchWorkspace() {
    const services = getServices()

    if (services.length === 0) {
      setData([])
      return
    }

    setLoading(true)

    try {
      const responses = await Promise.all(
        services.map(async (service) => {
          const response = await getServiceList<ServiceListResponse>(service.key)

          return (response.data ?? []).map((item) => ({
            id: String(item.id),
            nama: item.pegawai?.nama ?? "-",
            nip: item.pegawai?.nip ?? "-",
            unitKerja: "-",
            jenis: item.jenis?.nama ?? service.name,
            status: item.status,
            createdAt: item.createdAt,
            serviceKey: service.key,
            serviceName: service.name,
            pegawaiId: item.pegawai?.id ? String(item.pegawai.id) : undefined,
          }))
        }),
      )

      setData(responses.flat())
    } catch (error) {
      console.error(error)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchWorkspace()
  }, [])

  const summary = useMemo(() => {
    const counts = data.reduce<Record<string, number>>((acc, item) => {
      acc[item.status] = (acc[item.status] ?? 0) + 1
      return acc
    }, {})

    return {
      total: data.length,
      draft: counts.DRAFT ?? 0,
      submitted: counts.SUBMITTED ?? 0,
      verified: counts.VERIFIED ?? 0,
      returned: counts.RETURNED ?? 0,
      approved: counts.APPROVED ?? 0,
      rejected: counts.REJECTED ?? 0,
      completed: counts.COMPLETED ?? 0,
      syncedSiasn: counts.SYNCED_SIASN ?? 0,
      failedSiasn: counts.FAILED_SIASN ?? 0,
    }
  }, [data])

  return {
    data,
    loading,
    summary,
    reload: fetchWorkspace,
  }
}

export function filterWorkspaceByStatus(
  items: WorkspaceServiceItem[],
  statuses: ServiceStatus[],
) {
  const statusSet = new Set(statuses)
  return items.filter((item) => statusSet.has(item.status))
}

