# apps/web — the site

A statically generated blog, from Vercel's Next.js Blog Starter (in
[next.js/examples](https://github.com/vercel/next.js/tree/canary/examples),
MIT), running on Cloudflare Workers + Static Assets:

- Markdown posts with front matter (`_posts`), rendered to HTML at build time
- A hero post, more stories, cover images and author avatars
- A light/dark theme switcher
- Tailwind CSS

The site's name and the repository it links to are in `src/lib/site.ts`.

```bash
pnpm dev        # next dev on http://localhost:3000
pnpm build      # next build + opennextjs-cloudflare build → .open-next/
pnpm preview    # wrangler dev over the built Worker
```

How it is deployed — per environment, on merge to `main` — is the
repository's README and `component.yaml` beside this file.
