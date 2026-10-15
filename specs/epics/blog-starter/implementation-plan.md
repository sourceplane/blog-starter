# blog-starter — implementation plan

Milestones land in order; each task is one pull request on an
`orun/BS-n-<slug>` branch with an `Orun-Task: BS-n` trailer.

## BS0 — the spec ✅

This doc set, `epic.yaml` and the task contracts, merged to `main`.

**Done when**
- the five documents and `epic.yaml` are on `main`
- `tasks/BS-1.TaskContract.yaml`, `BS-2`, `BS-3` exist (BS-4 joined with BS3)

## BS1 — the blog on Workers ✅

`apps/web` is the upstream template with the Workers build around it;
`tests/web` exercises the posts loader and the markdown renderer.

**Done when**
- `pnpm install && pnpm typecheck && pnpm lint && pnpm test && pnpm build` is green locally and in `Checks`
- `.open-next/worker.js` and `.open-next/assets/` exist after the build
- `wrangler dev` (via `pnpm --filter @app/web preview`) answers `/` with the hero post and `/posts/hello-world` with the post body

## BS2 — ready to instantiate ✅

The README explains the port and how to run, test, preview and deploy it;
`IMPLEMENTATION-STATUS.md` records what shipped and every departure.

**Done when**
- the README's quick start works from a fresh clone
- the status file names the PRs and the `dynamicParams` departure

## BS3 — a baseline

`blueprint.yaml`, `repo-blueprint.yaml`, `.baseline/` (identity, task
contracts, the site's README), `tooling/rebrand`, `tooling/bootstrap`,
`hooks/render-deployment-docs.sh`, `ai/context/`, `docs/phases/`,
`BOOTSTRAP.md`, `testing/`, `baseline.yml` and `tag.yml` — ported from
portfolio-starter-kit's PK3 and the fixes its first live bootstrap found
(PK-5), with the site-specific parts rewritten for this app (design §6).

**Done when**
- orun at the bootstrap floor (v2.58.11) and at the lane pin (v2.78.4) reads
  `repo-blueprint.yaml`, and `testing/manifest.test.sh` holds the card to it
- `Baseline CI` is green: the contract tests, the leak gate, the offline
  bootstrap (`testing/placement.test.sh`) and the end-to-end tier
  (`testing/e2e.test.sh`)
- the status file records what is proven offline and what only a live
  bootstrap can prove

## After BS3 (outside this repository)

1. Cut `baseline-v1` with `tag.yml` from the merged `main`.
2. Merge the row in orun-cloud's `infra/baselines-registry/baselines.yaml`
   (unlisted, `manifestPath: blueprint.yaml`) — its catalogue preflight
   refuses a tag that does not exist yet.
3. Bootstrap one site from the tag against a workspace; record its timings;
   then flip the row to public with a page on orunbase.com.

## Sequencing note

BS1 needs nothing but BS0's contracts. BS2 is documentation over BS1's
verified build and can land the same day; BS3 packages BS1's site as a
baseline. Deploying to a Cloudflare account is not a milestone here: it is
the Orun lane (`ci.yml`), which plans nothing until `intent.yaml` names a
real workspace instead of `ws_CHANGE_ME`.
