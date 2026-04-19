import { Injectable } from "@nestjs/common"
import { PrismaService } from "@/prisma/prisma.service"

import { getAsnSummary } from "../queries/asn-summary.query"
import { getAsnGolonganStats } from "../queries/asn-golongan.query"
import { getAsnJabatanStats } from "../queries/asn-jabatan.query"
import { getAsnUsiaStats } from "../queries/asn-usia.query"
import { getAsnOpdStats } from "../queries/asn-opd.query"
import { getAsnRanking } from "../queries/asn-ranking.query"

import { getRetirementPrediction } from "../queries/asn-retirement-prediction.query"
import { getEducationStats } from "../queries/asn-education.query"
import { getGenderStats } from "../queries/asn-gender.query"
import { getRetirementByOpd } from "../queries/asn-retirement-opd.query"
import { getOpdHeatmap } from "../queries/asn-opd-heatmap.query"

import { getWorkforceGap } from "../queries/workforce-gap.query"
import { getWorkforceProjection } from "../queries/workforce-projection.query"
import { getIdealWorkforceByJabatan } from "../queries/workforce-ideal.query"

/**
 * Statistics Engine
 *
 * Menjalankan seluruh query statistik ASN.
 * Semua query dijalankan paralel agar performa optimal.
 */
@Injectable()
export class StatisticsEngineService {

  constructor(private prisma: PrismaService) {}

  async run(where: any) {

    const [
      summary,

      golongan,
      jabatan,
      usia,
      education,
      gender,

      opd,
      heatmap,

      ranking,

      retirementPrediction,
      retirementByOpd,

      workforceGap,
      workforceProjection,
      workforceIdeal

    ] = await Promise.all([

      /** SUMMARY */
      getAsnSummary(this.prisma, where),

      /** DISTRIBUTION */
      getAsnGolonganStats(this.prisma, where),
      getAsnJabatanStats(this.prisma, where),
      getAsnUsiaStats(this.prisma, where),
      getEducationStats(this.prisma, where),
      getGenderStats(this.prisma, where),

      /** ORGANIZATION */
      getAsnOpdStats(this.prisma, where),
      getOpdHeatmap(this.prisma, where),

      /** RANKING */
      getAsnRanking(this.prisma, where),

      /** RETIREMENT ANALYTICS */
      getRetirementPrediction(this.prisma, where),
      getRetirementByOpd(this.prisma),

      /** WORKFORCE PLANNING */
      getWorkforceGap(this.prisma),
      getWorkforceProjection(this.prisma),
      getIdealWorkforceByJabatan(this.prisma)

    ])

    return {
      summary,

      distribution: {
        golongan,
        jabatan,
        usia,
        pendidikan: education,
        gender
      },

      organization: {
        opd,
        heatmap
      },

      ranking,

      retirement: {
        prediction: retirementPrediction,
        byOpd: retirementByOpd
      },

      workforce: {
        gap: workforceGap,
        projection: workforceProjection,
        idealByJabatan: workforceIdeal
      }

    }
  }

}