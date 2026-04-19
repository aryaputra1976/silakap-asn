import { getRequest } from "@/core/http"
import type { CurrentUserResponse } from "../types"

export const getCurrentUser =
  async (): Promise<CurrentUserResponse> => {
    return getRequest<CurrentUserResponse>("/users/me")
  }
