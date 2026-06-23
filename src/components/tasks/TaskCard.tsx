import { Card, Chip } from "@heroui/react";
import { PRIORITY_LABELS, type Task } from "../../lib/types/task";
import { TaskStatusSelect } from "./TaskStatusSelect";
import { TaskAiSummary } from "./TaskAiSummary";

const PRIORITY_COLOR: Record<Task["priority"], "default" | "warning" | "danger"> = {
  LOW: "default",
  MEDIUM: "warning",
  HIGH: "danger",
};

export function TaskCard({ task }: { task: Task }) {
  return (
    <Card variant="default">
      <Card.Content className="gap-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm leading-snug">{task.title}</h4>
          <Chip size="sm" color={PRIORITY_COLOR[task.priority]} variant="soft">
            {PRIORITY_LABELS[task.priority]}
          </Chip>
        </div>

        {task.description && (
          <p className="text-xs text-slate-500 line-clamp-2">{task.description}</p>
        )}

        {task.assignedTo && (
          <p className="text-xs text-slate-400">Assigned to {task.assignedTo.name}</p>
        )}

        <TaskAiSummary task={task} />

        <div className="mt-2">
          <TaskStatusSelect taskId={task.id} status={task.status} />
        </div>
      </Card.Content>
    </Card>
  );
}