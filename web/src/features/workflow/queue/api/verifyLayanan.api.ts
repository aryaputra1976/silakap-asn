import http from "@/core/http/httpClient"

export async function verifyLayanan(
  layanan: string,
  id: string,
  action: "approve" | "reject",
  payload?: Record<string, any>
) {

  const res = await http.post(`/services/${layanan}/workflow`, {
    usulId: id,
    actionCode: action.toUpperCase(),
    ...(payload || {}),
  })

  return res.data

}
