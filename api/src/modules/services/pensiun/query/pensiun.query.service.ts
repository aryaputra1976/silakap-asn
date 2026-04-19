import { BusinessError } from "@/core/errors/business.error"
import { DBClient } from "../types/pensiun.types"

type ListQuery = {
  page?: number | string
  limit?: number | string
}

export class PensiunQueryService {

  async getDetail(
    db: DBClient,
    id: bigint
  ) {

    if (!id) {
      throw new BusinessError(
        "PENSIUN_ID_INVALID",
        "ID pensiun tidak valid"
      )
    }

    const data = await db.silakapPensiunDetail.findUnique({
      where: { id },
      include: {
        perhitungan: {
          select: {
            masaKerjaTahun: true,
            masaKerjaBulan: true,
            gajiPokok: true,
            estimasiPensiun: true
          }
        }
      }
    })

    if (!data) {
      throw new BusinessError(
        "PENSIUN_NOT_FOUND",
        "Data pensiun tidak ditemukan"
      )
    }

    return data

  }

  async list(
    db: DBClient,
    query: ListQuery
  ) {

    const page = Math.max(Number(query.page ?? 1), 1)
    const limit = Math.min(
      Math.max(Number(query.limit ?? 10), 1),
      100
    )

    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([

      db.silakapPensiunDetail.findMany({
        skip,
        take: limit,
        orderBy: { id: "desc" },
        select: {
          id: true,
          usulId: true,
          nipSnapshot: true,
          namaSnapshot: true,
          golonganSnapshot: true,
          jabatanSnapshot: true,
          unitKerjaSnapshot: true,
          tmtPensiun: true
        }
      }),

      db.silakapPensiunDetail.count()

    ])

    return {
      page,
      limit,
      total,
      data
    }

  }

}