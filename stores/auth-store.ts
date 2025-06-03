import { Auth } from "@/lib/generated/prisma"
import { create } from "zustand"
import { devtools } from "zustand/middleware"



interface AuthState {
  me: Auth[]
  isLoadingMe: boolean
  meError: string | null
}

interface AuthActions {
  fetchMe: () => Promise<void>
  clearMeError: () => void
}

export type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set, get) => ({
      me: [],
      isLoadingMe: false,
      meError: null,

      fetchMe: async () => {
        const { isLoadingMe } = get()
        if (isLoadingMe) return

        set({ isLoadingMe: true, meError: null })

        try {
          const response = await fetch("/api/auth/me")
          if (!response.ok) throw new Error("Failed to get auth.")

          const data = await response.json()
          const me = Array.isArray(data) ? data : data.me || []

          set({ me, isLoadingMe: false })
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : "Failed to fetch auth"
          set({
            meError: errorMessage,
            isLoadingMe: false,
          })
        }
      },

      clearMeError: () => {
        set({ meError: null })
      },
    }),
    { name: "auth-store" },
  ),
)
