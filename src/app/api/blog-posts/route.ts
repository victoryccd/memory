import { NextRequest, NextResponse } from "next/server";
import { createBlogPost, listBlogPosts, updateBlogPost } from "@/lib/blogPosts";
import { generateBlogDraft } from "@/lib/anthropic";
import { PERSONAS, type PersonaId } from "@/lib/personas";

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) {
    return NextResponse.json({ error: "projectId가 필요합니다." }, { status: 400 });
  }
  return NextResponse.json({ posts: listBlogPosts(projectId) });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { projectId, topic, persona } = body as {
    projectId?: string;
    topic?: string;
    persona?: PersonaId;
  };

  if (!projectId || !topic?.trim() || !persona || !PERSONAS[persona]) {
    return NextResponse.json(
      { error: "projectId, topic, persona가 모두 필요합니다." },
      { status: 400 }
    );
  }

  let post = createBlogPost({ projectId, topic: topic.trim(), persona });
  post = updateBlogPost(post.id, { status: "generating" })!;

  try {
    const { title, content } = await generateBlogDraft({ topic: post.topic, persona });
    post = updateBlogPost(post.id, {
      status: "needs_review",
      title,
      content,
      error: null,
    })!;
  } catch (err) {
    post = updateBlogPost(post.id, {
      status: "failed",
      error: err instanceof Error ? err.message : "생성 중 오류가 발생했습니다.",
    })!;
  }

  return NextResponse.json({ post });
}
