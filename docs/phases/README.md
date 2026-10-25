# The phases — one blueprint, three selections

`repo-blueprint.yaml` declares three phases that take a site from **nothing**
to **live on stage and prod, documented**. Run them one at a time with
`--phase <name>`, or the whole sequence unattended with `--resume`. There is
no umbrella workflow and no per-phase document: a phase is a selection on one
artifact, which is what makes running one alone, months later, from a fresh
container the same operation as running them all.

Each phase lands one pull request, checked in the box first; the deploying
phase, `02-site`, follows the whole contract:

> **place its modules → brand them → check them in the box and land them as
> one pull request → watch the convergence that merge triggers
> (auto-resumed) → verify the outcome over HTTP.**

The run's task set-up — the epic, a milestone per phase, a task per landing
— runs in the background from the start; the first hook that needs it, the
phase's `task`, waits for it.

Run from the baseline checkout (the blueprint's source is `path: .`); the
site's repository is wherever `--out` points.

## Execution order

The phase number is the EXECUTION order, and each phase's `requires.phases`
states it in the document: the engine refuses a phase whose predecessor is not
placed, and names it.

Every landing is a pull request on a branch named for its task
(`orun/BASE-<n>-<phase>`), checked before it is pushed: `orun validate`, then
`orun plan` as the pull request and as the merge would plan it, in the box,
in under a second (`checks: local`). Then it merges; nothing waits for the
PR's CI. On those branches `ci.yml` runs `plan` only and skips the lanes,
because the merge runs them on main a minute later, for real, and that
convergence is what the phase watches. The site carries no other workflow:
the baseline's own CI (Tier 2) installs, renders the fixtures, type-checks,
lints, tests and builds the scaffold's landing and the finished site before a
tag is cut, and every later pull request in the site runs `ci.yml`'s verify
lanes.

| phase | lands | verified by |
|---|---|---|
| [`01-scaffold`](01-scaffold.md) | **the GitHub repo created** and born: intent, CI, tooling, identity | repo pushed, workspace-linked, its commit checked in the box and merged |
| [`02-site`](02-site.md) | `apps/web` + `tests/web`, deployed to stage and prod side by side | convergence green (build, deploy, smoke) + both URLs answer |
| [`03-docs`](03-docs.md) | the live-deployment record; the promotion gate and dev lanes put back | committed manifest matches probed reality |

There is no custom-domain phase. Attaching a domain to a Worker needs zone
permissions the platform's brokered `workers-deploy` token does not carry, so
it is an owner's step after the bootstrap — the site's README, "Custom
domain", says how, and `SITE_URL` in `intent.yaml` makes the build use it.

## Inputs

`01-scaffold` takes the site's identity once and writes it into the repo
(`.rebrand/values.json`); every later phase reads it back from the placed
tree. But the blueprint's **required** inputs — `reponame`, `productname`,
`productdomain`, `githuborg` — are validated before any phase runs, so they
must be supplied on every invocation, single-phase ones included. A
`--values` file is easier than repeating `--set`.

- `subdomain` — the workers.dev subdomain of the Cloudflare account. It is
  in every URL the phases probe and in the origin the site is built with.
- `orunWorkspace` — workspace id (`ws_…`). Unset, it is the workspace the
  build runs in (`from: workspace`); with none anywhere, a placeholder that
  fails loudly rather than silently claiming another tenant's workspace.
- `epicSlug` (default `blog-baselining`) — the epic every phase clubs
  its task under. Found by slug, so a fresh run and a resumed run find the
  same work.
- `repoPrivate` (default `true`) — the repository's visibility at creation.

```bash
orun new --blueprint repo-blueprint.yaml \
  --out $HOME/sites/acme-notes --run-hooks --phase 02-site \
  --values ~/acme-notes.values.yaml
```

Drop `--run-hooks` (or add `--status`) to preview. Without it a phase places
files and stops: no repo, no landing, no convergence watch, and no probe —
which is exactly what makes a dry instantiation of this baseline possible in
CI with no workspace and no provider (`testing/placement.test.sh`,
`testing/e2e.test.sh`).

## What every phase does after it places

Placement writes the baseline's files as they are here. Before a phase lands,
its `post` hooks make them the site's:

1. `retouch` (deploying phases) — one `# orun: redeploy <phase> <stamp>` line
   at the end of each component.yaml its task contract names, so a re-run
   after a failed convergence still has a diff to land and redeploys exactly
   those components.
2. `rebrand` → `rebrand --verify` — the identity rename over the whole tree,
   then a sweep that fails on any of this baseline's identity left behind.

The baseline's complete lockfile ships as it is, with `01-scaffold`: it
carries no identity, and the projects it names that are not placed yet are
the ones `02-site` places — a frozen install accepts it at every landing. The
lanes install it with `--frozen-lockfile`, as the baseline's own CI does on
the scaffold's landing and on the finished site before a tag.

## When a phase fails

- **Before it lands** (a probe that timed out, a rebrand residue, a refused
  link, a tree the landing's own `orun plan` refuses): nothing was merged.
  Fix what the message names and re-run the phase.
- **After it lands** (the convergence went red): the files are on main.
  `orun.run/watch@v1` has already resumed the run up to three times. Re-run
  the phase (`--phase 02-site`, `--redo 02-site` under `--resume`, or the
  console's Retry): its `retouch` hook gives the landing a diff and the
  component redeploys.
