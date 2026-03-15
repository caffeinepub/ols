import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MobileAuthState {
  phoneNumber: string | null;
  isLoggingIn: boolean;
  isInitializing: boolean;
  setPhoneNumber: (phoneNumber: string | null) => void;
  setIsLoggingIn: (isLoggingIn: boolean) => void;
  setIsInitializing: (isInitializing: boolean) => void;
  clear: () => void;
}

const useMobileAuthStore = create<MobileAuthState>()(
  persist(
    (set) => ({
      phoneNumber: null,
      isLoggingIn: false,
      isInitializing: true,
      setPhoneNumber: (phoneNumber) =>
        set({ phoneNumber, isInitializing: false }),
      setIsLoggingIn: (isLoggingIn) => set({ isLoggingIn }),
      setIsInitializing: (isInitializing) => set({ isInitializing }),
      clear: () => set({ phoneNumber: null, isLoggingIn: false }),
    }),
    {
      name: "mobile-auth-storage",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isInitializing = false;
        }
      },
    },
  ),
);

export function useMobileAuth() {
  const {
    phoneNumber,
    isLoggingIn,
    isInitializing,
    setPhoneNumber,
    setIsLoggingIn,
    clear,
  } = useMobileAuthStore();

  const login = (phone: string) => {
    setPhoneNumber(phone);
    setIsLoggingIn(false);
  };

  const logout = () => {
    clear();
  };

  return {
    phoneNumber,
    isLoggingIn,
    isInitializing,
    isAuthenticated: !!phoneNumber,
    login,
    logout,
    setIsLoggingIn,
  };
}
