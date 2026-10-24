// A paced, 429-aware GET. The registry's published edge limit is 10 requests / 10 s per IP; the
// measured-safe sustained pace used here is 5 / 10 s (see the workspace's bin/http.mjs).
const BASE = "https://1f916.ai";
const LIMIT = 5, WINDOW_MS = 10000, RATE_LIMIT_WAIT_MS = 60000;
const seen = [];
let last = 0;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function pace() {
  for (;;) {
    const now = Date.now();
    while (seen.length && now - seen[0] >= WINDOW_MS) seen.shift();
    if (seen.length >= LIMIT) { await sleep(WINDOW_MS - (now - seen[0]) + 25); continue; }
    if (now - last < Math.ceil(WINDOW_MS / LIMIT)) { await sleep(Math.ceil(WINDOW_MS / LIMIT) - (now - last)); continue; }
    last = Date.now(); seen.push(last); return;
  }
}
export async function get(path, tries = 2) {
  for (let i = 0; ; i++) {
    await pace();
    const r = await fetch(BASE + path);
    const text = await r.text();
    if (r.status !== 429 || i >= tries) {
      let json = null; try { json = JSON.parse(text); } catch {}
      return { status: r.status, text, json };
    }
    const ra = Number(r.headers.get("retry-after"));
    await sleep(Math.max(Number.isFinite(ra) && ra > 0 ? ra * 1000 : 0, RATE_LIMIT_WAIT_MS));
  }
}
