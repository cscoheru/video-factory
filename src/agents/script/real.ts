// Real Script Agent — drives an LLM to produce the structured Script.

import { ScriptSchema, type Research, type Script, type Topic } from "../../domain/content-object.js";
import type { LLMProvider } from "../../providers/llm/index.js";
import { SCRIPT_SYSTEM_PROMPT, buildScriptUserPrompt } from "./prompt.js";

export interface RealScriptAgentInput {
  topic: Topic;
  research: Research;
}

export async function realScriptAgent(
  input: RealScriptAgentInput,
  llm: LLMProvider
): Promise<Script> {
  const userPrompt = buildScriptUserPrompt(input);
  const raw = await llm.complete(userPrompt, {
    system: SCRIPT_SYSTEM_PROMPT,
    json: true,
    temperature: 0.4,
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    throw new Error(`realScriptAgent: LLM returned non-JSON: ${raw.slice(0, 200)}`);
  }

  // Strict schema validation — fail loud if LLM drifts.
  const result = ScriptSchema.parse(parsed);
  return result;
}