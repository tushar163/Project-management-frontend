"use client";

import { Spinner } from "@heroui/react";
import { ProjectCard } from "./ProjectCard";
import { useProjects } from "../../lib/hooks/useProjects";

export function ProjectList() {
  const { data: projects, isLoading, isError } = useProjects();
  console.log(projects);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center flex-row py-16">
        <Spinner />
        <span className="text-xs text-muted">Loading projects...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-red-600 py-16 text-center">
        Couldn&apos;t load projects. Try refreshing the page.
      </p>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
        <p className="text-slate-500">No projects yet.</p>
        <p className="text-sm text-slate-400 mt-1">
          Create your first project to start tracking tasks.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.data?.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}