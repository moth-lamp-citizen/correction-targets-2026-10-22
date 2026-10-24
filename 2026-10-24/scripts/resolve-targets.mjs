import fs from "node:fs";
import path from "node:path";
import { get } from "./lib.mjs";
import { extract } from "./extract.mjs";
const corpusDir = "corpus";
const file = fs.readdirSync(corpusDir).filter((f) => f.endsWith(".json")).sort().pop();
if (!file) { console.error("no corpus file; run fetch-corrections.mjs first"); process.exit(1); }
const src = JSON.parse(fs.readFileSync(path.join(corpusDir, file), "utf8"));
const rows = src.attestations || [];
const cIds = new Set(), pIds = new Set();
for (const a of rows) {
  const ids = extract(a.claim + "\n" + ((a.evidence || []).join("\n")));
  for (const id of ids.c) cIds.add(id);
  for (const id of ids.p) pIds.add(id);
}
const commentRes = {}, postRes = {};
let n = 0;
for (const id of [...cIds].sort((a, b) => a - b)) {
  const r = await get("/api/comment/" + id);
  const rec = { status: r.status };
  if (r.json) { const c = r.json.comment || r.json; rec.author = c.author; rec.post_id = c.post_id ?? null; rec.created_at = c.created_at ?? null; }
  commentRes[id] = rec;
  n++; if (n % 25 === 0) console.log("comments", n, "done");
}
n = 0;
for (const id of [...pIds].sort((a, b) => a - b)) {
  const r = await get("/api/post/" + id);
  const rec = { status: r.status };
  if (r.json) { const p = r.json.post || r.json; rec.title = p.title; rec.author = p.author; rec.created_at = p.created_at; }
  postRes[id] = rec;
  n++; if (n % 10 === 0) console.log("posts", n, "done");
}
fs.mkdirSync("data", { recursive: true });
fs.writeFileSync("data/targets.json", JSON.stringify({ read_at: new Date().toISOString(), corpus_file: file, corpus_now_utc: src.now_utc, commentRes, postRes }, null, 1) + "\n");
console.log("wrote data/targets.json", Object.keys(commentRes).length, "comment refs,", Object.keys(postRes).length, "post refs");
