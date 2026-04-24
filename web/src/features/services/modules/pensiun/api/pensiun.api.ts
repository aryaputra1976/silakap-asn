import http from "@/core/http/httpClient"
import {
  createService,
  dispatchWorkflowAction,
  getServiceDetail,
  getServiceList,
  submitService,
} from "@/features/services/base/api/service.api"
import type {
  ServiceDetailResponse,
  ServiceListResponse,
} from "@/features/services/base/types/service.types"

import {
  CreatePensiunPayload,
  PensiunDetail,
  PensiunItem,
} from "../types/pensiun.types"

export async function getPensiunList(): Promise<PensiunItem[]> {
  const response =
    await getServiceList<ServiceListResponse>("pensiun")

  return (response.data ?? []).map((item) => ({
    id: String(item.id),
    nip: item.pegawai?.nip ?? "-",
    nama: item.pegawai?.nama ?? "-",
    unitKerja: "-",
    jenisPensiun: item.jenis?.nama ?? "Pensiun",
    tmtPensiun: item.createdAt ?? "",
    status: item.status as PensiunItem["status"],
    createdAt: item.createdAt ?? "",
  }))
}

export async function getPensiunDetail(id: string): Promise<PensiunDetail> {
  const detail =
    await getServiceDetail<ServiceDetailResponse>("pensiun", id)

  return {
    id: String(detail.id),
    nip: detail.pegawai?.nip ?? "-",
    nama: detail.pegawai?.nama ?? "-",
    unitKerja: "-",
    jenisPensiun: detail.jenis?.nama ?? "Pensiun",
    tmtPensiun: "",
    status: detail.status as PensiunDetail["status"],
    createdAt: "",
    tanggalUsul: "",
    dokumen: [],
    timeline: (detail.layananLog ?? []).map((item) => ({
      status: item.status,
      tanggal: item.createdAt,
      keterangan: item.keterangan ?? undefined,
    })),
  }
}

export async function createPensiun(payload: CreatePensiunPayload) {
  return createService("pensiun", {
    ...payload,
  })
}

export async function submitPensiun(id: string) {
  return submitService("pensiun", id)
}

export async function approvePensiun(id: string) {
  return dispatchWorkflowAction("pensiun", id, "APPROVE")
}

export async function rejectPensiun(id: string, reason?: string) {
  if (!reason) {
    return dispatchWorkflowAction("pensiun", id, "REJECT")
  }

  const response = await http.post("/services/pensiun/workflow", {
    usulId: id,
    actionCode: "REJECT",
    reason,
  })

  return response.data
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
