import { useEffect, useState } from "react"

import { getServiceDetail } from "../../api/service.api"
import type {
  ServiceDetailResponse,
  ServiceDetailView,
} from "../../types/service.types"

function mapServiceDetail(
  detail: ServiceDetailResponse,
): ServiceDetailView {
  const logTimeline = (detail.layananLog ?? []).map((item) => ({
    status:
      item.toStatus ??
      item.status,
    tanggal: item.createdAt,
    keterangan:
      item.keterangan ??
      item.actionCode ??
      undefined,
    source: "log" as const,
  }))

  const workflowTimeline = (detail.workflowTimeline ?? []).map(
    (item) => ({
      status:
        item.toStatus ??
        item.fromStatus ??
        "-",
      tanggal: item.createdAt,
      keterangan: item.actionCode ?? undefined,
      source: "timeline" as const,
    }),
  )

  const mergedTimeline =
    logTimeline.length > 0
      ? logTimeline
      : workflowTimeline

  return {
    id: String(detail.id),
    status: detail.status,
    currentStepCode: detail.currentStepCode ?? undefined,
    currentRoleCode: detail.currentRoleCode ?? undefined,
    pegawaiId: detail.pegawai?.id
      ? String(detail.pegawai.id)
      : undefined,
    jenisLayananId: detail.jenis?.id
      ? String(detail.jenis.id)
      : undefined,
    nama: detail.pegawai?.nama ?? "-",
    nip: detail.pegawai?.nip ?? "-",
    availableActions: (detail.availableActions ?? []).map(
      (item) => ({
        actionCode: item.actionCode,
        role:
          item.roleRequired ?? item.role ?? undefined,
        toState: item.toState,
        toStepCode: item.toStepCode ?? undefined,
      }),
    ),
    timeline: mergedTimeline,
    checklistItems: detail.checklistUsul ?? [],
    validationIssues: detail.validasiIssues ?? [],
    pensiunDetail: detail.pensiunDetail ?? null,
    jabatanDetail: detail.jabatanDetail ?? null,
  }
}

export function useServiceDetail(
  service: string,
  id?: string,
  enabled = true,
) {
  const [data, setData] = useState<ServiceDetailView | null>(null)
  const [loading, setLoading] = useState(false)

  async function fetchData() {
    if (!enabled || !id) return

    try {
      setLoading(true)

      const res =
        await getServiceDetail<ServiceDetailResponse>(service, id)

      setData(mapServiceDetail(res))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [enabled, service, id])

  return {
    data,
    loading,
    reload: fetchData,
  }
}
