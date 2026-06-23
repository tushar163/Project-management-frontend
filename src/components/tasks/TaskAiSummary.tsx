"use client";

import { Button, Spinner } from "@heroui/react";
import { Sparkles } from "lucide-react";
import { useGenerateTaskSummary } from "../../lib/hooks/useTask";
import type { Task } from "../../lib/types/task";

export function TaskAiSummary({ task }: { task: Task }) {
  const generateSummary = useGenerateTaskSummary();

  if (task.aiSummary) {
    return (
      <p className="text-xs text-slate-500 italic mt-2 border-l-2 border-slate-200 dark:border-slate-700 pl-2">
        {task.aiSummary}
      </p>
    );
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      isPending={generateSummary.isPending}
      onPress={() => generateSummary.mutate(task.id)}
      className="mt-1 -ml-2 text-xs"
    >
      {({ isPending }) => (
        <>
          {isPending ? <Spinner size="sm" color="current" /> : <Sparkles size={14} />}
          Generate summary
        </>
      )}
    </Button>
  );
}