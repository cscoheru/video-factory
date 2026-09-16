import { task, logger } from "@trigger.dev/sdk";
import { mockQualityAgent } from "../../src/agents/quality/mock.js";
import { QualitySchema, type ContentObject, type Quality } from "../../src/domain/content-object.js";

export const vfQualityTask = task({
  id: "vf-quality",
  run: async (payload: { contentObject: ContentObject }): Promise<Quality> => {
    logger.info("[vf-quality] started", {
      stage: "quality",
      taskId: "vf-quality",
    });
    const out = mockQualityAgent(payload.contentObject);
    const parsed = QualitySchema.parse(out);
    logger.info("[vf-quality] completed", {
      stage: "quality",
      taskId: "vf-quality",
      passed: parsed.passed,
      issueCount: parsed.issues.length,
    });
    return parsed;
  },
});