// Framework-agnostic workflow logic — composes agents into a single Content Object.
// Trigger.dev tasks call this; tests pass a mock LLMProvider to drive it.

import {
  ContentObjectSchema,
  createEmptyContentObject,
  touchContentObject,
  type ContentObject,
  type Topic,
  type Research,
  type Script,
  type FactCheck,
  type Storyboard,
  type Voice,
  type Quality,
} from "../domain/content-object.js";

import { mockTopicAgent } from "../agents/topic/mock.js";
import { mockResearchAgent } from "../agents/research/mock.js";
import { mockVoiceAgent } from "../agents/voice/mock.js";
import { mockQualityAgent } from "../agents/quality/mock.js";

import { scriptAgent } from "../agents/script/index.js";
import { factCheckAgent } from "../agents/factcheck/index.js";
import { storyboardAgent } from "../agents/storyboard/index.js";

import { MockLLMProvider, type LLMProvider } from "../providers/llm/index.js";

export type StageRunner<K extends keyof StageMap> = (
  input: StageMap[K]["input"]
) => Promise<StageMap[K]["output"]>;

export interface StageMap {
  topic: { input: { rawTopic: string }; output: Topic };
  research: { input: Topic; output: Research };
  script: { input: { topic: Topic; research: Research }; output: Script };
  factCheck: { input: Script; output: FactCheck };
  storyboard: { input: Script; output: Storyboard };
  voice: { input: Storyboard; output: Voice };
  quality: { input: ContentObject; output: Quality };
}

// Default runners use mock agents for stages that don't need an LLM, and dispatch
// through the dispatcher (mock vs real based on mockMode) for the LLM-driven stages.
export function buildDefaultRunners(opts: {
  mockMode: boolean;
  llm: LLMProvider;
}): { [K in keyof StageMap]: StageRunner<K> } {
  const { mockMode, llm } = opts;
  return {
    topic: async ({ rawTopic }) => mockTopicAgent(rawTopic),
    research: async (topic) => mockResearchAgent(topic),
    script: async ({ topic, research }) => scriptAgent({ topic, research }, mockMode, { llm }),
    factCheck: async (script) => factCheckAgent({ script }, mockMode, { llm }),
    storyboard: async (script) => storyboardAgent({ script }, mockMode, { llm }),
    voice: async (storyboard) => mockVoiceAgent(storyboard),
    quality: async (co) => mockQualityAgent(co),
  };
}

export interface WorkflowRunOptions {
  rawTopic: string;
  mockMode?: boolean;
  llmProvider?: LLMProvider;
  runners?: Partial<{ [K in keyof StageMap]: StageRunner<K> }>;
}

export async function runVideoFactoryWorkflow(
  opts: WorkflowRunOptions
): Promise<ContentObject> {
  const mockMode = opts.mockMode ?? true;
  const llm = opts.llmProvider ?? new MockLLMProvider();
  const defaults = buildDefaultRunners({ mockMode, llm });
  const r = { ...defaults, ...(opts.runners ?? {}) } as {
    [K in keyof StageMap]: StageRunner<K>;
  };

  let co = createEmptyContentObject(opts.rawTopic);
  co = touchContentObject({ ...co, mockMode }, "topic");

  // 1. topic (mock)
  const topic = await r.topic({ rawTopic: opts.rawTopic });
  co = { ...co, topic };
  co = touchContentObject(co, "research");

  // 2. research (mock)
  const research = await r.research(topic);
  co = { ...co, research };
  co = touchContentObject(co, "script");

  // 3. script (mock or real LLM)
  const script = await r.script({ topic, research });
  co = { ...co, script };
  co = touchContentObject(co, "factCheck");

  // 4. factCheck (mock or real LLM)
  const factCheck = await r.factCheck(script);
  co = { ...co, factCheck };
  co = touchContentObject(co, "storyboard");

  // 5. storyboard (mock or real LLM)
  const storyboard = await r.storyboard(script);
  co = { ...co, storyboard };
  co = touchContentObject(co, "voice");

  // 6. voice (mock stub)
  const voice = await r.voice(storyboard);
  co = { ...co, voice };
  co = touchContentObject(co, "quality");

  // 7. quality (mock structural check)
  const quality = await r.quality(co);
  co = { ...co, quality };

  // Final status
  const status = quality.passed ? "completed" : "failed";
  co = touchContentObject({ ...co, status }, "done");

  return ContentObjectSchema.parse(co);
}