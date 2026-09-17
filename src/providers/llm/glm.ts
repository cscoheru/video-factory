// GLMProvider — uses GLM's OpenAI-compatible API.
// Phase 3: first real provider. Add AnthropicProvider / OpenAIProvider later if needed.

import OpenAI from "openai";
import type { LLMOptions, LLMProvider } from "./index.js";

export interface GLMProviderOptions {
  apiKey: string;
  baseURL?: string;
  model?: string;
  timeoutMs?: number;
}

export class GLMProvider implements LLMProvider {
  readonly id = "glm";
  private client: OpenAI;
  private model: string;

  constructor(opts: GLMProviderOptions) {
    if (!opts.apiKey) {
      throw new Error("GLMProvider: apiKey is required");
    }
    this.client = new OpenAI({
      apiKey: opts.apiKey,
      baseURL: opts.baseURL ?? "https://open.bigmodel.cn/api/paas/v4/",
      timeout: opts.timeoutMs ?? 60_000,
    });
    this.model = opts.model ?? "glm-4-plus";
  }

  async complete(prompt: string, opts?: LLMOptions): Promise<string> {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
    if (opts?.system) {
      messages.push({ role: "system", content: opts.system });
    }
    messages.push({ role: "user", content: prompt });

    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages,
      ...(opts?.json ? { response_format: { type: "json_object" as const } } : {}),
      temperature: opts?.temperature ?? 0.4,
    });

    const content = completion.choices[0]?.message?.content;
    if (typeof content !== "string" || content.length === 0) {
      throw new Error("GLMProvider: empty completion");
    }
    return content;
  }
}