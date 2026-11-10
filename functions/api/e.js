// POST /api/e  records a game event or an email signup.  GET /api/e  reports whether storage is connected.
import { json, init } from "./_db.js";

const EVENTS = new Set([
  "game_start", "game_end", "copy_result", "challenge_copy", "challenge_open", "practice_start", "gate_shown",
]);
const ORIGIN = /^https:\/\/([a-z0-9-]+\.)?(structuralvacancy\.com|structuralvacancy\.pages\.dev)$/;
const int = (v, lo, hi) => (Number.isInteger(v) && v >= lo && v <= hi ? v : null);

export async function onRequestGet({ env }) {
  if (!env.DB) return json({ ok: false });
  try {
    await init(env.DB);
    return json({ ok: true });
  } catch (e) {
    return json({ ok: false });
  }
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ ok: false }, 503);
  const origin = request.headers.get("origin") || "";
  if (origin && !ORIGIN.test(origin)) return json({ ok: false }, 403);

  let b;
  try {
    const text = await request.text();
    if (text.length > 2000) return json({ ok: false }, 413);
    b = JSON.parse(text);
  } catch (e) {
    return json({ ok: false }, 400);
  }
  if (!b || typeof b !== "object") return json({ ok: false }, 400);

  const vid = typeof b.vid === "string" && /^[a-z0-9]{8,32}$/.test(b.vid) ? b.vid : null;
  const now = Date.now();

  const write = async () => {
    if (b.t === "email") {
      const email = String(b.email || "").trim().toLowerCase();
      if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json({ ok: false, error: "email" }, 400);
      await env.DB.prepare("INSERT OR IGNORE INTO emails (email, ts, vid) VALUES (?, ?, ?)").bind(email, now, vid).run();
      return json({ ok: true });
    }
    if (b.t === "event" && EVENTS.has(b.name)) {
      await env.DB
        .prepare("INSERT INTO events (ts, name, day, deal, mode, won, bids, first, vid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .bind(
          now, b.name, int(b.day, 1, 100000), int(b.deal, 0, 999),
          b.mode === "daily" || b.mode === "practice" ? b.mode : null,
          b.won === true ? 1 : b.won === false ? 0 : null,
          int(b.bids, 0, 5), int(b.first, 10, 2000), vid
        )
        .run();
      return json({ ok: true });
    }
    return json({ ok: false }, 400);
  };

  try {
    return await write();
  } catch (e) {
    try {
      await init(env.DB);
      return await write();
    } catch (e2) {
      return json({ ok: false }, 500);
    }
  }
}
