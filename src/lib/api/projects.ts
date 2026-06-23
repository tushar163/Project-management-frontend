import { apiClient } from "./client";
import type { CreateProjectPayload, Project } from "../types/project";

export const projectsApi = {
  list: async (): Promise<Project[]> => {
    const { data } = await apiClient.get<Project[]>("/v1/projects");
    return data;
  },

  create: async (payload: CreateProjectPayload): Promise<Project> => {
    const { data } = await apiClient.post<Project>("/v1/projects", payload);
    return data;
  },
};