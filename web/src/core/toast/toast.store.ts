import { create } from "zustand"
import { ToastItem } from "./toast.types"
console.log("TOAST STORE INIT", import.meta.url)
type ToastState = {
  toasts: ToastItem[]
  push: (toast: Omit<ToastItem, "id">) => void
  remove: (id: string) => void
  clear: () => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  push: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        
        { id: crypto.randomUUID(), duration: 4000, ...toast },
      ],
    })),

  remove: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clear: () => set({ toasts: [] }),
  
}))