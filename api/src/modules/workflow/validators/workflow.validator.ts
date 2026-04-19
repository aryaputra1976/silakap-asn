import { Prisma, LayananStatus } from "@prisma/client"
import { WorkflowActionInput } from "../types/workflow.types"

/**
 * VALIDASI INPUT API
 */
export function validateWorkflowAction(
  input: WorkflowActionInput
) {

  if (!input) {
    throw new Error("Input workflow tidak boleh kosong")
  }

  const {
    usulId,
    pegawaiId,
    jenisLayananId,
    currentStatus,
    nextStatus
  } = input

  if (!usulId) {
    throw new Error("usulId wajib")
  }

  if (!pegawaiId) {
    throw new Error("pegawaiId wajib")
  }

  if (!jenisLayananId) {
    throw new Error("jenisLayananId wajib")
  }

  if (!currentStatus) {
    throw new Error("currentStatus wajib")
  }

  if (!nextStatus) {
    throw new Error("nextStatus wajib")
  }

  if (currentStatus === nextStatus) {
    throw new Error("Status workflow tidak boleh sama")
  }

  if (!Object.values(LayananStatus).includes(currentStatus)) {
    throw new Error(`currentStatus tidak valid: ${currentStatus}`)
  }

  if (!Object.values(LayananStatus).includes(nextStatus)) {
    throw new Error(`nextStatus tidak valid: ${nextStatus}`)
  }

}

/**
 * VALIDASI ENGINE
 */
export class WorkflowValidator {

  static async beforeTransition(
    tx: Prisma.TransactionClient,
    usulId: bigint,
    currentStatus: LayananStatus,
    nextStatus: LayananStatus
  ) {

    if (!usulId) {
      throw new Error("usulId tidak valid")
    }

    if (currentStatus === nextStatus) {
      throw new Error("Transition workflow tidak valid")
    }

    const layanan =
      await tx.silakapUsulLayanan.findUnique({
        where: { id: usulId },
        select: { status: true }
      })

    if (!layanan) {
      throw new Error("Usul layanan tidak ditemukan")
    }

    if (layanan.status !== currentStatus) {

      throw new Error(
        `Status layanan berubah. expected=${currentStatus} actual=${layanan.status}`
      )

    }

  }

}