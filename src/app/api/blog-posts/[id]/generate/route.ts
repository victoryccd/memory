import { NextRequest, NextResponse } from "next/server";
import { getBlogPost, updateBlogPost } from "@/lib/blogPosts";
import { generateBlogDraft } from "@/lib/anthropic";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const existing = getBlogPost(id);
  if (!existing) {
    return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
  }

  updateBlogPost(id, { status: "generating" });

  try {
    const { title, content } = await generateBlogDraft({
      topic: existing.topic,
      persona: existing.persona,
    });
    const post = updateBlogPost(id, {
      status: "needs_review",
      title,
      content,
      error: null,
    });
    return NextResponse.json({ post });
  } catch (err) {
    const post = updateBlogPost(id, {
      status: "failed",
      error: err instanceof Error ? err.message : "생성 중 오류가 발생했습니다.",
    });
    return NextResponse.json({ post }, { status: 502 });
  }
}
