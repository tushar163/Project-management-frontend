"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi } from "../api/auth";
import { useAuthContext } from "../../store/authStore";
import type { LoginPayload, RegisterPayload } from "../types/auth";

export function useAuth() {
  const router = useRouter();
  const { user, token, isLoading, setSession, clearSession } = useAuthContext();

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      setSession(data.user, data.token);
      router.push("/projects");
    },
  });

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (data) => {
      setSession(data.user, data.token);
      router.push("/login");
    },
  });

  const logout = () => {
    clearSession();
    router.push("/login");
  };

  return {
    user,
    token,
    isAuthenticated: Boolean(token),
    isLoading,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    logout,
  };
}