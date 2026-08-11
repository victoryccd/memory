import { notFound } from "next/navigation";
import Link from "next/link";
import { getProject } from "@/lib/projects";
import BlogBoard from "./BlogBoard";

export default async function BlogPage({
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
        <Link
          href={`/projects/${projectId}`}
          className="text-sm text-slate-400 hover:text-slate-600"
        >
          ← {project.title}
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">블로그 콘텐츠 제작</h1>
        <p className="mt-1 text-sm text-slate-500">
          주제와 화자를 입력하면 설정에 맞춰 블로그 초안이 자동으로 작성됩니다. 최소 4개 이상
          작성 후 내용을 검수하고 완료 처리하세요.
        </p>
      </div>

      <BlogBoard projectId={projectId} />
    </div>
  );
}
