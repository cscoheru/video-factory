import { describe, it, expect } from "vitest";
import { mockTopicAgent } from "../src/agents/topic/mock.js";
import { mockResearchAgent } from "../src/agents/research/mock.js";
import { mockScriptAgent } from "../src/agents/script/mock.js";
import { mockFactCheckAgent } from "../src/agents/factcheck/mock.js";
import { mockStoryboardAgent } from "../src/agents/storyboard/mock.js";
import { mockVoiceAgent } from "../src/agents/voice/mock.js";
import { mockQualityAgent } from "../src/agents/quality/mock.js";
import { createEmptyContentObject } from "../src/domain/content-object.js";

describe("topic mock", () => {
  it("is deterministic for the same input", () => {
    const a = mockTopicAgent("为什么企业知识库上线后员工还是不愿意用?");
    const b = mockTopicAgent("为什么企业知识库上线后员工还是不愿意用?");
    expect(a).toEqual(b);
  });
  it("produces a non-empty title/angle/audience", () => {
    const t = mockTopicAgent("anything");
    expect(t.title.length).toBeGreaterThan(0);
    expect(t.angle.length).toBeGreaterThan(0);
    expect(t.audience.length).toBeGreaterThan(0);
  });
});

describe("research mock", () => {
  it("returns >=1 source and >=1 finding", () => {
    const r = mockResearchAgent({ title: "x", angle: "y", audience: "z" });
    expect(r.sources.length).toBeGreaterThanOrEqual(1);
    expect(r.findings.length).toBeGreaterThanOrEqual(1);
  });
});

describe("script mock", () => {
  it("estimates 60-120s duration for typical input", () => {
    const topic = mockTopicAgent("为什么企业知识库上线后员工还是不愿意用?");
    const research = mockResearchAgent(topic);
    const s = mockScriptAgent(topic, research);
    expect(s.estimatedDurationSec).toBeGreaterThanOrEqual(60);
    expect(s.estimatedDurationSec).toBeLessThanOrEqual(120);
    expect(s.hook.length).toBeGreaterThan(0);
    expect(s.body.length).toBeGreaterThan(0);
    expect(s.conclusion.length).toBeGreaterThan(0);
  });
});

describe("factcheck mock", () => {
  it("returns passed for a healthy mock script", () => {
    const topic = mockTopicAgent("x");
    const research = mockResearchAgent(topic);
    const script = mockScriptAgent(topic, research);
    const fc = mockFactCheckAgent(script);
    expect(["passed", "issues_found"]).toContain(fc.status);
  });
  it("returns failed if conclusion is empty", () => {
    const fc = mockFactCheckAgent({
      hook: "h",
      body: "b".repeat(100),
      conclusion: "",
      estimatedDurationSec: 60,
    });
    expect(fc.status).toBe("failed");
    expect(fc.issues.some((i) => i.severity === "error")).toBe(true);
  });
});

describe("storyboard mock", () => {
  it("produces >=1 scene", () => {
    const topic = mockTopicAgent("x");
    const research = mockResearchAgent(topic);
    const script = mockScriptAgent(topic, research);
    const sb = mockStoryboardAgent(script);
    expect(sb.scenes.length).toBeGreaterThanOrEqual(1);
    expect(sb.scenes.every((s) => s.durationSec > 0)).toBe(true);
  });
});

describe("voice mock (Phase 2 stub)", () => {
  it("returns provider=mock and null audioPath", () => {
    const topic = mockTopicAgent("x");
    const research = mockResearchAgent(topic);
    const script = mockScriptAgent(topic, research);
    const sb = mockStoryboardAgent(script);
    const v = mockVoiceAgent(sb);
    expect(v.provider).toBe("mock");
    expect(v.audioPath).toBeNull();
    expect(v.durationMs).toBeGreaterThan(0);
  });
});

describe("quality mock", () => {
  it("passes for a fully populated ContentObject (Phase 2: voice/video null is OK)", () => {
    const topic = mockTopicAgent("x");
    const research = mockResearchAgent(topic);
    const script = mockScriptAgent(topic, research);
    const sb = mockStoryboardAgent(script);
    const fc = mockFactCheckAgent(script);
    const v = mockVoiceAgent(sb);
    const co = createEmptyContentObject("x");
    const full = {
      ...co,
      topic,
      research,
      script,
      factCheck: fc,
      storyboard: sb,
      voice: v,
    };
    const q = mockQualityAgent(full);
    expect(q.passed).toBe(true);
    expect(q.issues).toEqual([]);
  });

  it("fails when topic is empty", () => {
    const co = createEmptyContentObject("");
    const q = mockQualityAgent(co);
    expect(q.passed).toBe(false);
    expect(q.issues.length).toBeGreaterThan(0);
  });
});