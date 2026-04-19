export const workforceKeys = {
  dashboard: (tahun: number) => ["workforce-dashboard", tahun],
  opd: (tahun: number) => ["workforce-opd", tahun],
  pensionRisk: (tahun: number) => ["workforce-pension-risk", tahun],
  detail: (tahun: number, unorId: number) => [
    "workforce-detail",
    tahun,
    unorId,
  ],
}
