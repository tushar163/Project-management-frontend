"use client";

import { useState, type ChangeEvent } from "react";
import {
  Button,
  Input,
  Label,
  Modal,
  Spinner,
  TextArea,
  useOverlayState,
} from "@heroui/react";
import { Plus } from "lucide-react";
import { useCreateProject } from "../../lib/hooks/useProjects";
import { getApiErrorMessage } from "../../lib/api/client";

export function CreateProjectModal() {
  const overlay = useOverlayState();
  const createProject = useCreateProject();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState("");

  const reset = () => {
    setName("");
    setDescription("");
    setNameError("");
    createProject.reset();
  };

  const handleClose = () => {
    reset();
    overlay.close();
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      setNameError("Project name is required.");
      return;
    }

    createProject.mutate(
      { name: name.trim(), description: description.trim() || undefined },
      { onSuccess: handleClose }
    );
  };

  return (
    <Modal>
      <Button onPress={overlay.open}>
        <Plus size={16} />
        New project
      </Button>

      <Modal.Backdrop isOpen={overlay.isOpen} onOpenChange={overlay.setOpen}>
        <Modal.Container>
          <Modal.Dialog>
            {({ close }) => (
              <>
                <Modal.CloseTrigger onPress={() => { handleClose(); close(); }} />
                <Modal.Header>
                  <Modal.Heading className="text-black">Create project</Modal.Heading>
                </Modal.Header>

                <Modal.Body className="flex flex-col gap-4">
                  {/* Project name */}
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="project-name" className="mb-1 text-black">Project name</Label>
                    <Input
                      id="project-name"
                      autoFocus
                      value={name}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setName(e.target.value);
                        setNameError("");
                      }}
                    />
                    {nameError && (
                      <p className="text-xs text-danger mt-0.5">{nameError}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="project-description" className="mb-1 text-black">Description</Label>
                    <TextArea
                      id="project-description"
                      placeholder="Optional"
                      rows={3}
                      value={description}
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                        setDescription(e.target.value)
                      }
                    />
                  </div>

                  {createProject.isError && (
                    <p className="text-sm text-red-600" role="alert">
                      {getApiErrorMessage(createProject.error)}
                    </p>
                  )}
                </Modal.Body>

                <Modal.Footer>
                  <Button variant="secondary" onPress={handleClose}>
                    Cancel
                  </Button>
                  <Button onPress={handleSubmit} isPending={createProject.isPending}>
                    {({ isPending }) => (
                      <>
                        {isPending && <Spinner size="sm" color="current" />}
                        Create project
                      </>
                    )}
                  </Button>
                </Modal.Footer>
              </>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}