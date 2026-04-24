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

export async function getRegistrationQueue(
  filters: GetRegistrationParams = {},
): Promise<PaginatedResponse<RegistrationQueueItem>> {
  const params = new URLSearchParams()

  appendIfPresent(params, "status", filters.status)
  appendIfPresent(params, "search", filters.search?.trim())
  appendIfPresent(params, "page", filters.page)
  appendIfPresent(params, "limit", filters.limit)

  const query = params.toString()

  return getRequest<PaginatedResponse<RegistrationQueueItem>>(
    query ? `/users/registrations?${query}` : "/users/registrations",
  )
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

  return getRequest<PaginatedResponse<UserListItem>>(
    query ? `/users?${query}` : "/users",
  )
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
