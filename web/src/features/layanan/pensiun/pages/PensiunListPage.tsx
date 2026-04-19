import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { usePensiunList } from "../hooks/usePensiunList"
import { PensiunListToolbar } from "../components/PensiunListToolbar"
import { PensiunListTable } from "../components/PensiunListTable"
import { PensiunListPagination } from "../components/PensiunListPagination"

export default function PensiunListPage() {
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string | undefined>()

  const { data, isLoading } =
    usePensiunList(page, status)

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          Usulan Pensiun Saya
        </h3>
      </div>

      <div className="card-body">
        <PensiunListToolbar
          onFilter={(s) => {
            setStatus(s || undefined)
            setPage(1)
          }}
          onCreate={() =>
            navigate("/layanan/pensiun/create")
          }
        />

        <PensiunListTable
          data={data?.data}
          loading={isLoading}
        />

        {data?.meta && (
          <PensiunListPagination
            page={data.meta.page}
            totalPages={data.meta.totalPages}
            onChange={setPage}
          />
        )}
      </div>
    </div>
  )
}