import { createContext, useContext, type ReactNode } from "react";
import type { User, LoginCredentials, RegisterData } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo user that is always "logged in" — no backend required
const DEMO_USER: User = {
  id: "demo-user-001",
  email: "admin@midnightroyale.com",
  name: "Ahmad Qadri",
  phone: "+1 (555) 987-6543",
  role: "ADMIN",
  emailVerified: true,
  createdAt: "2026-01-15T00:00:00Z",
  updatedAt: "2026-07-01T00:00:00Z",
  _count: { bookings: 12 },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const login = async (_credentials: LoginCredentials) => {
    // No-op: always logged in
  };

  const register = async (_data: RegisterData) => {
    // No-op: always logged in
  };

  const logout = () => {
    // No-op in demo mode
  };

  const updateUser = (_user: User) => {
    // No-op in demo mode
  };

  return (
    <AuthContext.Provider
      value={{
        user: DEMO_USER,
        loading: false,
        isAuthenticated: true,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
