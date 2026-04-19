import { useState } from "react"

interface Props {
  onChange: (filters: {
    search?: string
    status?: string
    jenis?: string
  }) => void
}

export function UniversalQueueToolbar({ onChange }: Props) {

  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [jenis, setJenis] = useState("")

  function apply() {

    onChange({
      ...(search ? { search } : {}),
      ...(status ? { status } : {}),
      ...(jenis ? { jenis } : {}),
    })

  }

  return (

    <div className="d-flex gap-3 mb-5 flex-wrap">

      <input
        className="form-control w-250px"
        placeholder="Cari NIP / Nama"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select
        className="form-select w-200px"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="">Semua Status</option>
        <option value="SUBMITTED">Submitted</option>
        <option value="VERIFIED">Verified</option>
        <option value="APPROVED">Approved</option>
        <option value="REJECTED">Rejected</option>
      </select>

      <select
        className="form-select w-200px"
        value={jenis}
        onChange={(e) => setJenis(e.target.value)}
      >
        <option value="">Semua Layanan</option>
        <option value="PENSIUN">Pensiun</option>
        <option value="BEBAS_HUKDIS">Bebas Hukdis</option>
      </select>

      <button
        type="button"
        className="btn btn-primary"
        onClick={apply}
      >
        Filter
      </button>

    </div>

  )
}