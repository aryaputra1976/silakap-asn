import { Injectable } from "@nestjs/common"
import { PrismaService } from "@/prisma/prisma.service"

import { WorkforceEngine } from "../workforce.engine"
import { WorkforceRiskEngine } from "../engine/workforce-risk.engine"
import { WorkforceProjectionEngine } from "../engine/workforce-projection.engine"
import { WorkforceAgingEngine } from "../engine/workforce-aging.engine"
import { WorkforceRetirementWaveEngine } from "../engine/workforce-retirement-wave.engine"
import { WorkforceOpdRiskEngine } from "../engine/workforce-opd-risk.engine"

@Injectable()
export class WorkforceService {

  private engine = new WorkforceEngine()
  private riskEngine = new WorkforceRiskEngine()
  private projectionEngine = new WorkforceProjectionEngine()
  private agingEngine = new WorkforceAgingEngine()
  private retirementWaveEngine = new WorkforceRetirementWaveEngine()
  private opdRiskEngine = new WorkforceOpdRiskEngine()

  constructor(private prisma: PrismaService) {}

  /* ======================================================
     WORKFORCE DETAIL PER UNIT
     ====================================================== */

  async calculate(unorId: number, tahun: number) {

    const batas = `${tahun + 4}-12-31`

    const [abk, asnEksisting, pensiunRows, workloadRows] =
      await Promise.all([

        this.prisma.abkHasilPerhitungan.findFirst({
          where: { unorId, tahun }
        }),

        this.prisma.silakapPegawai.count({
          where: {
            unorId,
            statusAktif: true,
            statusAsn: { in: ["PNS", "PPPK"] }
          }
        }),

        this.prisma.$queryRaw<
          { total: bigint }[]
        >`
          SELECT COUNT(*) as total
          FROM silakap_pegawai p
          JOIN ref_jabatan j ON j.id = p.jabatan_id
          WHERE
            p.unor_id = ${unorId}
            AND p.status_aktif = 1
            AND p.status_asn IN ('PNS','PPPK')
            AND p.tanggal_lahir IS NOT NULL
            AND DATE_ADD(p.tanggal_lahir, INTERVAL j.bup YEAR) <= ${batas}
        `,

        this.prisma.abkBebanKerja.findMany({
          where: { unorId, tahun },
          include: { tugas: true }
        })

      ])

    const pensiun5Tahun =
      Number(pensiunRows[0]?.total ?? 0)

    let kebutuhanAsn =
      Number(abk?.kebutuhanAsn ?? 0)

    let totalBebanKerja =
      Number(abk?.totalBeban ?? 0)

    /* fallback jika ABK belum dihitung */

    if (!kebutuhanAsn) {

      const result =
        this.engine.calculate(
          unorId,
          workloadRows,
          asnEksisting
        )

      kebutuhanAsn =
        result.kebutuhanAsn

      totalBebanKerja =
        result.totalBebanKerja

    }

    const gapAsn =
      Math.max(
        kebutuhanAsn - asnEksisting,
        0
      )

    const rekomendasiFormasi =
      gapAsn + pensiun5Tahun

    return {

      totalBebanKerja,
      kebutuhanAsn,
      asnEksisting,

      gapAsn,

      pensiun5Tahun,
      rekomendasiFormasi

    }

  }

/* ======================================================
   WORKFORCE ALL OPD
   ====================================================== */

async calculateAllOpd(tahun: number) {

  const batas =
    `${tahun + 4}-12-31`

  const [
    unors,
    abkRows,
    asnRows,
    pensiunRows
  ] = await Promise.all([

    this.prisma.refUnor.findMany({
      where: { isActive: true },
      select: {
        id: true,
        parentId: true,
        nama: true
      }
    }),

    this.prisma.abkHasilPerhitungan.findMany({
      where: { tahun }
    }),

    this.prisma.$queryRaw<
      { unor_id: bigint; total: bigint }[]
    >`
      SELECT unor_id, COUNT(*) as total
      FROM silakap_pegawai
      WHERE status_aktif = 1
        AND status_asn IN ('PNS','PPPK')
      GROUP BY unor_id
    `,

    this.prisma.$queryRaw<
      { unor_id: bigint; total: bigint }[]
    >`
      SELECT p.unor_id, COUNT(*) as total
      FROM silakap_pegawai p
      JOIN ref_jabatan j ON j.id = p.jabatan_id
      WHERE
        p.status_aktif = 1
        AND p.status_asn IN ('PNS','PPPK')
        AND p.tanggal_lahir IS NOT NULL
        AND DATE_ADD(p.tanggal_lahir, INTERVAL j.bup YEAR) <= ${batas}
      GROUP BY p.unor_id
    `
  ])

  const asnMap =
    new Map<number, number>(
      asnRows.map(r => [
        Number(r.unor_id),
        Number(r.total)
      ])
    )

  const pensiunMap =
    new Map<number, number>(
      pensiunRows.map(r => [
        Number(r.unor_id),
        Number(r.total)
      ])
    )

  const abkMap =
    new Map<number, any>()

  abkRows.forEach(row => {

    abkMap.set(
      Number(row.unorId),
      row
    )

  })

  return unors.map(unor => {

    const unorId =
      Number(unor.id)

    const asnEksisting =
      asnMap.get(unorId) ?? 0

    const pensiun5Tahun =
      pensiunMap.get(unorId) ?? 0

    const abk =
      abkMap.get(unorId)

    const kebutuhanAsn =
      Number(
        abk?.kebutuhanAsn ?? asnEksisting
      )

    const gapAsn =
      Math.max(
        kebutuhanAsn - asnEksisting,
        0
      )

    const rekomendasiFormasi =
      gapAsn + pensiun5Tahun

    return {

      /* WAJIB untuk TREE */

      unorId: unorId,

      parentId:
        unor.parentId
          ? Number(unor.parentId)
          : null,

      namaUnor:
        unor.nama,

      kebutuhanAsn,
      asnEksisting,

      gapAsn,

      pensiun5Tahun,
      rekomendasiFormasi

    }

  })

}

