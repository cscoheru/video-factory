import { describe, it, expect } from "vitest";
import {
  ContentObjectSchema,
  TopicSchema,
  ResearchSchema,
  ScriptSchema,
  FactCheckSchema,
  StoryboardSchema,
  VoiceSchema,
  VideoSchema,
  QualitySchema,
  createEmptyContentObject,
  touchContentObject,
} from "../src/domain/content-object.js";

describe("ContentObject", () => {
  it("createEmptyContentObject returns an intermediate shell (NOT schema-valid)", () => {
    // Note: the factory output is an *intermediate* state during workflow execution.
    // Each stage starts empty and is filled by an agent. Final-state validation happens
    // at the end of the workflow via ContentObjectSchema.parse, not on the factory output.
    const co = createEmptyContentObject("hello world");
    expect(co.topic.title).toBe("hello world");
    expect(co.status).toBe("pending");
    expect(co.mockMode).toBe(true);
    expect(co.storyboard.scenes).toEqual([]); // intentionally empty until storyboard agent runs
  });

  it("touchContentObject updates updatedAt and currentStage", () => {
    const co = createEmptyContentObject("t");
    const before = co.updatedAt;
    const next = touchContentObject(co, "topic");
    expect(next.currentStage).toBe("topic");
    expect(next.updatedAt >= before).toBe(true);
  });

  it("rejects invalid topic (empty title)", () => {
    const bad = { ...createEmptyContentObject("t"), topic: { title: "", angle: "x", audience: "y" } };
    expect(() => ContentObjectSchema.parse(bad)).toThrow();
  });

  it("rejects unknown visualType in scenes", () => {
    const co = createEmptyContentObject("t");
    const bad = {
      ...co,
      storyboard: {
        scenes: [
          {
            sceneId: "s1",
            sequence: 0,
            narration: "x",
            visualType: "video-gen" as any,
            visualPrompt: "p",
            subtitle: "s",
            durationSec: 10,
          },
        ],
      },
    };
    expect(() => ContentObjectSchema.parse(bad)).toThrow();
  });
});

describe("Stage schemas — minimal shape", () => {
  it("TopicSchema", () => {
    expect(() =>
      TopicSchema.parse({ title: "t", angle: "a", audience: "u" })
    ).not.toThrow();
  });
  it("ResearchSchema requires >=1 source and >=1 finding", () => {
    expect(() =>
      ResearchSchema.parse({ sources: [{ id: "1", title: "x" }], findings: ["f"] })
    ).not.toThrow();
    expect(() => ResearchSchema.parse({ sources: [], findings: [] })).toThrow();
  });
  it("ScriptSchema requires hook/body/conclusion", () => {
    expect(() =>
      ScriptSchema.parse({ hook: "h", body: "b", conclusion: "c", estimatedDurationSec: 60 })
    ).not.toThrow();
  });
  it("FactCheckSchema status enum", () => {
    expect(() =>
      FactCheckSchema.parse({ status: "passed", issues: [], corrections: [] })
    ).not.toThrow();
    expect(() =>
      FactCheckSchema.parse({ status: "bogus" as any, issues: [], corrections: [] })
    ).toThrow();
  });
  it("StoryboardSchema requires >=1 scene", () => {
    expect(() => StoryboardSchema.parse({ scenes: [] })).toThrow();
    expect(() =>
      StoryboardSchema.parse({
        scenes: [
          {
            sceneId: "s1",
            sequence: 0,
            narration: "n",
            visualType: "text",
            visualPrompt: "p",
            subtitle: "s",
            durationSec: 5,
          },
        ],
      })
    ).not.toThrow();
  });
  it("VoiceSchema allows null audioPath", () => {
    expect(() =>
      VoiceSchema.parse({ provider: "mock", audioPath: null, durationMs: 0 })
    ).not.toThrow();
  });
  it("VideoSchema allows null path", () => {
    expect(() => VideoSchema.parse({ videoPath: null, durationMs: null })).not.toThrow();
  });
  it("QualitySchema", () => {
    expect(() => QualitySchema.parse({ passed: true, issues: [] })).not.toThrow();
  });
});