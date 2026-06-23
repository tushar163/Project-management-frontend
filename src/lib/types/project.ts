import type { User } from "./auth";
import type { Task } from "./task";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  owner?: User;
  tasks?: Task[];
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