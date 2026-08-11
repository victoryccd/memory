"use client";

import { useEffect, useState } from "react";
import { PERSONA_LIST, PERSONAS, type PersonaId } from "@/lib/personas";
import type { BlogPost } from "@/lib/blogPosts";

const TARGET_COUNT = 4;

const STATUS_LABEL: Record<BlogPost["status"], string> = {
  draft_pending: "대기중",
  generating: "생성중...",
  needs_review: "검수 필요",
  approved: "완료",
  failed: "생성 실패",
};

const STATUS_STYLE: Record<BlogPost["status"], string> = {
  draft_pending: "bg-slate-100 text-slate-500",
  generating: "bg-amber-100 text-amber-700",
  needs_review: "bg-blue-100 text-blue-700",
  approved: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

export default function BlogBoard({ projectId }: { projectId: string }) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState("");
  const [persona, setPersona] = useState<PersonaId>("expert");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadPosts() {
    const res = await fetch(`/api/blog-posts?projectId=${projectId}`);
    const data = await res.json();
    setPosts(data.posts ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/blog-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, topic, persona }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "요청 중 오류가 발생했습니다.");
      } else {
        setPosts((prev) => [...prev, data.post]);
        setTopic("");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function regenerate(id: string) {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "generating" } : p))
    );
    const res = await fetch(`/api/blog-posts/${id}/generate`, { method: "POST" });
    const data = await res.json();
    if (data.post) {
      setPosts((prev) => prev.map((p) => (p.id === id ? data.post : p)));
    }
  }

  async function updatePost(id: string, patch: Partial<BlogPost>) {
    const res = await fetch(`/api/blog-posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (data.post) {
      setPosts((prev) => prev.map((p) => (p.id === id ? data.post : p)));
    }
  }

  async function deletePost(id: string) {
    if (!confirm("이 글을 삭제할까요?")) return;
    await fetch(`/api/blog-posts/${id}`, { method: "DELETE" });
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  const approvedCount = posts.filter((p) => p.status === "approved").length;
  const progress = Math.min(100, Math.round((approvedCount / TARGET_COUNT) * 100));

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700">
            완료된 글 {approvedCount} / {TARGET_COUNT}
          </span>
          <span className="text-slate-400">{progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-3 rounded-xl border border-slate-200 bg-white p-5"
      >
        <h2 className="font-semibold text-slate-900">새 블로그 글 요청</h2>
        <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">주제</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="예: 겨울철 실내 공기질 관리 팁"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">화자</label>
            <select
              value={persona}
              onChange={(e) => setPersona(e.target.value as PersonaId)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
            >
              {PERSONA_LIST.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-xs text-slate-400">{PERSONAS[persona].description}</p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !topic.trim()}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {submitting ? "생성 요청 중..." : "초안 생성 요청"}
        </button>
      </form>

      <div className="space-y-4">
        {loading && <p className="text-sm text-slate-400">불러오는 중...</p>}
        {!loading && posts.length === 0 && (
          <p className="text-sm text-slate-400">아직 등록된 글이 없습니다.</p>
        )}
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onRegenerate={() => regenerate(post.id)}
            onApprove={() => updatePost(post.id, { status: "approved" })}
            onReopen={() => updatePost(post.id, { status: "needs_review" })}
            onSaveContent={(title, content) => updatePost(post.id, { title, content })}
            onDelete={() => deletePost(post.id)}
          />
        ))}
      </div>
    </div>
  );
}

function PostCard({
  post,
  onRegenerate,
  onApprove,
  onReopen,
  onSaveContent,
  onDelete,
}: {
  post: BlogPost;
  onRegenerate: () => void;
  onApprove: () => void;
  onReopen: () => void;
  onSaveContent: (title: string, content: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(post.title ?? "");
  const [content, setContent] = useState(post.content ?? "");

  useEffect(() => {
    setTitle(post.title ?? "");
    setContent(post.content ?? "");
  }, [post.title, post.content]);

  const isGenerating = post.status === "generating";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {PERSONAS[post.persona]?.label ?? post.persona}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[post.status]}`}
          >
            {STATUS_LABEL[post.status]}
          </span>
        </div>
        <div className="flex gap-2 text-xs">
          <button
            onClick={onRegenerate}
            disabled={isGenerating}
            className="rounded-md border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            재생성
          </button>
          {post.status === "needs_review" && (
            <button
              onClick={onApprove}
              className="rounded-md border border-green-300 bg-green-50 px-2 py-1 text-green-700 hover:bg-green-100"
            >
              완료 처리
            </button>
          )}
          {post.status === "approved" && (
            <button
              onClick={onReopen}
              className="rounded-md border border-slate-300 px-2 py-1 text-slate-600 hover:bg-slate-50"
            >
              다시 검수
            </button>
          )}
          <button
            onClick={onDelete}
            className="rounded-md border border-red-200 px-2 py-1 text-red-500 hover:bg-red-50"
          >
            삭제
          </button>
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-500">주제: {post.topic}</p>

      {post.status === "failed" && post.error && (
        <p className="mt-2 text-sm text-red-600">오류: {post.error}</p>
      )}

      {isGenerating && (
        <p className="mt-3 text-sm text-amber-600">AI가 초안을 작성하고 있습니다...</p>
      )}

      {!isGenerating && post.content && (
        <div className="mt-3">
          {editing ? (
            <div className="space-y-2">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium focus:border-brand-500 focus:outline-none"
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onSaveContent(title, content);
                    setEditing(false);
                  }}
                  className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600"
                >
                  저장
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="font-semibold text-slate-900">{post.title}</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                {post.content}
              </p>
              <button
                onClick={() => setEditing(true)}
                className="mt-3 text-xs font-medium text-brand-600 hover:underline"
              >
                내용 수정
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
