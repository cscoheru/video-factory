import { task, logger } from "@trigger.dev/sdk";
import { mockFactCheckAgent } from "../../src/agents/factcheck/mock.js";
import { FactCheckSchema, type FactCheck, type Script } from "../../src/domain/content-object.js";

export const vfFactCheckTask = task({
  id: "vf-factcheck",
  run: async (payload: { script: Script }): Promise<FactCheck> => {
    logger.info("[vf-factcheck] started", {
      stage: "factCheck",
      taskId: "vf-factcheck",
    });
    const out = mockFactCheckAgent(payload.script);
    const parsed = FactCheckSchema.parse(out);
    logger.info("[vf-factcheck] completed", {
      stage: "factCheck",
      taskId: "vf-factcheck",
      status: parsed.status,
      issueCount: parsed.issues.length,
    });
    return parsed;
  },
});