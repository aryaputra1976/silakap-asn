import {
  deleteRequest,
  getRequest,
  patchRequest,
  postRequest,
} from "@/core/http/httpClient"

export type RegistrationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"

export type PaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type RegistrationQueueItem = {
  id: string
  username: string
  pegawaiId: string
  status: RegistrationStatus
  email: string
  noHp: string
  note: string | null
  submittedAt: string
  reviewedAt: string | null
  requestedRoleId: string | null
  requestedRole: string | null
  selectedUnorId: string | null
  reviewerName: string | null
  pegawai: {
    nama: string
    nip: string
    unor: string | null
  }
}

export type UserListItem = {
  id: string
  username: string
  isActive: boolean
  pegawaiId: string | null
  pegawai: {
    nama: string | null
    nip: string | null
    unor: string | null
  } | null
  roles: string[]
  roleIds: string[]
  canDelete?: boolean
  deleteBlockedReason?: string | null
}

export type RoleOption = {
  id: string
  name: string
}

export type PegawaiOption = {
  id: string
  nama: string
  nip: string
  unor: string | null
  hasUser: boolean
  userId: string | null
}

type ReviewPayload = {
  note?: string
}

type ReviewResponse = {
  message: string
  registrationId: string
  userId?: string
  username?: string
}

type UserMutationPayload = {
  username: string
  password?: string
  pegawaiId?: string
  roleIds: string[]
  isActive?: boolean
}

type UserMutationResponse = {
  message: string
  data: UserListItem
}

type DeleteUserResponse = {
  message: string
  userId: string
}

type PaginatedResponse<T> = {
  data: T[]
  meta: PaginationMeta
}

type GetUserListParams = {
  search?: string
  isActive?: boolean | ""
  roleId?: string
  page?: number
  limit?: number
}

type GetRegistrationParams = {
  status?: RegistrationStatus
  search?: string
  page?: number
  limit?: number
}

function appendIfPresent(
  params: URLSearchParams,
  key: string,
  value: string | number | boolean | undefined | null,
) {
  if (value === undefined || value === null || value === "") {
    return
  }

  params.set(key, String(value))
}

const DEFAULT_META: PaginationMeta = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
}

function normalizePaginatedResponse<T>(
  response: unknown,
): PaginatedResponse<T> {
  if (Array.isArray(response)) {
    return {
      data: response as T[],
      meta: {
        ...DEFAULT_META,
        total: response.length,
        totalPages: 1,
      },
    }
  }

  if (response && typeof response === "object") {
    const record = response as Record<string, unknown>
    const data = Array.isArray(record.data) ? (record.data as T[]) : []
    const rawMeta =
      record.meta && typeof record.meta === "object"
        ? (record.meta as Record<string, unknown>)
        : {}

    return {
      data,
      meta: {
        page:
          typeof rawMeta.page === "number" ? rawMeta.page : DEFAULT_META.page,
        limit:
          typeof rawMeta.limit === "number" ? rawMeta.limit : DEFAULT_META.limit,
        total:
          typeof rawMeta.total === "number" ? rawMeta.total : data.length,
        totalPages:
          typeof rawMeta.totalPages === "number"
            ? rawMeta.totalPages
            : Math.max(1, Math.ceil((data.length || 0) / DEFAULT_META.limit)),
      },
    }
  }

  return { data: [], meta: DEFAULT_META }
}

export async function getRegistrationQueue(
  filters: GetRegistrationParams = {},
): Promise<PaginatedResponse<RegistrationQueueItem>> {
  const params = new URLSearchParams()

  appendIfPresent(params, "status", filters.status)
  appendIfPresent(params, "search", filters.search?.trim())
  appendIfPresent(params, "page", filters.page)
  appendIfPresent(params, "limit", filters.limit)

  const query = params.toString()

  const response = await getRequest<unknown>(
    query ? `/users/registrations?${query}` : "/users/registrations",
  )

  return normalizePaginatedResponse<RegistrationQueueItem>(response)
}

export async function getUserList(
  filters: GetUserListParams = {},
): Promise<PaginatedResponse<UserListItem>> {
  const params = new URLSearchParams()

  appendIfPresent(params, "search", filters.search?.trim())
  appendIfPresent(params, "roleId", filters.roleId)
  if (filters.isActive !== "") {
    appendIfPresent(params, "isActive", filters.isActive)
  }
  appendIfPresent(params, "page", filters.page)
  appendIfPresent(params, "limit", filters.limit)

  const query = params.toString()

  const response = await getRequest<unknown>(
    query ? `/users?${query}` : "/users",
  )

  return normalizePaginatedResponse<UserListItem>(response)
}

export async function getRoleOptions(): Promise<RoleOption[]> {
  return getRequest<RoleOption[]>("/users/options/roles")
}

export async function getPegawaiOptions(search = ""): Promise<PegawaiOption[]> {
  const params = new URLSearchParams()
  appendIfPresent(params, "search", search.trim())
  appendIfPresent(params, "limit", 20)

  const query = params.toString()

  return getRequest<PegawaiOption[]>(
    query ? `/users/options/pegawai?${query}` : "/users/options/pegawai",
  )
}

export async function createUser(
  payload: Required<Pick<UserMutationPayload, "username" | "password" | "roleIds">> &
    Pick<UserMutationPayload, "pegawaiId" | "isActive">,
): Promise<UserMutationResponse> {
  return postRequest<UserMutationResponse, typeof payload>("/users", payload)
}

export async function updateUser(
  id: string,
  payload: Omit<UserMutationPayload, "password">,
): Promise<UserMutationResponse> {
  return patchRequest<UserMutationResponse, typeof payload>(`/users/${id}`, payload)
}

export async function toggleUserStatus(
  id: string,
  isActive: boolean,
): Promise<UserMutationResponse> {
  return patchRequest<UserMutationResponse, { isActive: boolean }>(
    `/users/${id}/status`,
    { isActive },
  )
}

export async function deleteUser(id: string): Promise<DeleteUserResponse> {
  return deleteRequest<DeleteUserResponse>(`/users/${id}`)
}

export async function approveRegistration(
  id: string,
  payload: ReviewPayload,
): Promise<ReviewResponse> {
  return patchRequest<ReviewResponse, ReviewPayload>(
    `/users/registrations/${id}/approve`,
    payload,
  )
}

export async function rejectRegistration(
  id: string,
  payload: ReviewPayload,
): Promise<ReviewResponse> {
  return patchRequest<ReviewResponse, ReviewPayload>(
    `/users/registrations/${id}/reject`,
    payload,
  )
}
