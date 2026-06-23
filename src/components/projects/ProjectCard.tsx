import Link from "next/link";
import { Card } from "@heroui/react";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "../../lib/types/project";

export function ProjectCard({ project }: { project: Project }) {
  const taskCount = project.taskCount ?? project.tasks?.length ?? 0;

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="hover:shadow-md transition-shadow h-full" variant="default">
        <Card.Header className="flex justify-between items-start">
          <Card.Title className="font-semibold text-base leading-tight">
            {project.name}
          </Card.Title>
          <ArrowUpRight size={16} className="text-slate-400 shrink-0" />
        </Card.Header>
        <Card.Content className="pt-0">
          <Card.Description className="text-sm text-slate-500 line-clamp-2 min-h-[2.5rem]">
            {project.description || "No description yet."}
          </Card.Description>
          <p className="text-xs text-slate-400 mt-3">
            {taskCount} {taskCount === 1 ? "task" : "tasks"}
          </p>
        </Card.Content>
      </Card>
    </Link>
  );
}