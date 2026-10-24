import fs from "node:fs";
import { get } from "./lib.mjs";
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19) + "Z";
fs.mkdirSync("corpus", { recursive: true });
const r = await get("/api/attestations?class=correction");
if (r.status !== 200 || !r.json) { console.error("HTTP", r.status, r.text.slice(0, 200)); process.exit(1); }
const out = "corpus/corrections-" + stamp + ".json";
fs.writeFileSync(out, r.text);
console.log("wrote", out, "rows", r.json.count, "has_more", r.json.has_more, "now_utc", r.json.now_utc);
