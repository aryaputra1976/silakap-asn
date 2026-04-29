import type { AsnDetail } from "../hooks/useAsnDetail"

type Props = {
  asn: AsnDetail
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="row py-3 border-bottom border-gray-200">
      <div className="col-5 col-md-4">
        <span className="text-muted fw-semibold fs-7 text-uppercase">{label}</span>
      </div>
      <div className="col-7 col-md-8">
        <span className="fw-semibold text-gray-800">{value || "-"}</span>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="text-primary fw-bolder fs-7 text-uppercase mb-3 border-start border-3 border-primary ps-3">
        {title}
      </div>
      {children}
    </div>
  )
}

export function AsnProfileTab({ asn }: Props) {
  const tanggalLahir = asn.tanggalLahir
    ? new Date(asn.tanggalLahir).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header border-0 pt-5 pb-3">
        <div className="card-title fw-bolder text-gray-900">Profil & Identitas</div>
      </div>
      <div className="card-body pt-2">
        <Section title="Identitas Diri">
          <Row label="Nama Lengkap" value={asn.nama} />
          <Row label="NIP" value={asn.nip} />
          <Row label="Jenis Kelamin" value={asn.jenisKelamin?.nama} />
          <Row label="Tempat Lahir" value={asn.tempatLahir} />
          <Row label="Tanggal Lahir" value={tanggalLahir} />
          <Row label="Agama" value={asn.agama} />
          <Row label="Status Perkawinan" value={asn.statusPerkawinan} />
        </Section>

        <Section title="Status Kepegawaian">
          <Row label="Status ASN" value={asn.statusAsn} />
          <Row label="Jabatan" value={asn.jabatan} />
          <Row label="Golongan" value={asn.golongan} />
          <Row label="Unit Kerja" value={asn.unitKerja} />
        </Section>
      </div>
    </div>
  )
}
