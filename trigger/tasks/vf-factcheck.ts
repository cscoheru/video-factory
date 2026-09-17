import { task, logger } from "@trigger.dev/sdk";
import { factCheckAgent } from "../../src/agents/factcheck/index.js";
import {
  getLLMProvider,
  readMockMode,
} from "../../src/providers/llm/index.js";
import {
  FactCheckSchema,
  type FactCheck,
  type Script,
} from "../../src/domain/content-object.js";

export const vfFactCheckTask = task({
  id: "vf-factcheck",
  run: async (payload: {
    script: Script;
    mockMode?: boolean;
  }): Promise<FactCheck> => {
    const mockMode = payload.mockMode ?? readMockMode();
    const llm = getLLMProvider(process.env.LLM_PROVIDER);

    logger.info("[vf-factcheck] started", {
      stage: "factCheck",
      taskId: "vf-factcheck",
      mockMode,
      llmId: llm.id,
    });

    const out = await factCheckAgent({ script: payload.script }, mockMode, { llm });
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