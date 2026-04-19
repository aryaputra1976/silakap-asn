import type { AsnSummary } from "../../types"

interface Props {
  summary: AsnSummary
}

export default function WorkforceInsight({ summary }: Props) {

  const total = summary?.total ?? 0
  const pns = summary?.pns ?? 0
  const pppk = summary?.pppk ?? 0
  const pppkParuh = summary?.pppkParuhWaktu ?? 0

  const percent = (value: number) =>
    total ? ((value / total) * 100).toFixed(1) : "0"

  return (

    <div className="card">

      <div className="card-header">
        <h3 className="card-title">
          Workforce Insight
        </h3>
      </div>

      <div className="card-body text-sm leading-relaxed space-y-2">

        <p>
          Total ASN daerah saat ini berjumlah{" "}
          <strong>{total.toLocaleString()}</strong> pegawai.
        </p>

        <p>
          Komposisi ASN terdiri dari{" "}
          <strong>{pns.toLocaleString()}</strong> PNS
          ({percent(pns)}%),{" "}
          <strong>{pppk.toLocaleString()}</strong> PPPK
          ({percent(pppk)}%), dan{" "}
          <strong>{pppkParuh.toLocaleString()}</strong> PPPK Paruh Waktu
          ({percent(pppkParuh)}%).
        </p>

        <p>
          Berdasarkan distribusi usia ASN, mayoritas pegawai berada pada
          kelompok usia produktif antara <strong>31–50 tahun</strong>.
        </p>

        <p>
          Komposisi golongan ASN menunjukkan dominasi pada{" "}
          <strong>Golongan III</strong>, yang mencerminkan bahwa sebagian
          besar ASN berada pada jenjang pelaksana dan jabatan fungsional
          pertama.
        </p>

        <p>
          Dengan struktur usia ASN saat ini, dalam beberapa tahun ke depan
          diperkirakan akan terjadi peningkatan jumlah pegawai yang memasuki
          masa pensiun sehingga diperlukan perencanaan kebutuhan ASN yang
          lebih strategis.
        </p>

      </div>

    </div>

  )
}