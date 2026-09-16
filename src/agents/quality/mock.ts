// Quality Agent — Phase 2 structural check only. No visual/audio QA.
// Returns passed=true iff every required stage is populated.

import type { ContentObject, Quality } from "../../domain/content-object.js";

export function mockQualityAgent(co: ContentObject): Quality {
  const issues: string[] = [];
  if (!co.topic.title) issues.push("topic.title missing");
  if (co.research.sources.length === 0) issues.push("research.sources empty");
  if (co.research.findings.length === 0) issues.push("research.findings empty");
  if (!co.script.hook) issues.push("script.hook missing");
  if (!co.script.body) issues.push("script.body missing");
  if (!co.script.conclusion) issues.push("script.conclusion missing");
  if (co.storyboard.scenes.length === 0) issues.push("storyboard.scenes empty");
  if (co.factCheck.status === "failed") issues.push("factCheck.status=failed");
  // voice/video nulls are EXPECTED in Phase 2 (Phase 4 fills them)
  return { passed: issues.length === 0, issues };
}