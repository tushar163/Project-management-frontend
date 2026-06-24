"use client";

import type { SortDescriptor } from "@heroui/react";

import { Button, Chip, Input, Label, Modal, Pagination, Spinner, Table, TextArea, useOverlayState } from "@heroui/react";
import { AlertCircle, Eye, Pencil, RefreshCw, Search, Trash2, X } from "lucide-react";
import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getApiErrorMessage } from "../../lib/api/client";
import {
  useDeleteProject,
  useProjects,
  useUpdateProject,
} from "../../lib/hooks/useProjects";
import type { Project } from "../../lib/types/project";

const PAGE_SIZE = 10;

function getTaskCount(project: Project) {
  return project._count?.tasks ?? project.taskCount ?? project.tasks?.length ?? 0;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getPageItems(page: number, totalPages: number) {
  const pages = new Set<number>([1, totalPages, page - 1, page, page + 1]);

  return Array.from(pages)
    .filter((item) => item >= 1 && item <= totalPages)
    .sort((a, b) => a - b);
}

export function ProjectTable() {
  const router = useRouter();
  const editOverlay = useOverlayState();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchDraft, setSearchDraft] = useState("");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editNameError, setEditNameError] = useState("");
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "createdAt",
    direction: "descending",
  });

  const projectsQuery = useProjects({
    page,
    limit: PAGE_SIZE,
    search,
  });

  const projects = useMemo(
    () => projectsQuery.data?.data ?? [],
    [projectsQuery.data?.data]
  );
  const pagination = projectsQuery.data?.pagination;
  const totalPages = Math.max(pagination?.totalPages ?? 1, 1);
  const pageItems = getPageItems(page, totalPages);
  const pageStart = pagination ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const pageEnd = pagination
    ? Math.min(pagination.page * pagination.limit, pagination.total)
    : 0;

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      const column = sortDescriptor.column;
      let first: string | number = "";
      let second: string | number = "";

      if (column === "tasks") {
        first = getTaskCount(a);
        second = getTaskCount(b);
      } else if (column === "name" || column === "createdAt" || column === "updatedAt") {
        first = a[column] ?? "";
        second = b[column] ?? "";
      }

      const comparison =
        typeof first === "number" && typeof second === "number"
          ? first - second
          : String(first).localeCompare(String(second));

      return sortDescriptor.direction === "descending" ? comparison * -1 : comparison;
    });
  }, [projects, sortDescriptor]);

  const openEditor = (project: Project) => {
    setEditingProject(project);
    setEditName(project.name);
    setEditDescription(project.description ?? "");
    setEditNameError("");
    updateProject.reset();
    editOverlay.open();
  };

  const closeEditor = () => {
    editOverlay.close();
    setEditingProject(null);
    setEditName("");
    setEditDescription("");
    setEditNameError("");
    updateProject.reset();
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchDraft.trim());
  };

  const clearSearch = () => {
    setSearch("");
    setSearchDraft("");
    setPage(1);
  };

  const handleEditSubmit = () => {
    if (!editingProject) return;

    if (!editName.trim()) {
      setEditNameError("Project name is required.");
      return;
    }

    updateProject.mutate(
      {
        id: editingProject.id,
        payload: {
          name: editName.trim(),
          description: editDescription.trim() || null,
        },
      },
      { onSuccess: closeEditor }
    );
  };

  const handleDelete = (project: Project) => {
    const confirmed = window.confirm(`Delete "${project.name}"? This cannot be undone.`);
    if (!confirmed) return;

    deleteProject.mutate(project.id, {
      onSuccess: () => {
        if (projects.length === 1 && page > 1) setPage((current) => current - 1);
      },
    });
  };

  const queryError = projectsQuery.isError
    ? getApiErrorMessage(projectsQuery.error)
    : "";
  const mutationError = deleteProject.isError
    ? getApiErrorMessage(deleteProject.error)
    : "";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:flex-row sm:items-center sm:justify-between">
        <form className="flex w-full flex-col gap-2 sm:max-w-md sm:flex-row" onSubmit={handleSearchSubmit}>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              aria-label="Search projects"
              className="pl-9"
              placeholder="Search projects"
              value={searchDraft}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setSearchDraft(event.target.value)
              }
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1 sm:flex-none">
              Search
            </Button>
            {search && (
              <Button isIconOnly type="button" variant="secondary" onPress={clearSearch}>
                <X size={16} />
              </Button>
            )}
          </div>
        </form>

        <div className="flex items-center justify-between gap-3 text-xs text-slate-500 sm:justify-end">
          <span>{pagination?.total ?? 0} total</span>
          <Button
            isIconOnly
            variant="tertiary"
            onPress={() => projectsQuery.refetch()}
            isDisabled={projectsQuery.isFetching}
          >
            <RefreshCw
              size={16}
              className={projectsQuery.isFetching ? "animate-spin" : ""}
            />
          </Button>
        </div>
      </div>

      {(queryError || mutationError) && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-200" role="alert">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{queryError || mutationError}</span>
        </div>
      )}

      <Table variant="secondary" className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <Table.ScrollContainer>
          <Table.Content
            aria-label="Projects table"
            className="min-w-[860px]"
            sortDescriptor={sortDescriptor}
            onSortChange={setSortDescriptor}
          >
            <Table.Header>
              <Table.Column allowsSorting isRowHeader id="name">
                {({ sortDirection }) => (
                  <Table.SortableColumnHeader sortDirection={sortDirection}>
                    Project
                  </Table.SortableColumnHeader>
                )}
              </Table.Column>
              <Table.Column>Description</Table.Column>
              <Table.Column allowsSorting id="tasks">
                {({ sortDirection }) => (
                  <Table.SortableColumnHeader sortDirection={sortDirection}>
                    Tasks
                  </Table.SortableColumnHeader>
                )}
              </Table.Column>
              <Table.Column allowsSorting id="createdAt">
                {({ sortDirection }) => (
                  <Table.SortableColumnHeader sortDirection={sortDirection}>
                    Created
                  </Table.SortableColumnHeader>
                )}
              </Table.Column>
              <Table.Column allowsSorting id="updatedAt">
                {({ sortDirection }) => (
                  <Table.SortableColumnHeader sortDirection={sortDirection}>
                    Updated
                  </Table.SortableColumnHeader>
                )}
              </Table.Column>
              <Table.Column className="text-end">Actions</Table.Column>
            </Table.Header>
            <Table.Body
              renderEmptyState={() => (
                <div className="flex flex-col items-center justify-center gap-1 py-12 text-center">
                  {projectsQuery.isLoading ? (
                    <>
                      <Spinner />
                      <span className="text-sm text-slate-500">Loading projects...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        No projects found
                      </span>
                      <span className="text-xs text-slate-500">
                        {search
                          ? "Try a different search."
                          : "Create your first project to start tracking tasks."}
                      </span>
                    </>
                  )}
                </div>
              )}
            >
              {sortedProjects.map((project) => {
                const taskCount = getTaskCount(project);
                const isDeleting =
                  deleteProject.isPending && deleteProject.variables === project.id;

                return (
                  <Table.Row key={project.id} id={project.id}>
                    <Table.Cell>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {project.name}
                        </span>
                        <span className="max-w-52 truncate text-xs text-slate-400">
                          {project.id}
                        </span>
                      </div>
                    </Table.Cell>
                    <Table.Cell className="max-w-80">
                      <span className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                        {project.description || "No description yet."}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <Chip size="sm" variant="soft" color={taskCount > 0 ? "accent" : "default"}>
                        {taskCount} {taskCount === 1 ? "task" : "tasks"}
                      </Chip>
                    </Table.Cell>
                    <Table.Cell className="text-sm text-slate-500">
                      {formatDate(project.createdAt)}
                    </Table.Cell>
                    <Table.Cell className="text-sm text-slate-500">
                      {formatDate(project.updatedAt)}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="tertiary"
                          aria-label={`View ${project.name}`}
                          onPress={() => router.push(`/projects/${project.id}`)}
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="tertiary"
                          aria-label={`Edit ${project.name}`}
                          onPress={() => openEditor(project)}
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="danger-soft"
                          aria-label={`Delete ${project.name}`}
                          isPending={isDeleting}
                          onPress={() => handleDelete(project)}
                        >
                          {isDeleting ? <Spinner size="sm" color="current" /> : <Trash2 size={16} />}
                        </Button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
        <Table.Footer className="flex flex-col gap-3 border-t border-slate-200 px-3 py-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-slate-500">
            {pagination && pagination.total > 0
              ? `${pageStart} to ${pageEnd} of ${pagination.total} projects`
              : "No projects to show"}
          </span>

          <Pagination size="sm" className="justify-end">
            <Pagination.Content>
              <Pagination.Item>
                <Pagination.Previous
                  isDisabled={page <= 1 || projectsQuery.isFetching}
                  onPress={() => setPage((current) => Math.max(current - 1, 1))}
                >
                  <Pagination.PreviousIcon />
                  <span>Prev</span>
                </Pagination.Previous>
              </Pagination.Item>
              {pageItems.map((item, index) => {
                const previous = pageItems[index - 1];
                const shouldShowEllipsis = previous && item - previous > 1;

                return (
                  <span key={item} className="contents">
                    {shouldShowEllipsis && (
                      <Pagination.Item>
                        <Pagination.Ellipsis />
                      </Pagination.Item>
                    )}
                    <Pagination.Item>
                      <Pagination.Link
                        isActive={item === page}
                        isDisabled={projectsQuery.isFetching}
                        onPress={() => setPage(item)}
                      >
                        {item}
                      </Pagination.Link>
                    </Pagination.Item>
                  </span>
                );
              })}
              <Pagination.Item>
                <Pagination.Next
                  isDisabled={page >= totalPages || projectsQuery.isFetching}
                  onPress={() => setPage((current) => Math.min(current + 1, totalPages))}
                >
                  <span>Next</span>
                  <Pagination.NextIcon />
                </Pagination.Next>
              </Pagination.Item>
            </Pagination.Content>
          </Pagination>
        </Table.Footer>
      </Table>

      <Modal>
        <Modal.Backdrop isOpen={editOverlay.isOpen} onOpenChange={editOverlay.setOpen}>
          <Modal.Container>
            <Modal.Dialog>
              {({ close }) => (
                <>
                  <Modal.CloseTrigger
                    onPress={() => {
                      closeEditor();
                      close();
                    }}
                  />
                  <Modal.Header>
                    <Modal.Heading className="text-black">Edit project</Modal.Heading>
                  </Modal.Header>

                  <Modal.Body className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="edit-project-name" className="mb-1 text-black">
                        Project name
                      </Label>
                      <Input
                        id="edit-project-name"
                        autoFocus
                        value={editName}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          setEditName(event.target.value);
                          setEditNameError("");
                        }}
                      />
                      {editNameError && (
                        <p className="text-xs text-danger mt-0.5">{editNameError}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <Label htmlFor="edit-project-description" className="mb-1 text-black">
                        Description
                      </Label>
                      <TextArea
                        id="edit-project-description"
                        rows={3}
                        value={editDescription}
                        onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                          setEditDescription(event.target.value)
                        }
                      />
                    </div>

                    {updateProject.isError && (
                      <p className="text-sm text-red-600" role="alert">
                        {getApiErrorMessage(updateProject.error)}
                      </p>
                    )}
                  </Modal.Body>

                  <Modal.Footer>
                    <Button variant="secondary" onPress={closeEditor}>
                      Cancel
                    </Button>
                    <Button
                      onPress={handleEditSubmit}
                      isPending={updateProject.isPending}
                    >
                      {({ isPending }) => (
                        <>
                          {isPending && <Spinner size="sm" color="current" />}
                          Save changes
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
    </div>
  );
}
