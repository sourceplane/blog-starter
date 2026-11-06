# blog-starter — risks and open questions

## BS-A — OpenNext and Next.js version drift (RISK, mitigated)

The upstream template pins `next: latest`. `@opennextjs/cloudflare` supports
a declared Next range (`>=15.5.27 <16 || >=16.3.8` at 1.20). The port pins
both (`next 16.4.1`, `@opennextjs/cloudflare ^1.20`) so a `pnpm install`
reproduces the verified build; bumping Next is a deliberate PR that re-runs
the build and the preview.

## BS-B — Unknown post slugs (RESOLVED)

On Vercel an unknown slug reaches `fs.readFileSync` and errors. On a Worker
there is no filesystem at request time. Decision: `dynamicParams = false`
on `posts/[slug]`, so every post is pre-rendered and anything else is a
404. This is the only behavioural change and it is an improvement.

## BS-C — Worker size (ACCEPTED)

The OpenNext worker for this template is small (no server components fetch
data). Larger templates must watch the compressed Worker size limit; this
one does not.

## BS-D — Google Fonts at build time (ACCEPTED)

`next/font/google` downloads Inter during `next build`. The build runner has
network access; an offline build would fail at this step, as it does on
Vercel.

## BS-E — Node's experimental Web Storage during prerender (RESOLVED)

Node 25 defines `localStorage` as a global object with no working methods,
which breaks upstream's `typeof localStorage !== "undefined"` check at
prerender. The theme switcher now also checks `typeof localStorage.getItem
=== "function"`. CI builds on Node 22, where the global is absent; the extra
check keeps a local build on a newer Node green.

## BS-F — Not yet proven live (RESOLVED 2026-11-05)

BS3 is proven offline: the contract tests, the leak gate, the offline
bootstrap and the end-to-end tier (built, dry-deployed, served under
`wrangler dev`, smoked) are green. Nothing short of a bootstrap against a
workspace proves the platform's half — the repository created, the brokered
Cloudflare token minted, the deploy and the workers.dev probes. The registry
row stays `unlisted` until one has run end to end, and `expectedMinutes` is
the card's estimate until then. portfolio-starter-kit's first live bootstrap
found two failures its offline tiers missed (its risks PK-J and PK-K); both
fixes are carried here, and the tests that now reproduce them came with them.

Proven 2026-11-05: `vijayakrishnans/hired-in-the-ai-era` was built from
`baseline-v3` with the CLI and went live on stage and prod, and the registry
row went public on that evidence. The first builds from the console then found
BS-G.

## BS-G — A typed workers.dev subdomain fails after deploy (RESOLVED)

The card asked for the subdomain in a form. There is one right answer, the
account's own, and a wrong one is only found when the smoke check tests an
address nothing answers on: two console builds on 2026-11-05 carried `b` and
`v` while their sites were live at the real address. Those values were first
keystrokes, because the hand-off's auto-start fired as soon as the box matched
its pattern (fixed in the console, sourceplane/orun-cloud). The card now reads
the value from the Cloudflare connection, as portfolio-starter-kit's does, so
there is no box to get wrong. The CLI build that proved BS-F passed the right
value by hand, which is why it did not find this.

## BS-H — 03-docs needs PyYAML the build box lacks (RESOLVED)

`hooks/render-deployment-docs.sh` imported `yaml` to read `SITE_URL` from
`intent.yaml`. The build box has python3 but not PyYAML, so the import failed
with exit 1 and no message. The first console build to reach 03-docs
(2026-11-06) stopped there with its site live on stage and prod; local and CLI
runs had PyYAML and passed. The hook now uses PyYAML when present and reads that
one key by indentation otherwise. `testing/render.test.sh` runs it under a
python3 with no third-party packages.
