// Storyboard Agent dispatcher.

import type { Script, Storyboard } from "../../domain/content-object.js";
import type { LLMProvider } from "../../providers/llm/index.js";
import { mockStoryboardAgent } from "./mock.js";
import { realStoryboardAgent } from "./real.js";

export interface StoryboardAgentDeps {
  llm: LLMProvider;
}

export async function storyboardAgent(
  input: { script: Script },
  mockMode: boolean,
  deps: StoryboardAgentDeps
): Promise<Storyboard> {
  return mockMode
    ? mockStoryboardAgent(input.script)
    : await realStoryboardAgent(input, deps.llm);
}

export { mockStoryboardAgent } from "./mock.js";
export { realStoryboardAgent } from "./real.js";
export { STORYBOARD_SYSTEM_PROMPT, buildStoryboardUserPrompt } from "./prompt.js";