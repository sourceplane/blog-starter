# blog-starter

Vercel's [Next.js Blog Starter](https://github.com/vercel/next.js/tree/canary/examples/blog-starter)
— Markdown posts in `_posts/`, statically generated — running on **Cloudflare
Workers + Static Assets** through [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare),
inside the repository conventions of the
[Cirrus baseline](https://github.com/sourceplane/cirrus-baseline): an
[Orun](https://github.com/sourceplane/orun) intent, one component per
deployable, a credential-free check lane as the merge gate, and an Orun lane
that turns on once the product is linked to a workspace.

The template's code is the code. What the port adds is the Workers build,
the monorepo wrapper, a test package, and the deploy contract. See
[`specs/epics/blog-starter`](specs/epics/blog-starter/README.md) for the
design, the milestones and the as-built status.

## What is here

| Surface | Where |
|---|---|
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

## How it maps to Vercel

| Vercel | Here |
|---|---|
| Next.js hosting (SSG, App Router) | Cloudflare Worker (`.open-next/worker.js`) + Static Assets (`ASSETS` binding) |
| Build-time filesystem reads of `_posts` | Unchanged; every post is pre-rendered (`dynamicParams = false`, so an unknown slug is a 404 — a Worker has no filesystem at request time) |
| Deploy on push | Orun deploys `blog-starter-web-{stage,prod}` on merge to `main` (`apps/web/component.yaml`) |

## Deploying

`.github/workflows/checks.yml` runs install, typecheck, lint, test and build on
every push and pull request. `ci.yml` is the Orun deployment pipeline: set
`execution.state.workspace` in `intent.yaml` to this product's Orun workspace
(`orun cloud link`), connect a Cloudflare account to that workspace, and set
the `ORUN_CI` repository variable to `true`. From then on a merge to `main`
deploys the Worker to `stage`, then `prod`.
