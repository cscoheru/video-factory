import { task, logger } from "@trigger.dev/sdk";
import { makeGreeting, type HelloPayload, type HelloOutput } from "../../src/hello-logic.js";

// Phase 1 hello task — proves the Trigger.dev runtime is wired up.
// Pure logic lives in src/hello-logic.ts so it can be unit-tested in isolation.
export const helloTask = task({
  id: "hello",
  run: async (payload: HelloPayload): Promise<HelloOutput> => {
    const who = payload?.who ?? "world";
    const startedAt = new Date().toISOString();

    logger.info("[hello] started", {
      contentId: who,
      taskId: "hello",
      startedAt,
    });

    const output = makeGreeting(payload);

    logger.info("[hello] completed", {
      taskId: "hello",
      durationMs: Date.parse(output.at) - Date.parse(startedAt),
      status: "ok",
    });

    return output;
  },
});