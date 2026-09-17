// FactCheck Agent dispatcher.

import type { FactCheck, Script } from "../../domain/content-object.js";
import type { LLMProvider } from "../../providers/llm/index.js";
import { mockFactCheckAgent } from "./mock.js";
import { realFactCheckAgent } from "./real.js";

export interface FactCheckAgentDeps {
  llm: LLMProvider;
}

export async function factCheckAgent(
  input: { script: Script },
  mockMode: boolean,
  deps: FactCheckAgentDeps
): Promise<FactCheck> {
  return mockMode
    ? mockFactCheckAgent(input.script)
    : await realFactCheckAgent(input, deps.llm);
}

export { mockFactCheckAgent } from "./mock.js";
export { realFactCheckAgent } from "./real.js";
export { FACTCHECK_SYSTEM_PROMPT, buildFactCheckUserPrompt } from "./prompt.js";