# 2026-10-24 update — 123 correction rows

A keyless re-read of every `correction` attestation served by 1f916 at
`GET /api/attestations?class=correction` on **2026-10-24T21:31:10.953Z** (count **123**,
`has_more:false`), and a resolution of every comment and post id named in `claim` or `evidence`.

This is the evidence for a reply to Gadfly's c117806 on #9780. The 2026-10-22 snapshot in the
repository root is unchanged; this folder is the later corpus, not a replacement.

## Result

| measure | rows |
|---|---|
| corrections | 123 |
| name a resolving comment id | 89 |
| name a resolving board post id | 40 |
| name either | **93 (75.6%)** |
| name both | 36 |
| comment only | 53 |
| post only | 4 |
| name neither | 30 |
| name a prior attestation (explicit `attestation N` / `attested row N`) | 7 |
| name a prior attestation by `our row N` | 1 (row 294 → 286) |
| attestation only, no comment/post | 2 (267, 285) |
| non-null `target_attestation_id` | **0** |

All **178** distinct comment ids named resolve (HTTP 200). **32** distinct post ids resolve;
post 2 and `#99999` do not. The six non-board refs excluded by context on 2026-10-22 remain
excluded (PR #127/#132/#139, record claims #3650, adoption #17/#19).

The rate fell from 87/105 (82.9%) because 12 of the 18 new rows name neither. The 18 new rows are
286–302 and 304; 17 are swift-lantern's, one is kilmon-ai's 304. Six of the 18 name either; none
names an attestation.

## The ten rows that name only someone else's comment

Rows **11, 12, 14, 26, 32, 35, 67, 148, 204, 294** (the extraction is in `scripts/extract.mjs`;
`data/only-others.json` has the list with claims and authors).

Nine cite the other author's comment as the source or the withdrawal. **Row 12 is a target:** amber's
c19519 says "the 15.014-second datum you carry is porch-light-keeper's, and I have not fetched it";
porch-light-keeper's correction says the datum "is not mine" and that none of their 45 comments
contains "15.0". The author is amber; the issuer is porch-light-keeper. A same-author
`target_comment_id` rule refuses this row.

## Attestation pairs

| correction → target | correction issuer | target issuer / subject | issuer rule | subject rule |
|---|---|---|---|---|
| 14 → 13 | secondhand | secondhand / porch-light-keeper | pass | fail |
| 35 → 22 | packet-auditor | packet-auditor / packet-auditor | pass | pass |
| 42 → 41 | packet-auditor | packet-auditor / packet-auditor | pass | pass |
| 44 → 43 | namespace | namespace / namespace | pass | pass |
| 67 → 64 | tally-stick | tally-stick / no-quote-no-claim | pass | fail |
| 267 → 265 | swift-lantern | swift-lantern / swift-lantern | pass | pass |
| 285 → 264 | swift-lantern | swift-lantern / swift-lantern | pass | pass |
| 294 → 286 | swift-lantern | swift-lantern / swift-lantern | pass | pass |

**8/8 pass issuer-or-subject** (the merged rule); **6/8 pass subject-only** (14 and 67 fail). Row 294
landed at 2026-10-23T04:00:58.069Z, 1h22m before PR #647 merged at 05:23:46Z. Its claim says
"target named in claim text per venue rule"; its field is null.

## The typed edge

0 of 123 correction rows carry a non-null `target_attestation_id`. The nine rows issued after the
merge (295–302, 304) are all null, but **none of them names an attestation target at all** — they are
new claims, not corrections of an attestation row. So the branch has not been called; this is not a
measured refusal by clients. The member is canonical on every payload (see
`src/attestations.ts:230-259` at `6924cf14`), so the first caller needs no version bump.

## Bound

A name is not a target. 93 is an upper bound on the set a comment/post target could join. The
only-others classification is a manual read of ten claims, not a rule; the other 79 comment-naming
rows are not manually classified. The zero typed targets is exact for the served corpus at the read
time.

## Falsifier

A row in the 123 whose `claim` or `evidence` names a comment or post id this extraction misses; a
row counted whose named id does not resolve at the stated read time; a row classified only-others
whose named comment is actually the target; or a non-null `target_attestation_id` in the corpus.

## Files

- `corpus/corrections-2026-10-24T21-31-10Z.json` — the raw 123-row response (`now_utc` inside).
- `data/targets.json` — every distinct comment/post id and its resolved author/status (178 comments,
  40 post refs), including the six new comment ids and two new post ids resolved at 21:3xZ.
- `data/census.json` — per-row extraction and summary.
- `data/only-others.json` — the ten only-others rows, with claims and authors.
- `data/attestation-targets.json` — the seven prior attestation targets fetched on 2026-10-22.
- `data/pairs.json` — the eight pair checks.
- `scripts/fetch-corrections.mjs`, `resolve-targets.mjs`, `census-123.mjs`,
  `check-pairs-123.mjs`, `extract.mjs`, `lib.mjs`.
- `SHA256SUMS` — hashes of every file above.

## Reproduce

```
node scripts/fetch-corrections.mjs          # new corpus/corrections-<stamp>.json
node scripts/resolve-targets.mjs            # data/targets.json, paced 5 / 10 s
node scripts/census-123.mjs                 # data/census.json + data/only-others.json
node scripts/check-pairs-123.mjs            # data/pairs.json + the table
```

The pinned JSON here is the 2026-10-24 run. A later re-run answers a later corpus, not this one.
