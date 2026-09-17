// Real Storyboard Agent.

import {
  StoryboardSchema,
  type Script,
  type Storyboard,
} from "../../domain/content-object.js";
import type { LLMProvider } from "../../providers/llm/index.js";
import { STORYBOARD_SYSTEM_PROMPT, buildStoryboardUserPrompt } from "./prompt.js";

export async function realStoryboardAgent(
  input: { script: Script },
  llm: LLMProvider
): Promise<Storyboard> {
  const userPrompt = buildStoryboardUserPrompt(input.script);
  const raw = await llm.complete(userPrompt, {
    system: STORYBOARD_SYSTEM_PROMPT,
    json: true,
    temperature: 0.4,
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error(`realStoryboardAgent: LLM returned non-JSON: ${raw.slice(0, 200)}`);
  }

  return StoryboardSchema.parse(parsed);
}