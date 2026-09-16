import { helloTask } from "./tasks/hello.js";

// Phase 1 hello workflow — calls the hello task twice to prove orchestration.
// Trigger.dev v4 batchTriggerAndWait returns BatchResult { id, runs: TaskRunResult[] }.
export async function helloWorkflow(payload?: { who?: string }): Promise<
  Array<{ greeting: string; at: string } | null>
> {
  const result = await helloTask.batchTriggerAndWait([
    { payload: { who: payload?.who ?? "video-factory" } },
    { payload: { who: "phase-1" } },
  ]);
  return result.runs.map((run) => (run.ok ? run.output : null));
}