import { apiClient } from "./client";
import type {
  CreateProjectPayload,
  PaginatedProjectsResponse,
  Project,
  ProjectListParams,
  UpdateProjectPayload,
} from "../types/project";

interface ApiDataResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export const projectsApi = {
  list: async (
    params?: ProjectListParams
  ): Promise<PaginatedProjectsResponse> => {
    const { data } = await apiClient.get<PaginatedProjectsResponse>("/v1/projects", {
      params: {
        page: params?.page,
        limit: params?.limit,
        search: params?.search || undefined,
      },
    });
    return data;
  },

  create: async (payload: CreateProjectPayload): Promise<Project> => {
    const { data } = await apiClient.post<ApiDataResponse<Project>>(
      "/v1/projects",
      payload
    );
    return data.data;
  },

  update: async (
    id: string,
    payload: UpdateProjectPayload
  ): Promise<Project> => {
    const { data } = await apiClient.put<ApiDataResponse<Project>>(
      `/v1/projects/${id}`,
      payload
    );
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/v1/projects/${id}`);
  },
};
