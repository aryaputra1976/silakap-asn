import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios"
import { env } from "@/core/utils/env"
import { useAuthStore } from "@/stores/auth.store"
import type { RefreshResponse } from "@/features/auth/types"
import {
  createUserFromToken,
  decodeAccessToken,
} from "@/features/auth/token"
import {
  getRefreshing,
  onRefreshed,
  onRefreshFailed,
  setRefreshing,
  subscribeTokenRefresh,
} from "./refreshQueue"
import { parseHttpError } from "./httpError"

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

type RequestConfig<TReq> = Omit<
  AxiosRequestConfig<TReq>,
  "url" | "method"
> & {
  url: string
  method?: NonNullable<AxiosRequestConfig<TReq>["method"]>
}

const http = axios.create({
  baseURL: env.apiUrl,
  timeout: env.apiTimeout,
  withCredentials: true,
})

const refreshHttp = axios.create({
  baseURL: env.apiUrl,
  timeout: env.apiTimeout,
  withCredentials: true,
})

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

http.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(parseHttpError(error))
    }

    const originalRequest = error.config as RetryConfig | undefined
    const status = error.response?.status

    if (status !== 401 || !originalRequest) {
      return Promise.reject(parseHttpError(error))
    }

    const { setAuth, clearSession, user } =
      useAuthStore.getState()

    if (originalRequest.url?.includes("/auth/refresh")) {
      clearSession()
      return Promise.reject(parseHttpError(error))
    }

    if (originalRequest._retry) {
      clearSession()
      return Promise.reject(parseHttpError(error))
    }

    originalRequest._retry = true

    if (getRefreshing()) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(
          (nextToken) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${nextToken}`
            }
            resolve(http(originalRequest))
          },
          (refreshError) => {
            reject(refreshError)
          },
        )
      })
    }

    try {
      setRefreshing(true)

      const refreshResponse =
        await refreshHttp.post<RefreshResponse>("/auth/refresh", {})
      const accessToken = refreshResponse.data.access_token
      const tokenPayload = decodeAccessToken(accessToken)

      setAuth({
        user: user ?? createUserFromToken(tokenPayload),
        accessToken,
        permissions: tokenPayload.permissions,
      })

      onRefreshed(accessToken)

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
      }

      return http(originalRequest)
    } catch (refreshError) {
      const parsedError = parseHttpError(refreshError)
      clearSession()
      onRefreshFailed(parsedError)
      return Promise.reject(parsedError)
    } finally {
      setRefreshing(false)
    }
  },
)

export async function request<TRes, TReq = undefined>(
  config: RequestConfig<TReq>,
): Promise<TRes> {
  const response = await http.request<
    TRes,
    AxiosResponse<TRes>,
    TReq
  >(config)

  return response.data
}

export function getRequest<TRes>(
  url: string,
  config?: Omit<RequestConfig<never>, "url" | "method" | "data">,
): Promise<TRes> {
  return request<TRes>({
    ...config,
    url,
    method: "get",
  })
}

export function postRequest<TRes, TReq>(
  url: string,
  data: TReq,
  config?: Omit<RequestConfig<TReq>, "url" | "method" | "data">,
): Promise<TRes> {
  return request<TRes, TReq>({
    ...config,
    url,
    method: "post",
    data,
  })
}

export function patchRequest<TRes, TReq>(
  url: string,
  data: TReq,
  config?: Omit<RequestConfig<TReq>, "url" | "method" | "data">,
): Promise<TRes> {
  return request<TRes, TReq>({
    ...config,
    url,
    method: "patch",
    data,
  })
}

export function deleteRequest<TRes>(
  url: string,
  config?: Omit<RequestConfig<never>, "url" | "method" | "data">,
): Promise<TRes> {
  return request<TRes>({
    ...config,
    url,
    method: "delete",
  })
}

export default http
