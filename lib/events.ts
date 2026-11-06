import "server-only";
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { validVisitorId, type Variant } from "./experiment";

type EventKind = "impression" | "conversion";
export type Counts = { impressions: number; conversions: number };

let database: DatabaseSync | undefined;
function db(): DatabaseSync {
  if (database) return database;
  const path = resolve(process.env.EXPERIMENT_DB_PATH || "data/eventos.sqlite");
  mkdirSync(dirname(path), { recursive: true });
  const instance = new DatabaseSync(path);
  instance.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visitor_id TEXT NOT NULL,
      variant TEXT NOT NULL CHECK (variant IN ('a', 'b')),
      kind TEXT NOT NULL CHECK (kind IN ('impression','conversion')),
      session_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE UNIQUE INDEX IF NOT EXISTS one_impression_per_session
      ON events(session_id) WHERE kind = 'impression';
    CREATE UNIQUE INDEX IF NOT EXISTS one_conversion_per_visitor
      ON events(visitor_id) WHERE kind = 'conversion';
  `);
  database = instance;
  return instance;
}

function validEvent(visitorId: string, variant: Variant, kind: EventKind, sessionId?: string): boolean {
  return validVisitorId(visitorId) && (variant === "a" || variant === "b") &&
    (kind === "impression" || kind === "conversion") &&
    (kind !== "impression" || (typeof sessionId === "string" && validVisitorId(sessionId)));
}

export function recordImpression(visitorId: string, variant: Variant, sessionId: string): boolean {
  if (!validEvent(visitorId, variant, "impression", sessionId)) return false;
  const result = db().prepare(`INSERT OR IGNORE INTO events
      (visitor_id, variant, kind, session_id) VALUES (?, ?, 'impression', ?)`).run(visitorId, variant, sessionId);
  return result.changes === 1;
}

export function recordConversion(visitorId: string, variant: Variant): boolean {
  if (!validEvent(visitorId, variant, "conversion")) return false;
  const result = db().prepare(`INSERT OR IGNORE INTO events
      (visitor_id, variant, kind, session_id) VALUES (?, ?, 'conversion', NULL)`).run(visitorId, variant);
  return result.changes === 1;
}

export function getCounts(): Record<Variant, Counts> {
  const result: Record<Variant, Counts> = {
    a: { impressions: 0, conversions: 0 },
    b: { impressions: 0, conversions: 0 },
  };
  const rows = db().prepare(`SELECT variant, kind, count(*) AS total
    FROM events GROUP BY variant, kind`).all();
  for (const row of rows) {
    if ((row.variant === "a" || row.variant === "b") &&
        (row.kind === "impression" || row.kind === "conversion") &&
        typeof row.total === "number" && Number.isSafeInteger(row.total) && row.total >= 0) {
      result[row.variant][row.kind === "impression" ? "impressions" : "conversions"] = row.total;
    }
  }
  return result;
}
