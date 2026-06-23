import { apiClient } from "./client";
import type {
  CreateTaskPayload,
  Task,
  TaskFilters,
  UpdateTaskStatusPayload,
} from "../types/task";

export const tasksApi = {
  // GET /api/tasks?search=&status=&projectId=
  // Filters are sent as query params and omitted entirely when undefined,
  // so an empty search box doesn't send `search=` and mask other params.
  list: async (filters?: TaskFilters): Promise<Task[]> => {
    const { data } = await apiClient.get<Task[]>("/tasks", {
      params: {
        search: filters?.search || undefined,
        status: filters?.status || undefined,
        projectId: filters?.projectId || undefined,
      },
    });
    return data;
  },

  create: async (payload: CreateTaskPayload): Promise<Task> => {
    const { data } = await apiClient.post<Task>("/v1/tasks", payload);
    return data;
  },

  updateStatus: async (
    id: string,
    payload: UpdateTaskStatusPayload
  ): Promise<Task> => {
    const { data } = await apiClient.put<Task>(`/v1/tasks/${id}/status`, payload);
    return data;
  },

  // Not in the original spec's three endpoints, but "AI-generated task
  // summaries" needs a route to trigger generation. Kept here so the
  // hook layer doesn't care that it's an addition.
  generateSummary: async (id: string): Promise<Task> => {
    const { data } = await apiClient.post<Task>(`/v1/tasks/${id}/summary`);
    return data;
  },
};