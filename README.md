# blog-starter

Vercel's [Next.js Blog Starter](https://github.com/vercel/next.js/tree/canary/examples/blog-starter)
— Markdown posts in `_posts/`, statically generated — running on **Cloudflare
Workers + Static Assets** through [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare),
and packaged as an **Orun baseline**: one command takes a new blog from
nothing to live on stage and prod, in its own repository, under its own name.

The template's code is the code. What the port adds is the Workers build,
the monorepo wrapper, a test package, and the deploy contract; what it swaps
is the hard-coded site name and source link (for one `site.ts`). What the
baseline adds is everything needed to make a copy of it somebody else's —
built the way [cirrus-baseline](https://github.com/sourceplane/cirrus-baseline)
and [portfolio-starter-kit](https://github.com/sourceplane/portfolio-starter-kit)
are. See [`specs/epics/blog-starter`](specs/epics/blog-starter/README.md) for
the design, the milestones and the as-built status.

## Instantiating a site

```bash
git clone --depth 1 --branch <baseline-tag> https://github.com/sourceplane/blog-starter
cd blog-starter
orun new --blueprint repo-blueprint.yaml --out ~/sites/acme-notes --run-hooks --resume \
  --set reponame=acme-notes --set productname="Acme Notes" --set productdomain=acme.dev \
  --set githuborg=acme-inc --set subdomain=<workers-dev-subdomain>
```

Or, once the platform's registry lists it, from the Orun console (Baselines →
`blog-starter` → Build). Three phases — `01-scaffold` (the repository, its CI
and identity), `02-site` (the site deployed to stage and prod, smoke-tested),
`03-docs` (the live deployment recorded) — each landing one pull request in
the new repository. **[BOOTSTRAP.md](BOOTSTRAP.md)** is the operator guide;
[docs/phases/](docs/phases/README.md) has a page per phase.

The new repository receives the **site only** — the app, its tests, its CI,
its tooling, a README of its own and its operating contract — renamed
throughout to the site's name, repository and Cloudflare Worker. None of this
repository's machinery ships.

| What makes it a baseline | Where |
|---|---|
| The console card (inputs, secrets, programme) | `blueprint.yaml` |
| The build document (modules, phases, hooks) | `repo-blueprint.yaml` |
| This tree's identity, and the bootstrap's task contracts | `.baseline/` |
| The rename engine | `tooling/rebrand/rebrand.mjs` |
| The bootstrap's helpers (deferrals, redeploy marker, work-tree strip) | `tooling/bootstrap/` |
| The deployment-record renderer | `hooks/render-deployment-docs.sh` |
| The site's README and context pack | `.baseline/product/README.md`, `ai/context/` |
| The baseline's tests: contract, leak, offline bootstrap, end to end | `testing/`, `.github/workflows/baseline.yml` |
| Cutting a `baseline-vN` tag | `.github/workflows/tag.yml` |

## What is here (the site)

| Surface | Where |
|---|---|
| The site's name and source link | `apps/web/src/lib/site.ts` |
| The blog — hero post, more stories, `/posts/[slug]` | `apps/web/src/app` |
| Posts (Markdown with front matter) | `apps/web/_posts` |
| Posts loader + markdown renderer | `apps/web/src/lib/api.ts`, `apps/web/src/lib/markdownToHtml.ts` |
| Workers build and deploy contract | `apps/web/next.config.mjs`, `apps/web/open-next.config.ts`, `apps/web/wrangler.jsonc`, `apps/web/component.yaml` |
| Tests | `tests/web` (vitest) |

## Getting started

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build            # next build + opennextjs-cloudflare build → apps/web/.open-next
```

Develop with Next's dev server, or preview the real Worker output locally:

```bash
pnpm --filter @app/web dev        # http://localhost:3000
pnpm --filter @app/web preview    # wrangler dev over .open-next/worker.js
```

Add a post by dropping a Markdown file with front matter into
`apps/web/_posts/`; it is pre-rendered at build time.

One optional build-time variable (`apps/web/.env.example`):
`NEXT_PUBLIC_SITE_URL`, the site's public origin, which makes the posts' Open
Graph images absolute. The Orun build sets it to the environment's `SITE_URL`
(intent.yaml), else its Worker URL. Defaults to `http://localhost:3000`.

## How it maps to Vercel

| Vercel | Here |
|---|---|
| Next.js hosting (SSG, App Router) | Cloudflare Worker (`.open-next/worker.js`) + Static Assets (`ASSETS` binding) |
| Build-time filesystem reads of `_posts` | Unchanged; every post is pre-rendered (`dynamicParams = false`, so an unknown slug is a 404 — a Worker has no filesystem at request time) |
| Deploy on push | Orun deploys `<repo>-web-{stage,prod}` on merge to `main` (`apps/web/component.yaml`) |
| "Deploy with Vercel" (clone the template) | `orun new --blueprint repo-blueprint.yaml` — a new repository, branded, deployed |

## CI

| Workflow | What it runs | Ships to a site |
|---|---|---|
| `ci.yml` | the Orun pipeline, and the only workflow a site carries: `orun plan --changed`, then one job per lane. A pull request runs the verify lanes (the site built and dry-deployed per environment; the tests' `quick-check` lane installs and checks the package, it does not run them), except the bootstrap's own landings (`orun/BASE-*`), where `plan` alone is the check; a merge deploys stage → prod. It plans nothing while `intent.yaml` names the placeholder workspace `ws_CHANGE_ME`, as this repository does | yes |
| `baseline.yml` | the baseline's own tiers: contract tests, the blueprint read by the pinned orun, the leak gate, the offline bootstrap, the site built, dry-deployed and served | no |
| `tag.yml` | cuts a `baseline-vN` tag (manual) | no |
