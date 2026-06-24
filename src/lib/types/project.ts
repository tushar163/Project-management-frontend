import type { User } from "./auth";
import type { Task } from "./task";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  owner?: User;
  tasks?: Task[];
  _count?: {
    tasks: number;
  };
  createdAt: string;
  updatedAt: string;
  // Convenience field some list endpoints return instead of the full
  // tasks array — optional so both shapes are valid without a union type.
  taskCount?: number;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface PaginatedProjectsResponse {
  data: Project[];
  pagination: PaginationMeta;
}

export interface ProjectListParams {
  page?: number;
  limit?: number;
  search?: string;
}
