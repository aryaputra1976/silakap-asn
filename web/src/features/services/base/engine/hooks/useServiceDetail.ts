import { useEffect, useState } from "react"
import { getServiceDetail } from "../../api/service.api"
import type {
  ServiceDetailResponse,
  ServiceDetailView,
} from "../../types/service.types"

function mapServiceDetail(
  detail: ServiceDetailResponse
): ServiceDetailView {
  return {
    id: String(detail.id),
    status: detail.status,
    pegawaiId: detail.pegawai?.id
      ? String(detail.pegawai.id)
      : undefined,
    jenisLayananId: detail.jenis?.id
      ? String(detail.jenis.id)
      : undefined,
    nama: detail.pegawai?.nama ?? "-",
    nip: detail.pegawai?.nip ?? "-",
    timeline: (detail.layananLog ?? []).map((item) => ({
      status: item.status,
      tanggal: item.createdAt,
      keterangan: item.keterangan ?? undefined,
    })),
  }
}

export function useServiceDetail(
  service: string,
  id?: string
) {

  const [data, setData] = useState<ServiceDetailView | null>(null)
  const [loading, setLoading] = useState(false)

  async function fetchData() {

    if (!id) return

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
  }, [service, id])

  return {
    data,
    loading,
    reload: fetchData,
  }
}
