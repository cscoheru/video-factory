// Orchestrator task — the single Trigger.dev entry point for Phase 2.
// Calls each leaf task via triggerAndWait, stitches the Content Object,
// and persists it to output/<contentId>.json so we can verify offline.

import { task, logger } from "@trigger.dev/sdk";
import { promises as fs } from "node:fs";
import path from "node:path";
import {
  ContentObjectSchema,
  type ContentObject,
} from "../../src/domain/content-object.js";
import { vfTopicTask } from "./vf-topic.js";
import { vfResearchTask } from "./vf-research.js";
import { vfScriptTask } from "./vf-script.js";
import { vfFactCheckTask } from "./vf-factcheck.js";
import { vfStoryboardTask } from "./vf-storyboard.js";
import { vfVoiceTask } from "./vf-voice.js";
import { vfQualityTask } from "./vf-quality.js";

const OUTPUT_DIR = path.resolve(process.cwd(), "output");

async function ensureOutputDir(): Promise<void> {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

export const videoFactoryTask = task({
  id: "video-factory",
  maxDuration: 300,
  run: async (payload: { rawTopic: string }) => {
    const startedAt = new Date().toISOString();
    logger.info("[video-factory] started", {
      taskId: "video-factory",
      rawTopic: payload.rawTopic,
      startedAt,
    });

    // 1. topic
    const topicRun = await vfTopicTask.triggerAndWait({ rawTopic: payload.rawTopic });
    if (!topicRun.ok) throw new Error("vf-topic failed");
    const topic = topicRun.output;

    // 2. research
    const researchRun = await vfResearchTask.triggerAndWait({ topic });
    if (!researchRun.ok) throw new Error("vf-research failed");
    const research = researchRun.output;

    // 3. script
    const scriptRun = await vfScriptTask.triggerAndWait({ topic, research });
    if (!scriptRun.ok) throw new Error("vf-script failed");
    const script = scriptRun.output;

    // 4. factCheck
    const factCheckRun = await vfFactCheckTask.triggerAndWait({ script });
    if (!factCheckRun.ok) throw new Error("vf-factcheck failed");
    const factCheck = factCheckRun.output;

    // 5. storyboard
    const storyboardRun = await vfStoryboardTask.triggerAndWait({ script });
    if (!storyboardRun.ok) throw new Error("vf-storyboard failed");
    const storyboard = storyboardRun.output;

    // 6. voice (Phase 2 stub)
    const voiceRun = await vfVoiceTask.triggerAndWait({ storyboard });
    if (!voiceRun.ok) throw new Error("vf-voice failed");
    const voice = voiceRun.output;

    // 7. assemble partial Content Object and run quality
    const partial: ContentObject = {
      id: `co_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: startedAt,
      updatedAt: new Date().toISOString(),
      topic,
      research,
      script,
      factCheck,
      storyboard,
      voice,
      video: { videoPath: null, durationMs: null },
      quality: { passed: false, issues: [] },
      status: "in_progress",
      currentStage: "quality",
      mockMode: true,
    };

    const qualityRun = await vfQualityTask.triggerAndWait({ contentObject: partial });
    if (!qualityRun.ok) throw new Error("vf-quality failed");
    const quality = qualityRun.output;

    const finalCo: ContentObject = {
      ...partial,
      quality,
      status: quality.passed ? "completed" : "failed",
      updatedAt: new Date().toISOString(),
      currentStage: "done",
    };
    const validated = ContentObjectSchema.parse(finalCo);

    // Persist
    await ensureOutputDir();
    const outPath = path.join(OUTPUT_DIR, `${validated.id}.json`);
    await fs.writeFile(outPath, JSON.stringify(validated, null, 2), "utf-8");

    logger.info("[video-factory] completed", {
      taskId: "video-factory",
      contentId: validated.id,
      status: validated.status,
      outputPath: outPath,
      durationMs: Date.parse(validated.updatedAt) - Date.parse(startedAt),
    });

    return {
      contentId: validated.id,
      status: validated.status,
      outputPath: outPath,
      qualityPassed: validated.quality.passed,
    };
  },
});