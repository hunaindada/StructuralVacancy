// GET /api/crowd?day=N  returns how other bidders did on a daily deal. Withheld until five people have finished it.
import { json } from "./_db.js";

const MIN_BIDDERS = 5;

export async function onRequestGet({ request, env }) {
  if (!env.DB) return json({ n: 0 });
  const day = parseInt(new URL(request.url).searchParams.get("day") || "", 10);
  if (!Number.isInteger(day) || day < 1 || day > 100000) return json({ n: 0 }, 400);
  try {
    // One row per player: their earliest finish of this deal.
    const { results } = await env.DB
      .prepare("SELECT won, bids, first, MIN(ts) AS ts FROM events WHERE name = 'game_end' AND mode = 'daily' AND day = ? AND vid IS NOT NULL GROUP BY vid")
      .bind(day)
      .all();
    const n = results.length;
    if (n < MIN_BIDDERS) return json({ n });
    const out = [0, 0, 0, 0, 0, 0];
    const first = new Array(20).fill(0);
    for (const r of results) {
      if (r.won === 1 && r.bids >= 1 && r.bids <= 5) out[r.bids - 1]++;
      else out[5]++;
      if (Number.isInteger(r.first)) first[Math.max(0, Math.min(19, Math.floor(r.first / 20)))]++;
    }
    return json({ n, out, first });
  } catch (e) {
    return json({ n: 0 });
  }
}
