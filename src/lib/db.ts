import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "dashboard.db");

declare global {
  // eslint-disable-next-line no-var
  var __dashboardDb: Database.Database | undefined;
}

function createConnection() {
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      topic TEXT NOT NULL,
      persona TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft_pending',
      title TEXT,
      content TEXT,
      error TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  return db;
}

// Reuse a single connection across hot reloads in dev.
export const db = global.__dashboardDb ?? createConnection();
if (process.env.NODE_ENV !== "production") {
  global.__dashboardDb = db;
}
