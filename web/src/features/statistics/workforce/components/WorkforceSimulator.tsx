interface Props {
  totalAsn: number
  gapAsn: number
  pensiun5Tahun: number
}

export default function WorkforceSimulator({
  totalAsn,
  gapAsn,
  pensiun5Tahun
}: Props) {

  const tersisa =
    (totalAsn ?? 0) - (pensiun5Tahun ?? 0)

  const kebutuhanTotal =
    (gapAsn ?? 0) + (pensiun5Tahun ?? 0)

  return (

    <div className="card">

      <div className="card-header">
        <h3 className="card-title">
          Workforce Recruitment Simulator
        </h3>
      </div>

      <div className="card-body space-y-2">

        <div>ASN Saat Ini: {totalAsn.toLocaleString()}</div>

        <div>ASN Pensiun: {pensiun5Tahun.toLocaleString()}</div>

        <div>ASN Tersisa: {tersisa.toLocaleString()}</div>

        <hr/>

        <div className="fw-bold">
          Total Kebutuhan Rekrutmen:
          {" "}
          {kebutuhanTotal.toLocaleString()}
        </div>

      </div>

    </div>

  )

}