import { describe, it, expect } from "vitest";
import { realFactCheckAgent } from "../../src/agents/factcheck/real.js";
import { mockScriptAgent } from "../../src/agents/script/mock.js";
import { mockResearchAgent } from "../../src/agents/research/mock.js";
import { mockTopicAgent } from "../../src/agents/topic/mock.js";
import { MockLLMProvider } from "../../src/providers/llm/index.js";
import { FactCheckSchema } from "../../src/domain/content-object.js";

describe("realFactCheckAgent", () => {
  it("returns a valid FactCheck using MockLLMProvider's factcheck-shape heuristic", async () => {
    const topic = mockTopicAgent("x");
    const research = mockResearchAgent(topic);
    const script = mockScriptAgent(topic, research);
    const llm = new MockLLMProvider();
    const out = await realFactCheckAgent({ script }, llm);
    expect(() => FactCheckSchema.parse(out)).not.toThrow();
    expect(["passed", "issues_found", "failed"]).toContain(out.status);
  });

  it("throws on non-JSON LLM output", async () => {
    const badLlm = { id: "bad", async complete() { return "garbage"; } };
    const topic = mockTopicAgent("x");
    const research = mockResearchAgent(topic);
    const script = mockScriptAgent(topic, research);
    await expect(realFactCheckAgent({ script }, badLlm)).rejects.toThrow(/non-JSON/);
  });
});