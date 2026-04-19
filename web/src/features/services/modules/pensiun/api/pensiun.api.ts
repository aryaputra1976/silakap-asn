import http from "@/core/http/httpClient"

import {
  CreatePensiunPayload,
  PensiunDetail,
  PensiunItem,
} from "../types/pensiun.types"

export async function getPensiunList(): Promise<PensiunItem[]> {
  const res = await http.get("/pensiun")
  return res.data
}

export async function getPensiunDetail(id: string): Promise<PensiunDetail> {
  const res = await http.get(`/pensiun/${id}`)
  return res.data
}

export async function createPensiun(payload: CreatePensiunPayload) {
  const res = await http.post("/pensiun", payload)
  return res.data
}

export async function submitPensiun(id: string) {
  const res = await http.post("/pensiun/submit", { id })
  return res.data
}

export async function approvePensiun(id: string) {
  const res = await http.post("/pensiun/approve", { id })
  return res.data
}

export async function rejectPensiun(id: string, reason?: string) {
  const res = await http.post("/pensiun/reject", {
    id,
    reason,
  })
  return res.data
}

export async function getPensiunStatistik() {
  const res = await http.get("/pensiun/statistik")
  return res.data
}

export async function getPensiunCalon(params?: {
  golongan?: string
  tmtPns?: string
  tmtPensiun?: string
}) {
  const res = await http.get("/pensiun/calon", { params })
  return res.data
}

export async function generateDpcp(id: string) {
  const res = await http.get(`/pensiun/dpcp/${id}`)
  return res.data
}