// Script Agent dispatcher: mock or real based on mockMode.

import type { Research, Script, Topic } from "../../domain/content-object.js";
import type { LLMProvider } from "../../providers/llm/index.js";
import { mockScriptAgent } from "./mock.js";
import { realScriptAgent } from "./real.js";

export interface ScriptAgentDeps {
  llm: LLMProvider;
}

export async function scriptAgent(
  input: { topic: Topic; research: Research },
  mockMode: boolean,
  deps: ScriptAgentDeps
): Promise<Script> {
  return mockMode
    ? mockScriptAgent(input.topic, input.research)
    : await realScriptAgent(input, deps.llm);
}

export { mockScriptAgent } from "./mock.js";
export { realScriptAgent } from "./real.js";
export { SCRIPT_SYSTEM_PROMPT, buildScriptUserPrompt } from "./prompt.js";