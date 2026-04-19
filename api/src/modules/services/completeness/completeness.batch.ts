import { PrismaClient } from "@prisma/client"
import { processCompleteness } from "./completeness.processor"

const prisma = new PrismaClient()

type PegawaiCursor = {
  id: bigint
}

export async function runCompletenessBatch(
  layananId: bigint,
  limit = 100
) {

  let cursor: bigint | null = null

  while (true) {

    const pegawai: PegawaiCursor[] =
      await prisma.silakapPegawai.findMany({

        take: limit,

        ...(cursor && {
          skip: 1,
          cursor: { id: cursor }
        }),

        select: {
          id: true
        },

        orderBy: {
          id: "asc"
        }

      })

    if (pegawai.length === 0) break

    for (const p of pegawai) {

      try {

        await prisma.$transaction(tx =>
          processCompleteness(
            tx,
            p.id,
            layananId
          )
        )

      } catch (err) {

        console.error(
          "Completeness batch error:",
          p.id.toString(),
          err
        )

      }

    }

    cursor = pegawai[pegawai.length - 1].id

  }

}