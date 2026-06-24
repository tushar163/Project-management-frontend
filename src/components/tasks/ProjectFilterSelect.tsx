"use client";

import type { Key } from "@heroui/react";
import { Label, ListBox, Select } from "@heroui/react";
import { FolderOpen } from "lucide-react";
import { useProjects } from "../../lib/hooks/useProjects";

export function ProjectFilterSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (projectId: string) => void;
}) {
  const { data: projectsResponse, isLoading } = useProjects({ limit: 100 });
  const projects = projectsResponse?.data ?? [];

  return (
    <Select
      value={value || null}
      onChange={(key: Key | null) => onChange((key as string) ?? "")}
      placeholder="All projects"
      aria-label="Filter by project"
    >
      <Select.Trigger className="min-w-[200px]">
        <FolderOpen className="size-4 text-slate-400 shrink-0" />
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          <ListBox.Item key="" id="" textValue="All projects">
            All projects
            <ListBox.ItemIndicator />
          </ListBox.Item>
          {isLoading ? (
            <ListBox.Item key="__loading" id="__loading" textValue="Loading...">
              Loading…
            </ListBox.Item>
          ) : (
            projects.map((project) => (
              <ListBox.Item
                key={project.id}
                id={project.id}
                textValue={project.name}
              >
                {project.name}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))
          )}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
