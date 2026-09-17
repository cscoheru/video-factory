import { describe, it, expect } from "vitest";
import { realStoryboardAgent } from "../../src/agents/storyboard/real.js";
import { mockScriptAgent } from "../../src/agents/script/mock.js";
import { mockResearchAgent } from "../../src/agents/research/mock.js";
import { mockTopicAgent } from "../../src/agents/topic/mock.js";
import { MockLLMProvider } from "../../src/providers/llm/index.js";
import { StoryboardSchema } from "../../src/domain/content-object.js";

describe("realStoryboardAgent", () => {
  it("returns a valid Storyboard using MockLLMProvider's storyboard-shape heuristic", async () => {
    const topic = mockTopicAgent("x");
    const research = mockResearchAgent(topic);
    const script = mockScriptAgent(topic, research);
    const llm = new MockLLMProvider();
    const out = await realStoryboardAgent({ script }, llm);
    expect(() => StoryboardSchema.parse(out)).not.toThrow();
    expect(out.scenes.length).toBeGreaterThanOrEqual(1);
  });

  it("throws on non-JSON LLM output", async () => {
    const badLlm = { id: "bad", async complete() { return "garbage"; } };
    const topic = mockTopicAgent("x");
    const research = mockResearchAgent(topic);
    const script = mockScriptAgent(topic, research);
    await expect(realStoryboardAgent({ script }, badLlm)).rejects.toThrow(/non-JSON/);
  });
});