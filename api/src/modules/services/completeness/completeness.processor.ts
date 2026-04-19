import { Prisma } from "@prisma/client"
import { KelengkapanItem, KelengkapanResult } from "./completeness.types"
import {
  createDokumenSet,
  checkDokumenStatus,
  calculateCompletenessStats
} from "./completeness.utils"

export async function processCompleteness(
  tx: Prisma.TransactionClient,
  pegawaiId: bigint,
  layananId: bigint
): Promise<KelengkapanResult> {

  /**
   * 1. ambil syarat layanan
   */
  const syarat = await tx.silakapSyaratLayanan.findMany({

    where: { layananId },

    include: {
      jenis: {
        select: {
          id: true,
          nama: true
        }
      }
    }

  })

  /**
   * 2. ambil dokumen pegawai
   */
  const dokumen = await tx.silakapDokumen.findMany({

    where: { pegawaiId },

    select: {
      jenisId: true
    }

  })

  /**
   * 3. buat lookup dokumen
   */
  const dokumenSet = createDokumenSet(dokumen)

  /**
   * 4. generate items
   */
  const items: KelengkapanItem[] = syarat.map(s => {

    const status =
      checkDokumenStatus(
        dokumenSet,
        s.jenisId
      )

    return {
      jenisId: s.jenisId,
      nama: s.jenis.nama,
      wajib: s.wajib,
      status
    }

  })

  /**
   * 5. hitung statistik
   */
  const stats =
    calculateCompletenessStats(items)

  /**
   * 6. upsert kelengkapan pegawai
   */
  const kelengkapan =
    await tx.silakapKelengkapanPegawai.upsert({

      where: {
        pegawaiId_layananId: {
          pegawaiId,
          layananId
        }
      },

      update: {

        totalSyarat: stats.total,
        terpenuhi: stats.terpenuhi,
        isLengkap: stats.isLengkap

      },

      create: {

        pegawaiId,
        layananId,
        totalSyarat: stats.total,
        terpenuhi: stats.terpenuhi,
        isLengkap: stats.isLengkap

      }

    })

  /**
   * 7. upsert detail (SERIAL untuk stabilitas DB)
   */
  for (const item of items) {

    await tx.silakapKelengkapanDetail.upsert({

      where: {

        pegawaiId_layananId_jenisId: {

          pegawaiId,
          layananId,
          jenisId: item.jenisId

        }

      },

      update: {

        status: item.status,
        wajib: item.wajib

      },

      create: {

        pegawaiId,
        layananId,
        jenisId: item.jenisId,
        wajib: item.wajib,
        status: item.status,
        kelengkapanPegawaiId: kelengkapan.id

      }

    })

  }

  return {

    pegawaiId,
    layananId,

    total: stats.total,
    terpenuhi: stats.terpenuhi,
    isLengkap: stats.isLengkap,

    items,

    isComplete: stats.isComplete,
    missing: stats.missing

  }

}