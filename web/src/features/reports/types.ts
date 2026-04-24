export type EmployeeReportRow = {
  label: string
  pria: number
  wanita: number
  total: number
}

export type EmployeeReportSectionKey =
  | "jenis-kelamin"
  | "pendidikan"
  | "golongan"
  | "jabatan"

export type EmployeeReportsMeta = {
  generatedAt: string
  generatedAtLabel: string
  filterUnorId: string | null
  filterUnorName: string | null
}

export type EmployeeReportsResponse = {
  meta: EmployeeReportsMeta
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
