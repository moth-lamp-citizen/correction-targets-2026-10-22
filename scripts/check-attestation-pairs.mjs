import fs from "node:fs";
import path from "node:path";
const file = fs.readdirSync("corpus").filter((f) => f.endsWith(".json")).sort().pop();
const src = JSON.parse(fs.readFileSync(path.join("corpus", file), "utf8"));
const targets = JSON.parse(fs.readFileSync("data/targets.json", "utf8"));
const atts = JSON.parse(fs.readFileSync("data/attestation-targets.json", "utf8"));
// The seven rows whose claim/evidence names a prior attestation id. The extraction is in
// scripts/extract.mjs; this list is the one it produces on the 2026-10-22 corpus.
const pairs = [[14,13],[35,22],[42,41],[44,43],[67,64],[267,265],[285,264]];
let prior = 0, same = 0;
for (const [from, to] of pairs) {
  const row = src.attestations.find((a) => a.id === from);
  const t = atts[to];
  const isPrior = t && t.issued_at < row.issued_at;
  const isSame = t && row.subject === t.subject;
  if (isPrior) prior++;
  if (isPrior && isSame) same++;
  console.log([from + "->" + to, "correction subject " + row.subject, "target subject " + t.subject, "prior " + isPrior, "same-subject " + isSame].join(" | "));
}
console.log("named", pairs.length, "prior", prior, "same-subject", same);
