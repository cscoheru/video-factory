import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { MockLLMProvider, getLLMProvider, readMockMode } from "../src/providers/llm/index.js";

describe("MockLLMProvider", () => {
  it("echoes prompt and reports id", async () => {
    const p = new MockLLMProvider();
    expect(p.id).toBe("mock");
    const out = await p.complete("hello");
    expect(out).toContain("hello");
  });

  it("returns JSON with echo when json:true and no recognizable schema", async () => {
    const p = new MockLLMProvider();
    const out = await p.complete("test", { json: true });
    const parsed = JSON.parse(out);
    expect(parsed.echo).toBeDefined();
    expect(parsed.model).toBe("mock");
  });

  it("dispatches to Script-shape JSON when system prompt mentions estimatedDurationSec", async () => {
    const p = new MockLLMProvider();
    const out = await p.complete("write script", {
      json: true,
      system: "返回 JSON, 必须含 estimatedDurationSec 字段",
    });
    const parsed = JSON.parse(out);
    expect(parsed.hook).toBeDefined();
    expect(parsed.body).toBeDefined();
    expect(parsed.conclusion).toBeDefined();
    expect(parsed.estimatedDurationSec).toBe(60);
  });

  it("dispatches to FactCheck-shape JSON when system prompt mentions severity", async () => {
    const p = new MockLLMProvider();
    const out = await p.complete("check", {
      json: true,
      system: '输出 JSON: {"status": "...", "issues": [{"severity": "info"}], "corrections": []}',
    });
    const parsed = JSON.parse(out);
    expect(parsed.status).toBe("passed");
    expect(parsed.issues).toEqual([]);
    expect(parsed.corrections).toEqual([]);
  });

  it("dispatches to Storyboard-shape JSON when system prompt mentions visualType", async () => {
    const p = new MockLLMProvider();
    const out = await p.complete("storyboard", {
      json: true,
      system: "visualType 必须是 text/image/diagram/screenshot 之一",
    });
    const parsed = JSON.parse(out);
    expect(parsed.scenes).toBeDefined();
    expect(parsed.scenes.length).toBeGreaterThan(0);
    expect(parsed.scenes[0].visualType).toBe("text");
  });
});

describe("getLLMProvider", () => {
  const originalEnv = process.env.LLM_PROVIDER;

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.LLM_PROVIDER;
    } else {
      process.env.LLM_PROVIDER = originalEnv;
    }
  });

  it("returns mock when envValue is undefined", () => {
    expect(getLLMProvider(undefined).id).toBe("mock");
  });

  it("returns mock when envValue is 'mock'", () => {
    expect(getLLMProvider("mock").id).toBe("mock");
  });

  it("returns mock for unknown envValue (graceful fallback)", () => {
    expect(getLLMProvider("unknown-provider").id).toBe("mock");
  });

  it("returns glm provider when envValue='glm' (Phase 3)", () => {
    // Provide a fake API key so GLMProvider constructor doesn't throw.
    process.env.GLM_API_KEY = "test-key";
    try {
      const p = getLLMProvider("glm");
      expect(p.id).toBe("glm");
    } finally {
      delete process.env.GLM_API_KEY;
    }
  });

  it("throws when envValue='glm' and GLM_API_KEY is empty", () => {
    delete process.env.GLM_API_KEY;
    expect(() => getLLMProvider("glm")).toThrow(/apiKey/);
  });
});

describe("readMockMode", () => {
  it("defaults to true when MOCK_MODE is unset", () => {
    const orig = process.env.MOCK_MODE;
    delete process.env.MOCK_MODE;
    try {
      expect(readMockMode()).toBe(true);
    } finally {
      if (orig !== undefined) process.env.MOCK_MODE = orig;
    }
  });

  it("honours MOCK_MODE=false", () => {
    const orig = process.env.MOCK_MODE;
    process.env.MOCK_MODE = "false";
    try {
      expect(readMockMode()).toBe(false);
    } finally {
      if (orig !== undefined) process.env.MOCK_MODE = orig;
      else delete process.env.MOCK_MODE;
    }
  });
});