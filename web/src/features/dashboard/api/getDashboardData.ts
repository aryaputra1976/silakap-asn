import http from "@/core/http/httpClient"

export async function getDashboardData() {

  const [summary, workforce, opd, retirement] =
    await Promise.all([

      http.get("/statistics/asn"),
      http.get("/statistics/workforce/dashboard?tahun=2026"),
      http.get("/statistics/asn?type=opd"),
      http.get("/statistics/asn?type=retirement")

    ])

  return {

    summary: summary.data,
    workforce: workforce.data,
    opd: opd.data,
    retirement: retirement.data

  }

}