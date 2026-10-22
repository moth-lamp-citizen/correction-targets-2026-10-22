import fs from "node:fs";
import path from "node:path";
import { extract } from "./extract.mjs";
const corpusDir = "corpus";
const file = fs.readdirSync(corpusDir).filter((f) => f.endsWith(".json")).sort().pop();
if (!file) { console.error("no corpus file; run fetch-corrections.mjs first"); process.exit(1); }
const src = JSON.parse(fs.readFileSync(path.join(corpusDir, file), "utf8"));
const tgt = JSON.parse(fs.readFileSync("data/targets.json", "utf8"));
const rows = src.attestations || [];
const cRes = tgt.commentRes, pRes = tgt.postRes;
const out = [];
for (const r of rows) {
  const text = r.claim + "\n" + ((r.evidence || []).join("\n"));
  const ids = extract(text);
  const cr = ids.c.filter((id) => cRes[id] && cRes[id].status === 200);
  const pr = ids.p.filter((id) => pRes[id] && pRes[id].status === 200);
  out.push({
    id: r.id, issuer: r.issuer, signed: r.signed, claim: r.claim,
    c: ids.c, p: ids.p, a: ids.a, excluded: ids.excluded,
    cResolved: cr, pResolved: pr,
    namesComment: cr.length > 0, namesPost: pr.length > 0,
    namesEither: cr.length > 0 || pr.length > 0, namesAtt: ids.a.length > 0,
    cUnresolved: ids.c.filter((id) => !cr.includes(id)),
    pUnresolved: ids.p.filter((id) => !pr.includes(id)),
  });
}
const count = (f) => out.filter(f).length;
const summary = {
  rows: out.length,
  namesComment: count((x) => x.namesComment),
  namesPost: count((x) => x.namesPost),
  namesEither: count((x) => x.namesEither),
  namesNeither: count((x) => !x.namesEither),
  both: count((x) => x.namesComment && x.namesPost),
  commentOnly: count((x) => x.namesComment && !x.namesPost),
  postOnly: count((x) => x.namesPost && !x.namesComment),
  namesAtt: count((x) => x.namesAtt),
  attOnly: count((x) => x.namesAtt && !x.namesEither),
  attAndEither: count((x) => x.namesAtt && x.namesEither),
  unresolvedCommentIds: [...new Set(out.flatMap((x) => x.cUnresolved))].sort((a, b) => a - b),
  unresolvedPostIds: [...new Set(out.flatMap((x) => x.pUnresolved))].sort((a, b) => a - b),
  distinctCommentsResolved: new Set(out.flatMap((x) => x.cResolved)).size,
  distinctPostsResolved: new Set(out.flatMap((x) => x.pResolved)).size,
  excludedRefs: out.flatMap((x) => x.excluded.map((e) => ({ row: x.id, ...e }))),
};
fs.writeFileSync("data/census.json", JSON.stringify({ source_read: src.now_utc, resolved_read: tgt.read_at, summary, rows: out }, null, 1) + "\n");
console.log(JSON.stringify(summary, null, 1));
