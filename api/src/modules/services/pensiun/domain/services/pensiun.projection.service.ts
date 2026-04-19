import { BusinessError } from "@/core/errors/business.error"
import { DBClient } from "../../types/pensiun.types"

export class PensiunProjectionService {

  async project(
    db: DBClient,
    golonganId: bigint,
    tmtPns: Date,
    tmtPensiun: Date
  ) {

    if (!golonganId) {
      throw new BusinessError(
        "GOLONGAN_REQUIRED",
        "Golongan tidak tersedia"
      )
    }

    if (!tmtPns) {
      throw new BusinessError(
        "TMT_PNS_REQUIRED",
        "TMT PNS tidak tersedia"
      )
    }

    if (!tmtPensiun) {
      throw new BusinessError(
        "TMT_PENSIUN_REQUIRED",
        "TMT pensiun tidak tersedia"
      )
    }

    const years =
      tmtPensiun.getFullYear() -
      tmtPns.getFullYear()

    const masaKerja = Math.max(years, 0)

    const gaji = await db.refGajiPokok.findFirst({
      where: {
        golonganId,
        masaKerja: {
          lte: masaKerja
        }
      },
      orderBy: {
        masaKerja: "desc"
      },
      select: {
        gaji: true
      }
    })

    return {
      masaKerja,
      gajiPokok: Number(gaji?.gaji ?? 0)
    }

  }

}