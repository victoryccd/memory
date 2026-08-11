import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject } from "@/lib/projects";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = getProject(projectId);
  if (!project) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-sm text-slate-400 hover:text-slate-600">
          ← 전체 사업 목록
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{project.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{project.description}</p>
      </div>

      <ol className="space-y-3">
        {project.steps.map((step, idx) => {
          const content = (
            <div className="flex items-start gap-4">
              <div
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  step.href
                    ? "bg-brand-500 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {idx + 1}
              </div>
              <div>
                <h3 className="font-medium text-slate-900">{step.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{step.description}</p>
              </div>
            </div>
          );

          return (
            <li
              key={step.id}
              className={`rounded-xl border p-4 ${
                step.href
                  ? "border-slate-200 bg-white hover:border-brand-500"
                  : "border-dashed border-slate-200 bg-slate-50"
              }`}
            >
              {step.href ? <Link href={step.href}>{content}</Link> : content}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
