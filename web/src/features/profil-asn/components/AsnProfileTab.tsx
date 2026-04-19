import type { AsnDetail } from "../hooks/useAsnDetail"

type Props = {
  asn: AsnDetail
}

export function AsnProfileTab({ asn }: Props) {
  return (
    <div className="card">
      <div className="card-body">

        <table className="table align-middle">
          <tbody>

            <tr>
              <th style={{ width: 200 }}>Nama</th>
              <td>{asn.nama}</td>
            </tr>

            <tr>
              <th style={{ width: 200 }}>NIP</th>
              <td>{asn.nip}</td>
            </tr>

            <tr>
              <th style={{ width: 200 }}>Status ASN</th>
              <td>{asn.statusAsn ?? "-"}</td>
            </tr>

            <tr>
              <th style={{ width: 200 }}>Jenis Kelamin</th>
              <td>{asn.jenisKelamin?.nama ?? "-"}</td>
            </tr>

            <tr>
              <th style={{ width: 200 }}>Tempat Lahir</th>
              <td>{asn.tempatLahir ?? "-"}</td>
            </tr>

            <tr>
              <th style={{ width: 200 }}>Tanggal Lahir</th>
              <td>
                {asn.tanggalLahir
                  ? new Date(asn.tanggalLahir).toLocaleDateString("id-ID")
                  : "-"}
              </td>
            </tr>

            <tr>
              <th style={{ width: 200 }}>Jabatan</th>
              <td>{asn.jabatan ?? "-"}</td>
            </tr>

            <tr>
              <th style={{ width: 200 }}>Unit Kerja</th>
              <td>{asn.unitKerja ?? "-"}</td>
            </tr>

          </tbody>
        </table>

      </div>
    </div>
  )
}