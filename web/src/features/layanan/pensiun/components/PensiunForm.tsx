import { useState } from "react"
import type { CreatePensiunPayload } from "../api/createPensiun.api"

interface Props {
  onSubmit: (data: CreatePensiunPayload) => void
  loading: boolean
}

export function PensiunForm({
  onSubmit,
  loading,
}: Props) {
  const [form, setForm] = useState<CreatePensiunPayload>({
    tmt_pensiun: "",
    alasan_pensiun_id: 0,
    catatan: "",
  })

  function handleChange(
    key: keyof CreatePensiunPayload,
    value: any
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-5">
        <label className="form-label">
          TMT Pensiun
        </label>
        <input
          type="date"
          className="form-control"
          value={form.tmt_pensiun}
          onChange={(e) =>
            handleChange("tmt_pensiun", e.target.value)
          }
          required
        />
      </div>

      <div className="mb-5">
        <label className="form-label">
          Alasan Pensiun
        </label>
        <input
          type="number"
          className="form-control"
          value={form.alasan_pensiun_id}
          onChange={(e) =>
            handleChange(
              "alasan_pensiun_id",
              Number(e.target.value)
            )
          }
          required
        />
      </div>

      <div className="mb-5">
        <label className="form-label">
          Catatan
        </label>
        <textarea
          className="form-control"
          value={form.catatan}
          onChange={(e) =>
            handleChange("catatan", e.target.value)
          }
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading}
      >
        {loading ? "Menyimpan..." : "Simpan & Ajukan"}
      </button>
    </form>
  )
}