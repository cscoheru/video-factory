// Framework-agnostic workflow logic — composes agents into a single Content Object.
// Trigger.dev tasks call this; tests mock TaskCaller to drive it directly.

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
import { mockScriptAgent } from "../agents/script/mock.js";
import { mockFactCheckAgent } from "../agents/factcheck/mock.js";
import { mockStoryboardAgent } from "../agents/storyboard/mock.js";
import { mockVoiceAgent } from "../agents/voice/mock.js";
import { mockQualityAgent } from "../agents/quality/mock.js";

// Each stage takes a slice and returns a typed slice; the orchestrator stitches them.
// Wrapping in functions (not bare exports) lets future phases swap in real LLM-driven agents
// without changing the workflow signature.

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

// Default mock runners — used when no custom runner is supplied.
export const mockRunners: { [K in keyof StageMap]: StageRunner<K> } = {
  topic: async ({ rawTopic }) => mockTopicAgent(rawTopic),
  research: async (topic) => mockResearchAgent(topic),
  script: async ({ topic, research }) => mockScriptAgent(topic, research),
  factCheck: async (script) => mockFactCheckAgent(script),
  storyboard: async (script) => mockStoryboardAgent(script),
  voice: async (storyboard) => mockVoiceAgent(storyboard),
  quality: async (co) => mockQualityAgent(co),
};

export interface WorkflowRunOptions {
  rawTopic: string;
  mockMode?: boolean;
  runners?: Partial<{ [K in keyof StageMap]: StageRunner<K> }>;
}

export async function runVideoFactoryWorkflow(
  opts: WorkflowRunOptions
): Promise<ContentObject> {
  const r = { ...mockRunners, ...(opts.runners ?? {}) } as {
    [K in keyof StageMap]: StageRunner<K>;
  };
  const mockMode = opts.mockMode ?? true;

  let co = createEmptyContentObject(opts.rawTopic);
  co = touchContentObject({ ...co, mockMode }, "topic");

  // 1. topic
  const topic = await r.topic({ rawTopic: opts.rawTopic });
  co = { ...co, topic };
  co = touchContentObject(co, "research");

  // 2. research
  const research = await r.research(topic);
  co = { ...co, research };
  co = touchContentObject(co, "script");

  // 3. script
  const script = await r.script({ topic, research });
  co = { ...co, script };
  co = touchContentObject(co, "factCheck");

  // 4. factCheck
  const factCheck = await r.factCheck(script);
  co = { ...co, factCheck };
  co = touchContentObject(co, "storyboard");

  // 5. storyboard
  const storyboard = await r.storyboard(script);
  co = { ...co, storyboard };
  co = touchContentObject(co, "voice");

  // 6. voice (Phase 2 stub)
  const voice = await r.voice(storyboard);
  co = { ...co, voice };
  co = touchContentObject(co, "quality");

  // 7. quality
  const quality = await r.quality(co);
  co = { ...co, quality };

  // Final status
  const status = quality.passed ? "completed" : "failed";
  co = touchContentObject({ ...co, status }, "done");

  // Validate the assembled object. If Zod fails here, it's a bug in the workflow.
  return ContentObjectSchema.parse(co);
}