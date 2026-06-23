"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectsApi } from "../api/projects";
import type { CreateProjectPayload } from "../types/project";

export const projectKeys = {
  all: ["projects"] as const,
};

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: projectsApi.list,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProjectPayload) => projectsApi.create(payload),
    onSuccess: () => {
      // Simplest correct invalidation for this scale of app. A
      // cache-merge optimistic update would shave one round trip but
      // isn't worth the complexity for a list that's rarely huge.
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}