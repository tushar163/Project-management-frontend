"use client";

import type { Key } from "@heroui/react";
import { Label, ListBox, Select } from "@heroui/react";
import { TASK_STATUS_COLUMNS, type TaskStatus } from "../../lib/types/task";
import { useUpdateTaskStatus } from "../../lib/hooks/useTask";

export function TaskStatusSelect({
  taskId,
  status,
}: {
  taskId: string;
  status: TaskStatus;
}) {
  const updateStatus = useUpdateTaskStatus();

  const handleChange = (key: Key | null) => {
    if (key && key !== status) {
      updateStatus.mutate({ id: taskId, status: key as TaskStatus });
    }
  };

  return (
    <Select value={status} onChange={handleChange} className="w-36">
      <Label className="sr-only">Task status</Label>
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {TASK_STATUS_COLUMNS.map((column) => (
            <ListBox.Item key={column.key} id={column.key} textValue={column.label}>
              {column.label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}