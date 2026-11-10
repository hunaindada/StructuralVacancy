// GET /api/stats?key=...  private play counts. The key is the STATS_KEY secret set in the Cloudflare dashboard.
export async function onRequestGet({ request, env }) {
  const key = new URL(request.url).searchParams.get("key") || "";
  if (!env.DB || !env.STATS_KEY || key !== env.STATS_KEY) return new Response("Not found", { status: 404 });
  const q = async (sql) => (await env.DB.prepare(sql).all()).results;
  let days = [], totals = {}, emails = 0;
  try {
    days = await q(
      "SELECT date(ts/1000, 'unixepoch', '-6 hours') AS d," +
        " COUNT(DISTINCT CASE WHEN name='game_start' THEN vid END) AS players," +
        " SUM(name='game_start') AS starts, SUM(name='game_end') AS finishes, SUM(name='game_end' AND won=1) AS wins," +
        " SUM(name='practice_start') AS practice, SUM(name='copy_result') AS copies, SUM(name='challenge_copy') AS challenges," +
        " SUM(name='challenge_open') AS challenge_opens, SUM(name='gate_shown') AS gate_shown" +
        " FROM events GROUP BY d ORDER BY d DESC LIMIT 60"
    );
    totals = (await q("SELECT COUNT(DISTINCT vid) AS players, SUM(name='game_end') AS finishes FROM events"))[0] || {};
    emails = ((await q("SELECT COUNT(*) AS c FROM emails"))[0] || {}).c || 0;
  } catch (e) {}
  const cols = ["d", "players", "starts", "finishes", "wins", "practice", "copies", "challenges", "challenge_opens", "gate_shown"];
  const head = ["Day (CT)", "Players", "Games started", "Finished", "Won", "Practice deals", "Result copies", "Challenges sent", "Challenges opened", "Email box shown"];
  const esc = (v) => String(v == null ? 0 : v).replace(/[<&]/g, "");
  const rows = days.map((r) => "<tr>" + cols.map((c) => "<td>" + esc(r[c]) + "</td>").join("") + "</tr>").join("");
  const html =
    '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Price the Deal stats</title>' +
    "<style>body{font:15px/1.5 system-ui,sans-serif;background:#e8e2d4;color:#1a1714;margin:0;padding:24px 16px}h1{font-size:22px;margin:0 0 4px}p{margin:0 0 16px}div{overflow-x:auto}table{border-collapse:collapse;font-variant-numeric:tabular-nums}th,td{border-top:1px solid #cfc6b6;padding:8px 12px;text-align:right;white-space:nowrap}th:first-child,td:first-child{text-align:left}th{font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:#5c564c}</style>" +
    "<h1>Price the Deal</h1><p>" + esc(totals.players) + " players all time, " + esc(totals.finishes) + " games finished, " + esc(emails) + " email signups.</p>" +
    "<div><table><tr>" + head.map((h) => "<th>" + h + "</th>").join("") + "</tr>" + rows + "</table></div>";
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}
