import { beforeAll, describe, expect, it } from "vitest";
import * as path from "node:path";

// The loader reads `_posts` relative to process.cwd(), exactly as the Vercel
// template does; the app directory is the cwd at build time.
const appDir = path.resolve(__dirname, "../../../apps/web");

describe("posts loader (apps/web/src/lib/api.ts)", () => {
  beforeAll(() => {
    process.chdir(appDir);
  });

  it("lists every markdown post, newest first", async () => {
    const { getAllPosts, getPostSlugs } = await import("@/lib/api");
    const slugs = getPostSlugs();
    expect(slugs.length).toBeGreaterThanOrEqual(3);
    const posts = getAllPosts();
    expect(posts.map((p) => p.slug).sort()).toEqual(
      slugs.map((s) => s.replace(/\.md$/, "")).sort(),
    );
    for (let i = 1; i < posts.length; i++) {
      expect(posts[i - 1]!.date >= posts[i]!.date).toBe(true);
    }
  });

  it("reads a post's front matter and body by slug", async () => {
    const { getPostBySlug } = await import("@/lib/api");
    const post = getPostBySlug("hello-world.md");
    expect(post.slug).toBe("hello-world");
    expect(post.title).toBeTruthy();
    expect(post.author.name).toBeTruthy();
    expect(post.content.trim().length).toBeGreaterThan(0);
  });

  it("renders markdown to html", async () => {
    const { default: markdownToHtml } = await import("@/lib/markdownToHtml");
    const html = await markdownToHtml("# Title\n\nA *paragraph*.");
    expect(html).toContain("<h1>Title</h1>");
    expect(html).toContain("<em>paragraph</em>");
  });
});
