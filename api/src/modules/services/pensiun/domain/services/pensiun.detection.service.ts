import { DBClient } from "../../types/pensiun.types"
import { PensiunDetectionEngine } from "../engines/pensiun.detection.engine"

export class PensiunDetectionService {

  async scanCalonPensiun(
    db: DBClient
  ) {

    const pegawaiList =
      await db.silakapPegawai.findMany({

        where: {
          statusAktif: true,
          deletedAt: null
        },

        select: {
          id: true,
          nip: true,
          nama: true,
          tanggalLahir: true,
          jabatan: {
            select: {
              bup: true
            }
          }
        }

      })

    if (!pegawaiList.length) {
      return []
    }

    const hasil =
      PensiunDetectionEngine.detectCalonPensiun(
        pegawaiList,
        new Date()
      )

    return hasil ?? []

  }

}