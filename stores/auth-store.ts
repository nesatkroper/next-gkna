import { clearAuthData, getAuthData, storeAuthData } from "@/lib/auth-utils";
import { Auth } from "@/lib/generated/prisma"
import { create } from "zustand"
import { devtools } from "zustand/middleware"

interface AuthState {
  me: Auth | null;
  isLoadingMe: boolean;
  meError: string | null;
}

interface AuthActions {
  fetchMe: () => Promise<void>;
  clearMeError: () => void;
  clearAuth: () => void; // Add this to your interface
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set, get) => ({
      me: getAuthData(), // Initialize with cookie data if exists
      isLoadingMe: false,
      meError: null,

      fetchMe: async () => {
        const { isLoadingMe } = get();
        if (isLoadingMe) return;

        set({ isLoadingMe: true, meError: null });

        try {
          const response = await fetch('/api/auth/me');
          if (!response.ok) throw new Error('Failed to get auth.');

          const data = await response.json();
          const userData = data.user || data;
          
          // Store the data in both state and cookie
          set({ me: userData, isLoadingMe: false });
          storeAuthData(userData);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch auth';
          set({ meError: errorMessage, isLoadingMe: false });
        }
      },

      clearMeError: () => {
        set({ meError: null });
      },

      clearAuth: () => {
        set({ me: null, meError: null });
        clearAuthData();
      },
    }),
    { name: 'auth-store' },
  ),
);


// import { clearAuthData, getAuthData, storeAuthData } from "@/lib/auth-utils";
// import { Auth } from "@/lib/generated/prisma"
// import { create } from "zustand"
// import { devtools } from "zustand/middleware"



// interface AuthState {
//   me: Auth | null;
//   isLoadingMe: boolean
//   meError: string | null
// }

// interface AuthActions {
//   fetchMe: () => Promise<void>
//   clearMeError: () => void
// }

// export type AuthStore = AuthState & AuthActions

// // Update your Zustand store to check cookies first


// export const useAuthStore = create<AuthStore>()(
//   devtools(
//     (set, get) => ({
//       me: null,
//       isLoadingMe: false,
//       meError: null,

//       fetchMe: async () => {
//         const { isLoadingMe } = get();
//         if (isLoadingMe) return;

//         set({ isLoadingMe: true, meError: null });

//         try {
//           const response = await fetch("/api/auth/me");
//           if (!response.ok) throw new Error("Failed to get auth.");

//           const data = await response.json();
          
//           // Handle both the old and new API response formats
//           const userData = data.user || data;
          
//           set({ 
//             me: userData, // Store the user object directly
//             isLoadingMe: false 
//           });
//         } catch (error: unknown) {
//           const errorMessage = error instanceof Error ? error.message : "Failed to fetch auth";
//           set({
//             meError: errorMessage,
//             isLoadingMe: false,
//           });
//         }
//       },

//       clearMeError: () => {
//         set({ meError: null })
//       },
//     }),
//     { name: "auth-store" },
//   ),
// )
