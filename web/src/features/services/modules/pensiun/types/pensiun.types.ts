export type PensiunStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "VERIFIED"
  | "APPROVED"
  | "REJECTED"
  | "SELESAI"

export interface PensiunItem {
  id: string
  nip: string
  nama: string
  jabatan?: string
  unitKerja: string
  jenisPensiun: string
  tmtPensiun: string
  status: PensiunStatus
  createdAt: string
}

export interface PensiunDokumen {
  id: string
  code: string
  nama: string
  url: string
  uploadedAt: string
}

export interface PensiunTimeline {
  status: PensiunStatus | string
  tanggal: string
  keterangan?: string
  user?: string
}

export interface PensiunDetail extends PensiunItem {
  tanggalUsul: string
  dokumen: PensiunDokumen[]
  timeline: PensiunTimeline[]
}

export interface CreatePensiunPayload {
  nip: string
  jenisPensiun: string
  tmtPensiun: string
}