import { Injectable } from "@nestjs/common"

import { QueryStatisticsDto } from "./dto/query-statistics.dto"
import { QueryEmployeeReportExportDto } from "./dto/query-employee-report-export.dto"
import type {
  EmployeeReportRow,
  EmployeeReportsResponse,
  EmployeeReportSectionKey,
  EmployeeReportMatrixCell,
  EmployeeEducationStatusMatrixRow,
  EmployeeEducationStatusMatrixGroup
} from "./types/employee-report.types"

import { PrismaService } from "@/prisma/prisma.service"
import { UnorTreeService } from "./services/unor-tree.service"
import { StatisticsCacheService } from "./services/statistics-cache.service"
import { StatisticsEngineService } from "./services/statistics-engine.service"

import { buildUnorWhere } from "./utils/build-unor-filter.util"
import { buildStatisticsKey } from "./utils/statistics-key.util"
import { normalizeBigInt } from "@/utils/normalizeBigInt"

@Injectable()
export class StatisticsService {

  constructor(
    private prisma: PrismaService,
    private unorTreeService: UnorTreeService,
    private cache: StatisticsCacheService,
    private engine: StatisticsEngineService
  ) {}

  private formatGeneratedAt(date: Date) {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "Asia/Jakarta"
    }).format(date)
  }

  private normalizeLabel(value?: string | null) {
    return (value ?? "").replace(/\s+/g, " ").trim()
  }

  private getGenderBucket(value?: { nama?: string | null; kode?: string | null } | null) {
    const raw = `${value?.kode ?? ""} ${value?.nama ?? ""}`.toLowerCase()

    if (
      raw.includes("laki") ||
      raw.includes("pria") ||
      raw.includes("male") ||
      /\b(l|lk)\b/.test(raw)
    ) {
      return "pria" as const
    }

    if (
      raw.includes("perempuan") ||
      raw.includes("wanita") ||
      raw.includes("female") ||
      /\b(p|pr)\b/.test(raw)
    ) {
      return "wanita" as const
    }

    return null
  }

  private getStatusAsnLabel(status?: string | null) {
    switch (status) {
      case "PNS":
        return "PNS"
      case "PPPK":
        return "PPPK"
      case "PPPK_PARUH_WAKTU":
        return "PPPK Paruh Waktu"
      default:
        return "Tidak Diketahui"
    }
  }

  private getEducationGroupLabel(name?: string | null) {
    const value = this.normalizeLabel(name).toLowerCase()

    if (!value) {
      return "Tidak Diketahui"
    }

    if (
      /^(sd|smp|sma|smk|slta|sltp|mi|mts|ma)\b/.test(value) ||
      value.includes("sekolah dasar") ||
      value.includes("sekolah menengah") ||
      value.includes("madrasah") ||
      value.includes("paket")
    ) {
      return "Dasar & Menengah"
    }

    if (/^d[1-4]\b/.test(value) || value.includes("diploma")) {
      return "Diploma"
    }

    return "Perguruan Tinggi"
  }

  private getGolonganLabel(kode?: string | null, nama?: string | null) {
    const normalizedKode = this.normalizeLabel(kode)
    const normalizedNama = this.normalizeLabel(nama)

    return normalizedKode || normalizedNama || "Tidak Diketahui"
  }

  private getGolonganMajorLabel(kode?: string | null) {
    const value = this.normalizeLabel(kode).toUpperCase()

    if (!value) {
      return "Tidak Diketahui"
    }

    if (/^(IV|4)/.test(value)) return "IV"
    if (/^(III|3)/.test(value)) return "III"
    if (/^(II|2)/.test(value)) return "II"
    if (/^(I|1)/.test(value)) return "I"

    return "Tidak Diketahui"
  }

  private isPppk(status?: string | null) {
    return status === "PPPK" || status === "PPPK_PARUH_WAKTU"
  }

  private isStruktural(jenisJabatan?: string | null, jenisJabatanId?: string | null) {
    const value = this.normalizeLabel(jenisJabatan).toLowerCase()
    return jenisJabatanId === "1" || value.includes("struktural")
  }

  private isFungsional(jenisJabatan?: string | null, jenisJabatanId?: string | null) {
    const value = this.normalizeLabel(jenisJabatan).toLowerCase()
    return jenisJabatanId === "2" || value.includes("fungsional")
  }

  private isHealthPosition(jabatanName?: string | null) {
    const value = this.normalizeLabel(jabatanName).toLowerCase()
    return (
      value.includes("dokter") ||
      value.includes("perawat") ||
      value.includes("bidan") ||
      value.includes("apoteker") ||
      value.includes("farmasi") ||
      value.includes("sanitarian") ||
      value.includes("gizi") ||
      value.includes("kesehatan")
    )
  }

  private isGuruPosition(jabatanName?: string | null) {
    const value = this.normalizeLabel(jabatanName).toLowerCase()
    return value.includes("guru") || value.includes("kepala sekolah")
  }

  private getJabatanJenjangLabel(employee: {
    statusAsn?: string | null
    jenisJabatanName?: string | null
    jenisJabatanId?: string | null
  }) {
    if (this.isPppk(employee.statusAsn)) {
      return "PPPK"
    }

    if (this.isStruktural(employee.jenisJabatanName, employee.jenisJabatanId)) {
      return "Struktural"
    }

    if (this.isFungsional(employee.jenisJabatanName, employee.jenisJabatanId)) {
      return "Fungsional"
    }

    if (this.normalizeLabel(employee.jenisJabatanName)) {
      return "Pelaksana"
    }

    return "Tidak Diketahui"
  }

  private emptyMatrixCell(): EmployeeReportMatrixCell {
    return { pria: 0, wanita: 0, total: 0 }
  }

  private createEducationMatrixRow(
    statusKey: "pns" | "pppk" | "pppkParuhWaktu",
    statusLabel: string
  ): EmployeeEducationStatusMatrixRow {
    return {
      statusKey,
      statusLabel,
      pns: this.emptyMatrixCell(),
      pppk: this.emptyMatrixCell(),
      pppkParuhWaktu: this.emptyMatrixCell(),
      total: this.emptyMatrixCell()
    }
  }

  private addToMatrixCell(
    cell: EmployeeReportMatrixCell,
    gender: "pria" | "wanita" | null
  ) {
    cell.total += 1

    if (gender === "pria") {
      cell.pria += 1
    } else if (gender === "wanita") {
      cell.wanita += 1
    }
  }

  private getEducationStatusKey(status?: string | null) {
    if (status === "PNS") {
      return "pns" as const
    }

    if (status === "PPPK") {
      return "pppk" as const
    }

    if (status === "PPPK_PARUH_WAKTU") {
      return "pppkParuhWaktu" as const
    }

    return null
  }

  private buildEducationMatrixSummary(
    groups: EmployeeEducationStatusMatrixGroup[]
  ): EmployeeEducationStatusMatrixRow {
    const summary = {
      statusKey: "pns",
      statusLabel: "Grand Total",
      pns: this.emptyMatrixCell(),
      pppk: this.emptyMatrixCell(),
      pppkParuhWaktu: this.emptyMatrixCell(),
      total: this.emptyMatrixCell()
    } satisfies EmployeeEducationStatusMatrixRow

    for (const group of groups) {
      const subtotal = group.subtotal

      summary.pns.pria += subtotal.pns.pria
      summary.pns.wanita += subtotal.pns.wanita
      summary.pns.total += subtotal.pns.total

      summary.pppk.pria += subtotal.pppk.pria
      summary.pppk.wanita += subtotal.pppk.wanita
      summary.pppk.total += subtotal.pppk.total

      summary.pppkParuhWaktu.pria += subtotal.pppkParuhWaktu.pria
      summary.pppkParuhWaktu.wanita += subtotal.pppkParuhWaktu.wanita
      summary.pppkParuhWaktu.total += subtotal.pppkParuhWaktu.total

      summary.total.pria += subtotal.total.pria
      summary.total.wanita += subtotal.total.wanita
      summary.total.total += subtotal.total.total
    }

    return summary
  }

  private addGenderCount(
    target: Map<string, { pria: number; wanita: number; total: number }>,
    label: string,
    gender: "pria" | "wanita" | null
  ) {
    const current = target.get(label) ?? { pria: 0, wanita: 0, total: 0 }

    current.total += 1

    if (gender === "pria") {
      current.pria += 1
    } else if (gender === "wanita") {
      current.wanita += 1
    }

    target.set(label, current)
  }

  private toRows(
    source: Map<string, { pria: number; wanita: number; total: number }>,
    sort: (a: string, b: string) => number
  ): EmployeeReportRow[] {
    const rows = Array.from(source.entries())
      .sort(([left], [right]) => sort(left, right))
      .map(([label, count]) => ({
        label,
        pria: count.pria,
        wanita: count.wanita,
        total: count.total
      }))

    if (rows.length === 0) {
      return []
    }

    const total = rows.reduce(
      (acc, row) => {
        acc.pria += row.pria
        acc.wanita += row.wanita
        acc.total += row.total
        return acc
      },
      { pria: 0, wanita: 0, total: 0 }
    )

    rows.push({
      label: "Total",
      pria: total.pria,
      wanita: total.wanita,
      total: total.total
    })

    return rows
  }

  private sortByExplicitOrder(order: string[]) {
    return (left: string, right: string) => {
      const leftIndex = order.indexOf(left)
      const rightIndex = order.indexOf(right)
      const safeLeft = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex
      const safeRight = rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex

      if (safeLeft !== safeRight) {
        return safeLeft - safeRight
      }

      return left.localeCompare(right, "id")
    }
  }

  private getEducationSortRank(label: string) {
    const value = label.toLowerCase()

    if (value.startsWith("sd")) return 1
    if (value.startsWith("smp")) return 2
    if (value.startsWith("sma") || value.startsWith("smk") || value.startsWith("ma")) return 3
    if (value.startsWith("d1")) return 4
    if (value.startsWith("d2")) return 5
    if (value.startsWith("d3")) return 6
    if (value.startsWith("d4")) return 7
    if (value.startsWith("s1")) return 8
    if (value.includes("profesi")) return 9
    if (value.startsWith("s2")) return 10
    if (value.includes("spesialis")) return 11
    if (value.startsWith("s3")) return 12
    if (value.includes("tidak diketahui")) return 99
    return 50
  }

  private sortEducationRows(left: string, right: string) {
    const rankDiff = this.getEducationSortRank(left) - this.getEducationSortRank(right)
    return rankDiff !== 0 ? rankDiff : left.localeCompare(right, "id")
  }

  private getGolonganDetailSortValue(label: string) {
    const value = label.toUpperCase()
    if (value.includes("TIDAK")) return "ZZZ"
    return value
  }

  private sortGolonganDetailRows(left: string, right: string) {
    return this.getGolonganDetailSortValue(left).localeCompare(
      this.getGolonganDetailSortValue(right),
      "id"
    )
  }

  private getEselonRank(value?: string | null) {
    const normalized = this.normalizeLabel(value).toUpperCase()
    const order = ["I", "II", "III", "IV", "V"]

    for (let index = 0; index < order.length; index += 1) {
      if (normalized.startsWith(order[index])) {
        return index + 1
      }
    }

    return 99
  }

  private buildReportTableHtml(
    title: string,
    firstColumnLabel: string,
    rows: EmployeeReportRow[]
  ) {
    const body =
      rows.length > 0
        ? rows
            .map(
              (row) => `
                <tr${row.label.toLowerCase() === "total" ? ' class="is-total"' : ""}>
                  <td>${row.label}</td>
                  <td class="num">${row.pria}</td>
                  <td class="num">${row.wanita}</td>
                  <td class="num">${row.total}</td>
                </tr>
              `
            )
            .join("")
        : `
            <tr>
              <td colspan="4">Belum ada data</td>
            </tr>
          `

    return `
      <section class="report-block">
        <div class="report-title">${title}</div>
        <table>
          <thead>
            <tr>
              <th>${firstColumnLabel}</th>
              <th>Pria</th>
              <th>Wanita</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>${body}</tbody>
        </table>
      </section>
    `
  }

  private pickReportSections(
    data: EmployeeReportsResponse,
    section: EmployeeReportSectionKey
  ) {
    if (section === "jenis-kelamin") {
      return [
        {
          title: "1. Rekap Pegawai berdasarkan Jenis Kelamin",
          firstColumnLabel: "Uraian",
          rows: data.genderByEmploymentStatus
        }
      ]
    }

    if (section === "pendidikan") {
      return [
        {
          title: "2. Rekap Pegawai berdasarkan Pendidikan & Jenis Kelamin",
          firstColumnLabel: "Pendidikan",
          rows: data.educationByGender
        },
        {
          title: "3. Rekap Pendidikan (Kelompok Besar)",
          firstColumnLabel: "Kategori",
          rows: data.educationGroupByGender
        }
      ]
    }

    if (section === "golongan") {
      return [
        {
          title: "4. Rekap Pegawai berdasarkan Golongan",
          firstColumnLabel: "Golongan",
          rows: data.golonganByGender
        },
        {
          title: "5. Rekap Pegawai berdasarkan Golongan Ruang (Detail)",
          firstColumnLabel: "Golongan",
          rows: data.golonganRuangByGender
        }
      ]
    }

    return [
      {
        title: "6. Rekap Pegawai berdasarkan Jenjang Jabatan",
        firstColumnLabel: "Jabatan",
        rows: data.jabatanJenjangByGender
      },
      {
        title: "7. Rincian Pegawai Berdasarkan Jabatan Struktural",
        firstColumnLabel: "Jabatan",
        rows: data.jabatanStrukturalDetail
      },
      {
        title: "8. Rincian Pegawai Berdasarkan Jabatan Tenaga Kesehatan",
        firstColumnLabel: "Jabatan",
        rows: data.jabatanFungsionalKesehatan
      },
      {
        title: "9. Rincian Pegawai Berdasarkan Jabatan Guru",
        firstColumnLabel: "Jabatan",
        rows: data.jabatanFungsionalGuru
      },
      {
        title: "10. Rincian Pegawai Berdasarkan Jabatan Fungsional Lainnya",
        firstColumnLabel: "Jabatan",
        rows: data.jabatanFungsionalLainnya
      }
    ]
  }

  private buildExportHtml(
    title: string,
    filterLabel: string,
    sections: Array<{ title: string; firstColumnLabel: string; rows: EmployeeReportRow[] }>
  ) {
    const tables = sections
      .map((section) =>
        this.buildReportTableHtml(section.title, section.firstColumnLabel, section.rows)
      )
      .join("")

    return `<!doctype html>
    <html lang="id">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #0f172a; }
          h1 { margin: 0 0 8px; font-size: 28px; }
          .meta { margin-bottom: 18px; color: #475569; font-size: 14px; }
          .report-block { margin-bottom: 24px; page-break-inside: avoid; }
          .report-title { background: #243068; color: #fff; padding: 12px 14px; font-size: 18px; font-weight: 700; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #d8e0ef; padding: 10px 12px; }
          th { text-align: left; background: #f8fafc; }
          .num { text-align: right; }
          .is-total td { font-weight: 700; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="meta">Unit aktif: ${filterLabel}</div>
        ${tables}
        <script>
          window.addEventListener('load', function () {
            setTimeout(function () { window.print(); }, 200);
          });
        </script>
      </body>
    </html>`
  }

  private buildEducationMatrixExportHtml(
    title: string,
    filterLabel: string,
    report: EmployeeReportsResponse
  ) {
    const groups = report.educationStatusMatrix.groups
    const grandTotal = report.educationStatusMatrix.grandTotal

    const rows = groups
      .map((group) => `
        <tr>
          <td>${group.groupLabel}</td>
          <td class="num">${group.subtotal.pns.pria || "-"}</td>
          <td class="num">${group.subtotal.pns.wanita || "-"}</td>
          <td class="num">${group.subtotal.pns.total || "-"}</td>
          <td class="num">${group.subtotal.pppk.pria || "-"}</td>
          <td class="num">${group.subtotal.pppk.wanita || "-"}</td>
          <td class="num">${group.subtotal.pppk.total || "-"}</td>
          <td class="num">${group.subtotal.pppkParuhWaktu.pria || "-"}</td>
          <td class="num">${group.subtotal.pppkParuhWaktu.wanita || "-"}</td>
          <td class="num">${group.subtotal.pppkParuhWaktu.total || "-"}</td>
          <td class="num">${group.subtotal.total.pria || "-"}</td>
          <td class="num">${group.subtotal.total.wanita || "-"}</td>
          <td class="num">${group.subtotal.total.total || "-"}</td>
        </tr>
      `)
      .join("")

    return `<!doctype html>
    <html lang="id">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #0f172a; }
          h1 { margin: 0 0 8px; font-size: 28px; }
          .meta { margin-bottom: 18px; color: #475569; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #d8e0ef; padding: 8px 10px; }
          th { text-align: center; background: #f8fafc; }
          td { vertical-align: middle; }
          .num { text-align: right; }
          .grand-total td { font-weight: 700; background: #faf7ef; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="meta">Unit aktif: ${filterLabel}</div>
        <table>
          <thead>
            <tr>
              <th rowspan="2" style="text-align:left">Pendidikan</th>
              <th colspan="3">PNS</th>
              <th colspan="3">PPPK</th>
              <th colspan="3">PPPK Paruh Waktu</th>
              <th colspan="3">Total</th>
            </tr>
            <tr>
              <th>P</th><th>W</th><th>Ttl</th>
              <th>P</th><th>W</th><th>Ttl</th>
              <th>P</th><th>W</th><th>Ttl</th>
              <th>P</th><th>W</th><th>Ttl</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
            <tr class="grand-total">
              <td>${grandTotal.statusLabel}</td>
              <td class="num">${grandTotal.pns.pria || "-"}</td>
              <td class="num">${grandTotal.pns.wanita || "-"}</td>
              <td class="num">${grandTotal.pns.total || "-"}</td>
              <td class="num">${grandTotal.pppk.pria || "-"}</td>
              <td class="num">${grandTotal.pppk.wanita || "-"}</td>
              <td class="num">${grandTotal.pppk.total || "-"}</td>
              <td class="num">${grandTotal.pppkParuhWaktu.pria || "-"}</td>
              <td class="num">${grandTotal.pppkParuhWaktu.wanita || "-"}</td>
              <td class="num">${grandTotal.pppkParuhWaktu.total || "-"}</td>
              <td class="num">${grandTotal.total.pria || "-"}</td>
              <td class="num">${grandTotal.total.wanita || "-"}</td>
              <td class="num">${grandTotal.total.total || "-"}</td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>`
  }

  /**
   * Build WHERE filter untuk seluruh query
   */
  private async buildWhere(query: QueryStatisticsDto) {

    let unorIds: bigint[] | undefined

    if (query.unorId) {
      unorIds = await this.unorTreeService.getSubtreeIds(
        BigInt(query.unorId)
      )
    }

    return {
      deletedAt: null,
      statusAktif: true,
      ...buildUnorWhere(unorIds)
    }
  }

  /**
   * Endpoint utama statistik ASN
   * GET /statistics/asn
   */
  async getAsnStatistics(query: QueryStatisticsDto) {

    const cacheKey = buildStatisticsKey(query)

    const cached = this.cache.get(cacheKey)

    if (cached) {
      return cached
    }

    const where = await this.buildWhere(query)

    const result = await this.engine.run(where)

    const normalized = normalizeBigInt(result)

    this.cache.set(cacheKey, normalized)

    return normalized
  }

  /**
   * Ambil bagian analytics tertentu
   */
  async getAnalytics(type: string, query: QueryStatisticsDto) {

    const data = await this.getAsnStatistics(query)

    switch (type) {

      case "summary":
        return data.summary

      case "distribution":
        return data.distribution

      case "organization":
        return data.organization

      case "retirement":
        return data.retirement

      case "workforce":
        return data.workforce

      case "ranking":
        return data.ranking

      default:
        return data
    }
  }

  async getEmployeeReports(query: QueryStatisticsDto): Promise<EmployeeReportsResponse> {
    const where = await this.buildWhere(query)

    const [employees, unor, pendidikanTingkatRefs] = await Promise.all([
      this.prisma.silakapPegawai.findMany({
        where,
        select: {
          statusAsn: true,
          jenisKelamin: {
            select: {
              nama: true,
              kode: true
            }
          },
          pendidikanTingkat: {
            select: {
              id: true,
              nama: true
            }
          },
          golonganAktif: {
            select: {
              kode: true,
              nama: true
            }
          },
          jenisJabatan: {
            select: {
              id: true,
              nama: true
            }
          },
          jabatan: {
            select: {
              nama: true,
              eselonId: true
            }
          }
        }
      }),
      query.unorId
        ? this.prisma.refUnor.findUnique({
            where: { id: BigInt(query.unorId) },
            select: { nama: true }
          })
        : Promise.resolve(null),
      this.prisma.refPendidikanTingkat.findMany({
        where: {
          isActive: true,
          deletedAt: null
        },
        orderBy: {
          id: "asc"
        },
        select: {
          id: true,
          nama: true
        }
      })
    ])

    const genderByEmploymentStatus = new Map<string, { pria: number; wanita: number; total: number }>()
    const educationByGender = new Map<string, { pria: number; wanita: number; total: number }>()
    const educationGroupByGender = new Map<string, { pria: number; wanita: number; total: number }>()
    const golonganByGender = new Map<string, { pria: number; wanita: number; total: number }>()
    const golonganRuangByGender = new Map<string, { pria: number; wanita: number; total: number }>()
    const jabatanJenjangByGender = new Map<string, { pria: number; wanita: number; total: number }>()
    const jabatanFungsionalKesehatan = new Map<string, { pria: number; wanita: number; total: number }>()
    const jabatanFungsionalGuru = new Map<string, { pria: number; wanita: number; total: number }>()
    const jabatanFungsionalLainnya = new Map<string, { pria: number; wanita: number; total: number }>()
    const educationMatrixMap = new Map<string, EmployeeEducationStatusMatrixGroup>()
    const jabatanStrukturalDetail = new Map<
      string,
      { pria: number; wanita: number; total: number; sortRank: number }
    >()

    for (const employee of employees) {
      const gender = this.getGenderBucket(employee.jenisKelamin)
      const statusLabel = this.getStatusAsnLabel(employee.statusAsn)
      const educationLabel =
        this.normalizeLabel(employee.pendidikanTingkat?.nama) || "Tidak Diketahui"
      const educationGroupLabel = this.getEducationGroupLabel(employee.pendidikanTingkat?.nama)
      const golonganLabel = this.getGolonganMajorLabel(employee.golonganAktif?.kode)
      const golonganDetailLabel = this.getGolonganLabel(
        employee.golonganAktif?.kode,
        employee.golonganAktif?.nama
      )
      const jenisJabatanId = employee.jenisJabatan?.id?.toString() ?? null
      const jenisJabatanName = employee.jenisJabatan?.nama ?? null
      const jabatanName = this.normalizeLabel(employee.jabatan?.nama) || "Tidak Diketahui"
      const jabatanJenjangLabel = this.getJabatanJenjangLabel({
        statusAsn: employee.statusAsn,
        jenisJabatanId,
        jenisJabatanName
      })

      this.addGenderCount(genderByEmploymentStatus, statusLabel, gender)
      this.addGenderCount(educationByGender, educationLabel, gender)
      this.addGenderCount(educationGroupByGender, educationGroupLabel, gender)
      this.addGenderCount(golonganByGender, golonganLabel, gender)
      this.addGenderCount(golonganRuangByGender, golonganDetailLabel, gender)
      this.addGenderCount(jabatanJenjangByGender, jabatanJenjangLabel, gender)

      const educationStatusKey = this.getEducationStatusKey(employee.statusAsn)
      const pendidikanTingkatId = employee.pendidikanTingkat?.id?.toString()
      const educationMatrixGroupKey = pendidikanTingkatId ?? "__unknown__"
      const educationMatrixGroupLabel = educationLabel

      let educationGroup = educationMatrixMap.get(educationMatrixGroupKey)

      if (!educationGroup) {
        educationGroup = {
          groupKey: educationMatrixGroupKey,
          groupLabel: educationMatrixGroupLabel,
          pegawaiCount: 0,
          rows: [
            this.createEducationMatrixRow("pns", "PNS"),
            this.createEducationMatrixRow("pppk", "PPPK"),
            this.createEducationMatrixRow("pppkParuhWaktu", "PPPK Paruh Waktu")
          ],
          subtotal: {
            statusKey: "pns",
            statusLabel: "Subtotal",
            pns: this.emptyMatrixCell(),
            pppk: this.emptyMatrixCell(),
            pppkParuhWaktu: this.emptyMatrixCell(),
            total: this.emptyMatrixCell()
          }
        }

        educationMatrixMap.set(educationMatrixGroupKey, educationGroup)
      }

      educationGroup.pegawaiCount += 1

      if (educationStatusKey) {
        const row = educationGroup.rows.find((item) => item.statusKey === educationStatusKey)

        if (row) {
          this.addToMatrixCell(row[educationStatusKey], gender)
          this.addToMatrixCell(row.total, gender)
        }

        this.addToMatrixCell(educationGroup.subtotal[educationStatusKey], gender)
      }

      this.addToMatrixCell(educationGroup.subtotal.total, gender)

      if (this.isStruktural(jenisJabatanName, jenisJabatanId)) {
        const current = jabatanStrukturalDetail.get(jabatanName) ?? {
          pria: 0,
          wanita: 0,
          total: 0,
          sortRank: this.getEselonRank(employee.jabatan?.eselonId)
        }

        current.total += 1

        if (gender === "pria") {
          current.pria += 1
        } else if (gender === "wanita") {
          current.wanita += 1
        }

        current.sortRank = Math.min(current.sortRank, this.getEselonRank(employee.jabatan?.eselonId))
        jabatanStrukturalDetail.set(jabatanName, current)
      }

      if (this.isFungsional(jenisJabatanName, jenisJabatanId)) {
        if (this.isHealthPosition(jabatanName)) {
          this.addGenderCount(jabatanFungsionalKesehatan, jabatanName, gender)
        } else if (this.isGuruPosition(jabatanName)) {
          this.addGenderCount(jabatanFungsionalGuru, jabatanName, gender)
        } else {
          this.addGenderCount(jabatanFungsionalLainnya, jabatanName, gender)
        }
      }
    }

    const generatedAt = new Date()
    const structuralRows = Array.from(jabatanStrukturalDetail.entries())
      .sort(([leftLabel, left], [rightLabel, right]) => {
        if (left.sortRank !== right.sortRank) {
          return left.sortRank - right.sortRank
        }

        return leftLabel.localeCompare(rightLabel, "id")
      })
      .map(([label, count]) => ({
        label,
        pria: count.pria,
        wanita: count.wanita,
        total: count.total
      }))

    if (structuralRows.length > 0) {
      const total = structuralRows.reduce(
        (acc, row) => {
          acc.pria += row.pria
          acc.wanita += row.wanita
          acc.total += row.total
          return acc
        },
        { pria: 0, wanita: 0, total: 0 }
      )

      structuralRows.push({
        label: "Total",
        pria: total.pria,
        wanita: total.wanita,
        total: total.total
      })
    }

    const orderedEducationGroups: EmployeeEducationStatusMatrixGroup[] = []

    for (const ref of pendidikanTingkatRefs) {
      const key = ref.id.toString()
      const existing = educationMatrixMap.get(key)

      if (existing) {
        orderedEducationGroups.push(existing)
        educationMatrixMap.delete(key)
      }
    }

    const remainingEducationGroups = Array.from(educationMatrixMap.values()).sort((left, right) =>
      left.groupLabel.localeCompare(right.groupLabel, "id")
    )

    orderedEducationGroups.push(...remainingEducationGroups)
    const educationGrandTotal = this.buildEducationMatrixSummary(orderedEducationGroups)

    return {
      meta: {
        generatedAt: generatedAt.toISOString(),
        generatedAtLabel: this.formatGeneratedAt(generatedAt),
        filterUnorId: query.unorId ? String(query.unorId) : null,
        filterUnorName: unor?.nama ?? null
      },
      educationStatusMatrix: {
        groups: orderedEducationGroups,
        grandTotal: educationGrandTotal
      },
      genderByEmploymentStatus: this.toRows(
        genderByEmploymentStatus,
        this.sortByExplicitOrder(["PNS", "PPPK", "PPPK Paruh Waktu", "Tidak Diketahui"])
      ),
      educationByGender: this.toRows(educationByGender, this.sortEducationRows.bind(this)),
      educationGroupByGender: this.toRows(
        educationGroupByGender,
        this.sortByExplicitOrder([
          "Dasar & Menengah",
          "Diploma",
          "Perguruan Tinggi",
          "Tidak Diketahui"
        ])
      ),
      golonganByGender: this.toRows(
        golonganByGender,
        this.sortByExplicitOrder(["I", "II", "III", "IV", "Tidak Diketahui"])
      ),
      golonganRuangByGender: this.toRows(
        golonganRuangByGender,
        this.sortGolonganDetailRows.bind(this)
      ),
      jabatanJenjangByGender: this.toRows(
        jabatanJenjangByGender,
        this.sortByExplicitOrder(["Struktural", "Fungsional", "Pelaksana", "PPPK", "Tidak Diketahui"])
      ),
      jabatanStrukturalDetail: structuralRows,
      jabatanFungsionalKesehatan: this.toRows(
        jabatanFungsionalKesehatan,
        (left, right) => left.localeCompare(right, "id")
      ),
      jabatanFungsionalGuru: this.toRows(
        jabatanFungsionalGuru,
        (left, right) => left.localeCompare(right, "id")
      ),
      jabatanFungsionalLainnya: this.toRows(
        jabatanFungsionalLainnya,
        (left, right) => left.localeCompare(right, "id")
      )
    }
  }

  async exportEmployeeReports(query: QueryEmployeeReportExportDto) {
    const section = query.section ?? "jenis-kelamin"
    const format = query.format ?? "excel"
    const report = await this.getEmployeeReports(query)
    const filterLabel = report.meta.filterUnorName ?? "Semua Unit"
    const sections = this.pickReportSections(report, section)
    const exportTitle =
      section === "pendidikan"
        ? "Laporan Pendidikan"
        : section === "golongan"
          ? "Laporan Golongan"
          : section === "jabatan"
            ? "Laporan Jabatan"
            : "Laporan Jenis Kelamin"
    const html =
      section === "pendidikan"
        ? this.buildEducationMatrixExportHtml(exportTitle, filterLabel, report)
        : this.buildExportHtml(exportTitle, filterLabel, sections)

    if (format === "pdf") {
      return {
        contentType: "text/html; charset=utf-8",
        disposition: undefined,
        content: html
      }
    }

    return {
      contentType: "application/vnd.ms-excel; charset=utf-8",
      disposition: `attachment; filename="laporan-pegawai-${section}.xls"`,
      content: `\ufeff${html}`
    }
  }

}
