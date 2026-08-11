import { randomUUID } from "crypto";
import { db } from "./db";
import type { PersonaId } from "./personas";

export type BlogPostStatus =
  | "draft_pending" // queued, not yet generated
  | "generating"
  | "needs_review" // draft generated, waiting on employee review
  | "approved" // employee marked as done
  | "failed";

export type BlogPost = {
  id: string;
  projectId: string;
  topic: string;
  persona: PersonaId;
  status: BlogPostStatus;
  title: string | null;
  content: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
};

type BlogPostRow = {
  id: string;
  project_id: string;
  topic: string;
  persona: string;
  status: string;
  title: string | null;
  content: string | null;
  error: string | null;
  created_at: string;
  updated_at: string;
};

function rowToPost(row: BlogPostRow): BlogPost {
  return {
    id: row.id,
    projectId: row.project_id,
    topic: row.topic,
    persona: row.persona as PersonaId,
    status: row.status as BlogPostStatus,
    title: row.title,
    content: row.content,
    error: row.error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function listBlogPosts(projectId: string): BlogPost[] {
  const rows = db
    .prepare(
      `SELECT * FROM blog_posts WHERE project_id = ? ORDER BY created_at ASC`
    )
    .all(projectId) as BlogPostRow[];
  return rows.map(rowToPost);
}

export function getBlogPost(id: string): BlogPost | null {
  const row = db.prepare(`SELECT * FROM blog_posts WHERE id = ?`).get(id) as
    | BlogPostRow
    | undefined;
  return row ? rowToPost(row) : null;
}

export function createBlogPost(input: {
  projectId: string;
  topic: string;
  persona: PersonaId;
}): BlogPost {
  const now = new Date().toISOString();
  const post: BlogPost = {
    id: randomUUID(),
    projectId: input.projectId,
    topic: input.topic,
    persona: input.persona,
    status: "draft_pending",
    title: null,
    content: null,
    error: null,
    createdAt: now,
    updatedAt: now,
  };
  db.prepare(
    `INSERT INTO blog_posts (id, project_id, topic, persona, status, title, content, error, created_at, updated_at)
     VALUES (@id, @projectId, @topic, @persona, @status, @title, @content, @error, @createdAt, @updatedAt)`
  ).run(post);
  return post;
}

export function updateBlogPost(
  id: string,
  patch: Partial<
    Pick<BlogPost, "status" | "title" | "content" | "error" | "topic" | "persona">
  >
): BlogPost | null {
  const existing = getBlogPost(id);
  if (!existing) return null;
  const updated: BlogPost = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  db.prepare(
    `UPDATE blog_posts SET topic=@topic, persona=@persona, status=@status, title=@title, content=@content, error=@error, updated_at=@updatedAt WHERE id=@id`
  ).run(updated);
  return updated;
}

export function deleteBlogPost(id: string): void {
  db.prepare(`DELETE FROM blog_posts WHERE id = ?`).run(id);
}
