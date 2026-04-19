import { BusinessError } from "@/core/errors/business.error"
import { DBClient } from "../../types/pensiun.types"
import { PensiunDPCPGenerator } from "../generators/pensiun.dpcp.generator"

export class PensiunDPCPService {

  private generator = new PensiunDPCPGenerator()

  async generate(
    db: DBClient,
    pensiunId: bigint
  ) {

    if (!pensiunId) {
      throw new BusinessError(
        "PENSIUN_ID_INVALID",
        "ID pensiun tidak valid"
      )
    }

    const pensiun =
      await db.silakapPensiunDetail.findUnique({

        where: { id: pensiunId },

        include: {

          perhitungan: {
            select: {
              masaKerjaTahun: true,
              masaKerjaBulan: true,
              gajiPokok: true,
              estimasiPensiun: true
            }
          },

          usul: {
            select: {
              pegawai: {
                select: {
                  jabatan: {
                    select: {
                      nama: true
                    }
                  },
                  unor: {
                    select: {
                      nama: true
                    }
                  }
                }
              }
            }
          }

        }

      })

    if (!pensiun) {
      throw new BusinessError(
        "PENSIUN_NOT_FOUND",
        "Data pensiun tidak ditemukan"
      )
    }

    if (!pensiun.perhitungan) {
      throw new BusinessError(
        "PERHITUNGAN_NOT_FOUND",
        "Perhitungan pensiun belum tersedia"
      )
    }

    return this.generator.generate(pensiun)

  }

}