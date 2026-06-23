import { Spinner } from "@heroui/react";
import { TASK_STATUS_COLUMNS, type Task } from "../../lib/types/task";
import { TaskCard } from "./TaskCard";

export function TaskBoard({
  tasks,
  isLoading,
}: {
  tasks: Task[] | undefined;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner  />
        <span className="text-xs text-muted">Loading tasks...</span>
      </div>
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
        <p className="text-slate-500">No tasks match right now.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {TASK_STATUS_COLUMNS.map((column) => {
        const columnTasks = tasks.filter((task) => task.status === column.key);
        return (
          <div key={column.key} className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                {column.label}
              </h3>
              <span className="text-xs text-slate-400">{columnTasks.length}</span>
            </div>

            <div className="flex flex-col gap-3 min-h-[4rem]">
              {columnTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}