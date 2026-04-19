import { ServiceDocumentConfig } from "../../base/documents/types/document.types"

export const pensiunDocuments: ServiceDocumentConfig[] = [

  {
    key: "dpcp",
    label: "Data Perorangan Calon Penerima Pensiun (DPCP)",
    required: true,
  },

  {
    key: "sk_cpns",
    label: "Fotokopi SK Pengangkatan CPNS",
    required: true,
  },

  {
    key: "sk_pns",
    label: "Fotokopi SK Pengangkatan PNS",
    required: true,
  },

  {
    key: "sk_pangkat_terakhir",
    label: "Fotokopi SK Pangkat Terakhir (2 rangkap)",
    required: true,
  },

  {
    key: "akta_nikah",
    label: "Fotokopi Akta Nikah / Cerai / Akta Kematian Pasangan",
    required: true,
  },

  {
    key: "akta_kelahiran_anak",
    label: "Fotokopi Akta Kelahiran Anak (di bawah 25 tahun dan belum menikah)",
    required: false,
  },

  {
    key: "akta_kematian",
    label: "Akta Kematian",
    required: false,
  },

  {
    key: "surat_janda_duda",
    label: "Surat Keterangan Janda/Duda dari Kelurahan/Desa",
    required: false,
  },

  {
    key: "daftar_susunan_keluarga",
    label: "Daftar Susunan Keluarga disahkan Camat/Lurah/Kepala Desa",
    required: true,
  },

  {
    key: "skp_terakhir",
    label: "Asli SKP 1 Tahun Terakhir",
    required: true,
  },

  {
    key: "surat_tidak_pernah_disiplin",
    label: "Surat Pernyataan Tidak Pernah Dijatuhi Hukuman Disiplin",
    required: true,
  },

  {
    key: "surat_tidak_pidana",
    label: "Surat Pernyataan Tidak Sedang Menjalani Proses Pidana",
    required: true,
  },

  {
    key: "sk_pasangan",
    label: "Fotokopi SK CPNS Pasangan / SK Pensiun Pasangan",
    required: false,
  },

  {
    key: "permohonan_atasan",
    label: "Surat Permohonan Disetujui Atasan Langsung",
    required: true,
  },

  {
    key: "permohonan_bupati",
    label: "Surat Permohonan Disetujui PyB (Bupati)",
    required: true,
  },

  {
    key: "kk",
    label: "Fotokopi Kartu Keluarga (KK)",
    required: true,
  },

  {
    key: "pas_foto",
    label: "Pas Foto 3x4 (1 lembar)",
    required: true,
  },

  {
    key: "riwayat_hidup",
    label: "Daftar Riwayat Hidup PNS",
    required: true,
  },

]