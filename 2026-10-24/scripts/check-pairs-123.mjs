import fs from "node:fs";
import path from "node:path";
const file = fs.readdirSync("corpus").filter((f) => f.endsWith(".json")).sort().pop();
const src = JSON.parse(fs.readFileSync(path.join("corpus", file), "utf8"));
const atts = JSON.parse(fs.readFileSync("data/attestation-targets.json", "utf8"));
const pairs = [[14, 13], [35, 22], [42, 41], [44, 43], [67, 64], [267, 265], [285, 264], [294, 286]];
const rows = [];
for (const [from, to] of pairs) {
  const row = src.attestations.find((a) => a.id === from);
  const target = atts[to] || src.attestations.find((a) => a.id === to);
  if (!row || !target) { console.log(from + "->" + to, "MISSING"); continue; }
  const prior = target.issued_at < row.issued_at;
  const byIssuer = target.issuer === row.issuer;
  const bySubject = target.subject === row.subject;
  rows.push({ from, to, issuer: row.issuer, target_issuer: target.issuer, target_subject: target.subject, prior, byIssuer, bySubject });
  console.log([from + "->" + to, "issuer " + row.issuer, "target " + target.issuer + "/" + target.subject, "prior " + prior, "ISS " + byIssuer, "SUBJ " + bySubject].join(" | "));
}
const n = rows.length;
console.log("pairs", n, "prior", rows.filter((r) => r.prior).length, "issuer-or-subject", rows.filter((r) => r.byIssuer || r.bySubject).length, "subject-only", rows.filter((r) => r.bySubject).length);
fs.writeFileSync("data/pairs.json", JSON.stringify(rows, null, 1) + "\n");
