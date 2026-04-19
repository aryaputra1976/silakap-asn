// src/modules/statistics/workforce/queries/pensiun.query.ts
import { PrismaService } from "@/prisma/prisma.service"

export class PensiunQuery {

  constructor(private prisma: PrismaService) {}

  async countPensiun(unorId: number, tahun: number) {

    const batas = `${tahun}-12-31`

    const rows = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT COUNT(*) as total
      FROM silakap_pegawai p
      JOIN ref_jabatan j ON j.id = p.jabatan_id
      WHERE
        p.unor_id = ?
        AND p.status_aktif = 1
        AND p.status_asn IN ('PNS','PPPK')
        AND p.tanggal_lahir IS NOT NULL
        AND DATE_ADD(p.tanggal_lahir, INTERVAL j.bup YEAR) <= ?
    `, unorId, batas)

    return Number(rows[0]?.total ?? 0)
  }
}