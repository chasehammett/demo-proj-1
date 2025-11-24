import type { AxiosResponse } from "axios";
import { type ReactNode, useEffect, useState } from "react";
import { api, setAuthToken } from "../lib/api";
import {
  AuthContext,
  type AuthContextValue,
  type AuthState,
  type User,
} from "./context";

interface LoginResponse {
  token: string;
  user: User;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
  });

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) setAuthToken(t);
    setState((s) => ({ ...s, token: t, loading: false }));
  }, []);

  async function login(email: string, password: string): Promise<void> {
    const res: AxiosResponse<LoginResponse> = await api.post("/auth/login", {
      email,
      password,
    });
    setAuthToken(res.data.token);
    setState({
      user: res.data.user,
      token: res.data.token,
      loading: false,
    });
  }

  function logout(): void {
    setAuthToken(null);
    setState({ user: null, token: null, loading: false });
  }

  const value: AuthContextValue = { ...state, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
