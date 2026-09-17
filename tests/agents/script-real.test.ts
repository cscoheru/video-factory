import { describe, it, expect } from "vitest";
import { realScriptAgent } from "../../src/agents/script/real.js";
import { mockResearchAgent } from "../../src/agents/research/mock.js";
import { mockTopicAgent } from "../../src/agents/topic/mock.js";
import { MockLLMProvider } from "../../src/providers/llm/index.js";
import { ScriptSchema, type Research, type Topic } from "../../src/domain/content-object.js";

describe("realScriptAgent", () => {
  const topic = mockTopicAgent("为什么企业知识库上线以后员工还是不愿意使用?");
  const research: Research = mockResearchAgent(topic);

  it("returns a valid Script using MockLLMProvider's script-shape heuristic", async () => {
    const llm = new MockLLMProvider();
    const out = await realScriptAgent({ topic, research }, llm);
    expect(() => ScriptSchema.parse(out)).not.toThrow();
    expect(out.hook.length).toBeGreaterThan(0);
    expect(out.body.length).toBeGreaterThan(0);
    expect(out.conclusion.length).toBeGreaterThan(0);
    expect(out.estimatedDurationSec).toBeGreaterThan(0);
  });

  it("throws when LLM returns invalid JSON", async () => {
    const badLlm = {
      id: "bad",
      async complete() {
        return "this is not json";
      },
    };
    await expect(
      realScriptAgent({ topic, research }, badLlm)
    ).rejects.toThrow(/non-JSON/);
  });

  it("throws when LLM returns JSON not matching Script schema", async () => {
    const wrongShape = {
      id: "wrong",
      async complete() {
        return JSON.stringify({ totally: "wrong", fields: [] });
      },
    };
    await expect(
      realScriptAgent({ topic, research }, wrongShape)
    ).rejects.toThrow();
  });
});