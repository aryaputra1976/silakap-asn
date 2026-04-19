import { getRequest, postRequest } from "@/core/http"
import type {
  RegisterPegawaiLookup,
  RegisterRequest,
  RegisterResponse,
} from "../types"

export async function register(
  payload: RegisterRequest,
): Promise<RegisterResponse> {
  return postRequest<RegisterResponse, RegisterRequest>(
    "/auth/register",
    payload,
  )
}

export async function getRegisterPegawai(
  nip: string,
): Promise<RegisterPegawaiLookup> {
  const params = new URLSearchParams({ nip })

  return getRequest<RegisterPegawaiLookup>(
    `/auth/register/pegawai?${params.toString()}`,
  )
}
