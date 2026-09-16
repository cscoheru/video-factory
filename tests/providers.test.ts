import { describe, it, expect } from "vitest";
import { MockLLMProvider, getLLMProvider } from "../src/providers/llm/index.js";

describe("MockLLMProvider", () => {
  it("echoes prompt and reports id", async () => {
    const p = new MockLLMProvider();
    expect(p.id).toBe("mock");
    const out = await p.complete("hello");
    expect(out).toContain("hello");
  });

  it("returns JSON when json:true", async () => {
    const p = new MockLLMProvider();
    const out = await p.complete("test", { json: true });
    const parsed = JSON.parse(out);
    expect(parsed.echo).toBeDefined();
    expect(parsed.model).toBe("mock");
  });
});

describe("getLLMProvider", () => {
  it("returns mock for any input in Phase 2", () => {
    expect(getLLMProvider(undefined).id).toBe("mock");
    expect(getLLMProvider("glm").id).toBe("mock"); // Phase 3 will branch
  });
});