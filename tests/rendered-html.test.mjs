import assert from "node:assert/strict";
import test from "node:test";

test("renders canonical application metadata and beginner guidance", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, /<link[^>]+rel="canonical"[^>]+href="https:\/\/sol-lens\.onrender\.com\/"/i);
  assert.match(html, /property="og:image" content="https:\/\/sol-lens\.onrender\.com\/og\.png"/i);
  assert.doesNotMatch(html, /codex-preview/i);
  assert.match(html, /Explore 7 examples/);
  assert.doesNotMatch(html, /Open packet/);
  assert.doesNotMatch(html, /Paste JSON/);
  assert.match(html, /New to SOL\? Start with an example\./);
  assert.match(html, /HOLD/);
  assert.match(html, /Observable baseline vs locally replayed candidate/);
  assert.match(html, /Self-Organizing Logos/);
  assert.match(html, /Not(?:<!-- -->)? the GPT-5\.6 Sol model name/i);
  assert.match(html, /href="https:\/\/github\.com\/TechmanStudios\/sol"/);
  assert.match(html, /href="https:\/\/github\.com\/TechmanStudios\/sol-lens"/);
  assert.doesNotMatch(html, /field-line/);
  assert.match(html, /Observable trace · (?:<!-- -->)?10(?:<!-- -->)? atomic units/);
  assert.match(html, /Observable traces only · no hidden reasoning claims/);
});
