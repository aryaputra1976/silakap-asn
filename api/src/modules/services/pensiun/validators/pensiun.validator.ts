import { BusinessError } from "@/core/errors/business.error"

export function validateSubmitPensiun(
  data: any
) {

  if (!data) {
    throw new BusinessError(
      "DATA_REQUIRED",
      "Data tidak tersedia"
    )
  }

  if (!data.usulId) {
    throw new BusinessError(
      "USUL_ID_REQUIRED",
      "usulId wajib"
    )
  }

  if (!data.pegawaiId) {
    throw new BusinessError(
      "PEGAWAI_ID_REQUIRED",
      "pegawaiId wajib"
    )
  }

  return {
    usulId: BigInt(data.usulId),
    pegawaiId: BigInt(data.pegawaiId)
  }

}