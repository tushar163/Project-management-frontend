import { apiClient } from "./client";
import type { AuthResponse, LoginPayload, RegisterPayload } from "../types/auth";

export const authApi = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>("/v1/auth/register", payload);
    return data;
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>("/v1/auth/login", payload);
    return data;
  },
};