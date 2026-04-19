import { useEffect } from "react"
import { socket } from "@/core/realtime/socket"
import { useQueryClient } from "@tanstack/react-query"

export function useDashboardRealtime(userId?: string) {
  const qc = useQueryClient()

  useEffect(() => {
    if (!userId) return

    socket.connect()
    socket.emit("join", { room: `user:${userId}` })

    socket.on("activity:new", () => {
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] })
    })

    socket.on("notification:new", () => {
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] })
    })

    return () => {
      socket.off("activity:new")
      socket.off("notification:new")
      socket.disconnect()
    }
  }, [userId, qc])
}