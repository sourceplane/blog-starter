# Epic: blog-starter (BS)

**Vercel's Blog Starter is the smallest product-shaped template in its catalog — Markdown posts, a hero post, a grid of more stories, one post page — and it needs nothing from Vercel but a Node runtime at build time. On Cloudflare it is a Worker plus static assets built by OpenNext, with the Cirrus baseline's repository shape around it: an Orun intent, one component per deployable, a credential-free check lane as the merge gate, and an Orun lane that turns on when the product is linked to a workspace.**

The upstream code stays the code. The port adds the Workers build (`@opennextjs/cloudflare`), the monorepo wrapper (pnpm + Turborepo, shared tsconfig and eslint), a test package that exercises the posts loader, and the deploy contract. The one behavioural change is that unknown post slugs are a 404 instead of an on-demand render, because a Worker has no filesystem at request time.

## Status

| Field | Value |
|-------|-------|
| Status | ✅ Shipped — BS0–BS2 landed (#1, #2, #3) |
| Cluster | **BS** (BS0–BS2) |
| Owner(s) | `apps/web` (the site) · `tests/web` (the posts-loader tests) |
| Builds on | `cirrus-baseline` conventions (intent, components, `checks.yml` gate, gated `ci.yml`) — no bounded context of the fleet is needed |
| Upstream | [vercel/next.js `examples/blog-starter`](https://github.com/vercel/next.js/tree/canary/examples/blog-starter) |
| Changes | Adds the Workers build, the monorepo wrapper, tests and the deploy contract; the template's components, styles, posts and loader are untouched |
| Decisions locked | (1) OpenNext on Workers + Static Assets, not Pages. (2) Posts are pre-rendered; `dynamicParams = false`. (3) No infra root: the site binds nothing. |
| Gate | BS1 is the first user-visible rung (the site serves from a Worker). |
| Shipped as | `main` after [#3](https://github.com/sourceplane/blog-starter/pull/3); verified locally under `wrangler dev`, deploy gated until a workspace is linked |

## Read order

1. `design.md` — what maps to what, the build, what is out of scope
2. `implementation-plan.md` — the milestones and what "done" means for each
3. `risks-and-open-questions.md` — what could go wrong and what was decided
4. `IMPLEMENTATION-STATUS.md` — what actually shipped (kept distinct from intent)

## Milestones at a glance

| Milestone | What it lands | Done when |
|---|---|---|
| BS0 — the spec | this doc set and the task contracts | merged on `main` |
| BS1 — the blog on Workers | `apps/web` built by OpenNext, `tests/web`, green checks | `wrangler dev` serves every page from the worker; Checks green |
| BS2 — ready to instantiate | README, as-built status | a reader can run, test, preview and deploy it |
