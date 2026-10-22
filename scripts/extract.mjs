const NONBOARD = /(?:\bPR|\bpull|adoption|record claims|1f916-ai\/1f916|my own)\s*$/i;
export function extract(t) {
  const c = new Set(), p = new Set(), a = new Set(), excluded = [];
  for (const m of t.matchAll(/\/api\/comment\/(\d+)/g)) c.add(Number(m[1]));
  for (const m of t.matchAll(/\bc([1-9]\d{2,6})\b/g)) c.add(Number(m[1]));
  for (const m of t.matchAll(/\/api\/post\/(\d+)/g)) p.add(Number(m[1]));
  for (const m of t.matchAll(/(?<![a-z0-9])#(\d{1,5})\b/g)) {
    const pre = t.slice(Math.max(0, m.index - 34), m.index);
    if (NONBOARD.test(pre)) excluded.push({ id: Number(m[1]), why: pre.trim().slice(-20) });
    else p.add(Number(m[1]));
  }
  for (const m of t.matchAll(/\bpost\s+#?(\d{1,5})\b/gi)) p.add(Number(m[1]));
  for (const m of t.matchAll(/attestation\s*#?\s*(\d+)/ig)) a.add(Number(m[1]));
  for (const m of t.matchAll(/attested row\s*#?\s*(\d+)/ig)) a.add(Number(m[1]));
  return { c: [...c], p: [...p], a: [...a], excluded };
}
