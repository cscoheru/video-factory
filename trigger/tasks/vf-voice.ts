import { task, logger } from "@trigger.dev/sdk";
import { mockVoiceAgent } from "../../src/agents/voice/mock.js";
import { VoiceSchema, type Storyboard, type Voice } from "../../src/domain/content-object.js";

export const vfVoiceTask = task({
  id: "vf-voice",
  run: async (payload: { storyboard: Storyboard }): Promise<Voice> => {
    logger.info("[vf-voice] started", {
      stage: "voice",
      taskId: "vf-voice",
      note: "phase-2 stub — no audio generated",
    });
    const out = mockVoiceAgent(payload.storyboard);
    const parsed = VoiceSchema.parse(out);
    logger.info("[vf-voice] completed", {
      stage: "voice",
      taskId: "vf-voice",
      provider: parsed.provider,
      durationMs: parsed.durationMs,
      status: "ok",
    });
    return parsed;
  },
});