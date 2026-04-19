import { postRequest } from "@/core/http"
import type {
  LoginRequest,
  LoginResponse,
} from "../types"

export async function login(
  payload: LoginRequest,
): Promise<LoginResponse> {
  return postRequest<LoginResponse, LoginRequest>(
    "/auth/login",
    payload,
  )
}
