import { Prisma } from "@prisma/client"

export type DependencyValidator =
  (
    tx: Prisma.TransactionClient,
    pegawaiId: bigint
  ) => Promise<"COMPLETED" | "PENDING">

export const dependencyValidators:
  Record<string, DependencyValidator> = {

  DATA_PEGAWAI: async (tx, pegawaiId) => {

    const pegawai =
      await tx.silakapPegawai.findUnique({
        where: { id: pegawaiId }
      })

    return pegawai
      ? "COMPLETED"
      : "PENDING"

  },

  RIWAYAT_PANGKAT: async (tx, pegawaiId) => {

    const count =
      await tx.silakapRiwayatPangkat.count({
        where: { pegawaiId }
      })

    return count > 0
      ? "COMPLETED"
      : "PENDING"

  },

  RIWAYAT_JABATAN: async (tx, pegawaiId) => {

    const count =
      await tx.silakapRiwayatJabatan.count({
        where: { pegawaiId }
      })

    return count > 0
      ? "COMPLETED"
      : "PENDING"

  }

}