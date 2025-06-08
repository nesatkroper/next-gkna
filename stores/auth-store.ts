import { clearAuthData, getAuthData, storeAuthData } from "@/lib/auth-utils";
import { Auth, Employee, Employeeinfo, Role } from "@/lib/generated/prisma"
import { create } from "zustand"
import { devtools } from "zustand/middleware"

interface AuthState {
  me: {
    Employee?: Employee & {
      EmployeeInfo?: Employeeinfo;
    };
    Role: Role;
    email: string;
  } | null;
  isLoadingMe: boolean;
  meError: string | null;
  hasFetched: boolean;
}



interface AuthActions {
  fetch: () => Promise<void>;
  clearMeError: () => void;
  clearAuth: () => void;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set, get) => ({
      me: getAuthData(),
      isLoadingMe: false,
      meError: null,
      hasFetched: false,

      fetch: async () => {
        const { isLoadingMe, me, hasFetched } = get();
        if (isLoadingMe || me || hasFetched) return;

        set({ isLoadingMe: true, meError: null });

        try {
          const response = await fetch('/api/auth/me');
          if (!response.ok) throw new Error('Failed to get auth.');

          const data = await response.json();
          const userData = data.user || data;

          set({ me: userData, isLoadingMe: false, hasFetched: true });
          storeAuthData(userData);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch auth';
          set({ meError: errorMessage, isLoadingMe: false, hasFetched: true });
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
