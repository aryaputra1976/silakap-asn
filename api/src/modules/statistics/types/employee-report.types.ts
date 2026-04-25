export type EmployeeReportRow = {
  label: string
  pria: number
  wanita: number
  total: number
}

export type EmployeeReportMatrixCell = {
  pria: number
  wanita: number
  total: number
}

export type EmployeeEducationStatusMatrixRow = {
  statusKey: "pns" | "pppk" | "pppkParuhWaktu"
  statusLabel: string
  pns: EmployeeReportMatrixCell
  pppk: EmployeeReportMatrixCell
  pppkParuhWaktu: EmployeeReportMatrixCell
  total: EmployeeReportMatrixCell
}

export type EmployeeEducationStatusMatrixGroup = {
  groupKey: string
  groupLabel: string
  pegawaiCount: number
  rows: EmployeeEducationStatusMatrixRow[]
  subtotal: EmployeeEducationStatusMatrixRow
}

export type EmployeeReportSectionKey =
  | "jenis-kelamin"
  | "pendidikan"
  | "golongan"
  | "jabatan"

export type EmployeeReportsResponse = {
  meta: {
    generatedAt: string
    generatedAtLabel: string
    filterUnorId: string | null
    filterUnorName: string | null
  }
  educationStatusMatrix: {
    groups: EmployeeEducationStatusMatrixGroup[]
    grandTotal: EmployeeEducationStatusMatrixRow
  }
  genderByEmploymentStatus: EmployeeReportRow[]
  educationByGender: EmployeeReportRow[]
  educationGroupByGender: EmployeeReportRow[]
  golonganByGender: EmployeeReportRow[]
  golonganRuangByGender: EmployeeReportRow[]
  jabatanJenjangByGender: EmployeeReportRow[]
  jabatanStrukturalDetail: EmployeeReportRow[]
  jabatanFungsionalKesehatan: EmployeeReportRow[]
  jabatanFungsionalGuru: EmployeeReportRow[]
  jabatanFungsionalLainnya: EmployeeReportRow[]
}
