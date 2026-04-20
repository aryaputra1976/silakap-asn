import { getRequest, patchRequest } from "@/core/http/httpClient"

export type RegistrationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"

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

export async function getRegistrationQueue(
  status?: RegistrationStatus,
): Promise<RegistrationQueueItem[]> {
  const params = new URLSearchParams()

  if (status) {
    params.set("status", status)
  }

  const query = params.toString()

  return getRequest<RegistrationQueueItem[]>(
    query ? `/users/registrations?${query}` : "/users/registrations",
  )
}

export async function getUserList(): Promise<UserListItem[]> {
  return getRequest<UserListItem[]>("/users")
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
