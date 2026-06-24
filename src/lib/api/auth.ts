import { apiClient } from "./client";
import type { AuthResponse, LoginPayload, RegisterPayload } from "../types/auth";

interface AuthApiResponse {
  data?: AuthResponse;
  user?: AuthResponse["user"];
  token?: string;
  message?: string;
  success?: boolean;
}

function unwrapAuthResponse(response: AuthApiResponse): AuthResponse {
  if (response.data) return response.data;
  return {
    user: response.user as AuthResponse["user"],
    token: response.token as string,
  };
}

export const authApi = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthApiResponse>(
      "/v1/auth/register",
      payload
    );
    return unwrapAuthResponse(data);
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthApiResponse>(
      "/v1/auth/login",
      payload
    );
    return unwrapAuthResponse(data);
  },
};
