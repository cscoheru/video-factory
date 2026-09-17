import { task, logger } from "@trigger.dev/sdk";
import { storyboardAgent } from "../../src/agents/storyboard/index.js";
import {
  getLLMProvider,
  readMockMode,
} from "../../src/providers/llm/index.js";
import {
  StoryboardSchema,
  type Script,
  type Storyboard,
} from "../../src/domain/content-object.js";

export const vfStoryboardTask = task({
  id: "vf-storyboard",
  run: async (payload: {
    script: Script;
    mockMode?: boolean;
  }): Promise<Storyboard> => {
    const mockMode = payload.mockMode ?? readMockMode();
    const llm = getLLMProvider(process.env.LLM_PROVIDER);

    logger.info("[vf-storyboard] started", {
      stage: "storyboard",
      taskId: "vf-storyboard",
      mockMode,
      llmId: llm.id,
    });

    const out = await storyboardAgent({ script: payload.script }, mockMode, { llm });
    const parsed = StoryboardSchema.parse(out);

    logger.info("[vf-storyboard] completed", {
      stage: "storyboard",
      taskId: "vf-storyboard",
      sceneCount: parsed.scenes.length,
      totalDurationSec: parsed.scenes.reduce((s, x) => s + x.durationSec, 0),
    });
    return parsed;
  },
});