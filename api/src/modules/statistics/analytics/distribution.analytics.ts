import { StatisticsAnalytics } from "../engine/analytics.interface"

import { getAsnGolonganStats } from "../queries/asn-golongan.query"
import { getAsnJabatanStats } from "../queries/asn-jabatan.query"
import { getAsnUsiaStats } from "../queries/asn-usia.query"
import { getEducationStats } from "../queries/asn-education.query"
import { getGenderStats } from "../queries/asn-gender.query"

export const DistributionAnalytics: StatisticsAnalytics = {

  key: "distribution",

  async run(prisma, where) {

    const [
      golongan,
      jabatan,
      usia,
      pendidikan,
      gender
    ] = await Promise.all([
      getAsnGolonganStats(prisma, where),
      getAsnJabatanStats(prisma, where),
      getAsnUsiaStats(prisma, where),
      getEducationStats(prisma, where),
      getGenderStats(prisma, where)
    ])

    return {
      golongan,
      jabatan,
      usia,
      pendidikan,
      gender
    }
  }

}