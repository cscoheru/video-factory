// Real FactCheck Agent — drives an LLM to fact-check a Script.

import {
  FactCheckSchema,
  type FactCheck,
  type Script,
} from "../../domain/content-object.js";
import type { LLMProvider } from "../../providers/llm/index.js";
import { FACTCHECK_SYSTEM_PROMPT, buildFactCheckUserPrompt } from "./prompt.js";

export async function realFactCheckAgent(
  input: { script: Script },
  llm: LLMProvider
): Promise<FactCheck> {
  const userPrompt = buildFactCheckUserPrompt(input.script);
  const raw = await llm.complete(userPrompt, {
    system: FACTCHECK_SYSTEM_PROMPT,
    json: true,
    temperature: 0.2,
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error(`realFactCheckAgent: LLM returned non-JSON: ${raw.slice(0, 200)}`);
  }

  return FactCheckSchema.parse(parsed);
}