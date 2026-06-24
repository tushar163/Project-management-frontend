"use client";

import { useState, type ChangeEvent } from "react";
import type { Key } from "@heroui/react";
import {
  Button,
  FieldError,
  Input,
  Label,
  ListBox,
  Modal,
  Select,
  TextArea,
  TextField,
  useOverlayState,
} from "@heroui/react";
import { Plus } from "lucide-react";
import { useCreateTask } from "../../lib/hooks/useTask";
import { useProjects } from "../../lib/hooks/useProjects";
import { PRIORITY_LABELS, type Priority } from "../../lib/types/task";
import { getApiErrorMessage } from "../../lib/api/client";

const PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH"];

export function CreateTaskModal({
  defaultProjectId,
}: {
  // When rendered from a single project's page, the project is fixed
  // and the picker is hidden. From the all-tasks page, the user picks
  // which project the task belongs to.
  defaultProjectId?: string;
}) {
  const overlay = useOverlayState();
  const createTask = useCreateTask();
  const { data: projectsResponse } = useProjects({ limit: 100 });
  const projects = projectsResponse?.data ?? [];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [projectId, setProjectId] = useState<string>(defaultProjectId ?? "");
  const [titleError, setTitleError] = useState("");

  const reset = () => {
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setProjectId(defaultProjectId ?? "");
    setTitleError("");
    createTask.reset();
  };

  const handleClose = () => {
    reset();
    overlay.close();
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      setTitleError("Task title is required.");
      return;
    }
    if (!projectId) {
      return; // project select is required; nothing to submit without it
    }

    createTask.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        projectId,
      },
      { onSuccess: handleClose }
    );
  };

  return (
    <Modal>
      <Button onPress={overlay.open}>
        <Plus size={16} />
        New task
      </Button>

      <Modal.Backdrop isOpen={overlay.isOpen} onOpenChange={overlay.setOpen}>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger onPress={handleClose} />
            <Modal.Header>
              <Modal.Heading>Create task</Modal.Heading>
            </Modal.Header>

            <Modal.Body className="flex flex-col gap-4">
              <TextField name="title" isInvalid={Boolean(titleError)}>
                <Label>Title</Label>
                <Input
                  autoFocus
                  value={title}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    setTitle(event.target.value);
                    setTitleError("");
                  }}
                />
                <FieldError>{titleError}</FieldError>
              </TextField>

              <TextField name="description">
                <Label>Description</Label>
                <TextArea
                  placeholder="Optional"
                  rows={3}
                  value={description}
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                    setDescription(event.target.value)
                  }
                />
              </TextField>

              {!defaultProjectId && (
                <Select
                  value={projectId || null}
                  onChange={(key: Key | null) => setProjectId((key as string) ?? "")}
                  placeholder="Select a project"
                  isRequired
                >
                  <Label>Project</Label>
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {(projects ?? []).map((project) => (
                        <ListBox.Item key={project.id} id={project.id} textValue={project.name}>
                          {project.name}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              )}

              <Select
                value={priority}
                onChange={(key: Key | null) => {
                  if (key) setPriority(key as Priority);
                }}
              >
                <Label>Priority</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {PRIORITIES.map((value) => (
                      <ListBox.Item key={value} id={value} textValue={PRIORITY_LABELS[value]}>
                        {PRIORITY_LABELS[value]}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>

              {createTask.isError && (
                <p className="text-sm text-red-600" role="alert">
                  {getApiErrorMessage(createTask.error)}
                </p>
              )}
            </Modal.Body>

            <Modal.Footer>
              <Button variant="secondary" onPress={handleClose}>
                Cancel
              </Button>
              <Button onPress={handleSubmit} isPending={createTask.isPending}>
                Create task
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
