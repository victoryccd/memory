import Link from "next/link";
import { PROJECTS } from "@/lib/projects";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">사업별 업무 목록</h1>
        <p className="mt-1 text-sm text-slate-500">
          진행 중인 모든 사업의 업무가 이 대시보드 하나에 모입니다. 사업을 선택해 단계별 업무를
          진행하세요.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {PROJECTS.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-500 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">{project.title}</h2>
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                진행중
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-500">{project.description}</p>
            <p className="mt-3 text-xs text-slate-400">{project.steps.length}개 단계</p>
          </Link>
        ))}

        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-slate-400">
          <h2 className="font-semibold">다음 사업 준비중</h2>
          <p className="mt-2 text-sm">
            새로운 사업이 시작되면 이곳에 업무 카드가 추가됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
