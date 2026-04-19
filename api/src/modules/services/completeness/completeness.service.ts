import { Prisma } from "@prisma/client"
import { processCompleteness } from "./completeness.processor"
import {
  KelengkapanResult
} from "./completeness.types"

export class CompletenessService {

  /**
   * Hitung ulang kelengkapan dokumen pegawai
   */
  async calculateByPegawai(
    tx: Prisma.TransactionClient,
    pegawaiId: bigint,
    layananId: bigint
  ): Promise<KelengkapanResult> {

    if (!pegawaiId || !layananId) {
      throw new Error("pegawaiId dan layananId wajib diisi")
    }

    return processCompleteness(
      tx,
      pegawaiId,
      layananId
    )

  }

  /**
   * Ambil status kelengkapan dokumen (dari cache table)
   */
  async getStatus(
    tx: Prisma.TransactionClient,
    pegawaiId: bigint,
    layananId: bigint
  ): Promise<KelengkapanResult | null> {

    const data =
      await tx.silakapKelengkapanPegawai.findUnique({

        where: {
          pegawaiId_layananId: {
            pegawaiId,
            layananId
          }
        },

        include: {
          details: {
            include: {
              jenis: true
            }
          }
        }

      })

    if (!data) {
      return null
    }

    return {

      pegawaiId: data.pegawaiId,

      layananId: data.layananId,

      total: data.totalSyarat,

      terpenuhi: data.terpenuhi,

      isLengkap: data.isLengkap,

      items: data.details.map(d => ({
        jenisId: d.jenisId,
        nama: d.jenis.nama,
        wajib: d.wajib,
        status: d.status
      })),

      // helper untuk orchestration
      isComplete: data.isLengkap,

      missing: data.details
        .filter(d => !d.status)
        .map(d => d.jenis.nama)

    }

  }

}