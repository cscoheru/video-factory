import { task, logger } from "@trigger.dev/sdk";
import { mockStoryboardAgent } from "../../src/agents/storyboard/mock.js";
import { StoryboardSchema, type Script, type Storyboard } from "../../src/domain/content-object.js";

export const vfStoryboardTask = task({
  id: "vf-storyboard",
  run: async (payload: { script: Script }): Promise<Storyboard> => {
    logger.info("[vf-storyboard] started", {
      stage: "storyboard",
      taskId: "vf-storyboard",
    });
    const out = mockStoryboardAgent(payload.script);
    const parsed = StoryboardSchema.parse(out);
    logger.info("[vf-storyboard] completed", {
      stage: "storyboard",
      taskId: "vf-storyboard",
      sceneCount: parsed.scenes.length,
      totalDurationSec: parsed.scenes.reduce((s, x) => s + x.durationSec, 0),
      status: "ok",
    });
    return parsed;
  },
});