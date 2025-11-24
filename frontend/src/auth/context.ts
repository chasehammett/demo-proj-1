import { createContext, type Context } from "react";

export interface User {
  id: number;
  email: string;
  name: string;
  role: "ADMIN" | "USER";
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

export interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Only context, no components exported from this file
export const AuthContext: Context<AuthContextValue | undefined> =
  createContext<AuthContextValue | undefined>(undefined);
