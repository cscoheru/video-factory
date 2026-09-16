// LLM Provider abstraction (ADR-006 LLM Provider Independence).
// Phase 2: interface + MockLLMProvider only. Real providers land in Phase 3.

export interface LLMProvider {
  readonly id: string;
  complete(
    prompt: string,
    opts?: { json?: boolean; temperature?: number }
  ): Promise<string>;
}

export class MockLLMProvider implements LLMProvider {
  readonly id = "mock";
  async complete(prompt: string, opts?: { json?: boolean }): Promise<string> {
    // Echo the prompt; do not pretend to do real LLM work.
    if (opts?.json) {
      return JSON.stringify({ echo: prompt.slice(0, 120), model: this.id });
    }
    return `[mock completion] ${prompt.slice(0, 200)}`;
  }
}

export function getLLMProvider(envValue: string | undefined): LLMProvider {
  // Phase 2: only mock is wired. Phase 3 will branch on envValue (glm | anthropic | openai).
  return new MockLLMProvider();
}