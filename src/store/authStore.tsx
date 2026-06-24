"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getCookie, setCookie, removeCookie } from "typescript-cookie";
import type { User } from "../lib/types/auth";

const COOKIE_OPTIONS = {
  expires: 7,       // days
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setSession: (user: User, token: string) => void;
  clearSession: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const storedToken = getCookie(TOKEN_KEY);
    const storedUser = getCookie(USER_KEY);

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser) as User);
      } catch {
        // Corrupted cookie — wipe both so we start clean.
        removeCookie(TOKEN_KEY, { path: COOKIE_OPTIONS.path });
        removeCookie(USER_KEY, { path: COOKIE_OPTIONS.path });
      }
    }
    setIsLoading(false);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const setSession = useCallback((nextUser: User, nextToken: string) => {
    setCookie(TOKEN_KEY, nextToken, COOKIE_OPTIONS);
    setCookie(USER_KEY, JSON.stringify(nextUser), COOKIE_OPTIONS);
    setUser(nextUser);
    setToken(nextToken);
  }, []);

  const clearSession = useCallback(() => {
    // path must exactly match what was used in setCookie or removal silently fails.
    removeCookie(TOKEN_KEY, { path: COOKIE_OPTIONS.path });
    removeCookie(USER_KEY, { path: COOKIE_OPTIONS.path });
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, setSession, clearSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return ctx;
}
