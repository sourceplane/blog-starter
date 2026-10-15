import { afterEach, describe, expect, it, vi } from "vitest";

describe("site identity (apps/web/src/lib/site.ts)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("names the site and links its source repository", async () => {
    const { SITE_NAME, SOURCE_URL } = await import("@/lib/site");
    expect(SITE_NAME.trim()).not.toBe("");
    expect(SOURCE_URL).toMatch(/^https:\/\/github\.com\/[A-Za-z0-9-]+\/[a-z0-9-]+$/);
  });

  it("takes its origin from NEXT_PUBLIC_SITE_URL, the dev server otherwise", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    expect((await import("@/lib/site")).SITE_ORIGIN).toBe("http://localhost:3000");
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://acme-blog-web-stage.acme.workers.dev");
    expect((await import("@/lib/site")).SITE_ORIGIN).toBe("https://acme-blog-web-stage.acme.workers.dev");
  });
});
