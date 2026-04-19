import http from "@/core/http/httpClient"
import type { DashboardSummary } from "../types"

export async function getDashboardSummary(): Promise<any> {

  const res = await http.get("/statistics/asn")

  const stats = res.data

  return {

    summary: stats.summary,
    distribution: stats.distribution,
    organization: stats.organization,
    retirement: stats.retirement,

    userName: "User",
    userRole: null,
    opd: null,

    totalAsn: stats.summary.total,

    totalUsul: 0,
    usulProses: 0,
    usulSelesai: 0,

    aktivitasTerbaru: [],
    notifications: []

  }

}