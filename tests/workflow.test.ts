import { describe, it, expect } from "vitest";
import { runVideoFactoryWorkflow } from "../src/workflow/video-factory.js";
import {
  ContentObjectSchema,
  type Topic,
  type Research,
  type Script,
  type FactCheck,
  type Storyboard,
  type Voice,
  type Quality,
} from "../src/domain/content-object.js";

describe("runVideoFactoryWorkflow", () => {
  it("composes all stages and returns a valid ContentObject", async () => {
    const rawTopic = "为什么企业知识库上线后员工还是不愿意用?";
    const co = await runVideoFactoryWorkflow({ rawTopic });

    // Each stage populated
    expect(co.topic.title).toBeTruthy();
    expect(co.research.sources.length).toBeGreaterThan(0);
    expect(co.research.findings.length).toBeGreaterThan(0);
    expect(co.script.hook.length).toBeGreaterThan(0);
    expect(co.storyboard.scenes.length).toBeGreaterThan(0);
    expect(co.factCheck.status).toBeDefined();
    expect(co.voice.provider).toBe("mock");
    expect(co.video.videoPath).toBeNull(); // Phase 4 fills
    expect(co.quality.passed).toBe(true);
    expect(co.status).toBe("completed");
    expect(co.currentStage).toBe("done");
    expect(co.mockMode).toBe(true);

    // Zod validation passes
    expect(() => ContentObjectSchema.parse(co)).not.toThrow();
  });

  it("allows injecting custom runners", async () => {
    const customTopic: Topic = {
      title: "CUSTOM_TITLE",
      angle: "knowledge-silo",
      audience: "企业老板",
    };
    const co = await runVideoFactoryWorkflow({
      rawTopic: "ignored",
      runners: {
        topic: async () => customTopic,
      },
    });
    expect(co.topic.title).toBe("CUSTOM_TITLE");
  });

  it("respects mockMode=false (still uses mock agents, just flag changes)", async () => {
    const co = await runVideoFactoryWorkflow({
      rawTopic: "x",
      mockMode: false,
    });
    expect(co.mockMode).toBe(false);
    expect(co.quality.passed).toBe(true);
  });
});