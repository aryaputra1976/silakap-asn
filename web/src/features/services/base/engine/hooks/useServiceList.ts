import { useEffect, useState } from "react"
import { getServiceList } from "../../api/service.api"
import {
  ServiceItem,
  ServiceListResponse,
} from "../../types/service.types"

export function useServiceList(service: string) {

  const [data, setData] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(false)

  async function fetchData() {

    try {

      setLoading(true)

      const res =
        await getServiceList<ServiceListResponse>(service)

      setData(
        (res.data ?? []).map((item) => ({
          id: String(item.id),
          nama: item.pegawai?.nama ?? "-",
          nip: item.pegawai?.nip ?? "-",
          unitKerja: "-",
          jenis: item.jenis?.nama ?? service,
          status: item.status,
          createdAt: item.createdAt,
        }))
      )

    } catch (err) {

      console.error(err)

    } finally {

      setLoading(false)

    }

  }

  useEffect(() => {
    fetchData()
  }, [service])

  return {
    data,
    loading,
    reload: fetchData,
  }
}
