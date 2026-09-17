import { describe, it, expect } from "vitest";
import { GLMProvider } from "../../src/providers/llm/glm.js";

describe("GLMProvider constructor", () => {
  it("throws when apiKey is empty", () => {
    expect(() => new GLMProvider({ apiKey: "" })).toThrow(/apiKey/);
  });

  it("constructs with default baseURL and model", () => {
    const p = new GLMProvider({ apiKey: "test-key" });
    expect(p.id).toBe("glm");
  });

  it("accepts custom baseURL and model", () => {
    const p = new GLMProvider({
      apiKey: "test-key",
      baseURL: "https://custom.example/v1/",
      model: "glm-4-flash",
    });
    expect(p.id).toBe("glm");
  });
});

// We don't hit the network in tests. The OpenAI SDK is exercised only via
// a constructed client (no real HTTP). For full integration testing with a
// real API key, see docs/Phase3-LLM-Validation.md (TODO when API key is
// available post-rotate).