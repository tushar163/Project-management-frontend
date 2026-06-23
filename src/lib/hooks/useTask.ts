"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "../api/tasks";
import type {
  CreateTaskPayload,
  Task,
  TaskFilters,
  TaskStatus,
} from "../types/task";

export const taskKeys = {
  all: ["tasks"] as const,
  list: (filters?: TaskFilters) => ["tasks", filters ?? {}] as const,
};

export function useTasks(filters?: TaskFilters) {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: () => tasksApi.list(filters),
    // Keep previous results visible while a new search keystroke is
    // in flight, so the board doesn't flash empty on every character.
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => tasksApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

// This is the "real-time status tracking" requirement. Dragging a card
// or picking a new status in the dropdown updates the UI immediately
// (optimistic write to the cache), then reconciles with the server
// response. If the server call fails, the cache is rolled back to the
// snapshot taken before the mutation started.
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      tasksApi.updateStatus(id, { status }),

    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });

      const previousQueries = queryClient.getQueriesData<Task[]>({
        queryKey: taskKeys.all,
      });

      queryClient.setQueriesData<Task[]>({ queryKey: taskKeys.all }, (old) =>
        old?.map((task) => (task.id === id ? { ...task, status } : task))
      );

      return { previousQueries };
    },

    onError: (_err, _variables, context) => {
      context?.previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

export function useGenerateTaskSummary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => tasksApi.generateSummary(taskId),
    onSuccess: (updatedTask) => {
      queryClient.setQueriesData<Task[]>({ queryKey: taskKeys.all }, (old) =>
        old?.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
    },
  });
}