import type { AsnDetail } from "../hooks/useAsnDetail"

type Props = {
  asn: AsnDetail
}

export function AsnHeaderCard({ asn }: Props) {
  return (
    <div className="card mb-5">
      <div className="card-body d-flex align-items-center gap-5">

        <div className="symbol symbol-100px">
          <img
            src={asn.fotoUrl ?? "/media/avatars/blank.png"}
            alt="foto asn"
          />
        </div>

        <div className="flex-grow-1">

          <h3 className="fw-bold mb-1">{asn.nama}</h3>

          <div className="text-muted mb-2">
            NIP: {asn.nip}
          </div>

          <div className="d-flex flex-wrap gap-6">

            <div>
              <div className="text-muted fs-7">Status ASN</div>
              <div className="fw-semibold">
                {asn.statusAsn ?? "-"}
              </div>
            </div>

            <div>
              <div className="text-muted fs-7">Jabatan</div>
              <div className="fw-semibold">
                {asn.jabatan ?? "-"}
              </div>
            </div>

            <div>
              <div className="text-muted fs-7">Unit Kerja</div>
              <div className="fw-semibold">
                {asn.unitKerja ?? "-"}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}