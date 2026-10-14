# blog-starter — implementation plan

Milestones land in order; each task is one pull request on an
`orun/BS-n-<slug>` branch with an `Orun-Task: BS-n` trailer.

## BS0 — the spec ✅

This doc set, `epic.yaml` and the task contracts, merged to `main`.

**Done when**
- the five documents and `epic.yaml` are on `main`
- `tasks/BS-1.TaskContract.yaml`, `BS-2`, `BS-3` exist

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

## Sequencing note

BS1 needs nothing but BS0's contracts. BS2 is documentation over BS1's
verified build and can land the same day. Deploying to a Cloudflare account
is not a milestone here: it is the Orun lane (`ci.yml`) that turns on when
`intent.yaml`'s workspace is set and the `ORUN_CI` variable is `true`.
