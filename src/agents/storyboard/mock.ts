// Storyboard Agent — turns a Script into Scene[].
// Phase 2: deterministic mock. PRD §十三.5 visualType ∈ {text, image, diagram, screenshot}.

import type { Scene, Script, Storyboard } from "../../domain/content-object.js";

export function mockStoryboardAgent(script: Script): Storyboard {
  // Distribute estimated duration across 5 scenes: hook / problem / why / example / conclusion.
  const perScene = Math.max(8, Math.round(script.estimatedDurationSec / 5));

  const scenes: Scene[] = [
    {
      sceneId: "s1-hook",
      sequence: 0,
      narration: script.hook,
      visualType: "text",
      visualPrompt: `大字标题:${script.hook}`,
      subtitle: script.hook,
      durationSec: perScene,
    },
    {
      sceneId: "s2-problem",
      sequence: 1,
      narration: extractFirstSentence(script.body),
      visualType: "image",
      visualPrompt: "员工面对电脑,知识库界面模糊",
      subtitle: extractFirstSentence(script.body),
      durationSec: perScene,
    },
    {
      sceneId: "s3-why",
      sequence: 2,
      narration: extractNumberedPoints(script.body)[0] ?? "",
      visualType: "diagram",
      visualPrompt: "四象限:检索 / 权限 / 流程 / Action",
      subtitle: extractNumberedPoints(script.body)[0] ?? "",
      durationSec: perScene,
    },
    {
      sceneId: "s4-example",
      sequence: 3,
      narration: extractParagraph(script.body, 1) ?? "",
      visualType: "screenshot",
      visualPrompt: "示意:报价审批流程截图",
      subtitle: extractParagraph(script.body, 1) ?? "",
      durationSec: perScene,
    },
    {
      sceneId: "s5-conclusion",
      sequence: 4,
      narration: script.conclusion,
      visualType: "text",
      visualPrompt: `结语:${script.conclusion}`,
      subtitle: script.conclusion,
      durationSec: perScene,
    },
  ];

  return { scenes };
}

function extractFirstSentence(text: string): string {
  const idx = text.search(/[。!?]/);
  return idx > 0 ? text.slice(0, idx + 1).trim() : text.trim();
}

function extractNumberedPoints(text: string): string[] {
  const lines = text.split(/\n+/);
  return lines.filter((l) => /^[一二三四五六七八九十]、/.test(l.trim()));
}

function extractParagraph(text: string, idx: number): string | undefined {
  const paragraphs = text.split(/\n\n+/);
  return paragraphs[idx]?.trim();
}