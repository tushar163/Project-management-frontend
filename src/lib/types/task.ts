import type { User } from "./auth";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type Priority = "LOW" | "MEDIUM" | "HIGH";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  aiSummary: string | null;
  projectId: string;
  project?: {
    id: string;
    name: string;
  };
  createdById: string;
  createdBy?: User;
  assignedToId: string | null;
  assignedTo?: User | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority?: Priority;
  projectId: string;
  assignedToId?: string;
}

export interface UpdateTaskStatusPayload {
  status: TaskStatus;
}

export interface TaskFilters {
  search?: string;
  status?: TaskStatus;
  projectId?: string;
}

// Drives the Kanban board's three columns. Centralizing the order and
// labels here means a column never has to be added in two places.
export const TASK_STATUS_COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: "TODO", label: "To do" },
  { key: "IN_PROGRESS", label: "In progress" },
  { key: "DONE", label: "Done" },
];

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};
