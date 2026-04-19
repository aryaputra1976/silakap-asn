import { useUnorOptions } from "../hooks/useUnorOptions"

interface Props {
  search: string
  jabatan: string
  unor?: string | number
  onSearch: (v: string) => void
  onJabatan: (v: string) => void
  onUnor: (v?: string | number) => void
}

export function AsnFilterBar({
  search,
  jabatan,
  unor,
  onSearch,
  onJabatan,
  onUnor
}: Props) {

  const { options } = useUnorOptions()

  return (

    <div className="card mb-5">

      <div className="card-body py-4">

        <div className="row g-3">

          {/* SEARCH */}

          <div className="col-lg-5">

            <input
              type="text"
              placeholder="Cari NIP atau Nama ASN..."
              className="form-control"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
            />

          </div>

          {/* JABATAN */}

          <div className="col-lg-3">

            <select
              className="form-select"
              value={jabatan}
              onChange={(e) => onJabatan(e.target.value)}
            >
              <option value="">Semua Jabatan</option>
              <option value="STRUKTURAL">Struktural</option>
              <option value="FUNGSIONAL">Fungsional</option>
              <option value="PELAKSANA">Pelaksana</option>
            </select>

          </div>

          {/* UNIT */}

          <div className="col-lg-4">

            <select
              className="form-select"
              value={unor ?? ""}
              onChange={(e) => {
                const v = e.target.value
                onUnor(v ? Number(v) : undefined)
              }}
            >
              <option value="">Semua Unit Organisasi</option>

              {options.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nama}
                </option>
              ))}

            </select>

          </div>

        </div>

      </div>

    </div>

  )

}