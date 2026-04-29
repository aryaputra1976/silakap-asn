import { ServiceSchema } from "../../base/schema/schema.types"

export const peremajaanSchema: ServiceSchema = {
  fields: [
    {
      name: "nip",
      label: "NIP Pegawai",
      type: "text",
      required: true,
    },
    {
      name: "jenisPerubahan",
      label: "Data yang Diubah",
      type: "select",
      required: true,
      options: [
        { label: "Nama Lengkap", value: "NAMA" },
        { label: "NIK (e-KTP)", value: "NIK" },
        { label: "Tempat Lahir", value: "TEMPAT_LAHIR" },
        { label: "Tanggal Lahir", value: "TANGGAL_LAHIR" },
        { label: "Gelar Depan", value: "GELAR_DEPAN" },
        { label: "Gelar Belakang", value: "GELAR_BELAKANG" },
        { label: "Jenis Kelamin", value: "JENIS_KELAMIN" },
        { label: "Agama", value: "AGAMA" },
        { label: "Status Perkawinan", value: "STATUS_PERKAWINAN" },
        { label: "TMT CPNS", value: "TMT_CPNS" },
        { label: "Nomor SK CPNS", value: "SK_CPNS_NOMOR" },
        { label: "Tanggal SK CPNS", value: "SK_CPNS_TANGGAL" },
        { label: "TMT PNS", value: "TMT_PNS" },
        { label: "Nomor SK PNS", value: "SK_PNS_NOMOR" },
        { label: "Tanggal SK PNS", value: "SK_PNS_TANGGAL" },
        { label: "Masa Kerja (Tahun)", value: "MK_TAHUN" },
        { label: "Masa Kerja (Bulan)", value: "MK_BULAN" },
        { label: "Alamat", value: "ALAMAT" },
        { label: "Nomor HP", value: "NO_HP" },
        { label: "Email", value: "EMAIL" },
        { label: "NPWP", value: "NPWP" },
        { label: "BPJS", value: "BPJS" },
        { label: "Nomor Ijazah", value: "NOMOR_IJAZAH" },
        { label: "Nama Sekolah Terakhir", value: "NAMA_SEKOLAH" },
      ],
    },
    {
      name: "nilaiBaru",
      label: "Nilai Baru",
      type: "text",
      required: true,
    },
    {
      name: "keterangan",
      label: "Alasan / Keterangan",
      type: "textarea",
      required: false,
    },
  ],
  documents: [
    {
      code: "surat_permohonan",
      label: "Surat Permohonan",
      required: true,
    },
    {
      code: "bukti_pendukung",
      label: "Dokumen Pendukung (Akta, KTP, dll)",
      required: false,
    },
  ],
}
