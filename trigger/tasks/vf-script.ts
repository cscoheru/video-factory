import { task, logger } from "@trigger.dev/sdk";
import { scriptAgent } from "../../src/agents/script/index.js";
import {
  getLLMProvider,
  readMockMode,
} from "../../src/providers/llm/index.js";
import {
  ScriptSchema,
  type Research,
  type Script,
  type Topic,
} from "../../src/domain/content-object.js";

export const vfScriptTask = task({
  id: "vf-script",
  run: async (payload: {
    topic: Topic;
    research: Research;
    mockMode?: boolean;
  }): Promise<Script> => {
    const mockMode = payload.mockMode ?? readMockMode();
    const llm = getLLMProvider(process.env.LLM_PROVIDER);

    logger.info("[vf-script] started", {
      stage: "script",
      taskId: "vf-script",
      mockMode,
      llmId: llm.id,
    });

    const out = await scriptAgent(
      { topic: payload.topic, research: payload.research },
      mockMode,
      { llm }
    );
    const parsed = ScriptSchema.parse(out);

    logger.info("[vf-script] completed", {
      stage: "script",
      taskId: "vf-script",
      estimatedDurationSec: parsed.estimatedDurationSec,
      hookLen: parsed.hook.length,
      bodyLen: parsed.body.length,
    });
    return parsed;
  },
});