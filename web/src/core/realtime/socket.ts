import { io } from "socket.io-client"
import { env } from "@/core/utils/env"

export const socket = io(`${env.wsUrl}/ws`, {
  autoConnect: false,
  withCredentials: true,
})