  /* ======================================================
     WORKFORCE DASHBOARD
     ====================================================== */

  async dashboard(tahun?: number) {

    const tahunSekarang =
      tahun ?? new Date().getFullYear()

    const [
      totalAsn,
      projectionRows,
      abkRows,
      pegawaiRows
    ] = await Promise.all([

      this.prisma.silakapPegawai.count({
        where: {
          statusAktif: true,
          statusAsn: { in: ["PNS", "PPPK"] }
        }
      }),

      this.prisma.$queryRaw<
        { tahun: number; total: bigint }[]
      >`
        SELECT
          YEAR(DATE_ADD(p.tanggal_lahir, INTERVAL j.bup YEAR)) AS tahun,
          COUNT(*) as total
        FROM silakap_pegawai p
        JOIN ref_jabatan j ON j.id = p.jabatan_id
        WHERE
          p.status_aktif = 1
          AND p.status_asn IN ('PNS','PPPK')
          AND p.tanggal_lahir IS NOT NULL
        GROUP BY tahun
        ORDER BY tahun
      `,

      this.prisma.abkHasilPerhitungan.findMany({
        where: { tahun: tahunSekarang }
      }),

      this.prisma.silakapPegawai.findMany({
        where: {
          statusAktif: true,
          statusAsn: { in: ["PNS", "PPPK"] },
          tanggalLahir: { not: null }
        },
        select: {
          tanggalLahir: true
        }
      })

    ])

    /* PROJECTION */

    const projectionData =
      projectionRows.map(r => ({
        tahun: Number(r.tahun),
        total: Number(r.total)
      }))

    const projection =
      this.projectionEngine.projection(
        tahunSekarang,
        projectionData
      )

    const totalPensiun =
      projection.reduce(
        (sum, p) => sum + Number(p.pensiun),
        0
      )

    /* TOTAL ABK */

    const totalKebutuhan =
      abkRows.reduce(
        (sum, r) =>
          sum + Number(r.kebutuhanAsn),
        0
      )

    const gapAsn =
      Math.max(
        totalKebutuhan - totalAsn,
        0
      )

    const rekomendasiFormasi =
      gapAsn + totalPensiun

    /* RISK */

    const risk =
      this.riskEngine.calculate(
        totalAsn,
        gapAsn,
        totalPensiun,
        totalKebutuhan,
        projection
      )

    /* AGING */

    const pegawaiAging =
      pegawaiRows.map(p => ({
        tanggal_lahir: p.tanggalLahir as Date
      }))

    const aging =
      this.agingEngine.calculate(
        pegawaiAging
      )

    /* RETIREMENT WAVE */

    const retirementWave =
      this.retirementWaveEngine.calculate(
        tahunSekarang,
        projectionData
      )

    /* OPD RISK */

    const opdRows =
      await this.calculateAllOpd(
        tahunSekarang
      )

    const opdRisk =
      this.opdRiskEngine.calculate(
        opdRows
      )

    return {

      summary: {

        totalAsn,

        totalKebutuhan,

        totalGap:
          gapAsn,

        pensiun5Tahun:
          totalPensiun,

        rekomendasiFormasi

      },

      risk,
      projection,
      aging,
      retirementWave,
      opdRisk

    }

  }

}