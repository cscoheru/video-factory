import { task, logger } from "@trigger.dev/sdk";
import { mockScriptAgent } from "../../src/agents/script/mock.js";
import {
  ScriptSchema,
  type Research,
  type Script,
  type Topic,
} from "../../src/domain/content-object.js";

export const vfScriptTask = task({
  id: "vf-script",
  run: async (payload: { topic: Topic; research: Research }): Promise<Script> => {
    logger.info("[vf-script] started", {
      stage: "script",
      taskId: "vf-script",
    });
    const out = mockScriptAgent(payload.topic, payload.research);
    const parsed = ScriptSchema.parse(out);
    logger.info("[vf-script] completed", {
      stage: "script",
      taskId: "vf-script",
      estimatedDurationSec: parsed.estimatedDurationSec,
      status: "ok",
    });
    return parsed;
  },
});