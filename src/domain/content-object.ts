// Content Object — the typed structured state passed between agents.
// Phase 2: stubs for voice/video; populated in Phase 4.

import { z } from "zod";

// ---------- Stage schemas ----------

export const TopicSchema = z.object({
  title: z.string().min(1),
  angle: z.string().min(1),
  audience: z.string().min(1),
});
export type Topic = z.infer<typeof TopicSchema>;

export const ResearchSourceSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  url: z.string().url().optional(),
});
export type ResearchSource = z.infer<typeof ResearchSourceSchema>;

export const ResearchSchema = z.object({
  sources: z.array(ResearchSourceSchema).min(1),
  findings: z.array(z.string().min(1)).min(1),
});
export type Research = z.infer<typeof ResearchSchema>;

export const ScriptSchema = z.object({
  hook: z.string().min(1),
  body: z.string().min(1),
  conclusion: z.string().min(1),
  estimatedDurationSec: z.number().int().positive(),
});
export type Script = z.infer<typeof ScriptSchema>;

export const FactCheckIssueSchema = z.object({
  severity: z.enum(["info", "warn", "error"]),
  message: z.string().min(1),
});
export type FactCheckIssue = z.infer<typeof FactCheckIssueSchema>;

export const FactCheckCorrectionSchema = z.object({
  original: z.string().min(1),
  corrected: z.string().min(1),
});
export type FactCheckCorrection = z.infer<typeof FactCheckCorrectionSchema>;

export const FactCheckSchema = z.object({
  status: z.enum(["passed", "issues_found", "failed"]),
  issues: z.array(FactCheckIssueSchema),
  corrections: z.array(FactCheckCorrectionSchema),
});
export type FactCheck = z.infer<typeof FactCheckSchema>;

export const SceneSchema = z.object({
  sceneId: z.string().min(1),
  sequence: z.number().int().nonnegative(),
  narration: z.string().min(1),
  visualType: z.enum(["text", "image", "diagram", "screenshot"]),
  visualPrompt: z.string().min(1),
  subtitle: z.string().min(1),
  durationSec: z.number().positive(),
});
export type Scene = z.infer<typeof SceneSchema>;

export const StoryboardSchema = z.object({
  scenes: z.array(SceneSchema).min(1),
});
export type Storyboard = z.infer<typeof StoryboardSchema>;

export const VoiceSchema = z.object({
  provider: z.string().nullable(),
  audioPath: z.string().nullable(),
  durationMs: z.number().int().nonnegative().nullable(),
});
export type Voice = z.infer<typeof VoiceSchema>;

export const VideoSchema = z.object({
  videoPath: z.string().nullable(),
  durationMs: z.number().int().nonnegative().nullable(),
});
export type Video = z.infer<typeof VideoSchema>;

export const QualitySchema = z.object({
  passed: z.boolean(),
  issues: z.array(z.string()),
});
export type Quality = z.infer<typeof QualitySchema>;

// ---------- Composed Content Object ----------

export const ContentObjectSchema = z.object({
  id: z.string().min(1),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),

  topic: TopicSchema,
  research: ResearchSchema,
  script: ScriptSchema,
  factCheck: FactCheckSchema,
  storyboard: StoryboardSchema,

  voice: VoiceSchema,
  video: VideoSchema,
  quality: QualitySchema,

  status: z.enum(["pending", "in_progress", "completed", "failed"]),
  currentStage: z.string(),
  mockMode: z.boolean(),
});
export type ContentObject = z.infer<typeof ContentObjectSchema>;

// ---------- Factory ----------

export function createEmptyContentObject(rawTopic: string): ContentObject {
  const now = new Date().toISOString();
  const id = `co_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    createdAt: now,
    updatedAt: now,

    topic: { title: rawTopic, angle: "general", audience: "general" },
    research: { sources: [], findings: [] },
    script: { hook: "", body: "", conclusion: "", estimatedDurationSec: 0 },
    factCheck: { status: "passed", issues: [], corrections: [] },
    storyboard: { scenes: [] },

    voice: { provider: null, audioPath: null, durationMs: null },
    video: { videoPath: null, durationMs: null },
    quality: { passed: false, issues: [] },

    status: "pending",
    currentStage: "init",
    mockMode: true,
  };
}

export function touchContentObject(co: ContentObject, stage: string): ContentObject {
  return { ...co, updatedAt: new Date().toISOString(), currentStage: stage };
}