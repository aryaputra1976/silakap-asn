import type { WorkforceOpd } from "../types"

interface Props {
  unit?: WorkforceOpd | null
  onClose: () => void
}

export default function WorkforceUnitDrawer({
  unit,
  onClose
}: Props) {

  if (!unit) return null

  return (

    <div
      className="position-fixed top-0 end-0 h-100 bg-white shadow-lg"
      style={{
        width: 420,
        zIndex: 1050
      }}
    >

      {/* HEADER */}

      <div className="p-6 border-bottom d-flex justify-content-between align-items-center">

        <div>

          <h3 className="fw-bold mb-1">
            Detail Unit
          </h3>

          <div className="text-muted">
            {unit.namaUnor}
          </div>

        </div>

        <button
          className="btn btn-sm btn-light"
          onClick={onClose}
        >
          ✕
        </button>

      </div>

      {/* BODY */}

      <div className="p-6">

        <div className="mb-5">

          <div className="text-muted fs-7">
            ASN Eksisting
          </div>

          <div className="fs-2 fw-bold text-dark">
            {unit.asnEksisting.toLocaleString()}
          </div>

        </div>

        <div className="mb-5">

          <div className="text-muted fs-7">
            Kebutuhan ASN
          </div>

          <div className="fs-2 fw-bold text-primary">
            {unit.kebutuhanAsn.toLocaleString()}
          </div>

        </div>

        <div className="mb-5">

          <div className="text-muted fs-7">
            Gap ASN
          </div>

          <div className="fs-2 fw-bold text-danger">
            {unit.gapAsn.toLocaleString()}
          </div>

        </div>

        <div className="mb-5">

          <div className="text-muted fs-7">
            Pensiun 5 Tahun
          </div>

          <div className="fs-2 fw-bold text-warning">
            {unit.pensiun5Tahun.toLocaleString()}
          </div>

        </div>

        <div>

          <div className="text-muted fs-7">
            Rekomendasi Formasi
          </div>

          <div className="fs-2 fw-bold text-success">
            {unit.rekomendasiFormasi.toLocaleString()}
          </div>

        </div>

      </div>

    </div>

  )

}