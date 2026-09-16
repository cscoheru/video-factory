import { task, logger } from "@trigger.dev/sdk";
import { mockTopicAgent } from "../../src/agents/topic/mock.js";
import { TopicSchema, type Topic } from "../../src/domain/content-object.js";

export const vfTopicTask = task({
  id: "vf-topic",
  run: async (payload: { rawTopic: string }): Promise<Topic> => {
    const startedAt = new Date().toISOString();
    logger.info("[vf-topic] started", {
      stage: "topic",
      taskId: "vf-topic",
      startedAt,
    });
    const out = mockTopicAgent(payload.rawTopic);
    // Validate so future agent changes that break the schema fail loudly.
    const parsed = TopicSchema.parse(out);
    logger.info("[vf-topic] completed", {
      stage: "topic",
      taskId: "vf-topic",
      status: "ok",
    });
    return parsed;
  },
});