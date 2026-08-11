import { NextRequest, NextResponse } from "next/server";
import { deleteBlogPost, getBlogPost, updateBlogPost } from "@/lib/blogPosts";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const existing = getBlogPost(id);
  if (!existing) {
    return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
  }

  const body = await req.json();
  const { title, content, status, topic, persona } = body as {
    title?: string;
    content?: string;
    status?: "needs_review" | "approved";
    topic?: string;
    persona?: string;
  };

  const post = updateBlogPost(id, {
    ...(title !== undefined ? { title } : {}),
    ...(content !== undefined ? { content } : {}),
    ...(status !== undefined ? { status } : {}),
    ...(topic !== undefined ? { topic } : {}),
    ...(persona !== undefined ? { persona: persona as never } : {}),
  });

  return NextResponse.json({ post });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  deleteBlogPost(id);
  return NextResponse.json({ ok: true });
}
