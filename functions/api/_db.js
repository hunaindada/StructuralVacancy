// Shared helpers for the Price the Deal backend. Storage is a D1 database bound as DB.
export const json = (o, s = 200) =>
  new Response(JSON.stringify(o), {
    status: s,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

export async function init(db) {
  await db.batch([
    db.prepare(
      "CREATE TABLE IF NOT EXISTS events (ts INTEGER NOT NULL, name TEXT NOT NULL, day INTEGER, deal INTEGER, mode TEXT, won INTEGER, bids INTEGER, first INTEGER, vid TEXT)"
    ),
    db.prepare("CREATE INDEX IF NOT EXISTS events_name_day ON events (name, day)"),
    db.prepare("CREATE TABLE IF NOT EXISTS emails (email TEXT PRIMARY KEY, ts INTEGER NOT NULL, vid TEXT)"),
  ]);
}
