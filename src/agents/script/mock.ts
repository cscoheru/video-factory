// Script Agent — generates a 60-120 second Chinese short-video script.
// Phase 2: deterministic mock. PRD §十三.3 structure: Hook → Problem → Why → Example → Insight → Conclusion.

import type { Research, Script, Topic } from "../../domain/content-object.js";

export function mockScriptAgent(topic: Topic, research: Research): Script {
  const hook = `为什么 ${topic.audience}花了大价钱上知识库,${topic.title.slice(0, 20)}…员工还是不愿意用?`;
  const body =
    `问题往往不出在"有没有 AI",而出在四个地方:\n` +
    `一、检索质量差,文档搜不到想要的;\n` +
    `二、权限不清,该看到的看不到,不该看到的又泄露;\n` +
    `三、没有嵌入到真实业务流程,知识库是"附加题"而不是"必答题";\n` +
    `四、缺 Action —— 只回答问题,不替人完成动作。`;
  const example =
    `有家企业把"销售报价审批"接到知识库上,每天省 2 小时;关键是 Knowledge + Workflow + Permission 三件套一起做。`;
  const insight =
    `AI 落地的真正杠杆是 Enterprise Context —— 把人、文档、业务对象统一在一个可检索、可推理、可执行的环境里。`;
  const conclusion =
    `如果你的知识库只有"问答",它注定只是另一个被遗忘的系统。`;
  return {
    hook,
    body: `${body}\n\n${example}\n\n${insight}`,
    conclusion,
    estimatedDurationSec: estimateDuration(hook, body, conclusion),
  };
}

function estimateDuration(hook: string, body: string, conclusion: string): number {
  // ~3 Chinese chars / sec reading pace for short video narration
  const totalChars = hook.length + body.length + conclusion.length;
  return Math.max(60, Math.min(120, Math.round(totalChars / 3)));
}