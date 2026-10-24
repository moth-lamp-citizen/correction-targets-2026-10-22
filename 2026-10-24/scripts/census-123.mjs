import fs from "node:fs";
import path from "node:path";
import { extract } from "./extract.mjs";

const corpusDir = "corpus";
const file = fs.readdirSync(corpusDir).filter((f) => f.endsWith(".json")).sort().pop();
if (!file) { console.error("no corpus file; run fetch-corrections.mjs first"); process.exit(1); }
const src = JSON.parse(fs.readFileSync(path.join(corpusDir, file), "utf8"));
const rows = src.attestations || [];
const tgt = JSON.parse(fs.readFileSync("data/targets.json", "utf8"));
const cRes = tgt.commentRes, pRes = tgt.postRes;

const out = [];
for (const r of rows) {
  const text = r.claim + "\n" + ((r.evidence || []).join("\n"));
  const ids = extract(text);
  const cr = ids.c.filter((id) => cRes[id] && cRes[id].status === 200);
  const pr = ids.p.filter((id) => pRes[id] && pRes[id].status === 200);
  const authors = cr.map((id) => String(cRes[id].author));
  out.push({
    id: r.id, issuer: r.issuer, subject: r.subject, signed: r.signed, claim: r.claim,
    issued_at: r.issued_at, target_attestation_id: r.target_attestation_id,
    c: ids.c, p: ids.p, a: ids.a, excluded: ids.excluded,
    cResolved: cr, pResolved: pr, authors,
    namesComment: cr.length > 0, namesPost: pr.length > 0,
    namesEither: cr.length > 0 || pr.length > 0, namesAtt: ids.a.length > 0,
    ownComment: authors.some((a) => a === r.issuer),
    onlyOthers: authors.length > 0 && authors.every((a) => a !== r.issuer),
    cUnresolved: ids.c.filter((id) => !cr.includes(id)),
    pUnresolved: ids.p.filter((id) => !pr.includes(id)),
  });
}
const count = (f) => out.filter(f).length;
const summary = {
  rows: out.length,
  source_now_utc: src.now_utc,
  source_count: src.count,
  has_more: src.has_more,
  namesComment: count((x) => x.namesComment),
  namesPost: count((x) => x.namesPost),
  namesEither: count((x) => x.namesEither),
  namesNeither: count((x) => !x.namesEither),
  both: count((x) => x.namesComment && x.namesPost),
  commentOnly: count((x) => x.namesComment && !x.namesPost),
  postOnly: count((x) => x.namesPost && !x.namesComment),
  namesAtt: count((x) => x.namesAtt),
  attOnly: count((x) => x.namesAtt && !x.namesEither),
  commentRowsWithOwn: count((x) => x.namesComment && x.ownComment),
  commentRowsOnlyOthers: count((x) => x.namesComment && x.onlyOthers),
  typedTargets: count((x) => x.target_attestation_id != null),
  distinctCommentsResolved: new Set(out.flatMap((x) => x.cResolved)).size,
  distinctPostsResolved: new Set(out.flatMap((x) => x.pResolved)).size,
  unresolvedCommentIds: [...new Set(out.flatMap((x) => x.cUnresolved))].sort((a, b) => a - b),
  unresolvedPostIds: [...new Set(out.flatMap((x) => x.pUnresolved))].sort((a, b) => a - b),
};
const only = out.filter((x) => x.namesComment && x.onlyOthers).map((x) => ({
  row: x.id, issuer: x.issuer, comments: x.cResolved, authors: x.authors,
  claim: x.claim,
}));
fs.writeFileSync("data/census.json", JSON.stringify({ read_at: new Date().toISOString(), source_now_utc: src.now_utc, summary, onlyOthers: only, rows: out }, null, 1) + "\n");
fs.writeFileSync("data/only-others.json", JSON.stringify(only, null, 1) + "\n");
console.log(JSON.stringify(summary, null, 1));
console.log("only-others rows:", only.map((x) => x.row).join(","));
