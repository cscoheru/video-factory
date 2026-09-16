import { task, logger } from "@trigger.dev/sdk";
import { mockResearchAgent } from "../../src/agents/research/mock.js";
import { ResearchSchema, type Research, type Topic } from "../../src/domain/content-object.js";

export const vfResearchTask = task({
  id: "vf-research",
  run: async (payload: { topic: Topic }): Promise<Research> => {
    const startedAt = new Date().toISOString();
    logger.info("[vf-research] started", {
      stage: "research",
      taskId: "vf-research",
      startedAt,
    });
    const out = mockResearchAgent(payload.topic);
    const parsed = ResearchSchema.parse(out);
    logger.info("[vf-research] completed", {
      stage: "research",
      taskId: "vf-research",
      sources: parsed.sources.length,
      findings: parsed.findings.length,
      status: "ok",
    });
    return parsed;
  },
});