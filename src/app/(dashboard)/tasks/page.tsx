"use client";

import { useState } from "react";
import { useTasks } from "../../../lib/hooks/useTask";
import { TaskBoard } from "../../../components/tasks/TaskBoard";
import { TaskSearchBar } from "../../../components/tasks/TaskSearchBar";
import { CreateTaskModal } from "../../../components/tasks/CreateTaskModal";

export default function TasksPage() {
  const [search, setSearch] = useState("");
  const { data: tasks, isLoading } = useTasks({ search });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">All tasks</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Search and track every task across your projects.
          </p>
        </div>
        <CreateTaskModal />
      </div>

      <TaskSearchBar onSearch={setSearch} />

      <TaskBoard tasks={tasks} isLoading={isLoading} />
    </div>
  );
}
