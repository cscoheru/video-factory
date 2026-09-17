// LLM Provider abstraction (ADR-006 LLM Provider Independence).
// Phase 2: MockLLMProvider only.
// Phase 3: + GLMProvider via OpenAI-compatible API.

import { GLMProvider } from "./glm.js";

export interface LLMOptions {
  system?: string;
  json?: boolean;
  temperature?: number;
}

export interface LLMProvider {
  readonly id: string;
  /**
   * Single-string signature: provider treats the input as a user message.
   * Real providers add an optional system prompt internally.
   */
  complete(prompt: string, opts?: LLMOptions): Promise<string>;
}

// ---------- Mock ----------

export class MockLLMProvider implements LLMProvider {
  readonly id = "mock";
  async complete(prompt: string, opts?: LLMOptions): Promise<string> {
    if (opts?.json) {
      const sys = opts.system ?? "";
      // Heuristic dispatch — order matters because some prompts share substrings.
      // Most specific marker first.
      if (sys.includes("visualType")) {
        // Storyboard agent — visualType enum is unique to its system prompt.
        return JSON.stringify({
          scenes: [
            {
              sceneId: "s1-hook",
              sequence: 0,
              narration: "[mock narration]",
              visualType: "text",
              visualPrompt: "[mock visual prompt]",
              subtitle: "[mock subtitle]",
              durationSec: 12,
            },
          ],
        });
      }
      if (sys.includes("\"severity\"")) {
        // FactCheck agent — severity enum (in literal JSON output format).
        return JSON.stringify({
          status: "passed",
          issues: [],
          corrections: [],
        });
      }
      if (sys.includes("estimatedDurationSec")) {
        // Script agent — checked last because Storyboard prompt also references
        // "estimatedDurationSec" when describing duration allocation.
        return JSON.stringify({
          hook: `[mock hook] ${prompt.slice(0, 30)}`,
          body: `[mock body] ${prompt.slice(0, 100)}`,
          conclusion: "[mock conclusion]",
          estimatedDurationSec: 60,
        });
      }
      return JSON.stringify({
        echo: prompt.slice(0, 120),
        systemEcho: sys.slice(0, 60) || null,
        model: this.id,
        temperature: opts.temperature ?? null,
      });
    }
    return `[mock completion] ${prompt.slice(0, 200)}`;
  }
}

// ---------- Factory ----------

export type LLMProviderName = "mock" | "glm";

export function getLLMProvider(envValue: string | undefined): LLMProvider {
  // Phase 3: branches to GLMProvider when envValue=glm.
  switch ((envValue ?? "mock").toLowerCase()) {
    case "glm":
      return new GLMProvider({ apiKey: process.env.GLM_API_KEY ?? "" });
    case "mock":
    default:
      return new MockLLMProvider();
  }
}

export function readMockMode(): boolean {
  const v = (process.env.MOCK_MODE ?? "true").toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}