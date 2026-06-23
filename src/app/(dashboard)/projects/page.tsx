import { ProjectList } from "../../../components/projects/ProjectList";
import { CreateProjectModal } from "../../../components/projects/CreateProjectModal";

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Everything you&apos;re organizing, in one place.
          </p>
        </div>
        <CreateProjectModal />
      </div>

      <ProjectList />
    </div>
  );
}