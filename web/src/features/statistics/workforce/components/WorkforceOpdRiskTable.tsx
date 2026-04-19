import { WorkforceOpd } from "../types"

interface Props {
  data: WorkforceOpd[]
}

export default function WorkforceOpdRiskTable({ data }: Props) {

  if (!data || data.length === 0) {

    return (

      <div className="card">

        <div className="card-body text-gray-500">
          Data OPD belum tersedia
        </div>

      </div>

    )

  }

  const top =
    [...data]
      .sort((a, b) => b.rekomendasiFormasi - a.rekomendasiFormasi)
      .slice(0, 10)

  return (

    <div className="card">

      {/* CARD HEADER */}

      <div className="card-header border-0 pt-6">

        <div className="card-title">

          <h3 className="fw-bold m-0">
            Top 10 OPD Kekurangan ASN
          </h3>

        </div>

      </div>

      {/* CARD BODY */}

      <div className="card-body pt-2">

        <div className="text-gray-600 fs-7 mb-4">

          Unit organisasi dengan kebutuhan formasi ASN tertinggi
          berdasarkan proyeksi kekurangan ASN dalam 5 tahun ke depan.

        </div>

        {/* TABLE */}

        <div className="table-responsive">

          <table className="table table-row-bordered table-row-dashed align-middle gs-0 gy-4">

            <thead>

              <tr className="fw-bold text-muted bg-light">

                <th style={{ width: 40 }}>
                  #
                </th>

                <th>
                  Unit Organisasi
                </th>

                <th className="text-end">
                  ASN Eksisting
                </th>

                <th className="text-end">
                  Kebutuhan ASN
                </th>

                <th className="text-end">
                  Pensiun 5 Tahun
                </th>

                <th className="text-end">
                  Rekomendasi Formasi
                </th>

              </tr>

            </thead>

            <tbody>

              {top.map((row, i) => (

                <tr key={row.namaUnor}>

                  <td className="text-muted">
                    {i + 1}
                  </td>

                  <td className="fw-semibold text-dark">
                    {row.namaUnor}
                  </td>

                  <td className="text-end">
                    {row.asnEksisting.toLocaleString()}
                  </td>

                  <td className="text-end">
                    {row.kebutuhanAsn.toLocaleString()}
                  </td>

                  <td className="text-end text-warning fw-semibold">
                    {row.pensiun5Tahun.toLocaleString()}
                  </td>

                  <td className="text-end">

                    <span className="badge badge-light-danger fw-bold">
                      {row.rekomendasiFormasi.toLocaleString()}
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {/* FORMULA */}

        <div className="separator my-6"></div>

        <div className="fs-7 text-gray-600">

          <div className="fw-bold mb-2">
            Rumus Perhitungan Rekomendasi Formasi ASN
          </div>

          <div className="bg-light p-3 rounded">

            Rekomendasi Formasi =
            <br />

            <b>
              MAX( Kebutuhan ASN − (ASN Eksisting − Pensiun 5 Tahun), 0 )
            </b>

          </div>

          <div className="mt-3">

            Artinya kebutuhan formasi dihitung dari jumlah ASN
            yang diperlukan setelah memperhitungkan ASN yang
            akan pensiun dalam 5 tahun ke depan.

          </div>

        </div>

      </div>

    </div>

  )

}